from rest_framework import generics, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Subcategory, Brand, Product
from .serializers import (CategorySerializer, SubcategorySerializer, 
                         BrandSerializer, ProductSerializer, ProductListSerializer)

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]