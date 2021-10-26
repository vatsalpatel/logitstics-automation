from datetime import date

from rest_framework.throttling import BaseThrottle

from .models import ApiUser, Usage


class CustomThrottle(BaseThrottle):
    def allow_request(self, request, view):
        config = {
            "STARTER": 25,
            "BUSINESS": 50
        }
        today = date.today()
        user = ApiUser.objects.filter(key=request.data.get("api_key")).first()
        if not user:
            return True
        usage = Usage.objects.filter(user=user, time__date=today)
        if user.plan:
            if len(usage) >= config[user.plan]:
                return False
        return True
