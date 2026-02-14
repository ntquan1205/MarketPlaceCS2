from django.db import models
from django.contrib.auth.models import User
import random

class Skin(models.Model):
    QUALITY_CHOICES = [
        ('Factory New', 'Factory New'),
        ('Minimal Wear', 'Minimal Wear'),
        ('Field-Tested', 'Field-Tested'),
        ('Well-Worn', 'Well-Worn'),
        ('Battle-Scarred', 'Battle-Scarred'),
    ]
    
    QUALITY_MULTIPLIERS = {
        'Factory New': 1.0,
        'Minimal Wear': 0.8,
        'Field-Tested': 0.6,
        'Well-Worn': 0.4,
        'Battle-Scarred': 0.2,
    }
    
    WEAPON_BASE_PRICES = {
        'AWP': 100,
        'AK-47': 80,
        'M4A4': 70,
        'Desert Eagle': 50,
        'USP-S': 30,
        'Glock-18': 25,
        'Karambit': 200,
        'Butterfly Knife': 250,
        'Bayonet': 150,
    }
    
    name = models.CharField(max_length=200)
    weapon = models.CharField(max_length=100)
    quality = models.CharField(max_length=50, choices=QUALITY_CHOICES)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)  
    min_sell_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_sell_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.base_price:
            weapon_base = self.WEAPON_BASE_PRICES.get(self.weapon, 50)
            quality_multiplier = self.QUALITY_MULTIPLIERS.get(self.quality, 0.5)
            self.base_price = round(weapon_base * quality_multiplier, 2)
        
        if not self.min_sell_price:
            self.min_sell_price = round(self.base_price * 0.8, 2)
        if not self.max_sell_price:
            self.max_sell_price = round(self.base_price * 1.2, 2)
        
        super().save(*args, **kwargs)
    
    def get_market_price(self):
        """Текущая рыночная цена (случайная в диапазоне)"""
        return round(random.uniform(float(self.min_sell_price), float(self.max_sell_price)), 2)
    
    def __str__(self):
        return f"{self.weapon} | {self.name} ({self.quality}) - ${self.base_price}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Inventory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inventory')
    skin = models.ForeignKey(Skin, on_delete=models.CASCADE)
    is_for_sale = models.BooleanField(default=False)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'skin']  
    
    def __str__(self):
        status = "FOR SALE" if self.is_for_sale else "NOT FOR SALE"
        return f"{self.user.username} - {self.skin.name} ({status})"


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('buy', 'Buy'),
        ('sell', 'Sell'),
        ('trade', 'Trade'),
        ('add_funds', 'Add Funds'),
        ('withdraw', 'Withdraw'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    skin = models.ForeignKey(Skin, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - ${self.amount}"