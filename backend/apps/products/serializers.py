from rest_framework import serializers
from .models import Category, Subcategory, Brand, Product, ProductVariant, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            else:
                return f"http://localhost:8000{obj.image.url}"
        return None
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'display_name', 'description', 'image', 'is_active', 'created_at']


class CategoryWriteSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating categories with image upload support"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'display_name', 'description', 'image', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
      

class SubcategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.display_name', read_only=True)
    
    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'description', 'category', 'category_name', 'is_active']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'description', 'is_active']

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            else:
                return f"http://localhost:8000{obj.image.url}"
        return None
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main', 'order']

class ProductVariantSerializer(serializers.ModelSerializer):
    final_price = serializers.ReadOnlyField()
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'color', 'stock', 'price_adjustment', 'final_price']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.display_name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    main_image = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'category', 'category_name', 
                 'subcategory', 'subcategory_name', 'brand', 'brand_name', 
                 'price', 'stock', 'is_active', 'is_featured', 'images', 
                 'variants', 'main_image', 'is_in_stock', 'created_at', 'updated_at']
        

class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.display_name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    main_image = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'category_name', 'brand_name', 'price', 
                 'main_image', 'is_in_stock', 'is_featured']