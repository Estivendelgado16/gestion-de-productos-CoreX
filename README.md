# Gestión de Productos CoreX

> **La plataforma moderna para administrar tu catálogo, tu inventario y tu experiencia de compra — todo en un solo lugar.**

CoreX es una aplicación full-stack de gestión de productos con una experiencia de doble cara: un **catálogo público** elegante para tus clientes y un **panel administrativo** potente para tu equipo. Diseñada para crecer con tu negocio, con imágenes automáticas, roles inteligentes y una interfaz que se siente premium en cada detalle.

---

## Cómo viaja la información de los productos

CoreX es un sistema de tres capas: el **cliente Angular** hace llamadas HTTPS a la **API NestJS**, la API consulta **PostgreSQL** y, cuando hace falta una imagen, llama a la **Pexels API**. Todo empieza con un **login JWT**: el cliente guarda el token y lo envía en cada petición protegida.

```mermaid
flowchart LR
    subgraph Navegador["NAVEGADOR (Angular)"]
        A1["PublicCatalog /userProducts /products<br/>vistas de cards"]
        A2["product-form<br/>crear / editar"]
        A3["auth.service / login modal<br/>guardado del token JWT"]
    end

    subgraph API["API NESTJS"]
        C["AuthController<br/>POST /auth/login<br/>POST /auth/register"]
        P["ProductsController<br/>GET/POST /products<br/>PATCH/DELETE /products/:id"]
        PS["ProductsService<br/>create · findAll · update"]
        PX["PexelsService<br/>searchPexelsImage()"]
    end

    subgraph Data["DATOS"]
        DB[("PostgreSQL (Supabase)<br/>products · product_images<br/>categories · users · favorites")]
        PXAPI["Pexels API<br/>https://api.pexels.com/v1/search"]
    end

    A1 -- "GET {API}/products?search&categoryId&page&limit" --> P
    A2 -- "POST {API}/products (JWT admin)" --> P
    P -- "llamada al servicio" --> PS
    A3 -- "POST {API}/auth/login → token" --> C
    C --> DB
    PS -- "TypeORM (joins: category, images)" --> DB
    PS -- "solo si no hay imágenes: fetch con Authorization PEXELS_API_KEY" --> PX
    PX -- "GET /v1/search?query=nombre&per_page=1" --> PXAPI
    PXAPI -- "200 { photos[0].src.large }" --> PX
    PX -- "URL de la foto" --> PS
    PS -- "INSERT product + product_image" --> DB
    DB -- "JSON { data, total, images, category }" --> PS
    PS -- "HTTP 200 / 201" --> P
    P -- "respuesta JSON" --> A1
    P -- "respuesta JSON (con images)" --> A2
```

### Flujo de lectura (ver productos)

```mermaid
sequenceDiagram
    participant NG as Angular (cards: catálogo, mis productos, admin)
    participant API as NestJS /products
    participant SVC as ProductsService
    participant DB as PostgreSQL (Supabase)
    participant PE as Pexels API

    NG->>API: GET /products?search=&categoryId=&page=1&limit=12
    Note over NG,API: HTTPS · sin token (público) o con JWT
    API->>SVC: findAll(query)
    SVC->>DB: QueryBuilder con joins (category, images)<br/>ORDER BY createdAt DESC · skip/take
    DB-->>SVC: filas de products + category + product_images
    SVC-->>API: { data, total, page, totalPages }
    API-->>NG: HTTP 200 · JSON
    NG->>NG: renderiza cards (imagen, nombre, precio, stock)<br/>si no hay imágenes → fallback "NO IMAGE"
```

### Flujo de creación (con imagen automática)

```mermaid
sequenceDiagram
    participant F as Angular product-form (admin)
    participant A as AuthGuard + RolesGuard
    participant API as NestJS POST /products
    participant SVC as ProductsService
    participant CAT as CategoriesService
    participant DB as PostgreSQL (Supabase)
    participant PE as Pexels API

    F->>A: POST /products { name, price, stock, categoryId }<br/>Header: Authorization: Bearer <JWT>
    A->>A: valida token JWT + rol admin
    A-->>F: 401 / 403 si no autorizado
    A->>API: continúa la petición
    API->>SVC: create(dto)
    SVC->>CAT: findOne(categoryId) → ¿existe la categoría?
    CAT-->>SVC: ok / 404
    SVC->>DB: assertNameNotTaken(name) → ¿nombre duplicado? (ILIKE)
    DB-->>SVC: ok / 409 Conflict
    Note over SVC,PE: dto.images vacío → generar imagen automática
    SVC->>PE: fetch https://api.pexels.com/v1/search<br/>?query=tenis air jordan&per_page=1&orientation=landscape<br/>Header: Authorization: PEXELS_API_KEY
    PE-->>SVC: 200 { photos: [ { src.large } ] }
    Note over SVC,PE: si Pexels falla o no hay key → fallback LoremFlickr
    SVC->>DB: INSERT products + product_images (url de la foto)
    DB-->>SVC: producto guardado con imágenes
    SVC-->>API: findOne(id) → producto completo (images[])
    API-->>F: HTTP 201 · JSON con images
    F->>F: redirige a /products · la card muestra la foto real
```

