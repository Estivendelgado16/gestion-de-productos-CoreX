# 📋 TOLLA · Gestión de Productos — Tablero de Tareas

Espejo del tablero **Trello "Gestión de Productos — Sprint 1"** para consulta rápida dentro del repo.

> ⚠️ **Este archivo es una referencia.** La fuente de verdad es el tablero de Trello; los avances/cambios de estado se actualizan allí.

**Estado global del sprint:** `9 Hecho` · `1 En Progreso` · `3 Por hacer` · `0 Revisión`

---

## 👥 Equipo

| Integrante | Miembro Trello |
|---|---|
| **Estiven** | Brallam Delgado |
| **Valen** | Valentina |
| **Daniel** | José Daniel Gutiérrez |
| **Juan** | Juan Carlos Vanegas Palencia |

---

## ✅ Hecho

### HU-01 [Estiven] — Autenticación: Registro e Inicio de Sesión
- [x] `POST /auth/register` y `POST /auth/login` funcionales desde la pantalla de autenticación.
- [x] Validación de email (formato) y password (mín 6 caracteres).
- [x] El `accessToken` se guarda en `localStorage`.
- [x] Tras autenticarse redirige a `/dashboard`.
- [x] Los errores 400/401 del backend se muestran en la UI.

### HU-03 [Estiven] — Navegación global y Logout
- [x] Sidebar y Header con la marca TOLLA y buscador global.
- [x] Logout: `POST /auth/logout`, borra el token local y redirige a `/login`.
- [x] Las rutas privadas redirigen a login si no hay token (guard).

### HU-06 [Estiven] — KPIs del dashboard con datos reales
- [x] Total Categories = length de `GET /categories`.
- [x] SKU Count = total de `GET /products`.
- [x] Revenue = Σ (precio × stock) formateado.
- [x] Uncategorized = productos sin categoría.

### HU-02 [Estiven] — Home: listado, búsqueda y paginación
> Como visitante quiero ver el catálogo de productos y poder buscarlos desde el Home.

- [x] `GET /products` carga el listado inicial.
- [x] La barra de búsqueda usa `GET /products?search=` y filtra por nombre y descripción.
- [x] Paginación con `?page` y `?limit` usando `total`/`totalPages` de la respuesta.
- [x] Estados de carga y vacío visibles.

### HU-07 [Valen] — CRUD de categorías (Ontología)
> Como usuario autenticado quiero gestionar las categorías de la ontología.

- [x] Listar: `GET /categories` en las tarjetas del Active Ontology.
- [x] Crear: `POST /categories` (name obligatorio, description opcional).
- [x] Editar: `PATCH /categories/:id`.
- [x] **Eliminar: `DELETE /categories/:id`.**
- [x] Error 409 por nombre duplicado; la lista se refresca tras cada acción.

### HU-08 [Valen] — Filtro de productos por categoría
> Como usuario quiero filtrar el catálogo por categoría.

- [x] Selector de categorías alimentado por `GET /categories`.
- [x] `GET /products?categoryId=` filtra los resultados.
- [x] El filtro se combina con búsqueda y paginación.
- [x] Desde una categoría se ven sus productos vinculados (`category-list`) y se pueden eliminar.

### HU-05 [Estiven] — CRUD de productos
> Como usuario autenticado quiero crear, editar y eliminar productos.

- [x] **`POST /products` crea con name, description?, price, stock, categoryId, images?.**
- [x] **`PATCH /products/:id` edita campos opcionales (form reutilizado vía `/products/:id/edit`).**
- [x] **`DELETE /products/:id` elimina (204) con modal de confirmación.**
- [x] **Validación de price/stock numéricos y error 409 por nombre duplicado.**

### HU-11 [Daniel] — Manejo global de errores y estados
> Como usuario quiero respuestas claras ante errores y esperas en todo el panel.

- [x] **El interceptor maneja 401: limpia sesión y redirige a `/login`.**
- [x] Errores con formato `{statusCode, message, error}` mostrados en la UI.
- [x] Quick-Edit conectado a `CategoryService` con spinner y mensajes de éxito/error.
- [x] Estados de carga/vacío en todas las pantallas.

### HU-10 [Juan] — Perfil y cambio de contraseña
> Como usuario quiero ver mi perfil y cambiar mi contraseña.

