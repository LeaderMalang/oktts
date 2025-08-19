from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('purchase', '0001_initial'),
        ('sale', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentTerm',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('installments', models.PositiveIntegerField(default=1)),
                ('interval_days', models.PositiveIntegerField(default=30)),
            ],
        ),
        migrations.CreateModel(
            name='PaymentSchedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('due_date', models.DateField()),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('status', models.CharField(choices=[('Pending', 'Pending'), ('Paid', 'Paid')], default='Pending', max_length=20)),
                ('purchase_invoice', models.ForeignKey(blank=True, null=True, on_delete=models.deletion.CASCADE, related_name='payment_schedules', to='purchase.purchaseinvoice')),
                ('sale_invoice', models.ForeignKey(blank=True, null=True, on_delete=models.deletion.CASCADE, related_name='payment_schedules', to='sale.saleinvoice')),
                ('term', models.ForeignKey(on_delete=models.deletion.CASCADE, to='finance.paymentterm')),
            ],
        ),
    ]
