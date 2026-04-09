# Proyecto Final Grupo 18 - University Parking Reservations API

# Ali Cheves 20245542@esen.edu.sv
# Joseph Lyon 20245574@esen.edu.sv
# Guillermo Molina 20245562@esen.edu.sv

Backend + frontend para gestionar reservas de parqueo universitario.

## Stack
- PHP 8.3+
- Laravel 13
- Laravel Sanctum (token auth API)
- Spatie Laravel Permission (roles y permisos)
- Pest + PHPUnit
- Inertia + React + Vite (frontend)
- Swagger UI + OpenAPI 3.0

## Funcionalidades principales
- Login/logout/profile API en `/api/v1/auth/*`
- CRUD de parking spots con permisos por rol
- Creacion y cancelacion de reservas
- Reglas de negocio:
  - solo spots activos se pueden reservar
  - no reservar spot ocupado
  - no reservar con conflicto de horario
  - cancelar reserva activa libera spot
  - no cancelar reservas canceladas/completadas
- Documentacion interactiva Swagger
- Coleccion Postman lista para importar

## Roles del sistema
- `admin_parqueo`
  - CRUD completo de parking spots
  - puede ver todas las reservas
  - puede cancelar reservas
- `docente`
  - crea y cancela sus reservas
  - ve su historial permitido
- `estudiante`
  - crea y cancela sus reservas
  - ve su historial permitido

## Requisitos previos
- PHP 8.3 o superior
- Composer
- Node.js 20+ y npm
- SQLite habilitado en PHP

## Instalacion
1. Clonar proyecto y entrar al directorio.
2. Instalar dependencias PHP:
```bash
composer install
```
3. Instalar dependencias frontend:
```bash
npm install
```
4. Configurar entorno:
```bash
cp .env.example .env
php artisan key:generate
```

## Base de datos y seeders
Para cargar estructura y datos demo (recomendado):
```bash
php artisan migrate:fresh --seed
```

Esto crea:
- roles/permisos
- usuarios demo
- spots demo

## Credenciales demo
- Admin:
  - email: `admin.parqueo@example.com`
  - password: `password`
- Docente:
  - email: `docente@example.com`
  - password: `password`
- Estudiante:
  - email: `estudiante@example.com`
  - password: `password`

## Levantamiento local
### Opcion A (recomendada en este proyecto)
Servidor PHP built-in en puerto 3001:
```bash
php -S 127.0.0.1:3001 -t public
```
En otra terminal, Vite:
```bash
npm run dev
```
Abrir:
- App web: `http://127.0.0.1:3001`
- Modulo parking: `http://127.0.0.1:3001/parking`
- Swagger UI: `http://127.0.0.1:3001/swagger`

### Opcion B (artisan serve)
```bash
php artisan serve --host=127.0.0.1 --port=3001
npm run dev
```
Si tu Windows falla en puertos 8000-8010, usa siempre `--port=3001` o la Opcion A.

## Ejecutar pruebas
```bash
php artisan test
```

Notas:
- Testing usa SQLite en memoria (`phpunit.xml`).
- Actualmente la suite pasa completamente.

## Documentacion API
### Swagger (OpenAPI)
- UI: `/swagger`
- Spec: `/swagger/openapi.yaml`
- Archivo spec: `public/swagger/openapi.yaml`

### Postman
Coleccion incluida en:
- `postman/UniversityParkingAPI_v1.postman_collection.json`

Importar en Postman y ajustar variable `base_url`.

## Rutas API principales
Base: `/api/v1`

Auth:
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/profile`

Parking spots:
- `GET /parking-spots`
- `POST /parking-spots`
- `GET /parking-spots/{parking_spot}`
- `PUT /parking-spots/{parking_spot}`
- `DELETE /parking-spots/{parking_spot}`

Reservations:
- `GET /reservations`
- `POST /reservations`
- `POST /reservations/{reservation}/cancel`

## Frontend
Pagina principal del modulo:
- `/parking`

Incluye:
- sesion API por token
- formulario de reservas
- listado y cancelacion
- CRUD de spots para admin
- vistas por rol

## Archivos clave
- API routes: `routes/api.php`
- Web routes: `routes/web.php`
- Auth controller: `app/Http/Controllers/Api/V1/AuthController.php`
- Spots controller: `app/Http/Controllers/Api/V1/ParkingSpotController.php`
- Reservations controller: `app/Http/Controllers/Api/V1/ReservationController.php`
- Policies: `app/Policies/*`
- Tests API: `tests/Feature/Api/*`
- Frontend parking page: `resources/js/pages/parking/index.tsx`

## Troubleshooting rapido
1. Error al levantar servidor con `php artisan serve`:
- Probar:
```bash
php artisan serve --host=127.0.0.1 --port=3001
```
- O usar:
```bash
php -S 127.0.0.1:3001 -t public
```

2. Login falla con credenciales demo:
- Ejecutar:
```bash
php artisan migrate:fresh --seed
```

3. Cambios frontend no se ven:
- Confirmar `npm run dev` activo.
- Limpiar cache del navegador.

4. Verificar rutas:
```bash
php artisan route:list
```
