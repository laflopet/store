# Modal Tela - Plataforma E-commerce

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![Django](https://img.shields.io/badge/Django-5.2.3-green.svg)
![React](https://img.shields.io/badge/React-19.1.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)

**Modal Tela** es una plataforma de comercio electrónico completa desarrollada para SENA, especializada en ropa para toda la familia (hombres, mujeres, niños y bebés). El proyecto implementa una arquitectura moderna con Django REST Framework en el backend y React en el frontend.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Uso del Sistema](#-uso-del-sistema)
- [API Endpoints](#-api-endpoints)
- [Funcionalidades](#-funcionalidades)
- [Roles y Permisos](#-roles-y-permisos)
- [Base de Datos](#-base-de-datos)
- [Características Técnicas](#-características-técnicas)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🚀 Características Principales

### Para Clientes
- ✅ **Catálogo de productos** con filtros avanzados (categoría, marca, precio)
- ✅ **Búsqueda inteligente** con sugerencias y filtros dinámicos
- ✅ **Carrito de compras** persistente con gestión de cantidades
- ✅ **Proceso de checkout** completo con datos de envío
- ✅ **Consulta de pedidos** para usuarios registrados y invitados
- ✅ **Seguimiento de envíos** con número de guía y transportadora
- ✅ **Perfil de usuario** con historial de pedidos y gestión de datos
- ✅ **Variantes de productos** por talla y color
- ✅ **Diseño responsivo** para dispositivos móviles y desktop

### Para Administradores
- ✅ **Panel administrativo** completo con gestión de productos, categorías y marcas
- ✅ **Gestión de pedidos** con cambios de estado y asignación de administradores
- ✅ **Control de inventario** con stock por variantes
- ✅ **Gestión de usuarios** (solo super administradores)
- ✅ **Sistema de tracking** para envíos con empresas transportadoras
- ✅ **Historial de cambios** en estados de pedidos
- ✅ **Gestión de imágenes** múltiples por producto con selección de imagen principal

### Características de Seguridad
- ✅ **Autenticación JWT** con tokens de acceso y refresh
- ✅ **Control de roles** (cliente, administrador, super administrador)
- ✅ **Rutas protegidas** con verificación de permisos
- ✅ **Timeout de sesión** por inactividad (30 minutos)
- ✅ **Validaciones** tanto en frontend como backend

## 🏗️ Arquitectura del Sistema

### Backend (Django REST Framework)
```
backend/
├── apps/
│   ├── accounts/     # Gestión de usuarios y autenticación
│   ├── products/     # Catálogo de productos, categorías, marcas
│   ├── cart/         # Carrito de compras
│   └── orders/       # Gestión de pedidos y estados
├── store/            # Configuración principal del proyecto
├── media/            # Archivos multimedia (imágenes)
└── db.sqlite3        # Base de datos SQLite
```

### Frontend (React)
```
frontend/modal-tela-frontend/
├── src/
│   ├── components/   # Componentes reutilizables
│   ├── contexts/     # Estado global (Auth, Cart)
│   ├── hooks/        # Hooks personalizados
│   ├── pages/        # Páginas principales
│   ├── data/         # Datos estáticos (Colombia)
│   └── assets/       # Recursos estáticos
└── public/           # Archivos públicos
```

## 💻 Tecnologías Utilizadas

### Backend
- **Django 5.2.3** - Framework web principal
- **Django REST Framework 3.16.0** - API REST
- **Django CORS Headers** - Manejo de CORS
- **Django Filter** - Filtros avanzados
- **Simple JWT 5.5.0** - Autenticación JWT
- **Pillow** - Procesamiento de imágenes
- **SQLite** - Base de datos

### Frontend
- **React 19.1.0** - Framework de interfaz de usuario
- **React Router DOM 7.7.0** - Navegación
- **Axios 1.10.0** - Cliente HTTP
- **React Toastify** - Notificaciones
- **Tailwind CSS 3.4.17** - Framework CSS
- **PostCSS & Autoprefixer** - Procesamiento CSS

### Herramientas de Desarrollo
- **Create React App** - Configuración inicial de React
- **ESLint** - Linting de código
- **Web Vitals** - Métricas de rendimiento

## 📁 Estructura del Proyecto

```
STORE/
├── backend/                    # API Django REST Framework
│   ├── apps/
│   │   ├── accounts/          # Usuarios, autenticación, roles
│   │   │   ├── models.py      # User, GuestUser
│   │   │   ├── views.py       # Login, registro, perfil
│   │   │   ├── serializers.py # Serialización de datos
│   │   │   └── urls.py        # Rutas de la app
│   │   ├── products/          # Catálogo de productos
│   │   │   ├── models.py      # Product, Category, Brand, Variant
│   │   │   ├── views.py       # CRUD productos, filtros
│   │   │   ├── serializers.py # Serialización con imágenes
│   │   │   └── urls.py        # Rutas del catálogo
│   │   ├── cart/              # Carrito de compras
│   │   │   ├── models.py      # Cart, CartItem
│   │   │   ├── views.py       # Gestión del carrito
│   │   │   └── urls.py        # Rutas del carrito
│   │   └── orders/            # Gestión de pedidos
│   │       ├── models.py      # Order, OrderItem, StatusHistory
│   │       ├── views.py       # Estados, tracking, admin
│   │       └── urls.py        # Rutas de pedidos
│   ├── store/                 # Configuración Django
│   │   ├── settings.py        # Configuración principal
│   │   └── urls.py           # URLs principales
│   ├── media/                 # Archivos multimedia
│   │   ├── products/         # Imágenes de productos
│   │   ├── categories/       # Imágenes de categorías
│   │   └── brands/           # Imágenes de marcas
│   ├── requirements.txt       # Dependencias Python
│   └── db.sqlite3            # Base de datos
├── frontend/modal-tela-frontend/  # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   └── Header.js     # Navegación principal
│   │   │   ├── Loading.js        # Componente de carga
│   │   │   └── ProtectedRoute.js # Rutas protegidas
│   │   ├── contexts/
│   │   │   ├── AuthContext.js    # Gestión de autenticación
│   │   │   └── CartContext.js    # Gestión del carrito
│   │   ├── hooks/
│   │   │   ├── useOrders.js      # Hook para pedidos
│   │   │   └── useSessionTimeout.js # Timeout de sesión
│   │   ├── pages/
│   │   │   ├── Home.js           # Página principal
│   │   │   ├── Products.js       # Listado de productos
│   │   │   ├── ProductDetail.js  # Detalle de producto
│   │   │   ├── Cart.js           # Carrito de compras
│   │   │   ├── Checkout.js       # Proceso de compra
│   │   │   ├── Login.js          # Inicio de sesión
│   │   │   ├── Register.js       # Registro de usuario
│   │   │   ├── Profile.js        # Perfil de usuario
│   │   │   ├── AdminPanel.js     # Panel administrativo
│   │   │   ├── OrderConfirmation.js # Confirmación de pedido
│   │   │   └── OrderLookup.js    # Consulta de pedidos
│   │   ├── data/
│   │   │   └── colombiaData.js   # Datos geográficos
│   │   └── assets/              # Recursos estáticos
│   ├── package.json             # Dependencias Node.js
│   └── tailwind.config.js       # Configuración Tailwind
├── CLAUDE.md                    # Instrucciones para Claude Code
└── README.md                    # Documentación del proyecto
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Python 3.11+
- Node.js 18+
- npm o yarn
- Git

### Configuración del Backend

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd STORE/backend
```

2. **Crear entorno virtual**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar base de datos**
```bash
python manage.py migrate
```

5. **Crear superusuario**
```bash
python manage.py createsuperuser
```

6. **Cargar datos de ejemplo (opcional)**
```bash
python load_sample_data.py
```

7. **Iniciar servidor de desarrollo**
```bash
python manage.py runserver
```

El backend estará disponible en `http://localhost:8000`

### Configuración del Frontend

1. **Navegar al directorio frontend**
```bash
cd ../frontend/modal-tela-frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar servidor de desarrollo**
```bash
npm start
```

El frontend estará disponible en `http://localhost:3000`

### Variables de Entorno

Crear archivo `.env` en `backend/` con:
```env
SECRET_KEY=tu_clave_secreta_aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## 🎯 Uso del Sistema

### Para Clientes

1. **Navegación**
   - Visita la página principal en `http://localhost:3000`
   - Explora productos por categorías (Hombres, Mujeres, Niños, Bebés)
   - Usa la búsqueda para encontrar productos específicos

2. **Compras**
   - Selecciona productos y variantes (talla, color)
   - Agrega al carrito y ajusta cantidades
   - Procede al checkout con datos de envío
   - Completa la compra con información de contacto

3. **Seguimiento**
   - Usa "Consultar Pedido" con número de pedido y email
   - Ve el estado actualizado y información de tracking

### Para Administradores

1. **Acceso al Panel**
   - Inicia sesión con cuenta de administrador
   - Accede al panel administrativo desde el menú de usuario

2. **Gestión de Productos**
   - Crea/edita productos con múltiples imágenes
   - Gestiona categorías y marcas
   - Configura variantes por talla y color

3. **Gestión de Pedidos**
   - Ve todos los pedidos organizados por estado
   - Cambia estados y asigna a administradores
   - Agrega información de tracking para envíos

## 🔌 API Endpoints

### Autenticación
- `POST /api/accounts/register/` - Registro de usuario
- `POST /api/accounts/login/` - Inicio de sesión
- `POST /api/accounts/token/refresh/` - Renovar token
- `GET /api/accounts/profile/` - Obtener perfil
- `PATCH /api/accounts/change-password/` - Cambiar contraseña

### Productos
- `GET /api/products/` - Listar productos con filtros
- `GET /api/products/<id>/` - Detalle de producto
- `GET /api/products/categories/` - Listar categorías
- `GET /api/products/brands/` - Listar marcas
- `GET /api/products/featured/` - Productos destacados

### Carrito
- `GET /api/cart/` - Obtener carrito
- `POST /api/cart/add/` - Agregar producto
- `PATCH /api/cart/update/<id>/` - Actualizar cantidad
- `DELETE /api/cart/remove/<id>/` - Remover producto

### Pedidos
- `GET /api/orders/` - Listar pedidos (autenticado)
- `POST /api/orders/create/` - Crear pedido
- `GET /api/orders/<id>/` - Detalle de pedido
- `POST /api/orders/lookup/` - Consultar pedido (público)
- `PATCH /api/orders/<id>/status/` - Cambiar estado (admin)

### Administración
- `GET /api/products/admin/` - Gestión de productos (admin)
- `POST /api/products/admin/create/` - Crear producto (admin)
- `POST /api/products/admin/<id>/images/upload/` - Subir imágenes (admin)
- `GET /api/accounts/admin/users/` - Gestión de usuarios (super admin)

## ⚡ Funcionalidades

### Sistema de Productos
- **Catálogo completo** con categorías jerárquicas
- **Variantes por producto** (talla, color, precio)
- **Gestión de imágenes** múltiples con imagen principal
- **Filtros avanzados** por precio, marca, categoría
- **Búsqueda inteligente** con coincidencias parciales
- **Control de inventario** por variante

### Sistema de Pedidos
- **Estados de pedido**: Pendiente → Preparando → Enviado → Entregado
- **Asignación de administradores** para gestión de pedidos
- **Tracking de envíos** con número de guía y transportadora
- **Historial de cambios** con timestamp y responsables
- **Consulta pública** para usuarios no registrados

### Sistema de Usuarios
- **Registro e inicio de sesión** con validaciones
- **Roles diferenciados**: Cliente, Administrador, Super Administrador
- **Gestión de perfil** con cambio de contraseña
- **Usuarios invitados** para compras sin registro
- **Timeout de sesión** por seguridad

### Sistema de Carrito
- **Persistencia** entre sesiones para usuarios registrados
- **Gestión temporal** para usuarios invitados
- **Cálculo automático** de totales y cantidades
- **Variantes** con precios diferenciados
- **Validación de stock** antes de agregar

## 👥 Roles y Permisos

### Cliente (customer)
- ✅ Navegar catálogo de productos
- ✅ Gestionar carrito de compras
- ✅ Realizar pedidos
- ✅ Ver historial de pedidos propios
- ✅ Consultar estado de pedidos
- ✅ Gestionar perfil personal

### Administrador (admin)
- ✅ Todo lo del cliente
- ✅ Gestionar productos, categorías, marcas
- ✅ Ver y gestionar pedidos asignados
- ✅ Cambiar estados de pedidos
- ✅ Agregar información de tracking
- ✅ Rechazar pedidos (reasigna a super admin)

### Super Administrador (super_admin)
- ✅ Todo lo del administrador
- ✅ Gestionar todos los pedidos
- ✅ Crear y gestionar usuarios administradores
- ✅ Asignar pedidos a administradores
- ✅ Eliminar usuarios con confirmación
- ✅ Acceso completo al sistema

## 🗄️ Base de Datos

### Modelos Principales

#### Usuarios y Autenticación
- **User**: Usuarios del sistema con roles
- **GuestUser**: Usuarios invitados para compras sin registro

#### Catálogo de Productos
- **Category**: Categorías principales (Hombres, Mujeres, Niños, Bebés)
- **Subcategory**: Subcategorías por tipo de producto
- **Brand**: Marcas de productos
- **Product**: Productos principales con información base
- **ProductVariant**: Variantes por talla y color con stock individual
- **ProductImage**: Imágenes múltiples por producto

#### Carrito y Pedidos
- **Cart**: Carrito de compras por usuario
- **CartItem**: Items individuales en el carrito
- **Order**: Pedidos con información de facturación y envío
- **OrderItem**: Productos individuales en cada pedido
- **OrderStatusHistory**: Historial de cambios de estado

### Relaciones Clave
- User 1:N Order (usuario tiene múltiples pedidos)
- Product 1:N ProductVariant (producto con múltiples variantes)
- Order 1:N OrderItem (pedido con múltiples productos)
- Product 1:N ProductImage (producto con múltiples imágenes)

## 🔧 Características Técnicas

### Seguridad
- **Autenticación JWT** con refresh tokens
- **CORS configurado** para desarrollo
- **Validaciones** en frontend y backend
- **Control de acceso** basado en roles
- **Timeout de sesión** automático
- **Sanitización** de datos de entrada

### Rendimiento
- **Lazy loading** de imágenes
- **Paginación** de resultados
- **Optimización de consultas** con select_related
- **Caché** de datos estáticos
- **Compresión** de imágenes automática

### Experiencia de Usuario
- **Diseño responsivo** para todos los dispositivos
- **Notificaciones** en tiempo real con toast
- **Estados de carga** para operaciones asíncronas
- **Navegación intuitiva** con breadcrumbs
- **Búsqueda instantánea** con filtros dinámicos

### Mantenibilidad
- **Arquitectura modular** por aplicaciones Django
- **Componentes reutilizables** en React
- **Documentación** en código y README
- **Patrones consistentes** de desarrollo
- **Manejo centralizado** de estado

## 🌍 Localización

### Configuración Regional
- **Idioma**: Español (Colombia)
- **Zona horaria**: America/Bogota
- **Moneda**: Peso colombiano (COP)
- **Datos geográficos**: Departamentos y municipios de Colombia

### Datos de Ejemplo
- **Categorías**: Hombres, Mujeres, Niños, Bebés
- **Marcas**: Nike, Adidas, Zara, H&M, Levi's
- **Productos**: 15+ productos con variantes
- **Transportadoras**: Servientrega, Coordinadora, Interrapidísimo, TCC, Envía, Deprisa

## 🚀 Despliegue

### Desarrollo
- Backend: `python manage.py runserver` (puerto 8000)
- Frontend: `npm start` (puerto 3000)
- Proxy configurado automáticamente

### Producción
1. **Backend**
   - Configurar variables de entorno
   - Usar PostgreSQL o MySQL
   - Configurar servidor web (nginx/Apache)
   - Configurar HTTPS

2. **Frontend**
   - `npm run build` para compilar
   - Servir archivos estáticos
   - Configurar CDN para imágenes

## 📝 Scripts Útiles

### Backend
```bash
# Cargar datos de ejemplo
python load_sample_data.py

# Ejecutar migraciones
python run_migrations.py

# Actualizar base de datos
python manage.py shell < update_database.sql
```

### Frontend
```bash
# Desarrollo
npm start

# Compilación
npm run build

# Pruebas
npm test

# Linting
npm run lint
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución
- Sigue las convenciones de código existentes
- Agrega pruebas para nuevas funcionalidades
- Actualiza la documentación según sea necesario
- Mantén los commits atómicos y descriptivos

## 📊 Métricas del Proyecto

- **Líneas de código**: ~8,000 líneas
- **Archivos Python**: 20+ archivos
- **Componentes React**: 15+ componentes
- **Endpoints API**: 25+ endpoints
- **Tablas de BD**: 12 tablas principales
- **Tiempo de desarrollo**: 3 meses

## 🔮 Roadmap Futuro

### Características Planeadas
- [ ] Pasarela de pagos integrada (PSE, tarjetas)
- [ ] Sistema de reviews y calificaciones
- [ ] Programa de puntos y descuentos
- [ ] Integración con redes sociales
- [ ] App móvil nativa
- [ ] Analytics avanzados
- [ ] Sistema de notificaciones push
- [ ] Chat en vivo para soporte

### Mejoras Técnicas
- [ ] Migración a PostgreSQL
- [ ] Implementación de Redis para caché
- [ ] API GraphQL alternativa
- [ ] Microservicios para escalabilidad
- [ ] CI/CD con GitHub Actions
- [ ] Monitoring con Sentry
- [ ] Tests automatizados completos

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto:

- **Institución**: SENA (Servicio Nacional de Aprendizaje)
- **Programa**: Tecnólogo en Análisis y Desarrollo de Software
- **Fase**: 3 - Actividad de Proyecto 8
- **Documentación**: Ver `CLAUDE.md` para instrucciones técnicas detalladas

## 📄 Licencia

Este proyecto fue desarrollado como parte del programa académico del SENA y está destinado únicamente para fines educativos.

---

**Modal Tela** - Plataforma E-commerce desarrollada con ❤️ para SENA