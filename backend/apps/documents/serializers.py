from rest_framework import serializers
from .models import Document, RFI, Submittal, PunchItem


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.StringRelatedField(source='uploaded_by', read_only=True)

    class Meta:
        model  = Document
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_by', 'created_at', 'updated_at')


class RFISerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.StringRelatedField(source='submitted_by', read_only=True)
    assigned_to_name  = serializers.StringRelatedField(source='assigned_to', read_only=True)
    answered_by_name  = serializers.StringRelatedField(source='answered_by', read_only=True)

    class Meta:
        model  = RFI
        fields = '__all__'
        read_only_fields = (
            'id', 'number',
            'submitted_by', 'assigned_to', 'answered_by',
            'answered_at', 'created_at', 'updated_at',
        )


class SubmittalSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.StringRelatedField(source='submitted_by', read_only=True)
    reviewed_by_name  = serializers.StringRelatedField(source='reviewed_by', read_only=True)

    class Meta:
        model  = Submittal
        fields = '__all__'
        read_only_fields = (
            'id', 'number',
            'submitted_by', 'reviewed_by',
            'created_at', 'updated_at',
        )


class PunchItemSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.StringRelatedField(source='assigned_to', read_only=True)
    created_by_name  = serializers.StringRelatedField(source='created_by', read_only=True)

    class Meta:
        model  = PunchItem
        fields = '__all__'
        read_only_fields = (
            'id', 'number',
            'assigned_to', 'created_by',
            'resolved_at', 'created_at', 'updated_at',
        )
