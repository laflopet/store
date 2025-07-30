from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer
from apps.products.models import Product, ProductVariant

class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_object(self):
        if self.request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=self.request.user)
        else:
            session_key = self.request.session.session_key
            if not session_key:
                self.request.session.create()
                session_key = self.request.session.session_key
            cart, created = Cart.objects.get_or_create(session_key=session_key)
        return cart

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def add_to_cart(request):
    serializer = AddToCartSerializer(data=request.data)
    if serializer.is_valid():
        product_id = serializer.validated_data['product_id']
        variant_id = serializer.validated_data.get('variant_id')
        quantity = serializer.validated_data['quantity']
        
        product = get_object_or_404(Product, id=product_id)
        variant = None
        if variant_id:
            variant = get_object_or_404(ProductVariant, id=variant_id)
        
        # Get or create cart
        if request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=request.user)
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key
            cart, created = Cart.objects.get_or_create(session_key=session_key)
        
        # Add or update cart item
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([permissions.AllowAny])
def update_cart_item(request, item_id):
    quantity = request.data.get('quantity', 1)
    
    try:
        if request.user.is_authenticated:
            cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        else:
            session_key = request.session.session_key
            cart_item = CartItem.objects.get(id=item_id, cart__session_key=session_key)
        
        if quantity <= 0:
            cart_item.delete()
            return Response({'message': 'Item eliminado'}, status=status.HTTP_204_NO_CONTENT)
        else:
            cart_item.quantity = quantity
            cart_item.save()
            return Response(CartSerializer(cart_item.cart).data)
    
    except CartItem.DoesNotExist:
        return Response({'error': 'Item no encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.AllowAny])
def remove_from_cart(request, item_id):
    try:
        if request.user.is_authenticated:
            cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        else:
            session_key = request.session.session_key
            cart_item = CartItem.objects.get(id=item_id, cart__session_key=session_key)
        
        cart_item.delete()
        return Response({'message': 'Item eliminado'}, status=status.HTTP_204_NO_CONTENT)
    
    except CartItem.DoesNotExist:
        return Response({'error': 'Item no encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.AllowAny])
def clear_cart(request):
    if request.user.is_authenticated:
        Cart.objects.filter(user=request.user).delete()
    else:
        session_key = request.session.session_key
        Cart.objects.filter(session_key=session_key).delete()
    
    return Response({'message': 'Carrito limpiado'}, status=status.HTTP_204_NO_CONTENT)