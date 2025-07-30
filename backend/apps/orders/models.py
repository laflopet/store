from django.db import models
from django.contrib.auth import get_user_model
from apps.accounts.models import GuestUser
from django.conf import settings


User = get_user_model()

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('preparing', 'Preparando paquete'),
        ('shipped', 'Paquete enviado'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
        ('rejected', 'Rechazado'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    guest_user = models.ForeignKey(GuestUser, on_delete=models.CASCADE, null=True, blank=True)
    order_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    tracking_number = models.CharField(max_length=50, blank=True)
    shipping_company = models.CharField(max_length=100, blank=True)
    assigned_admin = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_orders',
        limit_choices_to={'role__in': ['admin', 'super_admin']},
    )

    # Billing information
    billing_first_name = models.CharField(max_length=30)
    billing_last_name = models.CharField(max_length=30)
    billing_email = models.EmailField()
    billing_phone = models.CharField(max_length=20)
    billing_address = models.TextField()
    billing_city = models.CharField(max_length=50)
    billing_department = models.CharField(max_length=50)
    billing_postal_code = models.CharField(max_length=10)

    # Shipping information
    shipping_first_name = models.CharField(max_length=30)
    shipping_last_name = models.CharField(max_length=30)
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=50)
    shipping_department = models.CharField(max_length=50)
    shipping_postal_code = models.CharField(max_length=10)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            import uuid
            self.order_number = str(uuid.uuid4()).replace('-', '')[:8].upper()
        
        # Auto-assign to super admin if no admin is assigned and this is a new order
        if not self.assigned_admin and not self.pk:
            try:
                super_admin = User.objects.filter(role='super_admin').first()
                if super_admin:
                    self.assigned_admin = super_admin
            except:
                pass  # If no super admin exists, continue without assignment
        
        super().save(*args, **kwargs)

    
    @property
    def customer_name(self):
        return f"{self.billing_first_name} {self.billing_last_name}"
    
    @property
    def customer_email(self):
        return self.billing_email
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_prepared = models.BooleanField(default=False)  # Control de preparación
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.product.name} x {self.quantity}"
    
    @property
    def subtotal(self):
        return self.price * self.quantity


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES)
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.status}"