from rest_framework import serializers
from .models import (
    Client, Project, Phase, Task,
    ProgressUpdate, ProgressPhoto,
    PaymentMilestone, MilestoneEvidence, MilestoneApproval,
    ProjectContact, ProjectNote,
    Quote, QuoteLineItem,
    QuoteTemplate, QuoteTemplateLineItem,
)


class ClientSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model  = Client
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        # Prioridad: avatar propio del cliente
        if obj.avatar and obj.avatar.name:
            url = obj.avatar.url
            return request.build_absolute_uri(url) if request else url
        # Fallback: avatar del usuario del portal
        if obj.portal_user:
            user = obj.portal_user
            if user.avatar:
                url = user.avatar.url
                return request.build_absolute_uri(url) if request else url
            return getattr(user, 'avatar_url', None) or None
        return None


class PhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Phase
        fields = '__all__'
        read_only_fields = ('id',)


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    created_by_name  = serializers.SerializerMethodField()
    phase_name       = serializers.SerializerMethodField()
    is_overdue       = serializers.SerializerMethodField()

    class Meta:
        model  = Task
        fields = '__all__'
        read_only_fields = ('id', 'project', 'created_by', 'completed_at', 'created_at', 'updated_at')

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.get_full_name() if obj.assigned_to else None

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None

    def get_phase_name(self, obj):
        return obj.phase.name if obj.phase else None

    def get_is_overdue(self, obj):
        from django.utils import timezone
        if obj.due_date and obj.status not in ('done', 'cancelled'):
            return obj.due_date < timezone.now().date()
        return False


class ProgressPhotoSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model  = ProgressPhoto
        fields = ('id', 'update', 'photo', 'photo_url', 'caption', 'taken_at', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at', 'photo_url')

    def get_photo_url(self, obj):
        """Archivo subido tiene prioridad; fallback a URL externa."""
        if obj.photo:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.photo.url) if request else obj.photo.url
        return obj.photo_url


class ProgressUpdateSerializer(serializers.ModelSerializer):
    photos = ProgressPhotoSerializer(many=True, read_only=True)

    class Meta:
        model  = ProgressUpdate
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


# ─── Hitos de pago ────────────────────────────────────────────────────────────

class MilestoneEvidenceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.StringRelatedField(source='uploaded_by', read_only=True)

    class Meta:
        model  = MilestoneEvidence
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_at', 'uploaded_by')


class MilestoneApprovalSerializer(serializers.ModelSerializer):
    company_approved_by_name = serializers.StringRelatedField(
        source='company_approved_by', read_only=True
    )

    class Meta:
        model  = MilestoneApproval
        fields = '__all__'
        read_only_fields = (
            'id', 'milestone', 'status',
            'company_approved_by', 'company_approved_at',
            'client_approved_at', 'client_ip_address',
            'created_at', 'updated_at',
        )


class PaymentMilestoneSerializer(serializers.ModelSerializer):
    evidence            = MilestoneEvidenceSerializer(many=True, read_only=True)
    approval            = MilestoneApprovalSerializer(read_only=True)
    amount_usd          = serializers.ReadOnlyField()
    percentage_of_total = serializers.ReadOnlyField()
    phase_name          = serializers.StringRelatedField(source='phase', read_only=True)

    class Meta:
        model  = PaymentMilestone
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


# ─── Project serializers ──────────────────────────────────────────────────────

class ProjectListSerializer(serializers.ModelSerializer):
    """Vista ligera para listas — sin fases ni tareas anidadas."""
    client_name             = serializers.StringRelatedField(source='client', read_only=True)
    project_manager_name    = serializers.StringRelatedField(source='project_manager', read_only=True)
    project_manager_avatar  = serializers.SerializerMethodField()
    progress_percentage     = serializers.ReadOnlyField()
    total_budget_usd        = serializers.ReadOnlyField()
    cover_photo_url         = serializers.SerializerMethodField()

    def get_project_manager_avatar(self, obj):
        pm = obj.project_manager
        if not pm:
            return None
        if pm.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(pm.avatar.url) if request else pm.avatar.url
        return pm.avatar_url or None

    def get_cover_photo_url(self, obj):
        """ImageField (subida) tiene prioridad sobre URL externa."""
        if obj.cover_photo:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.cover_photo.url) if request else obj.cover_photo.url
        return obj.cover_photo_url or None

    class Meta:
        model  = Project
        fields = (
            'id', 'name', 'slug', 'project_type', 'status',
            'client_id', 'client_name',
            'project_manager_name', 'project_manager_avatar',
            'start_date', 'estimated_end', 'actual_end',
            'total_budget_gtq', 'total_budget_usd', 'base_currency',
            'progress_percentage', 'cover_photo_url', 'is_public_portfolio',
            'created_at',
        )


class ProjectDetailSerializer(ProjectListSerializer):
    """Vista completa con fases, cliente y hitos de pago anidados."""
    phases     = PhaseSerializer(many=True, read_only=True)
    client     = ClientSerializer(read_only=True)
    milestones = PaymentMilestoneSerializer(many=True, read_only=True)

    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + (
            'description', 'address', 'city', 'department',
            'exchange_rate_snapshot', 'phases', 'milestones', 'client',
        )



