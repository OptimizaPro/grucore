from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    created_by_name  = serializers.SerializerMethodField()
    project_name     = serializers.SerializerMethodField()
    lead_name        = serializers.SerializerMethodField()
    attendee_ids     = serializers.SerializerMethodField()
    event_type_display    = serializers.SerializerMethodField()
    status_display        = serializers.SerializerMethodField()
    client_approval_display = serializers.SerializerMethodField()

    class Meta:
        model  = Event
        fields = '__all__'
        read_only_fields = (
            'id', 'created_by', 'created_at', 'updated_at',
            'created_by_name', 'project_name', 'lead_name', 'attendee_ids',
            'event_type_display', 'status_display', 'client_approval_display',
        )

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    def get_lead_name(self, obj):
        return obj.lead.full_name if obj.lead else None

    def get_attendee_ids(self, obj):
        return list(obj.attendees.values_list('id', flat=True))

    def get_event_type_display(self, obj):
        return obj.get_event_type_display()

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_client_approval_display(self, obj):
        return obj.get_client_approval_display()


class EventWriteSerializer(serializers.ModelSerializer):
    """Used for create/update — accepts attendee ids as a list."""
    attendees = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=__import__('apps.users.models', fromlist=['User']).User.objects.all(),
        required=False,
    )

    class Meta:
        model  = Event
        fields = (
            'title', 'description', 'event_type', 'location',
            'start_datetime', 'end_datetime',
            'project', 'lead',
            'attendees',
            'status', 'is_client_meeting',
        )

    def create(self, validated_data):
        attendees = validated_data.pop('attendees', [])
        event = Event.objects.create(**validated_data)
        event.attendees.set(attendees)
        return event

    def update(self, instance, validated_data):
        attendees = validated_data.pop('attendees', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if attendees is not None:
            instance.attendees.set(attendees)
        return instance
