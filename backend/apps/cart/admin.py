from django.contrib import admin
from .models import Cart, CartItem

class CartItemInline(admin.TabularInline):
    model = CartItem
    readonly_fields = ('product', 'variant', 'quantity', 'price_display', 'subtotal_display')
    extra = 0
    
    def price_display(self, obj):
        if obj.pk:
            return f"${obj.price:,.0f}"
        return "-"
    price_display.short_description = 'Precio'
    
    def subtotal_display(self, obj):
        if obj.pk:
            return f"${obj.subtotal:,.0f}"
        return "-"
    subtotal_display.short_description = 'Subtotal'

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('cart_info', 'total_items_display', 'total_price_display', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__email', 'session_key')
    readonly_fields = ('user', 'session_key', 'created_at', 'updated_at', 
                      'total_items_display', 'total_price_display')
    inlines = [CartItemInline]
    
    def cart_info(self, obj):
        if obj.user:
            return f"Usuario: {obj.user.email}"
        return f"Invitado: {obj.session_key[:10]}..."
    cart_info.short_description = 'Propietario'
    
    def total_items_display(self, obj):
        return obj.total_items
    total_items_display.short_description = 'Items'
    
    def total_price_display(self, obj):
        return f"${obj.total_price:,.0f}"
    total_price_display.short_description = 'Total'

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart_info', 'product', 'variant_info', 'quantity', 'subtotal_display')
    list_filter = ('cart__created_at', 'product__category')
    search_fields = ('product__name', 'cart__user__email')
    readonly_fields = ('cart', 'product', 'variant', 'subtotal_display')
    
    def cart_info(self, obj):
        if obj.cart.user:
            return f"Usuario: {obj.cart.user.email}"
        return f"Invitado: {obj.cart.session_key[:10]}..."
    cart_info.short_description = 'Carrito'
    
    def variant_info(self, obj):
        if obj.variant:
            return f"{obj.variant.size} - {obj.variant.color}"
        return "Sin variante"
    variant_info.short_description = 'Variante'
    
    def subtotal_display(self, obj):
        return f"${obj.subtotal:,.0f}"
    subtotal_display.short_description = 'Subtotal'