from django.db import models
from django.contrib.auth.models import User


class Skin(models.Model):
    QUALITY_CHOICES = [
        ('Factory New', 'Factory New'),
        ('Minimal Wear', 'Minimal Wear'),
        ('Field-Tested', 'Field-Tested'),
        ('Well-Worn', 'Well-Worn'),
        ('Battle-Scarred', 'Battle-Scarred'),
    ]

    name = models.CharField(max_length=200)
    weapon = models.CharField(max_length=100)
    quality = models.CharField(max_length=50, choices=QUALITY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.weapon} | {self.name} ({self.quality})"


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
        return f"{self.user.username} - {self.skin.name}"


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('buy', 'Buy'),
        ('sell', 'Sell'),
        ('trade', 'Trade'),
        ('add_funds', 'Add Funds'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    skin = models.ForeignKey(Skin, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - ${self.amount}"