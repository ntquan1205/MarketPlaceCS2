from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Skin, UserProfile, Inventory, Transaction


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class SkinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skin
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'balance', 'created_at']


class InventorySerializer(serializers.ModelSerializer):
    skin = SkinSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Inventory
        fields = ['id', 'user', 'skin', 'is_for_sale', 'sale_price', 'added_at']


class TransactionSerializer(serializers.ModelSerializer):
    skin = SkinSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = '__all__'