"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import SimpleRouter

from api.views import (
    FindRoute,
    FindRouteWithEnd,
    ResendActivationMail,
    ContactFormViewSet,
    CreateCustomer,
    CreateSubscription,
    UpgradeSubscription,
    RetryInvoice,
    UpdatePaymentMethod,
    WebHooks
)


router = SimpleRouter()
router.register("contact", ContactFormViewSet, basename="Contact")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("djoser.urls")),
    path("api/auth/", include("djoser.urls.authtoken")),
    path("api/", include(router.urls)),
    path("api/", FindRoute.as_view()),
    path("api/ends/", FindRouteWithEnd.as_view()),
    path("api/resend/", ResendActivationMail.as_view()),
    # Stripe URLs
    path("api/customer/", CreateCustomer.as_view()),
    path("api/subscription/", CreateSubscription.as_view()),
    path("api/upgrade-subscription/", UpgradeSubscription.as_view()),
    path("api/retry-invoice/", RetryInvoice.as_view()),
    path("api/update-payment/", UpdatePaymentMethod.as_view()),
    path("api/webhooks/", WebHooks.as_view()),
]
