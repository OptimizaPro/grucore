from rest_framework import serializers
from .models import Worker, WorkLog, IGSS_PATRONAL, IGSS_LABORAL


class WorkLogSerializer(serializers.ModelSerializer):
    regular_pay   = serializers.ReadOnlyField()
    overtime_pay  = serializers.ReadOnlyField()
    gross_pay     = serializers.ReadOnlyField()
    igss_patronal = serializers.ReadOnlyField()
    total_cost    = serializers.ReadOnlyField()
    project_name  = serializers.StringRelatedField(source='project', read_only=True)

    class Meta:
        model  = WorkLog
        fields = [
            'id', 'worker', 'project', 'project_name', 'date',
            'start_time', 'end_time',
            'regular_hours', 'overtime_hours', 'notes',
            'regular_pay', 'overtime_pay', 'gross_pay',
            'igss_patronal', 'total_cost',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class WorkerSerializer(serializers.ModelSerializer):
    full_name            = serializers.ReadOnlyField()
    avatar_url           = serializers.ReadOnlyField()
    current_project_name = serializers.StringRelatedField(source='current_project', read_only=True)

    # Resumen económico del mes actual
    current_month_gross    = serializers.SerializerMethodField()
    current_month_days     = serializers.SerializerMethodField()
    current_month_cost     = serializers.SerializerMethodField()
    total_days_worked      = serializers.SerializerMethodField()

    class Meta:
        model  = Worker
        fields = [
            'id', 'first_name', 'last_name', 'full_name',
            'avatar_url',
            'dpi', 'phone', 'emergency_contact_name', 'emergency_contact_phone',
            'position', 'daily_rate_gtq', 'hire_date', 'status',
            'current_project', 'current_project_name',
            'notes',
            'current_month_gross', 'current_month_days',
            'current_month_cost', 'total_days_worked',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def _month_logs(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return obj.work_logs.filter(date__year=today.year, date__month=today.month)

    def get_current_month_days(self, obj):
        return self._month_logs(obj).count()

    def get_current_month_gross(self, obj):
        total = sum(log.gross_pay for log in self._month_logs(obj))
        return round(total, 2)

    def get_current_month_cost(self, obj):
        gross = self.get_current_month_gross(obj)
        return round(gross + gross * IGSS_PATRONAL, 2)

    def get_total_days_worked(self, obj):
        return obj.work_logs.count()
