from django.contrib import admin
from django.contrib.auth.models import Group

from .models import ApiUser, Usage, ContactForm


# Register your models here.
admin.site.register(ApiUser)
admin.site.register(Usage)
admin.site.register(ContactForm)

admin.site.unregister(Group)
