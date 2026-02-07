from django.contrib import admin
from .models import Skin, UserProfile, Inventory, Transaction

@admin.register(Skin)
class SkinAdmin(admin.ModelAdmin):
    list_display = ('name', 'weapon', 'quality', 'base_price', 'min_sell_price', 'max_sell_price')
    list_filter = ('weapon', 'quality')
    search_fields = ('name', 'weapon')
    ordering = ('weapon', 'name')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'created_at')
    search_fields = ('user__username',)

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'skin', 'is_for_sale', 'sale_price', 'added_at')
    list_filter = ('is_for_sale',)
    search_fields = ('user__username', 'skin__name')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'transaction_type', 'amount', 'created_at')
    list_filter = ('transaction_type',)
    search_fields = ('user__username', 'description')