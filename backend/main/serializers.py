from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Skin, UserProfile, Inventory, Transaction
from django.contrib.auth.password_validation import validate_password


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        user.set_password(validated_data['password'])
        user.save()
        
        return user
    
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