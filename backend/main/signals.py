from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db import transaction as db_transaction
import random
from .models import UserProfile, Inventory, Skin

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):

    if created:
        print(f"Creating UserProfile for {instance.username}")  
        UserProfile.objects.create(user=instance, balance=100.00)

@receiver(post_save, sender=UserProfile)
def create_initial_inventory(sender, instance, created, **kwargs):

    if created:
        print(f"Creating inventory for {instance.user.username}")  
        
        all_skins = list(Skin.objects.all())
        
        if all_skins:
            num_skins = min(10, len(all_skins))
            random_skins = random.sample(all_skins, num_skins)
       
            for skin in random_skins:
                Inventory.objects.create(
                    user=instance.user,
                    skin=skin,
                    is_for_sale=False
                )

            from .models import Transaction
            Transaction.objects.create(
                user=instance.user,
                transaction_type='add_funds',
                amount=100.00,
                description='Initial balance upon registration'
            )
            
            print(f"Added {num_skins} skins to inventory")
        else:
            print("No skins available in database")