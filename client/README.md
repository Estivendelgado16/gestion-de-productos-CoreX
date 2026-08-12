# TOLLA · Gestión de Productos — Frontend

Aplicación web de gestión de productos construida con **Angular 22** (standalone components, signals, control flow) y un backend **NestJS + PostgreSQL (Supabase)**. Sigue un diseño *cyberpunk admin* con el sistema de tokens TOLLA.

> El frontend es la cara del monorepo `client/` + `server/`. Este README documenta únicamente la aplicación **Angular**; para el API ver `server/README.md` (si existe) o la sección [Backend](#backend--api).

---

## Tabla de contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Instalación](#2-instalación)
3. [Configuración de variables de entorno](#3-configuración-de-variables-de-entorno)
4. [Scripts disponibles](#4-scripts-disponibles)
5. [Levantar el entorno (paso a paso)](#5-levantar-el-entorno-paso-a-paso)
6. [Arquitectura de la aplicación](#6-arquitectura-de-la-aplicación)
7. [Flujo de autenticación y navegación](#7-flujo-de-autenticación-y-navegación)
8. [Módulos y funcionalidades](#8-módulos-y-funcionalidades)
9. [Backend & API](#9-backend--api)
10. [Consumo de la API desde el frontend](#10-consumo-de-la-api-desde-el-frontend)
11. [Estilos y sistema de diseño](#11-estilos-y-sistema-de-diseño)
12. [Solución de problemas comunes](#12-solución-de-problemas-comunes)
13. [Convenciones y buenas prácticas](#13-convenciones-y-buenas-prácticas)

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Notas |
|---|---|---|
| **Node.js** | `v22.22.3` (o `v24.x` / `v26.x`) | **Angular CLI 22 NO soporta Node 20.** Usar Node < 22 rompe `ng serve`/`ng build`. |
| **npm** | `^11.x` | Bundled con Node. |
| **Backend NestJS** | — | Debe estar corriendo para que el frontend consuma el API. |

> ⚠️ **IMPORTANTE:** Si tienes múltiples versiones de Node (p. ej. con `nvm`), el sistema puede resolver a una versión vieja. Verifica siempre con:

```bash
node --version   # debe ser >= v22.22.3
```

Ejemplo con `nvm` (versiones instaladas localmente):

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"
node --version   # v22.22.3
```

---

## 2. Instalación

```bash
# Desde la raíz del frontend
cd client

# Instalar dependencias (usa el packageManager declarado: npm@11)
npm install
```

Si el backend aún no tiene dependencias instaladas:

```bash
cd ../server
npm install
cd ../client
```

---

## 3. Configuración de variables de entorno

### 3.1 Frontend (este proyecto)

El frontend **no usa `.env`** en runtime. La configuración de red vive en un archivo TypeScript central:

**`src/app/core/config/api.config.ts`**

```ts
export const API_BASE_URL = 'http://localhost:3001';

export const AUTH_TOKEN_KEY = 'accessToken';

export const AUTH_USER_KEY = 'currentUser';
```

| Constante | Uso | Valor típico |
|---|---|---|
| `API_BASE_URL` | URL base de todos los servicios HTTP | `http://localhost:3000` (o `3001`) |
| `AUTH_TOKEN_KEY` | Clave en `localStorage` del JWT | `accessToken` |
| `AUTH_USER_KEY` | Clave en `localStorage` del usuario serializado | `currentUser` |

> ⚠️ Si el backend corre en un puerto distinto (p. ej. `3001` por conflicto), actualiza **solo** `API_BASE_URL`.

### 3.2 Backend (dependencia)

El API lee su configuración desde `server/.env` (no es necesario tocarlo para el frontend, pero determina dónde está el servicio):

```env
PORT=3000

# Base de datos (Supabase - PostgreSQL)
DATABASE_URL=postgresql://usuario:password@host:5432/postgres

# JWT
JWT_SECRET=cambia-este-valor-por-uno-generado-aleatoriamente
JWT_EXPIRES_IN=1d
```

---

## 4. Scripts disponibles

Definidos en `client/package.json`:

| Comando | Descripción |
|---|---|
| `npm start` | `ng serve` — servidor de desarrollo con HMR |
| `npm run build` | `ng build` — build de producción en `dist/client` |
| `npm run watch` | Build en modo watch (desarrollo) |
| `npm test` | `ng test` — ejecuta unit tests |
| `ng generate component nombre` | Scaffolding de componentes |

---

## 5. Levantar el entorno (paso a paso)

**Paso 1 — Verificar Node**

```bash
node --version   # >= v22.22.3
```

**Paso 2 — Levantar el backend NestJS** (en otra terminal)

```bash
cd server
npm install
npm run start:dev      # o npm run start
```

El API debe responder. Verifica:

```bash
curl http://localhost:3000/api
# → {"message":"Cannot GET /api","error":"Not Found","statusCode":404}  (es normal, /api no existe)
curl http://localhost:3001/api
# → idéntico si el backend quedó en 3001
```

**Paso 3 — Alinear el puerto del frontend con el backend**

Compara `PORT` del `server/.env` con `API_BASE_URL` en `src/app/core/config/api.config.ts`:

```bash
grep PORT ../server/.env
grep API_BASE_URL src/app/core/config/api.config.ts
```

> Ambos deben coincidir. Si el backend quedó en `3001` (porque `3000` estaba ocupado), pon `http://localhost:3001` en `API_BASE_URL`.

**Paso 4 — Levantar el frontend**

```bash
cd client
npm start
```

**Paso 5 — Abrir la aplicación**

```
http://localhost:4200
```

- Sin sesión → redirige a `/login`.
- Con sesión activa → `/dashboard`.

---

## 6. Arquitectura de la aplicación

### 6.1 Resumen

Aplicación **standalone** (sin `NgModule`), arrancada con `bootstrapApplication` en `src/main.ts`. Usa:

- **Signals** (`signal`, `computed`) para el estado reactivo en componentes.
- **Control flow** de Angular (@if, @for, @switch) en las plantillas.
- **Lazy loading** por feature en las rutas.
- **Router outlet anidado**: un *shell* (`LayoutContainerComponent`) envuelve todas las vistas autenticadas.

### 6.2 Mapa de carpetas

```
src/
├── index.html                  # Bootstrap HTML, fuentes (Orbitron, Rajdhani, JetBrains Mono)
├── main.ts                     # bootstrapApplication(App, appConfig)
├── app/
│   ├── app.ts                  # Componente raíz (solo <router-outlet/>)
│   ├── app.routes.ts           # Definición de rutas (lazy)
│   ├── app.config.ts           # Providers globales (router, http, interceptores)
│   ├── app.html / app.scss     # Root template & styles
│   │
│   ├── core/                   # Capa transversal (no depende de features)
│   │   ├── config/
│   │   │   └── api.config.ts   # ★ API_BASE_URL y claves de localStorage
│   │   ├── guards/
│   │   │   └── auth.guard.ts   # CanActivateFn → redirige a /login si no hay token
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts  # Adjunta Authorization: Bearer <token>
│   │   └── services/
│   │       └── auth.service.ts # login/register/logout/getCurrentUser + sesión
│   │
│   ├── shared/                 # Recursos reutilizables
│   │   └── styles/
│   │       └── _tokens.scss    # ★ Design tokens TOLLA (colores, fuentes, radios)
│   │
│   ├── models/                 # Interfaces de dominio (tipos)
│   │   ├── auth.model.ts
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── category.model.ts
│   │   └── kpi.model.ts
│   │
│   ├── services/               # Clientes HTTP por entidad
│   │   ├── product.service.ts
│   │   ├── category.service.ts
│   │   └── favorite.service.ts
│   │
│   └── features/               # ★ Módulos funcionales (lazy)
│       ├── auth/
│       │   └── pages/login/    # Login/Registro
│       │
│       ├── layout/             # App shell (compartido por todas las vistas)
│       │   └── components/
│       │       ├── sidebar/            # Navegación: Dashboard, Products, Categories, Favorites
│       │       ├── header/             # Búsqueda global, usuario, logout
│       │       └── layout-container/   # Shell con <router-outlet/>
│       │
│       ├── dashboard/          # Métricas + accesos rápidos
│       │   └── pages/dashboard/
│       │       ├── dashboard.component.*
│       │       └── components/metrics/
│       │           ├── kpi-card/
│       │           └── kpi-grid/
│       │
│       ├── products/           # CRUD de productos
│       │   └── pages/
│       │       ├── product-list/    # Listado + paginación + botón CREATE
│       │       └── product-form/    # Formulario crear producto
│       │
│       ├── categories/         # CRUD de categorías
│       │   ├── pages/
│       │   │   └── category-list/   # Listado + crear inline
│       │   └── components/
│       │       ├── category-grid/   # grid + tarjetas de categoría
│       │       └── quick-edit/      # panel de edición rápida
│       │
│       └── favorites/          # Productos favoritos
│           └── pages/favorite-list/
```

### 6.3 Principios

- **Feature-first**: cada dominio (products, categories, favorites) vive bajo `features/` con sus páginas y componentes privados.
- **Capas separadas**: `core/` (transversal), `shared/` (reutilizable), `models/` + `services/` (dominio), `features/` (UI).
- **Lazy loading**: cada feature se carga on-demand desde `app.routes.ts`.
- **Shell compartido**: el sidebar/header se renderizan una sola vez en `LayoutContainerComponent`.

---

## 7. Flujo de autenticación y navegación

### 7.1 Ciclo de sesión

1. **Login/Registro** — `LoginComponent` → `AuthService.login()/register()`.
2. **Persistencia** — la respuesta `{ accessToken, user }` se guarda en `localStorage` (`accessToken`, `currentUser`).
3. **Guard** — `authGuard` revisa `isAuthenticated()` (existe token). Sin token → `UrlTree('/login')`.
4. **Interceptor** — toda petición HTTP lleva `Authorization: Bearer <token>` (`auth.interceptor.ts`).
5. **Logout** — `AuthService.logout()` → `POST /auth/logout` → borra `localStorage` → navega a `/login`.
6. **Perfil** — `AuthService.getCurrentUser()` → `GET /users/me` (usado por el shell para mostrar el nombre).

### 7.2 Mapa de rutas

| Ruta | Componente | Guard | Descripción |
|---|---|---|---|
| `/login` | `LoginComponent` | — | Pantalla de acceso/registro |
| `/dashboard` | `DashboardComponent` | `authGuard` | Métricas y accesos rápidos |
| `/products` | `ProductListComponent` | `authGuard` | Listado de productos con paginación |
| `/products/new` | `ProductFormComponent` | `authGuard` | Formulario de creación |
| `/categories` | `CategoryListComponent` | `authGuard` | CRUD de categorías |
| `/favorites` | `FavoriteListComponent` | `authGuard` | Productos favoritos |
| `**` | redirige a `/dashboard` | — | Fallback |

Estructura de rutas (`app.routes.ts`):

```
''
├── 'login'                     (sin shell)
└── ''  → LayoutContainerComponent  (shell, authGuard)
    ├── 'dashboard'
    ├── 'products'
    ├── 'products/new'
    ├── 'categories'
    └── 'favorites'
```

> Todas las rutas autenticadas son **hijas** del shell; por eso sidebar/header persisten al navegar.

---

## 8. Módulos y funcionalidades

### 8.1 Dashboard

- 4 KPIs calculados con `computed()`:
  - **Total Categories** (longitud de `GET /categories`).
  - **SKU Count** (total de productos).
  - **Revenue** = Σ(price × stock).
  - **Uncategorized** (productos sin `categoryId`).
- **Quick access**: tarjetas enlazadas a `/products` y `/categories`.

### 8.2 Products

- **Listado**: `GET /products?page&limit`, estados de carga (skeletons) y vacío.
- **Paginación**: navegación `‹ página / total ›` usando `page`, `totalPages`, `total` de la respuesta.
- **Crear**: botón `+ CREATE` → `/products/new` → `POST /products` → vuelve al listado.

### 8.3 Categories

- **Listado**: `GET /categories`.
- **Crear**: botón `+ CREATE` despliega un formulario inline → `POST /categories`.
- Componentes auxiliares: `category-grid`, `category-card`, `create-node-card`, `quick-edit`.

### 8.4 Favorites

- **Listado**: `GET /favorites`.
- **Eliminar**: `DELETE /favorites/:productId` → recarga la lista.

---

## 9. Backend & API

### 9.1 Stack

- **NestJS 11** + TypeORM 0.3 + PostgreSQL (Supabase, `ssl: rejectUnauthorized: false`).
- **JWT** (Passport) para autenticación.
- **Swagger** en `http://localhost:<PORT>/api/docs`.
- Migraciones en `server/src/migrations/` (`synchronize: false`).

### 9.2 Endpoints consumidos por el frontend

| Método | Ruta | Cuerpo / Query | Descripción |
|---|---|---|---|
| `POST` | `/auth/register` | `{ name, email, password }` | Registro |
| `POST` | `/auth/login` | `{ email, password }` | Login → `{ accessToken, user }` |
| `POST` | `/auth/logout` | — | Logout |
| `GET` | `/users/me` | — | Usuario actual |
| `PATCH` | `/users/me/password` | `{ currentPassword, newPassword }` | Cambiar contraseña |
| `GET` | `/products` | `?search&categoryId&page&limit` | Listado paginado/filtrado |
| `GET` | `/products/:id` | — | Detalle |
| `POST` | `/products` | `{ name, description?, price, stock, categoryId, images? }` | Crear |
| `PATCH` | `/products/:id` | campos parciales | Editar |
| `DELETE` | `/products/:id` | — | Eliminar |
| `GET` | `/categories` | — | Listar categorías |
| `POST` | `/categories` | `{ name, description? }` | Crear categoría |
| `GET` | `/favorites` | — | Lista de favoritos |
| `POST` | `/favorites/:productId` | — | Agregar favorito |
| `DELETE` | `/favorites/:productId` | — | Quitar favorito |

### 9.3 Paginación (contrato)

`GET /products` responde:

```json
{
  "data": [ { "id": "...", "name": "...", "price": 0, "stock": 0, "category": { ... }, "images": [ ... ] } ],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 10. Consumo de la API desde el frontend

Todos los servicios viven en `src/app/services/` y usan `HttpClient` con la base `API_BASE_URL`.

```ts
// services/product.service.ts
getProducts(params: ProductQueryParams = {}): Observable<ProductListResponse> {
  let httpParams: HttpParams = new HttpParams();
  if (params.search) httpParams = httpParams.set('search', params.search);
  if (params.page) httpParams = httpParams.set('page', params.page.toString());
  if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
  return this.http.get<ProductListResponse>(this.baseUrl, { params: httpParams });
}
```

El token se inyecta de forma transparente por `auth.interceptor.ts`, por lo que **ningún servicio** debe manejar headers de autorización manualmente.

---

## 11. Estilos y sistema de diseño

### 11.1 Design tokens

Definidos en `src/app/shared/styles/_tokens.scss` dentro de `:root`:

| Token | Valor |
|---|---|
| `--tolla-bg-base` | `#05070d` |
| `--tolla-bg-card` | `#0d1322` |
| `--tolla-text-primary` | `#e8f0ff` |
| `--tolla-cyan` | `#00e5ff` |
| `--tolla-magenta` | `#ff2a6d` |
| `--tolla-purple` | `#a855f7` |
| `--tolla-amber` | `#ffb020` |
| `--tolla-green` | `#22d3a5` |
| `--tolla-radius-sm/md/lg` | `6px / 10px / 16px` |
| Fuentes | `Orbitron` (display), `Rajdhani` (body), `JetBrains Mono` (mono) |
| `--tolla-header-h` | `68px` |
| `--tolla-sidebar-w` | `256px` |
| `--tolla-quickedit-w` | `420px` |

### 11.2 Convenciones de estilos

- Cada componente tiene su propio `.scss` con prefijo `tolla-` (BEM).
- Estados: `--loading`, `--empty`, `--error` visibles en las vistas.
- Skeletons con `@keyframes tolla-shimmer`.
- Fondo con gradientes radiales sutiles (cyan/magenta/purple) en `layout-container`.

---

## 12. Solución de problemas comunes

### "Node.js version v20.20.2 detected. The Angular CLI requires v22..."

Node es muy viejo. Usa Node 22:

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"
node --version   # v22.22.3
```

### El login no funciona / 404 en la API

El frontend apunta a `API_BASE_URL` pero el backend está en otro puerto.

```bash
# ¿En qué puerto está el backend?
ss -tlnp | grep -E ':(3000|3001|5432)'

# Compara con la config
grep API_BASE_URL client/src/app/core/config/api.config.ts
grep PORT server/.env
```

> Si el puerto `3000` está ocupado por otro proceso, el backend NestJS puede quedar en `3001`. Ajusta `API_BASE_URL`.

### "Unable to connect to the database" en el backend

El host de Supabase puede resolver solo a IPv6 y la red no tiene IPv6. Soluciones:

1. Usar el **pooler** de Supabase (IPv4): `aws-0-us-east-1.pooler.supabase.com:6543` (usuario `postgres.<ref>`).
2. Habilitar IPv6 en el router/ISP.
3. Usar un PostgreSQL local (`localhost:5432`) y quitar `ssl`.

### El puerto 4200 ya está en uso

```bash
lsof -i :4200   # o: ss -tlnp | grep 4200
kill -9 <PID>
```

---

## 13. Convenciones y buenas prácticas

- **Estado reactivo**: usar `signal()`/`computed()` en vez de propiedades mutables.
- **Control flow nativo**: `@if`, `@for`, `@switch` (no `*ngIf`/`*ngFor`).
- **Imports standalone**: cada componente declara sus imports en el decorador.
- **Lazy loading**: agregar rutas nuevas con `loadComponent`.
- **Modelos tipados**: toda respuesta de la API se mapea a una interface en `models/`.
- **Servicios finos**: cada entidad tiene un solo `service` que centraliza el HTTP.
- **Tokens, no valores mágicos**: los colores/espaciados provienen de `_tokens.scss`.
- **BEM con prefijo `tolla-`**: `bloque__elemento--modificador`.

---

## Licencia

Proyecto académico/privado — "Gestión de Productos · Core X". No redistribuir sin autorización.
