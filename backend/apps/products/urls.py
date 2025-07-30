from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    path('subcategories/', views.SubcategoryListView.as_view(), name='subcategories'),
    path('brands/', views.BrandListView.as_view(), name='brands'),
    path('', views.ProductListView.as_view(), name='products'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
    # Admin routes
    path('admin/create/', views.AdminProductCreateView.as_view(), name='admin-product-create'),
    path('admin/', views.AdminProductListView.as_view(), name='admin-products'),
    path('admin/<int:pk>/', views.AdminProductUpdateView.as_view(), name='admin-product-update'),
    # Image management routes
    path('admin/<int:product_id>/images/upload/', views.upload_product_image, name='upload-product-image'),
    path('admin/<int:product_id>/images/<int:image_id>/delete/', views.delete_product_image, name='delete-product-image'),
    path('admin/<int:product_id>/images/<int:image_id>/set-main/', views.set_main_image, name='set-main-image'),
    # Category management routes
    path('admin/categories/', views.AdminCategoryListView.as_view(), name='admin-categories'),
    path('admin/categories/create/', views.AdminCategoryCreateView.as_view(), name='admin-category-create'),
    path('admin/categories/<int:pk>/', views.AdminCategoryUpdateView.as_view(), name='admin-category-update'),
    path('admin/categories/<int:pk>/delete/', views.AdminCategoryDeleteView.as_view(), name='admin-category-delete'),
    # Brand management routes
    path('admin/brands/', views.AdminBrandListView.as_view(), name='admin-brands'),
    path('admin/brands/create/', views.AdminBrandCreateView.as_view(), name='admin-brand-create'),
    path('admin/brands/<int:pk>/', views.AdminBrandUpdateView.as_view(), name='admin-brand-update'),
    path('admin/brands/<int:pk>/delete/', views.AdminBrandDeleteView.as_view(), name='admin-brand-delete'),
    # Variant management routes
    path('admin/<int:product_id>/variants/', views.AdminProductVariantListView.as_view(), name='admin-product-variants'),
    path('admin/variants/<int:pk>/', views.AdminProductVariantUpdateView.as_view(), name='admin-variant-update'),
    path('variant-choices/', views.get_variant_choices, name='variant-choices'),
]