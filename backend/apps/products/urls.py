from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    # path('subcategories/', views.SubcategoryListView.as_view(), name='subcategories'),
    # path('brands/', views.BrandListView.as_view(), name='brands'),
    # path('', views.ProductListView.as_view(), name='products'),
    # path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    # path('featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
]