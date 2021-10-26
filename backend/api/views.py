from datetime import datetime
import json

from django.core.mail import send_mail
from django.conf import settings as django_settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from djoser.conf import settings

import stripe

from .models import ApiUser, Usage
from .services import find_path, find_path_end
from .serializers import ContactFormSerializer
from .throttling import CustomThrottle


stripe.api_key = django_settings.STRIPE_SECRET
status_data = {
    "points": [
        "40.7578796,-73.9859365",
        "40.7647359,-73.9800493",
        "40.750124,-73.9745989",
        "40.7489745,-73.9830351",
        "40.7751311,-73.9667091",
        "40.784531,-73.9703754"
    ],
    "capacity": [10],
}


class FindRoute(APIView):
    authentication_classes = []
    permission_classes = []
    throttle_classes = [CustomThrottle]

    def validate(self, request):
        data = request.data
        key = data.get("api_key")
        if not key:
            return "Key Not Provided"
        if key == "status":
            return "STATUS"

        # Validate user and check active plan
        user = ApiUser.objects.filter(key=key).first()
        if not user:
            return "Unauthorized key"
        if user.sub_status != "active" and user.is_staff is False:
            return "Purchase Subscription to accesst this resource"

        # Check number of points based on plan
        if user.plan == "STARTER":
            count = len(data.get("points"))
            count += 1 if data.get("start_point", False) else 0
            if count > 25:
                return "Requested more points than allowed, you are only allowed 25"
        if user.plan == "BUSINESS":
            count = len(data.get("points"))
            count += 1 if data.get("start_point", False) else 0
            if count > 50:
                return "Requested more points than allowed, you are only allowed 50"

        # Validate request body
        if not data.get("points"):
            return "Points Not Provided"
        if sum(data.get("capacity")) < len(data.get("points")):
            return "Invalid Capacity"

        return "OK"

    def post(self, request, form=None):
        status = self.validate(request)
        if status == "OK":
            user = ApiUser.objects.filter(key=request.data.get("api_key")).first()
            Usage.objects.create(user=user)
            res = find_path(request.data)
            return Response(res)
        elif status == "STATUS":
            res = find_path(status_data)
            return Response(res)

        return Response({"error": status}, status=400)


class FindRouteWithEnd(APIView):
    authentication_classes = []
    permission_classes = []
    throttle_classes = [CustomThrottle]

    def validate(self, request):
        data = request.data
        key = data.get("api_key")
        if not key:
            return "Key Not Provided"

        # Validate user and check active plan
        user = ApiUser.objects.filter(key=key).first()
        if not user:
            return "Unauthorized key"
        if user.sub_status != "active" and user.is_staff is False:
            return "Purchase Subscription to accesst this resource"

        # Check number of points based on plan
        if user.plan == "STARTER":
            count = len(data.get("points"))
            count += 1 if data.get("start_point", False) else 0
            if count > 30:
                return "Requested more points than allowed, you are only allowed 30"
        if user.plan == "BUSINESS":
            count = len(data.get("points"))
            count += 1 if data.get("start_point", False) else 0
            if count > 100:
                return "Requested more points than allowed, you are only allowed 100"

        # Validate request body
        if not data.get("start_point"):
            return "Start Point Not Provided"
        if not data.get("end_points"):
            return "End Points Not Provided"
        if not data.get("points"):
            return "Points Not Provided"
        if sum(data.get("capacity")) < len(data.get("points")):
            return "Invalid Capacity"
        if len(data.get("end_points")) != len(data.get("capacity")):
            return "Number of End Points and Vehicles(Length of Capacity Array) Must be same"

        return "OK"

    def post(self, request, form=None):
        status = self.validate(request)
        if status == "OK":
            user = ApiUser.objects.filter(key=request.data.get("api_key")).first()
            Usage.objects.create(user=user)
            res = find_path_end(request.data)
            return Response(res)

        return Response({"error": status}, status=400)


class ResendActivationMail(APIView):
    def post(self, request):
        to = [request.user.email]
        context = {"user": request.user}
        settings.EMAIL.activation(self.request, context).send(to)
        return Response("OK")


class ContactFormViewSet(ModelViewSet):
    serializer_class = ContactFormSerializer
    permission_classes = []

    def perform_create(self, serializer_class):
        if self.request.user.id:
            serializer_class.save(user=self.request.user)
        else:
            serializer_class.save()
        # Send Email to Admin
        data = self.request.data
        send_mail(
            subject=f"{data.get('full_name')} needs help with {data.get('subject')}",
            message=f"Message: {data.get('message')}\n\nReach out to him at: {data.get('email')}",
            recipient_list=[django_settings.ADMIN_EMAIL_ADDRESS, django_settings.EMAIL_HOST_USER],
            from_email=django_settings.EMAIL_HOST_USER,
        )


# Stripe Views
class CreateCustomer(APIView):
    def post(self, request, form=None):
        user = self.request.user
        customer = stripe.Customer.create(
            email=request.data.get("email"),
            name=user.get_full_name(),
            address=request.data.get("address"),
        )
        user.cus_id = customer.get("id")
        user.save()
        return Response({"status": "success"})


