from rest_framework import generics, filters, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Category, Subcategory, Brand, Product, ProductImage, ProductVariant
from .serializers import (CategorySerializer, CategoryWriteSerializer, SubcategorySerializer, 
                         BrandSerializer, ProductSerializer, ProductListSerializer, ProductImageSerializer, ProductVariantSerializer)

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class SubcategoryListView(generics.ListAPIView):
    serializer_class = SubcategorySerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        category_id = self.request.query_params.get('category')
        queryset = Subcategory.objects.filter(is_active=True)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset
    

class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subcategory', 'brand', 'is_featured']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Custom filter for category by name
        category_name = self.request.query_params.get('category')
        if category_name:
            queryset = queryset.filter(category__name=category_name)
            
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


class FeaturedProductsView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_featured=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


class AdminProductCreateView(generics.CreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos para crear productos')
        serializer.save()


class AdminProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos')
        return Product.objects.all()


class AdminProductUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos')
        return Product.objects.all()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_product_image(request, product_id):
    """Upload image for a product"""
    if request.user.role not in ['admin', 'super_admin']:
        return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    if 'image' not in request.FILES:
        return Response({'error': 'No se ha enviado ninguna imagen'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get the highest order number
    max_order = ProductImage.objects.filter(product=product).count()
    
    image = ProductImage.objects.create(
        product=product,
        image=request.FILES['image'],
        is_main=request.data.get('is_main', False),
        order=max_order
    )
    
    # If this is set as main image, remove main from others
    if image.is_main:
        ProductImage.objects.filter(product=product).exclude(id=image.id).update(is_main=False)
    
    serializer = ProductImageSerializer(image)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_product_image(request, product_id, image_id):
    """Delete a product image"""
    if request.user.role not in ['admin', 'super_admin']:
        return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        image = ProductImage.objects.get(id=image_id, product_id=product_id)
        image.delete()
        return Response({'message': 'Imagen eliminada exitosamente'}, status=status.HTTP_200_OK)
    except ProductImage.DoesNotExist:
        return Response({'error': 'Imagen no encontrada'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def set_main_image(request, product_id, image_id):
    """Set an image as the main image for a product"""
    if request.user.role not in ['admin', 'super_admin']:
        return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = Product.objects.get(id=product_id)
        # Remove main from all images
        ProductImage.objects.filter(product=product).update(is_main=False)
        # Set new main image
        image = ProductImage.objects.get(id=image_id, product=product)
        image.is_main = True
        image.save()
        
        serializer = ProductImageSerializer(image)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except (Product.DoesNotExist, ProductImage.DoesNotExist):
        return Response({'error': 'Producto o imagen no encontrada'}, status=status.HTTP_404_NOT_FOUND)


class AdminCategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos')
        return Category.objects.all()


class AdminCategoryCreateView(generics.CreateAPIView):
    serializer_class = CategoryWriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos para crear categorías')
        serializer.save()


class AdminCategoryUpdateView(generics.UpdateAPIView):
    serializer_class = CategoryWriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos')
        return Category.objects.all()


class AdminCategoryDeleteView(generics.DestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos')
        return Category.objects.all()
    
    def perform_destroy(self, instance):
        # Check if category has products before deleting
        if instance.products.exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('No se puede eliminar una categoría que tiene productos asociados')
        # Delete the category completely
        instance.delete()


# Brand Management Views
class AdminBrandListView(generics.ListAPIView):
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos')
        return Brand.objects.all()


class AdminBrandCreateView(generics.CreateAPIView):
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos para crear marcas')
        serializer.save()


class AdminBrandUpdateView(generics.UpdateAPIView):
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos')
        return Brand.objects.all()


class AdminBrandDeleteView(generics.DestroyAPIView):
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos')
        return Brand.objects.all()
    
    def perform_destroy(self, instance):
        # Check if brand has products before deleting
        if instance.products.exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('No se puede eliminar una marca que tiene productos asociados')
        # Delete the brand completely
        instance.delete()


# Product Variants Management Views
class AdminProductVariantListView(generics.ListCreateAPIView):
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos')
        product_id = self.kwargs.get('product_id')
        return ProductVariant.objects.filter(product_id=product_id)
    
    def perform_create(self, serializer):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos para crear variantes')
        product_id = self.kwargs.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        serializer.save(product=product)


class AdminProductVariantUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'super_admin']:
            raise permissions.PermissionDenied('Sin permisos')
        return ProductVariant.objects.all()


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_variant_choices(request):
    """Get available size and color choices for frontend"""
    return Response({
        'sizes': ProductVariant.SIZE_CHOICES,
        'colors': ProductVariant.COLOR_CHOICES
    })
    