- [x] `GET /users/me` muestra nombre y email.
- [x] `PATCH /users/me/password` con `currentPassword` y `newPassword` (mín 6 y distinta a la actual).
- [x] Error claro si la contraseña actual no coincide o la nueva es débil.

---

## 🔵 En Progreso

### HU-09 [Daniel] — Favoritos
> Como usuario autenticado quiero guardar productos favoritos.

- [x] `GET /favorites` lista los productos favoritos.
- [x] `DELETE /favorites/:productId` elimina (204); 404 si no existía.
- [ ] `POST /favorites/:productId` agrega (201); 409 si ya era favorito.
- [ ] Botón de favorito en listado y detalle con estado sincronizado.

---

## ⚪ Por hacer

### HU-04 [Estiven] — Detalle de producto
> Como usuario quiero ver el detalle completo de un producto.

- [ ] `GET /products/:id` muestra nombre, descripción, precio y stock.
- [ ] Imágenes mostradas en orden asc (`images[].order`).
- [ ] Error 404 claro cuando el producto no existe.

### HU-12 [Juan] — Catálogo público y rutas protegidas
> Como visitante quiero ver el catálogo de productos sin iniciar sesión. Si quiero dar "me gusta" o realizar cualquier otra acción, se me pide iniciar sesión.

- [ ] `GET /products` es accesible sin token: el catálogo/Home se ve sin login.
- [ ] El botón de "me gusta" (favorito) u otra acción pide iniciar sesión si el usuario no está autenticado (redirige a `/login` o muestra prompt).
- [ ] Las rutas públicas (catálogo, detalle) no se bloquean por el guard.
- [ ] Las rutas protegidas (crear/editar/eliminar, favoritos, etc.) requieren sesión; el interceptor 401 redirige a `/login` solo al intentar una acción protegida.

> Nota: la funcionalidad de favoritos en sí (POST/DELETE `/favorites`) no es de esta tarjeta — es de HU-09. Juan solo integra el gate de login para esa acción.

### HU-13 [Estiven] — Separación de roles: Admin vs Usuario
> Como usuario quiero que el sistema distinga roles: todos inician sesión con el mismo formulario, pero la experiencia y los permisos cambian según el rol.

- [ ] Login único: el mismo formulario sirve para admin y usuario; el rol se carga tras autenticarse y se persiste en la sesión.
- [ ] Admin: se renderizan todas las vistas actuales tal como están, excepto Favoritos.
- [ ] Usuario: SOLO ve el catálogo de productos de todos los admins, en modo solo lectura (sin crear/editar/eliminar).
- [ ] Protección de rutas por rol: las rutas administrativas (crear/editar/eliminar productos y categorías) solo son accesibles para admin; el guard redirige/bloquea a un usuario sin permisos.
- [ ] El sidebar/navegación se adapta según el rol (oculta entradas administrativas y Favoritos para admin, etc.).

---

## 🔍 Revisión

*(sin tarjetas en este momento)*

---

## 🧩 Resumen por integrante

| Integrante | Hecho | En progreso | Por hacer |
|---|---|---|---|
| **Estiven** | HU-01, HU-03, HU-02, HU-06, HU-05 | — | HU-04, HU-13 |
| **Valen** | HU-07, HU-08 | — | — |
| **Daniel** | HU-11 | HU-09 | — |
| **Juan** | HU-10 | — | HU-12 |

---

## 📌 Notas del sprint

- **HU-05 (CRUD de productos) se completó con el PR de Juan** (`feature-categories-proucts`): el formulario ahora crea y edita (`/products/:id/edit`), elimina con modal de confirmación y reemplazó el input de `categoryId` por un selector de categorías.
- **HU-08 (filtro por categoría)** quedó completo y además la lista de categorías permite ver y eliminar los productos vinculados a cada una.
- **HU-09 (favoritos)** en progreso: faltan el `POST /favorites/:productId` y el botón de favorito en listado/detalle.
- **Quedan pendientes:** HU-04 (detalle de producto), HU-12 (catálogo público y rutas protegidas — Juan) y HU-13 (separación de roles — Estiven). HU-12 solo cubre acceso público + gate de login; la lógica de favoritos es de HU-09. HU-13 depende del campo `role` del usuario en la sesión y se coordina con HU-12 (protección de rutas).
- Los criterios marcados `[ ]` (sin tilde) son los que faltan para dar por cerrada cada tarjeta.
