from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'skins', views.SkinViewSet)
router.register(r'profile', views.UserProfileViewSet, basename='profile')
router.register(r'inventory', views.InventoryViewSet, basename='inventory')
router.register(r'transactions', views.TransactionViewSet, basename='transactions')
router.register(r'marketplace', views.MarketplaceViewSet, basename='marketplace')

urlpatterns = [
    path('', views.index, name='api-root'),
    
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    path('', include(router.urls)),
    
    path('market/buy/<int:skin_id>/', views.buy_skin, name='buy-skin'),
    path('market/sell/<int:inventory_id>/', views.sell_skin, name='sell-skin'),
]