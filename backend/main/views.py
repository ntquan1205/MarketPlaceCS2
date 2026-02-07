from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db import transaction as db_transaction
from rest_framework.decorators import action, api_view, permission_classes
from .models import Skin, UserProfile, Inventory, Transaction
from .serializers import (
    UserSerializer, SkinSerializer, UserProfileSerializer,
    InventorySerializer, TransactionSerializer
)
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated 
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer

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
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def buy(self, request, pk=None):
        """Купить скин"""
        skin = self.get_object()
        user = request.user
        
        try:
            user_profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем текущую рыночную цену
        current_price = skin.get_market_price()
        
        # Проверяем баланс
        if user_profile.balance < current_price:
            return Response(
                {'error': 'Insufficient balance'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with db_transaction.atomic():
            # Снимаем деньги
            user_profile.balance -= current_price
            user_profile.save()
            
            # Добавляем скин в инвентарь
            inventory_item, created = Inventory.objects.get_or_create(
                user=user,
                skin=skin,
                defaults={'is_for_sale': False}
            )
            
            # Если скин уже есть в инвентаре, просто увеличиваем количество?
            # Пока оставим так - нельзя купить тот же скин если уже есть
            
            # Создаем запись о транзакции
            Transaction.objects.create(
                user=user,
                skin=skin,
                transaction_type='buy',
                amount=current_price,
                description=f'Purchased {skin.name}'
            )
        
        return Response({
            'success': True,
            'message': f'Successfully purchased {skin.name} for ${current_price}',
            'new_balance': float(user_profile.balance),
            'skin': SkinSerializer(skin).data
        })

class InventoryViewSet(viewsets.ModelViewSet):
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Inventory.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def sell(self, request, pk=None):
        """Продать скин из инвентаря"""
        inventory_item = self.get_object()
        
        # Проверяем что это инвентарь текущего пользователя
        if inventory_item.user != request.user:
            return Response(
                {'error': 'Not your inventory item'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Проверяем что скин не выставлен на продажу
        if inventory_item.is_for_sale:
            return Response(
                {'error': 'Skin is already for sale'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        skin = inventory_item.skin
        user = request.user
        
        try:
            user_profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем цену продажи (можно передать в запросе или использовать рыночную)
        sell_price = request.data.get('price')
        if sell_price:
            sell_price = float(sell_price)
            # Проверяем что цена в допустимом диапазоне
            if sell_price < float(skin.min_sell_price) or sell_price > float(skin.max_sell_price):
                return Response({
                    'error': f'Price must be between ${skin.min_sell_price} and ${skin.max_sell_price}'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Используем рыночную цену
            sell_price = skin.get_market_price()
        
        with db_transaction.atomic():
            # Добавляем деньги
            user_profile.balance += sell_price
            user_profile.save()
            
            # Помечаем как проданное или удаляем из инвентаря
            # Вариант 1: Удаляем из инвентаря
            inventory_item.delete()

            Transaction.objects.create(
                user=user,
                skin=skin,
                transaction_type='sell',
                amount=sell_price,
                description=f'Sold {skin.name}'
            )
        
        return Response({
            'success': True,
            'message': f'Successfully sold {skin.name} for ${sell_price}',
            'new_balance': float(user_profile.balance),
            'skin': SkinSerializer(skin).data
        })
    
    @action(detail=False)
    def for_sale(self, request):
        """Получить скины выставленные на продажу"""
        queryset = self.get_queryset().filter(is_for_sale=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class MarketplaceViewSet(viewsets.ViewSet):
    """Отдельный ViewSet для маркетплейса"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def list(self, request):
        """Все скины доступные для покупки"""
        skins = Skin.objects.all()
        serializer = SkinSerializer(skins, many=True)
        
        # Добавляем текущую рыночную цену для каждого скина
        data = serializer.data
        for item in data:
            skin = Skin.objects.get(id=item['id'])
            item['current_price'] = skin.get_market_price()
            item['price_range'] = {
                'min': float(skin.min_sell_price),
                'max': float(skin.max_sell_price)
            }
        
        return Response(data)

class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_skin(request, skin_id):
    """Endpoint для покупки скина"""
    try:
        skin = Skin.objects.get(id=skin_id)
    except Skin.DoesNotExist:
        return Response({'error': 'Skin not found'}, status=status.HTTP_404_NOT_FOUND)

    viewset = SkinViewSet()
    viewset.request = request
    viewset.format_kwarg = None
    viewset.kwargs = {'pk': skin_id}
    
    return viewset.buy(request, pk=skin_id)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sell_skin(request, inventory_id):
    """Endpoint для продажи скина из инвентаря"""
    try:
        inventory_item = Inventory.objects.get(id=inventory_id)
    except Inventory.DoesNotExist:
        return Response({'error': 'Inventory item not found'}, status=status.HTTP_404_NOT_FOUND)
    
    viewset = InventoryViewSet()
    viewset.request = request
    viewset.format_kwarg = None
    viewset.kwargs = {'pk': inventory_id}
    
    return viewset.sell(request, pk=inventory_id)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'User registered successfully. You received $100 and 10 random skins!'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from .serializers import UserProfileSerializer
        from .models import UserProfile
        
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)