class CreateSubscription(APIView):
    def post(self, request):
        user = self.request.user
        customer = user.cus_id

        try:
            stripe.PaymentMethod.attach(
                request.data.get("paymentMethodId"), customer=customer
            )
            stripe.Customer.modify(
                customer,
                invoice_settings={
                    "default_payment_method": request.data.get("paymentMethodId"),
                },
            )

            priceId = ""
            if request.data.get("priceId") == "STARTER":
                priceId = django_settings.STRIPE_STARTER_PLAN
            elif request.data.get("priceId") == "BUSINESS":
                priceId = django_settings.STRIPE_BUSINESS_PLAN

            print(priceId)
            sub = stripe.Subscription.create(
                customer=customer,
                items=[{"price": priceId}],
                expand=["latest_invoice.payment_intent"],
            )

            user.plan = request.data.get("priceId")
            user.sub_end = datetime.utcfromtimestamp(sub.current_period_end)
            user.sub_status = sub.status
            user.sub_id = sub.id
            user.invoice_id = sub.latest_invoice.id
            user.invoice_status = sub.latest_invoice.status
            user.save()
            return Response(sub)
        except Exception as e:
            print(e)
            return Response({"error": str(e)})


class UpgradeSubscription(APIView):
    def post(self, request):
        user = self.request.user
        try:
            sub = stripe.Subscription.retrieve(user.sub_id)
            updated_sub = stripe.Subscription.modify(
                user.sub_id,
                cancel_at_period_end=False,
                items=[
                    {
                        "id": sub["items"]["data"][0].id,
                        "price": django_settings.STRIPE_BUSINESS_PLAN,
                    }
                ],
                proration_behavior="always_invoice",
            )

            user.plan = request.data.get("priceId")
            user.sub_end = datetime.utcfromtimestamp(updated_sub.current_period_end)
            user.sub_status = updated_sub.status
            user.sub_id = updated_sub.id
            user.save()
            return Response(updated_sub)
        except Exception as e:
            print(e)
            return Response({"error": str(e)})


class RetryInvoice(APIView):
    def post(self, request):
        user = self.request.user
        try:
            stripe.PaymentMethod.attach(
                request.data["paymentMethodId"], customer=user.cus_id
            )
            stripe.Customer.modify(
                user.cus_id,
                invoice_settings={
                    "default_payment_method": request.data["paymentMethodId"],
                },
            )
            invoice = stripe.Invoice.retrieve(
                request.data["invoiceId"], expand=["payment_intent"],
            )
            return Response(invoice)
        except Exception as e:
            print("error", e)
            return Response({"error": str(e)})


class UpdatePaymentMethod(APIView):
    def post(self, request):
        user = self.request.user
        try:
            stripe.PaymentMethod.attach(
                request.data["paymentMethodId"], customer=user.cus_id
            )
            stripe.Customer.modify(
                user.cus_id,
                invoice_settings={
                    "default_payment_method": request.data["paymentMethodId"],
                },
            )
            return Response({"status": "success"})
        except Exception as e:
            print(e)
            return Response({"error": str(e)})


class WebHooks(APIView):
    # stripe listen --forward-to localhost:8000/api/webhooks/
    authentication_classes = []
    permission_classes = []
    throttling_classes = []

    def post(self, request):
        # Retrieve Event to Verify
        try:
            evt = stripe.Event.retrieve(request.data["id"])
            # Renew Subscription
            if request.data.get("type") == "invoice.payment_succeeded" or request.data.get("type") == "invoice.paid":
                data = json.loads(str(evt))
                data = data["data"]["object"]
                sub_id = data["subscription"]
                sub = stripe.Subscription.retrieve(sub_id)

                user = ApiUser.objects.get(cus_id=sub.customer)

                user.sub_end = datetime.utcfromtimestamp(sub.current_period_end)
                user.sub_status = sub.status
                user.sub_id = sub.id
                user.invoice_id = data["id"]
                user.invoice_status = data["status"]
                user.save()

            # Set subscription to inactive
            elif request.data.get("type") == "invoice.payment_failed":
                data = json.loads(str(evt))
                data = data["data"]["object"]
                sub_id = data["subscription"]
                sub = stripe.Subscription.retrieve(sub_id)

                user = ApiUser.objects.get(cus_id=sub.customer)

                user.sub_end = datetime.fromtimestamp(sub.current_period_end)
                user.sub_status = sub.status
                user.sub_id = sub.id
                user.invoice_id = data["id"]
                user.invoice_status = data["status"]
                user.save()

            # Cancel Subscription
            elif request.data.get("type") == "customer.subscription.deleted":
                data = json.loads(str(evt))
                data = data["data"]["object"]

                user = ApiUser.objects.get(cus_id=data["customer"])
                user.sub_status = data["status"]
                user.plan = ""
                user.invoice_status = ""
                user.invoice_id = ""
                user.save()

            return Response(status=200)
        except Exception as e:
            print(e)
            return Response({'error': str(e)})