---

## ¿Por qué CoreX?

- **Catálogo público de nivel comercial.** Tus clientes navegan, exploran y guardan favoritos sin necesidad de registrarse — con un login elegante que aparece justo cuando lo necesitan.
- **Imágenes automáticas con Pexels.** Crea un producto y CoreX busca y asigna una foto real según su nombre. Adiós a las cards vacías.
- **Roles inteligentes.** Un solo sistema, dos experiencias: usuarios con sus productos y favoritos; administradores con control total de productos, categorías y métricas.
- **Dashboard en tiempo real.** Métricas de inventario, categorías y valor estimado que te dicen cómo va tu negocio de un vistazo.
- **Interfaz cyberpunk.** Un diseño oscuro, tipográfico y distintivo que hace que tu catálogo destaque por encima de la competencia.

---

## Funcionalidades destacadas

### Para el usuario final
- Catálogo público con búsqueda, categorías y paginación.
- Favoritos con un solo clic (corazón) — sin necesidad de cuenta.
- Login modal integrado que no interrumpe la navegación.
- Vista personal "Mis productos" con buscador rápido.

### Para el administrador
- Gestión completa de productos: crear, editar, eliminar.
- Gestión de categorías.
- Dashboard con métricas de inventario y valor estimado.
- Control de perfil y cambio de contraseña.
- Panel con imagen automática del producto según su nombre.

### Sistema
- Autenticación JWT con roles `admin` y `user`.
- Roles administradores configurables por email (`ADMIN_EMAILS`).
- API REST documentada con Swagger.
- Base de datos PostgreSQL relacional (Supabase).

---

## Arquitectura

```
┌─────────────────────┐      ┌──────────────────────┐
│   Cliente Angular   │ HTTP │   API NestJS         │
│  (catálogo, panel)  │ ───► │  (auth, productos,   │
│                     │ ◄─── │   categorías, favs)  │
└─────────────────────┘      └──────────┬───────────┘
                                        │ TypeORM
                              ┌─────────▼───────────┐
                              │  PostgreSQL (Supabase)│
                              └──────────────────────┘
```

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 22, RxJS, Angular Material de estilos propios (SCSS) |
| Backend | NestJS 11, TypeORM, Passport JWT, class-validator |
| Base de datos | PostgreSQL (Supabase) |
| Imágenes automáticas | Pexels API (con fallback a LoremFlickr) |
| Deploy | Vercel (frontend) · Render (API) |

---


## Roles de acceso

| Acción | Usuario | Administrador |
|--------|:------:|:-------------:|
| Ver catálogo público | Sí | Sí |
| Guardar favoritos | Sí | No |
| Ver "Mis productos" | Sí | — |
| Gestionar productos | No | Sí |
| Gestionar categorías | No | Sí |
| Ver dashboard | No | Sí |
| Configuración de perfil | Sí | Sí |

> El rol se asigna automáticamente al iniciar sesión: si el email está en `ADMIN_EMAILS`, el usuario es administrador.

---

## Estructura del proyecto

```
├── client/          # Aplicación Angular (catálogo público + panel)
│   └── src/app/
│       ├── core/          # Servicios, guards, interceptores, configuración
│       ├── features/      # Módulos: public-catalog, products, categories,
│       │                  #   favorites, auth, dashboard, settings, layout
│       ├── models/        # Modelos e interfaces
│       └── services/      # Servicios de API (productos, favoritos)
├── server/          # API REST NestJS
│   └── src/
│       ├── modules/       # auth, users, products, categories, favorites
│       ├── migrations/    # Esquema de base de datos
│       └── main.ts        # Bootstrap + Swagger
├── .github/workflows/     # CI (lint, build, tests)
└── vercel.json            # Configuración de deploy del frontend
```

---

## Despliegue

El proyecto está preparado para publicarse en la nube:

- **Frontend (Angular):** en Vercel, usando el `vercel.json` incluido (framework Angular, rewrites SPA incluidos).
- **Backend (NestJS):** en Render, apuntando la variable de entorno `DATABASE_URL` a tu PostgreSQL.

En producción, configura las mismas variables del `.env` en el panel de tu proveedor de hosting. El frontend en producción apunta automáticamente a `https://tolla-backend.onrender.com` (ajústalo en `client/src/app/core/config/api.config.ts` según tu dominio).

---

## Roadmap

- Carrito de compras y checkout.
- Pedidos y seguimiento de órdenes.
- Reportes avanzados de ventas.
- Soporte multiusuario con permisos granulares.

---

## Contribuir

1. Haz un fork del repositorio.
2. Crea tu rama: `git checkout -b feature/mi-mejora`.
3. Realiza tus cambios y haz commit.
4. Abre un Pull Request a la rama `develop`.

---

Hecho con el stack de productividad definitivo: **Angular + NestJS + PostgreSQL**.