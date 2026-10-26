from django.utils import timezone
from rest_framework import serializers

from .models import Pipeline, PipelineStage, Lead, LeadActivity


# ─── Pipeline Stage ───────────────────────────────────────────────────────────

class PipelineStageSerializer(serializers.ModelSerializer):
    leads_count = serializers.SerializerMethodField()

    class Meta:
        model  = PipelineStage
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_leads_count(self, obj):
        return obj.leads.filter(status='active').count()


# ─── Pipeline ─────────────────────────────────────────────────────────────────

class PipelineSerializer(serializers.ModelSerializer):
    stages = PipelineStageSerializer(many=True, read_only=True)

    class Meta:
        model  = Pipeline
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


# ─── Lead Activity ────────────────────────────────────────────────────────────

class LeadActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model  = LeadActivity
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else None


# ─── Lead ─────────────────────────────────────────────────────────────────────

class LeadSerializer(serializers.ModelSerializer):
    stage_name             = serializers.SerializerMethodField()
    stage_color            = serializers.SerializerMethodField()
    assigned_to_name       = serializers.SerializerMethodField()
    converted_project_name = serializers.SerializerMethodField()
    activities             = LeadActivitySerializer(many=True, read_only=True)
    days_in_stage          = serializers.SerializerMethodField()

    class Meta:
        model  = Lead
        fields = '__all__'
        read_only_fields = (
            'id',
            'converted_at',
            'created_at',
            'updated_at',
            'stage_name',
            'stage_color',
            'assigned_to_name',
            'converted_project_name',
            'activities',
            'days_in_stage',
        )

    def get_stage_name(self, obj):
        return obj.stage.name

    def get_stage_color(self, obj):
        return obj.stage.color

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.get_full_name() if obj.assigned_to else None

    def get_converted_project_name(self, obj):
        return obj.converted_project.name if obj.converted_project else None

    def get_days_in_stage(self, obj):
        return (timezone.now().date() - obj.updated_at.date()).days
