from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'skins', views.SkinViewSet)
router.register(r'profile', views.UserProfileViewSet, basename='profile')
router.register(r'inventory', views.InventoryViewSet, basename='inventory')
router.register(r'transactions', views.TransactionViewSet, basename='transactions')
router.register(r'marketplace', views.MarketplaceViewSet, basename='marketplace')

urlpatterns = [
    path('', views.index, name='api-root'),
    path('', include(router.urls)),
    # Дополнительные endpoints
    path('market/buy/<int:skin_id>/', views.buy_skin, name='buy-skin'),
    path('market/sell/<int:inventory_id>/', views.sell_skin, name='sell-skin'),
]