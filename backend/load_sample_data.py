# management/commands/load_sample_data.py
import os
import django
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decimal import Decimal
import random
from io import BytesIO
import requests
from PIL import Image
from django.core.files.base import ContentFile

# Configurar Django si se ejecuta como script standalone
if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'store.settings')
    django.setup()

from apps.products.models import Category, Subcategory, Brand, Product, ProductImage, ProductVariant
from apps.accounts.models import User

User = get_user_model()

class Command(BaseCommand):
    help = 'Cargar datos de ejemplo para Modal Tela'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Limpiar datos existentes antes de cargar nuevos',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('🗑️ Limpiando datos existentes...')
            self.clear_existing_data()

        self.stdout.write('🚀 Iniciando carga de datos de ejemplo...')
        
        # Crear usuarios de ejemplo
        self.create_sample_users()
        
        # Crear categorías
        categories = self.create_categories()
        
        # Crear subcategorías
        subcategories = self.create_subcategories(categories)
        
        # Crear marcas
        brands = self.create_brands()
        
        # Crear productos
        products = self.create_products(categories, subcategories, brands)
        
        # Crear variantes
        self.create_product_variants(products)
        
        # Crear imágenes de productos
        self.create_product_images(products)
        
        self.stdout.write(
            self.style.SUCCESS('✅ ¡Datos de ejemplo cargados exitosamente!')
        )

    def clear_existing_data(self):
        """Limpiar datos existentes (excepto superusuarios)"""
        ProductImage.objects.all().delete()
        ProductVariant.objects.all().delete()
        Product.objects.all().delete()
        Subcategory.objects.all().delete()
        Category.objects.all().delete()
        Brand.objects.all().delete()
        # No eliminar usuarios admin/superusuarios
        User.objects.filter(is_superuser=False, role='customer').delete()

    def create_sample_users(self):
        """Crear usuarios de ejemplo"""
        self.stdout.write('👥 Creando usuarios de ejemplo...')
        
        users_data = [
            {
                'email': 'admin@modaltela.com',
                'username': 'superadmin',
                'first_name': 'Super',
                'last_name': 'Admin',
                'role': 'super_admin',
                'is_staff': True,
                'is_superuser': True,
                'password': 'admin123'
            },
            {
                'email': 'admin1@modaltela.com',
                'username': 'admin1',
                'first_name': 'María',
                'last_name': 'García',
                'role': 'admin',
                'is_staff': True,
                'password': 'admin123'
            },
            {
                'email': 'admin2@modaltela.com',
                'username': 'admin2',
                'first_name': 'Carlos',
                'last_name': 'Rodríguez',
                'role': 'admin',
                'is_staff': True,
                'password': 'admin123'
            },
            {
                'email': 'cliente1@test.com',
                'username': 'cliente1',
                'first_name': 'Ana',
                'last_name': 'Martínez',
                'role': 'customer',
                'phone': '3001234567',
                'password': 'cliente123'
            },
            {
                'email': 'cliente2@test.com',
                'username': 'cliente2',
                'first_name': 'Juan',
                'last_name': 'López',
                'role': 'customer',
                'phone': '3109876543',
                'password': 'cliente123'
            }
        ]
        
        for user_data in users_data:
            password = user_data.pop('password')
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults=user_data
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(f'  ✅ Usuario creado: {user.email}')

    def create_categories(self):
        """Crear categorías principales"""
        self.stdout.write('📂 Creando categorías...')
        
        categories_data = [
            {
                'name': 'hombres',
                'description': 'Ropa y accesorios para hombres de todas las edades. Encuentra desde ropa casual hasta formal.'
            },
            {
                'name': 'mujeres',
                'description': 'Moda femenina moderna y elegante. Descubre las últimas tendencias en ropa para mujer.'
            },
            {
                'name': 'ninos',
                'description': 'Ropa cómoda y divertida para niños. Prendas de calidad que acompañan su crecimiento.'
            },
            {
                'name': 'bebes',
                'description': 'Ropa suave y delicada para los más pequeños. Prendas diseñadas con amor y cuidado.'
            }
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'  ✅ Categoría creada: {category.get_name_display()}')
        
        return categories

    def create_subcategories(self, categories):
        """Crear subcategorías"""
        self.stdout.write('📁 Creando subcategorías...')
        
        subcategories_data = {
            'hombres': [
                ('Camisetas', 'Camisetas de manga corta y larga para hombre'),
                ('Pantalones', 'Pantalones casuales, jeans y formales'),
                ('Chaquetas', 'Chaquetas, blazers y abrigos'),
                ('Zapatos', 'Calzado deportivo, casual y formal'),
                ('Accesorios', 'Cinturones, gorras, billeteras y más'),
                ('Ropa Interior', 'Boxers, camisetas interiores y calcetines'),
                ('Deportiva', 'Ropa deportiva y activewear para hombre')
            ],
            'mujeres': [
                ('Vestidos', 'Vestidos elegantes, casuales y de fiesta'),
                ('Blusas', 'Blusas y camisas para toda ocasión'),
                ('Pantalones', 'Pantalones, jeans y leggings'),
                ('Faldas', 'Faldas cortas, largas y midi'),
                ('Zapatos', 'Zapatos de tacón, flats y deportivos'),
                ('Accesorios', 'Bolsos, joyería y accesorios'),
                ('Ropa Interior', 'Lencería, brassieres y ropa interior'),
                ('Deportiva', 'Ropa deportiva y yoga para mujer')
            ],
            'ninos': [
                ('Camisetas', 'Camisetas divertidas y cómodas para niños'),
                ('Pantalones', 'Pantalones y shorts para niños'),
                ('Vestidos', 'Vestidos bonitos para niñas'),
                ('Zapatos', 'Calzado cómodo para niños'),
                ('Pijamas', 'Pijamas y ropa de dormir'),
                ('Uniformes', 'Uniformes escolares y deportivos'),
                ('Accesorios', 'Mochilas, gorras y accesorios infantiles')
            ],
            'bebes': [
                ('Bodies', 'Bodies suaves para bebés'),
                ('Pijamas', 'Pijamas y ropa de dormir para bebés'),
                ('Conjuntos', 'Conjuntos completos para bebés'),
                ('Zapatos', 'Zapatitos y calcetines para bebés'),
                ('Accesorios', 'Baberos, mantas y accesorios'),
                ('Ropa de Baño', 'Ropa para el baño y toallas'),
                ('Seasonal', 'Ropa de temporada para bebés')
            ]
        }
        
        subcategories = {}
        for cat_name, subcats in subcategories_data.items():
            category = categories[cat_name]
            subcategories[cat_name] = {}
            
            for subcat_name, description in subcats:
                subcategory, created = Subcategory.objects.get_or_create(
                    category=category,
                    name=subcat_name,
                    defaults={'description': description}
                )
                subcategories[cat_name][subcat_name] = subcategory
                if created:
                    self.stdout.write(f'  ✅ Subcategoría creada: {category.get_name_display()} > {subcat_name}')
        
        return subcategories

    def create_brands(self):
        """Crear marcas"""
        self.stdout.write('🏷️ Creando marcas...')
        
        brands_data = [
            {
                'name': 'Nike',
                'description': 'Marca líder mundial en ropa deportiva y calzado atlético'
            },
            {
                'name': 'Adidas',
                'description': 'Marca alemana de ropa deportiva y estilo de vida'
            },
            {
                'name': 'Zara',
                'description': 'Moda contemporánea y tendencias actuales'
            },
            {
                'name': 'H&M',
                'description': 'Moda accesible y sostenible para toda la familia'
            },
            {
                'name': 'Levis',
                'description': 'La marca original de jeans desde 1853'
            },
            {
                'name': 'Polo Ralph Lauren',
                'description': 'Elegancia americana clásica y sofisticada'
            },
            {
                'name': 'Gap',
                'description': 'Ropa casual americana para toda la familia'
            },
            {
                'name': 'Uniqlo',
                'description': 'Ropa básica de alta calidad y diseño funcional'
            },
            {
                'name': 'Mango',
                'description': 'Moda española moderna y accesible'
            },
            {
                'name': 'Calvin Klein',
                'description': 'Diseño minimalista y elegancia moderna'
            }
        ]
        
        brands = {}
        for brand_data in brands_data:
            brand, created = Brand.objects.get_or_create(
                name=brand_data['name'],
                defaults=brand_data
            )
            brands[brand_data['name']] = brand
            if created:
                self.stdout.write(f'  ✅ Marca creada: {brand.name}')
        
        return brands

    def create_products(self, categories, subcategories, brands):
        """Crear productos de ejemplo"""
        self.stdout.write('🛍️ Creando productos...')
        
        products_data = [
            # HOMBRES
            {
                'name': 'Camiseta Nike Dri-FIT Running',
                'description': 'Camiseta de running con tecnología Dri-FIT que mantiene la piel seca. Perfecta para entrenamientos intensos y carreras largas.',
                'category': 'hombres',
                'subcategory': 'Camisetas',
                'brand': 'Nike',
                'price': Decimal('89900'),
                'stock': 50,
                'is_featured': True
            },
            {
                'name': 'Jean Levis 511 Slim Fit',
                'description': 'Jean clásico de corte slim que se adapta perfectamente al cuerpo. Fabricado con denim de alta calidad y diseño atemporal.',
                'category': 'hombres',
                'subcategory': 'Pantalones',
                'brand': 'Levis',
                'price': Decimal('249900'),
                'stock': 30,
                'is_featured': True
            },
            {
                'name': 'Chaqueta Adidas Track Jacket',
                'description': 'Chaqueta deportiva clásica con las icónicas tres rayas. Perfecta para el gimnasio o uso casual.',
                'category': 'hombres',
                'subcategory': 'Chaquetas',
                'brand': 'Adidas',
                'price': Decimal('199900'),
                'stock': 25
            },
            {
                'name': 'Zapatos Nike Air Max 270',
                'description': 'Zapatillas con la unidad Air más grande de Nike para máxima comodidad durante todo el día.',
                'category': 'hombres',
                'subcategory': 'Zapatos',
                'brand': 'Nike',
                'price': Decimal('449900'),
                'stock': 40,
                'is_featured': True
            },
            {
                'name': 'Camisa Polo Ralph Lauren Classic',
                'description': 'Camisa polo clásica de algodón pique con bordado del icónico jugador de polo.',
                'category': 'hombres',
                'subcategory': 'Camisetas',
                'brand': 'Polo Ralph Lauren',
                'price': Decimal('189900'),
                'stock': 35
            },
            
            # MUJERES
            {
                'name': 'Vestido Zara Midi Floral',
                'description': 'Vestido midi con estampado floral, perfecto para ocasiones especiales. Corte favorecedor y tela fluida.',
                'category': 'mujeres',
                'subcategory': 'Vestidos',
                'brand': 'Zara',
                'price': Decimal('159900'),
                'stock': 20,
                'is_featured': True
            },
            {
                'name': 'Blusa H&M Seda Sintética',
                'description': 'Blusa elegante de seda sintética, ideal para la oficina o cenas especiales. Corte moderno y cómodo.',
                'category': 'mujeres',
                'subcategory': 'Blusas',
                'brand': 'H&M',
                'price': Decimal('119900'),
                'stock': 45
            },
            {
                'name': 'Jean Levis 721 High Rise Skinny',
                'description': 'Jean de tiro alto que estiliza la figura. Corte skinny moderno con la calidad Levis de siempre.',
                'category': 'mujeres',
                'subcategory': 'Pantalones',
                'brand': 'Levis',
                'price': Decimal('229900'),
                'stock': 38,
                'is_featured': True
            },
            {
                'name': 'Zapatos Calvin Klein Stiletto',
                'description': 'Zapatos de tacón alto con diseño minimalista. Perfectos para looks elegantes y profesionales.',
                'category': 'mujeres',
                'subcategory': 'Zapatos',
                'brand': 'Calvin Klein',
                'price': Decimal('299900'),
                'stock': 15
            },
            {
                'name': 'Falda Mango Plisada',
                'description': 'Falda midi plisada con cintura alta. Versátil y elegante para múltiples ocasiones.',
                'category': 'mujeres',
                'subcategory': 'Faldas',
                'brand': 'Mango',
                'price': Decimal('89900'),
                'stock': 32
            },
            
            # NIÑOS
            {
                'name': 'Camiseta Adidas Kids Logo',
                'description': 'Camiseta cómoda para niños con el logo clásico de Adidas. Perfecta para jugar y hacer deporte.',
                'category': 'ninos',
                'subcategory': 'Camisetas',
                'brand': 'Adidas',
                'price': Decimal('59900'),
                'stock': 60,
                'is_featured': True
            },
            {
                'name': 'Pantalón Gap Kids Chino',
                'description': 'Pantalón chino cómodo y resistente. Ideal para el colegio y ocasiones casuales.',
                'category': 'ninos',
                'subcategory': 'Pantalones',
                'brand': 'Gap',
                'price': Decimal('79900'),
                'stock': 45
            },
            {
                'name': 'Vestido H&M Kids Princess',
                'description': 'Vestido de princesa con tul y detalles brillantes. Perfecto para fiestas y ocasiones especiales.',
                'category': 'ninos',
                'subcategory': 'Vestidos',
                'brand': 'H&M',
                'price': Decimal('99900'),
                'stock': 25
            },
            {
                'name': 'Zapatos Nike Kids Air Force 1',
                'description': 'Versión para niños del icónico Air Force 1. Cómodos y duraderos para uso diario.',
                'category': 'ninos',
                'subcategory': 'Zapatos',
                'brand': 'Nike',
                'price': Decimal('179900'),
                'stock': 30
            },
            
            # BEBÉS
            {
                'name': 'Body Gap Baby Organic Cotton',
                'description': 'Body de algodón orgánico súper suave. Perfecto para la piel delicada del bebé.',
                'category': 'bebes',
                'subcategory': 'Bodies',
                'brand': 'Gap',
                'price': Decimal('39900'),
                'stock': 80,
                'is_featured': True
            },
            {
                'name': 'Pijama H&M Baby Animal Print',
                'description': 'Pijama de dos piezas con estampado de animales. Cómoda y adorable para las noches del bebé.',
                'category': 'bebes',
                'subcategory': 'Pijamas',
                'brand': 'H&M',
                'price': Decimal('49900'),
                'stock': 55
            },
            {
                'name': 'Conjunto Uniqlo Baby Basics',
                'description': 'Conjunto básico de tres piezas. Calidad superior y diseño funcional para bebés.',
                'category': 'bebes',
                'subcategory': 'Conjuntos',
                'brand': 'Uniqlo',
                'price': Decimal('69900'),
                'stock': 40
            },
            {
                'name': 'Zapatitos Nike Baby Swoosh',
                'description': 'Primeros zapatos con el icónico swoosh de Nike. Suaves y perfectos para los primeros pasos.',
                'category': 'bebes',
                'subcategory': 'Zapatos',
                'brand': 'Nike',
                'price': Decimal('89900'),
                'stock': 35
            }
        ]
        
        products = []
        for product_data in products_data:
            category = categories[product_data['category']]
            subcategory = subcategories[product_data['category']][product_data['subcategory']]
            brand = brands[product_data['brand']]
            
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    'description': product_data['description'],
                    'category': category,
                    'subcategory': subcategory,
                    'brand': brand,
                    'price': product_data['price'],
                    'stock': product_data['stock'],
                    'is_featured': product_data.get('is_featured', False)
                }
            )
            
            if created:
                products.append(product)
                featured_text = " (Destacado)" if product.is_featured else ""
                self.stdout.write(f'  ✅ Producto creado: {product.name}{featured_text}')
        
        return products

    def create_product_variants(self, products):
        """Crear variantes para productos"""
        self.stdout.write('🎨 Creando variantes de productos...')
        
        # Tallas por categoría
        sizes_by_category = {
            'hombres': ['S', 'M', 'L', 'XL', 'XXL'],
            'mujeres': ['XS', 'S', 'M', 'L', 'XL'],
            'ninos': ['4', '6', '8', '10', '12', '14'],
            'bebes': ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M']
        }
        
        # Colores disponibles
        colors = ['negro', 'blanco', 'azul', 'rojo', 'verde', 'gris', 'rosa', 'amarillo']
        
        variant_count = 0
        for product in products:
            category_name = product.category.name
            available_sizes = sizes_by_category.get(category_name, ['S', 'M', 'L'])
            
            # Seleccionar aleatoriamente 2-4 tallas y 2-3 colores
            selected_sizes = random.sample(available_sizes, min(random.randint(2, 4), len(available_sizes)))
            selected_colors = random.sample(colors, random.randint(2, 3))
            
            for size in selected_sizes:
                for color in selected_colors:
                    # Precio adicional aleatorio (0-20% del precio base)
                    price_adjustment = random.choice([
                        Decimal('0'),
                        Decimal('0'),  # Más probabilidad de precio base
                        Decimal('0'),
                        round(product.price * Decimal('0.1'), 0),  # 10% más
                        round(product.price * Decimal('0.15'), 0)  # 15% más
                    ])
                    
                    # Stock aleatorio para cada variante
                    variant_stock = random.randint(5, 25)
                    
                    variant, created = ProductVariant.objects.get_or_create(
                        product=product,
                        size=size,
                        color=color,
                        defaults={
                            'stock': variant_stock,
                            'price_adjustment': price_adjustment
                        }
                    )
                    
                    if created:
                        variant_count += 1
        
        self.stdout.write(f'  ✅ {variant_count} variantes creadas')

    def create_product_images(self, products):
        """Crear imágenes de ejemplo para productos"""
        self.stdout.write('🖼️ Creando imágenes de productos...')
        
        # URLs de imágenes de ejemplo de Unsplash
        image_urls_by_category = {
            'hombres': [
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',  # Camiseta
                'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',   # Jean
                'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', # Chaqueta
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',   # Zapatos
                'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400'  # Polo
            ],
            'mujeres': [
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', # Vestido
                'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', # Blusa
                'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', # Jean
                'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',   # Zapatos
                'https://images.unsplash.com/photo-1583496661160-fb5886a13d1e?w=400'  # Falda
            ],
            'ninos': [
                'https://images.unsplash.com/photo-1503944168656-b54ae56e7a0a?w=400', # Camiseta
                'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400', # Pantalón
                'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400', # Vestido
                'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'   # Zapatos
            ],
            'bebes': [
                'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400',   # Body
                'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=400', # Pijama
                'https://images.unsplash.com/photo-1520119944704-75c1864b8b83?w=400', # Conjunto
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'  # Zapatitos
            ]
        }
        
        image_count = 0
        for i, product in enumerate(products):
            category_name = product.category.name
            available_urls = image_urls_by_category.get(category_name, [])
            
            if not available_urls:
                continue
            
            # Seleccionar URL de imagen basada en el índice del producto
            url_index = i % len(available_urls)
            image_url = available_urls[url_index]
            
            try:
                # Descargar imagen
                response = requests.get(image_url, timeout=10)
                if response.status_code == 200:
                    # Crear imagen
                    img = Image.open(BytesIO(response.content))
                    img = img.convert('RGB')
                    img = img.resize((400, 400), Image.Resampling.LANCZOS)
                    
                    # Guardar imagen
                    img_io = BytesIO()
                    img.save(img_io, format='JPEG', quality=85)
                    img_io.seek(0)
                    
                    # Crear ProductImage
                    image_name = f"{product.name.lower().replace(' ', '_')}_main.jpg"
                    product_image = ProductImage(
                        product=product,
                        is_main=True,
                        order=0
                    )
                    product_image.image.save(
                        image_name,
                        ContentFile(img_io.getvalue()),
                        save=True
                    )
                    image_count += 1
                    
            except Exception as e:
                self.stdout.write(f'  ❌ Error al crear imagen para {product.name}: {str(e)}')
                continue
        
        self.stdout.write(f'  ✅ {image_count} imágenes creadas')

# Script standalone para ejecutar directamente
if __name__ == '__main__':
    command = Command()
    command.handle(clear=True)
    print("✅ ¡Datos de ejemplo cargados exitosamente!")

# También crear management command
# Guardar como: products/management/commands/load_sample_data.py