from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Subcategory, Brand, Product, ProductImage, ProductVariant

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_display_name', 'is_active', 'product_count', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)
    
    def get_display_name(self, obj):
        return obj.get_name_display()
    get_display_name.short_description = 'Nombre Mostrado'
    
    def product_count(self, obj):
        return obj.product_set.count()
    product_count.short_description = 'Productos'

@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active', 'product_count')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')
    
    def product_count(self, obj):
        return obj.product_set.count()
    product_count.short_description = 'Productos'

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'product_count', 'logo_preview')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    
    def product_count(self, obj):
        return obj.product_set.count()
    product_count.short_description = 'Productos'
    
    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.logo.url)
        return "Sin logo"
    logo_preview.short_description = 'Logo'

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'is_main', 'order', 'image_preview')
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" style="object-fit: cover;" />', obj.image.url)
        return "Sin imagen"
    image_preview.short_description = 'Vista Previa'

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('size', 'color', 'stock', 'price_adjustment', 'final_price_display')
    readonly_fields = ('final_price_display',)
    
    def final_price_display(self, obj):
        if obj.pk:
            return f"${obj.final_price:,.0f}"
        return "-"
    final_price_display.short_description = 'Precio Final'

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'subcategory', 'brand', 'price_display', 
                   'stock', 'is_active', 'is_featured', 'image_preview')
    list_filter = ('category', 'subcategory', 'brand', 'is_active', 'is_featured', 'created_at')
    search_fields = ('name', 'description')
    list_editable = ('is_active', 'is_featured', 'stock')
    inlines = [ProductImageInline, ProductVariantInline]
    readonly_fields = ('created_at', 'updated_at', 'main_image_preview')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'category', 'subcategory', 'brand')
        }),
        ('Precios e Inventario', {
            'fields': ('price', 'stock')
        }),
        ('Estado', {
            'fields': ('is_active', 'is_featured')
        }),
        ('Vista Previa', {
            'fields': ('main_image_preview',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def price_display(self, obj):
        return f"${obj.price:,.0f}"
    price_display.short_description = 'Precio'
    
    def image_preview(self, obj):
        if obj.main_image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.main_image)
        return "Sin imagen"
    image_preview.short_description = 'Imagen'
    
    def main_image_preview(self, obj):
        if obj.main_image:
            return format_html('<img src="{}" width="200" height="200" style="object-fit: cover;" />', obj.main_image)
        return "Sin imagen principal"
    main_image_preview.short_description = 'Imagen Principal'

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'is_main', 'order', 'image_preview')
    list_filter = ('is_main', 'product__category')
    search_fields = ('product__name',)
    list_editable = ('is_main', 'order')
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" style="object-fit: cover;" />', obj.image.url)
        return "Sin imagen"
    image_preview.short_description = 'Vista Previa'

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'size', 'color', 'stock', 'price_adjustment', 'final_price_display')
    list_filter = ('size', 'color', 'product__category')
    search_fields = ('product__name',)
    list_editable = ('stock', 'price_adjustment')
    
    def final_price_display(self, obj):
        return f"${obj.final_price:,.0f}"
    final_price_display.short_description = 'Precio Final'
