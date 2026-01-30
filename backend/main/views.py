from django.http import JsonResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Skin, UserProfile, Inventory, Transaction
from .serializers import (
    UserSerializer, SkinSerializer, UserProfileSerializer,
    InventorySerializer, TransactionSerializer
)

def index(request):
    return JsonResponse({
        'message': 'CS2 Marketplace API',
        'endpoints': {
            'api/': 'API Root (this page)',
            'api/skins/': 'List all available skins',
            'api/skins/<id>/': 'Get skin details',
            'api/profile/': 'Get user profile (authenticated)',
            'api/inventory/': 'Get user inventory (authenticated)',
            'api/transactions/': 'Get transaction history (authenticated)',
            'admin/': 'Django Admin Panel',
        },
        'documentation': 'Use /api/ endpoints with appropriate authentication',
        'status': 'API is running'
    })


class SkinViewSet(viewsets.ModelViewSet):
    queryset = Skin.objects.all()
    serializer_class = SkinSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)


class InventoryViewSet(viewsets.ModelViewSet):
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Inventory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)