class ProjectContactSerializer(serializers.ModelSerializer):
    resolved_avatar_url = serializers.SerializerMethodField()

    class Meta:
        model  = ProjectContact
        fields = '__all__'
        read_only_fields = ('id', 'project', 'created_at', 'updated_at', 'resolved_avatar_url')

    def get_resolved_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and obj.avatar.name:
            url = obj.avatar.url
            return request.build_absolute_uri(url) if request else url
        return obj.avatar_url or ''


class ProjectNoteSerializer(serializers.ModelSerializer):
    author_name   = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()

    class Meta:
        model  = ProjectNote
        fields = ['id', 'body', 'author', 'author_name', 'author_avatar', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'author_name', 'author_avatar', 'created_at', 'updated_at']

    def get_author_name(self, obj):
        if not obj.author:
            return 'Usuario eliminado'
        return f'{obj.author.first_name} {obj.author.last_name}'.strip() or obj.author.email

    def get_author_avatar(self, obj):
        if not obj.author or not obj.author.avatar:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.author.avatar.url) if request else obj.author.avatar.url


class QuoteLineItemSerializer(serializers.ModelSerializer):
    subtotal     = serializers.SerializerMethodField()
    product_name = serializers.StringRelatedField(source='product', read_only=True)
    product_id   = serializers.IntegerField(allow_null=True, required=False)
    unit_display = serializers.SerializerMethodField()

    class Meta:
        model  = QuoteLineItem
        fields = ['id', 'category', 'description', 'quantity', 'unit', 'unit_display', 'unit_price', 'subtotal', 'order', 'product_id', 'product_name']

    def get_subtotal(self, obj):
        return float(obj.quantity * obj.unit_price)

    def get_unit_display(self, obj):
        # If linked to an inventory product, use its canonical display label
        if obj.product_id and obj.product:
            return obj.product.get_unit_display()
        return obj.unit or ''


class QuoteSerializer(serializers.ModelSerializer):
    line_items      = QuoteLineItemSerializer(many=True, required=False)
    created_by_name = serializers.SerializerMethodField()
    subtotal_amount = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    tax_amount      = serializers.SerializerMethodField()
    total_amount    = serializers.SerializerMethodField()

    class Meta:
        model  = Quote
        fields = [
            'id', 'project', 'revision', 'quote_number', 'status',
            'valid_until', 'notes', 'discount_pct', 'tax_pct',
            'client_comment', 'created_by', 'created_by_name',
            'sent_at', 'decided_at', 'created_at', 'updated_at',
            'line_items',
            'subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount',
        ]
        read_only_fields = [
            'id', 'project', 'revision', 'quote_number', 'status',
            'created_by', 'created_by_name',
            'sent_at', 'decided_at', 'created_at', 'updated_at',
            'subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount',
        ]

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return None
        return f'{obj.created_by.first_name} {obj.created_by.last_name}'.strip() or obj.created_by.email

    def _compute_subtotal(self, obj):
        return sum(item.quantity * item.unit_price for item in obj.line_items.all())

    def get_subtotal_amount(self, obj):
        return float(self._compute_subtotal(obj))

    def get_discount_amount(self, obj):
        return float(self._compute_subtotal(obj) * obj.discount_pct / 100)

    def get_tax_amount(self, obj):
        subtotal = self._compute_subtotal(obj)
        after_discount = subtotal - subtotal * obj.discount_pct / 100
        return float(after_discount * obj.tax_pct / 100)

    def get_total_amount(self, obj):
        subtotal = self._compute_subtotal(obj)
        after_discount = subtotal - subtotal * obj.discount_pct / 100
        return float(after_discount + after_discount * obj.tax_pct / 100)

    def create(self, validated_data):
        items_data = validated_data.pop('line_items', [])
        quote = Quote.objects.create(**validated_data)
        for i, item in enumerate(items_data):
            item.setdefault('order', i)
            QuoteLineItem.objects.create(quote=quote, **item)
        return quote

    def update(self, instance, validated_data):
        items_data = validated_data.pop('line_items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.line_items.all().delete()
            for i, item in enumerate(items_data):
                item.setdefault('order', i)
                QuoteLineItem.objects.create(quote=instance, **item)
        return instance


class QuoteTemplateLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = QuoteTemplateLineItem
        fields = ['id', 'category', 'description', 'quantity', 'unit', 'unit_price', 'order']


class QuoteTemplateSerializer(serializers.ModelSerializer):
    line_items       = QuoteTemplateLineItemSerializer(many=True, required=False)
    created_by_name  = serializers.SerializerMethodField()

    class Meta:
        model  = QuoteTemplate
        fields = ['id', 'name', 'description', 'created_by', 'created_by_name', 'created_at', 'updated_at', 'line_items']
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return None
        return f'{obj.created_by.first_name} {obj.created_by.last_name}'.strip() or obj.created_by.email

    def create(self, validated_data):
        items_data = validated_data.pop('line_items', [])
        template = QuoteTemplate.objects.create(**validated_data)
        for i, item in enumerate(items_data):
            item.setdefault('order', i)
            QuoteTemplateLineItem.objects.create(template=template, **item)
        return template

    def update(self, instance, validated_data):
        items_data = validated_data.pop('line_items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.line_items.all().delete()
            for i, item in enumerate(items_data):
                item.setdefault('order', i)
                QuoteTemplateLineItem.objects.create(template=instance, **item)
        return instance
