# Generated by Django 3.0.7 on 2020-07-14 09:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_contactform_full_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='apiuser',
            name='invoice_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='apiuser',
            name='invoice_status',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='apiuser',
            name='payment_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='apiuser',
            name='payment_status',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='apiuser',
            name='sub_end',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
