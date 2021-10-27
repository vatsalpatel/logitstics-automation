from rest_framework import serializers
from djoser.serializers import (
    UserSerializer,
    UserCreateSerializer,
    UidAndTokenSerializer,
)
from .models import ApiUser, Usage, ContactForm


class UsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usage
        fields = "__all__"


class ContactFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactForm
        fields = "__all__"


class ApiUserSerializer(UserSerializer):
    class Meta:
        model = ApiUser
        fields = [
            "first_name",
            "last_name",
            "email",
            "address",
            "key",
            "plan",
            "sub_status",
            "sub_end",
            "invoice_id",
            "invoice_status"
        ]


class ApiUserCreateSerializer(UserCreateSerializer):
    class Meta:
        model = ApiUser
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "password",
            "address",
        ]


class ApiUserActivationSerializer(UidAndTokenSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)
        return attrs
