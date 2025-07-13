from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from products.serializers import ProductSerializer, ProductVariantSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'variant', 'quantity', 'price', 'subtotal']

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'changed_by_name', 'notes', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    customer_name = serializers.ReadOnlyField()
    customer_email = serializers.ReadOnlyField()
    assigned_admin_name = serializers.CharField(source='assigned_admin.get_full_name', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'tracking_number', 'assigned_admin', 
                 'assigned_admin_name', 'billing_first_name', 'billing_last_name', 
                 'billing_email', 'billing_phone', 'billing_address', 'billing_city', 
                 'billing_department', 'billing_postal_code', 'shipping_first_name', 
                 'shipping_last_name', 'shipping_address', 'shipping_city', 
                 'shipping_department', 'shipping_postal_code', 'subtotal', 
                 'shipping_cost', 'tax', 'total', 'created_at', 'updated_at', 
                 'items', 'status_history', 'customer_name', 'customer_email']

class OrderCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(child=serializers.DictField(), write_only=True)
    
    class Meta:
        model = Order
        fields = ['billing_first_name', 'billing_last_name', 'billing_email', 
                 'billing_phone', 'billing_address', 'billing_city', 
                 'billing_department', 'billing_postal_code', 'shipping_first_name', 
                 'shipping_last_name', 'shipping_address', 'shipping_city', 
                 'shipping_department', 'shipping_postal_code', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate totals
        subtotal = 0
        for item_data in items_data:
            product = item_data['product']
            variant = item_data.get('variant')
            quantity = item_data['quantity']
            
            if variant:
                price = variant.final_price
            else:
                price = product.price
            
            subtotal += price * quantity
        
        # Create order
        order = Order.objects.create(
            subtotal=subtotal,
            total=subtotal,  # Add shipping and tax calculation here
            **validated_data
        )
        
        # Create order items
        for item_data in items_data:
            product = item_data['product']
            variant = item_data.get('variant')
            quantity = item_data['quantity']
            
            if variant:
                price = variant.final_price
            else:
                price = product.price
            
            OrderItem.objects.create(
                order=order,
                product=product,
                variant=variant,
                quantity=quantity,
                price=price
            )
        
        return order