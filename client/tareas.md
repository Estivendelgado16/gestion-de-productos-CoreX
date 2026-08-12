# 📋 TOLLA · Gestión de Productos — Tablero de Tareas

Espejo del tablero **Trello "Gestión de Productos — Sprint 1"** para consulta rápida dentro del repo.

> ⚠️ **Este archivo es una referencia.** La fuente de verdad es el tablero de Trello; los avances/cambios de estado se actualizan allí.

**Estado global del sprint:** `3 Hecho` · `4 En Progreso` · `4 Por hacer` · `0 Revisión`

---

## 👥 Equipo

| Integrante | Miembro Trello |
|---|---|
| **Estiven** | Brallam Delgado |
| **Jenn** | Jennifer López |
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

### HU-06 [Jenn] — KPIs del dashboard con datos reales
- [x] Total Categories = length de `GET /categories`.
- [x] SKU Count = total de `GET /products`.
- [x] Revenue = Σ (precio × stock) formateado.
- [x] Uncategorized = productos sin categoría.

---

## 🔵 En Progreso

### HU-02 [Estiven] — Home: listado, búsqueda y paginación
> Como visitante quiero ver el catálogo de productos y poder buscarlos desde el Home.

- [x] `GET /products` carga el listado inicial.
- [x] La barra de búsqueda usa `GET /products?search=` y filtra por nombre y descripción.
- [ ] **Paginación con `?page` y `?limit` usando `total`/`totalPages` de la respuesta.**
- [x] Estados de carga y vacío visibles.

### HU-07 [Valen] — CRUD de categorías (Ontología)
> Como usuario autenticado quiero gestionar las categorías de la ontología.

- [x] Listar: `GET /categories` en las tarjetas del Active Ontology.
- [x] Crear: `POST /categories` (name obligatorio, description opcional).
- [x] Editar: `PATCH /categories/:id`.
- [ ] **Eliminar: `DELETE /categories/:id`.**
- [x] Error 409 por nombre duplicado; la lista se refresca tras cada acción.

### HU-11 [Daniel] — Manejo global de errores y estados
> Como usuario quiero respuestas claras ante errores y esperas en todo el panel.

- [ ] **El interceptor maneja 401: limpia sesión y redirige a `/login`.**
- [x] Errores con formato `{statusCode, message, error}` mostrados en la UI.
- [x] Quick-Edit conectado a `CategoryService` con spinner y mensajes de éxito/error.
- [x] Estados de carga/vacío en todas las pantallas.

### HU-05 [Jenn] — CRUD de productos
> Como usuario autenticado quiero crear, editar y eliminar productos.

- [ ] **`POST /products` crea con name, description?, price, stock, categoryId, images?.**
- [ ] **`PATCH /products/:id` edita campos opcionales.**
- [ ] **`DELETE /products/:id` elimina (204).**
- [ ] **Validación de price/stock numéricos y error 409 por nombre duplicado.**

---

## ⚪ Por hacer

### HU-04 [Jenn] — Detalle de producto
> Como usuario quiero ver el detalle completo de un producto.

- [ ] `GET /products/:id` muestra nombre, descripción, precio y stock.
- [ ] Imágenes mostradas en orden asc (`images[].order`).
- [ ] Error 404 claro cuando el producto no existe.

### HU-08 [Valen] — Filtro de productos por categoría
> Como usuario quiero filtrar el catálogo por categoría.

- [ ] Selector de categorías alimentado por `GET /categories`.
- [ ] `GET /products?categoryId=` filtra los resultados.
- [ ] El filtro se combina con búsqueda y paginación.

### HU-09 [Daniel] — Favoritos
> Como usuario autenticado quiero guardar productos favoritos.

- [ ] `GET /favorites` lista los productos favoritos.
- [ ] `POST /favorites/:productId` agrega (201); 409 si ya era favorito.
- [ ] `DELETE /favorites/:productId` elimina (204); 404 si no existía.
- [ ] Botón de favorito en listado y detalle con estado sincronizado.

### HU-10 [Juan] — Perfil y cambio de contraseña
> Como usuario quiero ver mi perfil y cambiar mi contraseña.

- [ ] `GET /users/me` muestra nombre y email.
- [ ] `PATCH /users/me/password` con `currentPassword` y `newPassword` (mín 6 y distinta a la actual).
- [ ] Error claro si la contraseña actual no coincide o la nueva es débil.

---

## 🔍 Revisión

*(sin tarjetas en este momento)*

---

## 🧩 Resumen por integrante

| Integrante | Hecho | En progreso | Por hacer |
|---|---|---|---|
| **Estiven** | HU-01, HU-03 | HU-02 | — |
| **Jenn** | HU-06 | HU-05 | HU-04 |
| **Valen** | — | HU-07 | HU-08 |
| **Daniel** | — | HU-11 | HU-09 |
| **Juan** | — | — | HU-10 |

---

## 📌 Notas del sprint

- **Bloqueo cruzado:** HU-05 (Jenn) necesita el patrón de servicios de producto de HU-02 (Estiven). HU-08 (Valen) depende de HU-02 + HU-07.
- **Juan** tiene la única tarea 100% independiente (HU-10), ideal para integrarse sin presión.
- Los criterios marcados `[ ]` (sin tilde) son los que faltan para dar por cerrada cada tarjeta.
