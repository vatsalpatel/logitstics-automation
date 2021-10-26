import random
import string

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import JSONField
from django.dispatch import receiver

from djoser.signals import user_registered, user_activated


# Create your models here.
class ApiUser(AbstractUser):
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    email = models.EmailField(unique=True)
    address = JSONField(blank=True, null=True)
    key = models.CharField(max_length=50, blank=True, null=True, default="")
    plan = models.CharField(max_length=30, blank=True, null=True)

    # Stripe
    cus_id = models.CharField(max_length=100, blank=True, null=True)
    sub_id = models.CharField(max_length=100, blank=True, null=True)
    sub_status = models.CharField(max_length=30, null=True, blank=True)
    sub_end = models.DateTimeField(null=True, blank=True)
    invoice_id = models.CharField(max_length=100, blank=True, null=True)
    invoice_status = models.CharField(max_length=30, null=True, blank=True)


class Usage(models.Model):
    user = models.ForeignKey(to=ApiUser, on_delete=models.CASCADE, related_name="User")
    time = models.DateTimeField(auto_now_add=True)


class ContactForm(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=100)
    message = models.TextField()
    user = models.ForeignKey(to=ApiUser, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.subject} from {self.email}"


def generate_key():
    return "".join(
        random.choice(string.ascii_letters + string.digits) for _ in range(32)
    )


@receiver(user_registered)
def activate_immediate(sender, user, **kwargs):
    # Activate User immediately so that they may login
    user.is_active = True
    user.save()


@receiver(user_activated)
def user_generate_key(sender, user, **kwargs):
    # Use activation email to generate key instead of using it to activate user
    user.key = generate_key()
    user.save()
