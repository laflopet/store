from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Order, OrderStatusHistory
from .serializers import OrderSerializer, OrderCreateSerializer
from apps.products.models import Product, ProductVariant
from apps.accounts.models import GuestUser

User = get_user_model()

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'super_admin']:
            if user.role == 'super_admin':
                return Order.objects.all()
            else:
                return Order.objects.filter(assigned_admin=user)
        else:
            return Order.objects.filter(user=user)

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'super_admin']:
            return Order.objects.all()
        else:
            return Order.objects.filter(user=user)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_order(request):
    data = request.data.copy()
    
    # Ensure session exists
    if not request.session.session_key:
        request.session.create()
    
    # Handle guest users
    guest_user = None
    if not request.user.is_authenticated:
        guest_data = {
            'session_key': request.session.session_key,
            'email': data.get('email'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'phone': data.get('phone'),
        }
        guest_user, created = GuestUser.objects.get_or_create(
            session_key=request.session.session_key,
            defaults=guest_data
        )
    
    # Process cart items
    items_data = []
    cart_items = data.get('items', [])
    
    for item in cart_items:
        product = get_object_or_404(Product, id=item['product_id'])
        variant = None
        if item.get('variant_id'):
            variant = get_object_or_404(ProductVariant, id=item['variant_id'])
        
        items_data.append({
            'product': product,
            'variant': variant,
            'quantity': item['quantity'],
            'price': item.get('price', variant.final_price if variant else product.price)
        })
    
    # Calculate totals
    subtotal = sum(item['price'] * item['quantity'] for item in items_data)
    
    # Create order data
    order_data = {
        'billing_first_name': data.get('first_name'),
        'billing_last_name': data.get('last_name'),
        'billing_email': data.get('email'),
        'billing_phone': data.get('phone'),
        'billing_address': data.get('address'),
        'billing_city': data.get('city'),
        'billing_department': data.get('department'),
        'billing_postal_code': data.get('postal_code', ''),
        'shipping_first_name': data.get('first_name'),
        'shipping_last_name': data.get('last_name'),
        'shipping_address': data.get('address'),
        'shipping_city': data.get('city'),
        'shipping_department': data.get('department'),
        'shipping_postal_code': data.get('postal_code', ''),
        'subtotal': subtotal,
        'shipping_cost': 0,  # Free shipping
        'tax': 0,  # No tax for now
        'total': subtotal,
    }
    
    try:
        # Create the order
        order = Order.objects.create(**order_data)
        
        # Assign to user or guest
        if request.user.is_authenticated:
            order.user = request.user
        else:
            order.guest_user = guest_user
        
        # Set initial status
        order.status = 'pending'
        order.save()
        
        # Create order items
        from .models import OrderItem
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                variant=item_data.get('variant'),
                quantity=item_data['quantity'],
                price=item_data['price']
            )
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            status='pending',
            changed_by=request.user if request.user.is_authenticated else None,
            notes='Pedido creado'
        )
        
        return Response({
            'success': True,
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_order_status(request, order_id):
    if request.user.role not in ['admin', 'super_admin']:
        return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
    
    order = get_object_or_404(Order, id=order_id)
    new_status = request.data.get('status')
    tracking_number = request.data.get('tracking_number', '')
    shipping_company = request.data.get('shipping_company', '')
    notes = request.data.get('notes', '')
    
    if new_status:
        order.status = new_status
        if tracking_number:
            order.tracking_number = tracking_number
        if shipping_company:
            order.shipping_company = shipping_company
        order.save()
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            changed_by=request.user,
            notes=notes
        )
        
        return Response(OrderSerializer(order).data)
    
    return Response({'error': 'Estado requerido'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def assign_order(request, order_id):
    if request.user.role != 'super_admin':
        return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
    
    order = get_object_or_404(Order, id=order_id)
    admin_id = request.data.get('admin_id')
    
    if admin_id:
        admin = get_object_or_404(User, id=admin_id, role__in=['admin', 'super_admin'])
        order.assigned_admin = admin
        order.save()
        
        return Response(OrderSerializer(order).data)
    
    return Response({'error': 'Admin ID requerido'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_order(request, order_id):
    """Rechazar un pedido y reasignarlo al super admin"""
    if request.user.role not in ['admin', 'super_admin']:
        return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
    
    order = get_object_or_404(Order, id=order_id)
    reason = request.data.get('reason', '')
    
    # Find super admin to reassign
    try:
        super_admin = User.objects.filter(role='super_admin').first()
        if super_admin:
            order.assigned_admin = super_admin
            order.save()
            
            # Create status history for rejection
            OrderStatusHistory.objects.create(
                order=order,
                status=order.status,  # Keep current status
                changed_by=request.user,
                notes=f'Pedido rechazado por {request.user.get_full_name() or request.user.username}. Motivo: {reason}. Reasignado al Super Admin.'
            )
            
            return Response({
                'success': True,
                'message': 'Pedido rechazado y reasignado al Super Admin',
                'order': OrderSerializer(order).data
            })
        else:
            return Response({'error': 'No se encontró Super Admin para reasignar'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def order_detail_admin(request, order_id):
    """Obtener detalles completos del pedido para admins"""
    if request.user.role not in ['admin', 'super_admin']:
        return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
    
    order = get_object_or_404(Order, id=order_id)
    
    # Check if admin has access to this order
    if request.user.role == 'admin' and order.assigned_admin != request.user:
        return Response({'error': 'No tienes acceso a este pedido'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get order with all details including items and status history
    serializer = OrderSerializer(order)
    order_data = serializer.data
    
    # Add status history
    order_data['status_history'] = [
        {
            'id': history.id,
            'status': history.status,
            'changed_by': history.changed_by.get_full_name() if history.changed_by else 'Sistema',
            'notes': history.notes,
            'created_at': history.created_at
        }
        for history in order.status_history.all()
    ]
    
    return Response(order_data)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_order_preparation(request, order_id):
    """Actualizar el estado de preparación de productos en un pedido"""
    if request.user.role not in ['admin', 'super_admin']:
        return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
    
    order = get_object_or_404(Order, id=order_id)
    
    # Check if admin has access to this order
    if request.user.role == 'admin' and order.assigned_admin != request.user:
        return Response({'error': 'No tienes acceso a este pedido'}, status=status.HTTP_403_FORBIDDEN)
    
    item_updates = request.data.get('item_updates', {})
    
    try:
        # Update preparation status for items
        from .models import OrderItem
        for item_id, is_prepared in item_updates.items():
            try:
                item = OrderItem.objects.get(id=item_id, order=order)
                item.is_prepared = is_prepared
                item.save()
            except OrderItem.DoesNotExist:
                continue
        
        # Add notes if provided
        notes = request.data.get('notes', '')
        if notes:
            OrderStatusHistory.objects.create(
                order=order,
                status=order.status,
                changed_by=request.user,
                notes=notes
            )
        
        return Response({
            'success': True,
            'order': OrderSerializer(order).data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def lookup_order(request):
    """Buscar un pedido por número de pedido y email"""
    order_number = request.data.get('order_number', '').strip()
    email = request.data.get('email', '').strip()
    
    if not order_number or not email:
        return Response({'error': 'Número de pedido y email son requeridos'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        order = Order.objects.get(
            order_number__iexact=order_number,
            billing_email__iexact=email
        )
        return Response(OrderSerializer(order).data)
    except Order.DoesNotExist:
        return Response({'error': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND)


