# Generated by Django 3.0.7 on 2020-07-21 12:22

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_apiuser_address'),
    ]

    operations = [
        migrations.AlterField(
            model_name='apiuser',
            name='address',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True),
        ),
    ]