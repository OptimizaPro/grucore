from rest_framework import serializers
from .models import Notification, ProjectMessage


class NotificationSerializer(serializers.ModelSerializer):
    sender_name  = serializers.StringRelatedField(source='sender', read_only=True)
    project_name = serializers.StringRelatedField(source='project', read_only=True)

    class Meta:
        model  = Notification
        fields = '__all__'
        read_only_fields = (
            'id', 'recipient', 'sender',
            'is_read', 'read_at', 'created_at',
        )


class ProjectMessageSerializer(serializers.ModelSerializer):
    author_name = serializers.StringRelatedField(source='author', read_only=True)
    replies     = serializers.SerializerMethodField()

    class Meta:
        model  = ProjectMessage
        fields = '__all__'
        read_only_fields = ('id', 'author', 'project', 'created_at', 'updated_at')

    def get_replies(self, obj):
        # Only serialize replies for top-level messages (parent is None)
        if obj.parent is None:
            qs = obj.replies.all()
            return ProjectMessageSerializer(qs, many=True, context=self.context).data
        return []
