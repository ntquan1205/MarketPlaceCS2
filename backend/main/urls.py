from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from .views import FinanceViewSet

router = DefaultRouter()
router.register(r'skins', views.SkinViewSet)
router.register(r'profile', views.UserProfileViewSet, basename='profile')
router.register(r'inventory', views.InventoryViewSet, basename='inventory')
router.register(r'transactions', views.TransactionViewSet, basename='transactions')
router.register(r'marketplace', views.MarketplaceViewSet, basename='marketplace')

urlpatterns = [
    path('health/', views.health_check, name='health'),
    path('', views.index, name='api-root'),
    
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    path('', include(router.urls)),
    
    path('marketplace/buy/<int:pk>/', views.MarketplaceViewSet.as_view({'post': 'buy'}), name='marketplace-buy'),
    path('market/sell/<int:inventory_id>/', views.sell_skin, name='sell-skin'),
    path('finance/deposit/', FinanceViewSet.as_view({'post': 'deposit'}), name='deposit'),
    path('api/finance/deposit/', FinanceViewSet.as_view({'post': 'deposit'}), name='deposit-api'),
    path('finance/withdraw/', FinanceViewSet.as_view({'post': 'withdraw'}), name='withdraw'),
    path('api/finance/withdraw/', FinanceViewSet.as_view({'post': 'withdraw'}), name='withdraw-api'),
]