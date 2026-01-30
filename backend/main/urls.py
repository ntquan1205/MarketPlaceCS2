from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'skins', views.SkinViewSet)
router.register(r'profile', views.UserProfileViewSet, basename='profile')
router.register(r'inventory', views.InventoryViewSet, basename='inventory')
router.register(r'transactions', views.TransactionViewSet, basename='transactions')

urlpatterns = [
    path('', views.index, name='api-root'),  # API корневой URL
    path('', include(router.urls)),
]