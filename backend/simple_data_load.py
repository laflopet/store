import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'store.settings')
django.setup()

from apps.products.models import Category, Brand, Product
from apps.accounts.models import User
from decimal import Decimal

def create_sample_data():
    print("Creando datos de ejemplo...")
    
    # Crear superadmin si no existe
    if not User.objects.filter(email='admin@modaltela.com').exists():
        superuser = User.objects.create_user(
            email='admin@modaltela.com',
            username='superadmin',
            first_name='Super',
            last_name='Admin',
            password='admin123',
            role='super_admin',
            is_staff=True,
            is_superuser=True
        )
        print(f"Superusuario creado: {superuser.email}")
    
    # Crear admin si no existe
    if not User.objects.filter(email='admin1@modaltela.com').exists():
        admin = User.objects.create_user(
            email='admin1@modaltela.com',
            username='admin1',
            first_name='Maria',
            last_name='Garcia',
            password='admin123',
            role='admin',
            is_staff=True
        )
        print(f"Admin creado: {admin.email}")
    
    # Crear categorías
    categories_data = [
        ('hombres', 'Ropa para hombres'),
        ('mujeres', 'Ropa para mujeres'),
        ('ninos', 'Ropa para niños'),
        ('bebes', 'Ropa para bebés')
    ]
    
    for name, desc in categories_data:
        category, created = Category.objects.get_or_create(
            name=name,
            defaults={'description': desc}
        )
        if created:
            print(f"Categoria creada: {category.get_name_display()}")
    
    # Crear marcas
    brands_data = [
        ('Nike', 'Marca deportiva'),
        ('Adidas', 'Marca deportiva'),
        ('Zara', 'Moda contemporanea'),
        ('H&M', 'Moda accesible'),
        ('Levis', 'Jeans originales')
    ]
    
    for name, desc in brands_data:
        brand, created = Brand.objects.get_or_create(
            name=name,
            defaults={'description': desc}
        )
        if created:
            print(f"Marca creada: {brand.name}")
    
    # Crear productos
    nike = Brand.objects.get(name='Nike')
    zara = Brand.objects.get(name='Zara')
    hombres = Category.objects.get(name='hombres')
    mujeres = Category.objects.get(name='mujeres')
    
    products_data = [
        {
            'name': 'Camiseta Nike Dri-FIT',
            'description': 'Camiseta deportiva con tecnologia Dri-FIT',
            'category': hombres,
            'brand': nike,
            'price': Decimal('89900'),
            'stock': 50,
            'is_featured': True
        },
        {
            'name': 'Vestido Zara Midi',
            'description': 'Vestido midi elegante',
            'category': mujeres,
            'brand': zara,
            'price': Decimal('159900'),
            'stock': 30,
            'is_featured': True
        }
    ]
    
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            name=product_data['name'],
            defaults=product_data
        )
        if created:
            print(f"Producto creado: {product.name}")
    
    print("Datos de ejemplo cargados exitosamente!")

if __name__ == '__main__':
    create_sample_data()