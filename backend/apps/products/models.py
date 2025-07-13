from django.db import models


class Category(models.Model):
    CATEGORY_CHOICES = [
        ('hombres', 'Hombres'),
        ('mujeres', 'Mujeres'),
        ('ninos', 'Niños'),
        ('bebes', 'Bebés'),
    ]

    name = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.get_name_display()
    

class Subcategory(models.Model):
    category = models.ForeignKey(Category, related_name='subcategories', on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Subcategories'
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"
    

class Brand(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    

class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    subcategory = models.ForeignKey(Subcategory, related_name='products', on_delete=models.CASCADE, null=True, blank=True)
    brand = models.ForeignKey(Brand, related_name='products', on_delete=models.CASCADE, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    def __str__(self):
        return self.name
    
    @property
    def main_image(self):
        image = self.images.filter(is_main=True).first()
        return image.image.url if image else None
    
    @property
    def is_in_stock(self):
        return self.stock > 0
    

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    is_main = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.product.name} - Image {self.order}"
    

class ProductVariant(models.Model):
    SIZE_CHOICES = [
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double Extra Large'),
    ]
    
    COLOR_CHOICES = [
        ('rojo', 'Rojo'),
        ('azul', 'Azul'),
        ('verde', 'Verde'),
        ('negro', 'Negro'),
        ('blanco', 'Blanco'),
        ('gris', 'Gris'),
        ('amarillo', 'Amarillo'),
        ('rosa', 'Rosa'),
    ]

    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    size = models.CharField(max_length=3, choices=SIZE_CHOICES)
    color = models.CharField(max_length=20, choices=COLOR_CHOICES)
    stock = models.PositiveIntegerField(default=0)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        unique_together = ('product', 'size', 'color')

    def __str__(self):
        return f"{self.product.name} - {self.size} - {self.color}"
    
    @property
    def final_price(self):
        return self.product.price + self.price_adjustment
