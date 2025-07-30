from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Order, OrderItem, OrderStatusHistory

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('product', 'variant', 'quantity', 'price', 'subtotal_display')
    extra = 0
    can_delete = False
    
    def subtotal_display(self, obj):
        if obj.pk:
            return f"${obj.subtotal:,.0f}"
        return "-"
    subtotal_display.short_description = 'Subtotal'

class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    readonly_fields = ('status', 'changed_by', 'notes', 'created_at')
    extra = 0
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_info', 'status_display', 'assigned_admin', 
                   'total_display', 'created_at', 'tracking_info')
    list_filter = ('status', 'created_at', 'assigned_admin')
    search_fields = ('order_number', 'billing_email', 'billing_first_name', 'billing_last_name')
    readonly_fields = ('order_number', 'user', 'guest_user', 'created_at', 'updated_at', 
                      'subtotal', 'total', 'customer_info_display')
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    
    fieldsets = (
        ('Información del Pedido', {
            'fields': ('order_number', 'user', 'guest_user', 'status', 'tracking_number', 'assigned_admin')
        }),
        ('Información del Cliente', {
            'fields': ('customer_info_display',),
        }),
        ('Información de Facturación', {
            'fields': ('billing_first_name', 'billing_last_name', 'billing_email', 'billing_phone',
                      'billing_address', 'billing_city', 'billing_department', 'billing_postal_code'),
            'classes': ('collapse',)
        }),
        ('Información de Envío', {
            'fields': ('shipping_first_name', 'shipping_last_name', 'shipping_address', 
                      'shipping_city', 'shipping_department', 'shipping_postal_code'),
            'classes': ('collapse',)
        }),
        ('Totales', {
            'fields': ('subtotal', 'shipping_cost', 'tax', 'total')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def customer_info(self, obj):
        return f"{obj.customer_name} ({obj.customer_email})"
    customer_info.short_description = 'Cliente'
    
    def customer_info_display(self, obj):
        info = f"""
        <strong>Nombre:</strong> {obj.customer_name}<br>
        <strong>Email:</strong> {obj.customer_email}<br>
        <strong>Teléfono:</strong> {obj.billing_phone}<br>
        """
        if obj.user:
            info += f"<strong>Usuario registrado:</strong> Sí<br>"
        else:
            info += f"<strong>Usuario invitado:</strong> Sí<br>"
        return mark_safe(info)
    customer_info_display.short_description = 'Información del Cliente'
    
    def status_display(self, obj):
        colors = {
            'pending': 'orange',
            'preparing': 'blue',
            'shipped': 'green',
            'delivered': 'darkgreen',
            'cancelled': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Estado'
    
    def total_display(self, obj):
        return f"${obj.total:,.0f}"
    total_display.short_description = 'Total'
    
    def tracking_info(self, obj):
        if obj.tracking_number:
            return format_html(
                '<span style="background: #e8f5e8; padding: 2px 6px; border-radius: 3px;">{}</span>',
                obj.tracking_number
            )
        return "Sin guía"
    tracking_info.short_description = 'Guía'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Si es admin pero no superuser, solo ve pedidos asignados
        return qs.filter(assigned_admin=request.user)

@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('order', 'status', 'changed_by', 'created_at')
    list_filter = ('status', 'created_at', 'changed_by')
    search_fields = ('order__order_number', 'notes')
    readonly_fields = ('order', 'status', 'changed_by', 'created_at')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False