from rest_framework import serializers
from .models import (
    AccountingPeriod, Account, JournalEntry, JournalLine,
    TaxRule, AccountMapping,
)


class AccountingPeriodSerializer(serializers.ModelSerializer):
    label            = serializers.ReadOnlyField()
    closed_by_name   = serializers.StringRelatedField(source='closed_by', read_only=True)

    class Meta:
        model  = AccountingPeriod
        fields = '__all__'
        read_only_fields = ('id', 'closed_by', 'closed_at')


class AccountSerializer(serializers.ModelSerializer):
    """Catálogo de cuentas — ligero para listas y dropdowns."""
    parent_code = serializers.SerializerMethodField()

    class Meta:
        model  = Account
        fields = (
            'id', 'code', 'name', 'account_type', 'nature',
            'level', 'parent', 'parent_code', 'pl_group', 'is_active',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_parent_code(self, obj):
        return obj.parent.code if obj.parent else None


class AccountDetailSerializer(AccountSerializer):
    """Versión con campos adicionales para la vista de detalle."""
    full_path = serializers.ReadOnlyField()

    class Meta(AccountSerializer.Meta):
        fields = AccountSerializer.Meta.fields + ('notes', 'full_path', 'created_at', 'updated_at')


class JournalLineSerializer(serializers.ModelSerializer):
    account_code = serializers.SerializerMethodField()
    account_name = serializers.SerializerMethodField()

    class Meta:
        model  = JournalLine
        fields = '__all__'
        read_only_fields = ('id', 'entry')

    def get_account_code(self, obj):
        return obj.account.code

    def get_account_name(self, obj):
        return obj.account.name


class JournalEntrySerializer(serializers.ModelSerializer):
    lines          = JournalLineSerializer(many=True, read_only=True)
    created_by_name = serializers.StringRelatedField(source='created_by', read_only=True)
    total_debit    = serializers.ReadOnlyField()
    total_credit   = serializers.ReadOnlyField()
    is_balanced    = serializers.ReadOnlyField()

    class Meta:
        model  = JournalEntry
        fields = '__all__'
        read_only_fields = (
            'id', 'number', 'created_by', 'reversed_by', 'created_at', 'updated_at',
        )


class TaxRuleSerializer(serializers.ModelSerializer):
    created_by_name = serializers.StringRelatedField(source='created_by', read_only=True)

    class Meta:
        model  = TaxRule
        fields = '__all__'
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')


class AccountMappingSerializer(serializers.ModelSerializer):
    key_display  = serializers.SerializerMethodField()
    account_code = serializers.SerializerMethodField()
    account_name = serializers.SerializerMethodField()

    class Meta:
        model  = AccountMapping
        fields = '__all__'

    def get_key_display(self, obj):
        return obj.get_key_display()

    def get_account_code(self, obj):
        return obj.account.code

    def get_account_name(self, obj):
        return obj.account.name
