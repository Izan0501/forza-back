# Forja – API REST

API REST para una aplicación de entrenamiento y nutrición. Permite registrar usuarios, armar rutinas con ejercicios, guardar favoritos, registrar el progreso y llevar el control de la alimentación y la hidratación.

Está desarrollada con **NestJS** y **Prisma**, sobre una base de datos **PostgreSQL**.

## Tecnologías

| Tecnología | Uso |
|---|---|
| NestJS 12 | Framework del servidor |
| TypeScript | Lenguaje |
| Prisma 7 | Acceso a la base de datos (ORM) |
| PostgreSQL 16 | Base de datos |
| JWT (`@nestjs/jwt`) | Token de acceso al registrarse o iniciar sesión |
| bcrypt | Encriptación de contraseñas |
| class-validator | Validación de los datos que llegan en cada request |

## Requisitos

- Node.js 24
- pnpm (se activa con `corepack enable`)
- PostgreSQL 16 en ejecución

## Instalación y ejecución

1. **Instalar las dependencias**

   ```bash
   pnpm install
   ```

2. **Crear la base de datos**

   ```bash
   createdb forza_db
   ```

3. **Crear el archivo `.env`** en la raíz del proyecto (ver [Variables de entorno](#variables-de-entorno)).

4. **Crear las tablas y generar el cliente de Prisma**

   ```bash
   pnpm exec prisma migrate deploy --config prisma7.config.ts
   pnpm exec prisma generate --config prisma7.config.ts
   ```

5. **Levantar el servidor**

   ```bash
   pnpm start:dev
   ```

El servidor queda disponible en `http://localhost:3000`.

## Variables de entorno

Archivo `.env` en la raíz:

```env
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/forza_db?schema=public"
JWT_SECRET="una-cadena-larga-y-aleatoria"
JWT_EXPIRES_IN="1d"
```

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Clave para firmar los tokens. Es obligatoria: sin ella el servidor no arranca |
| `JWT_EXPIRES_IN` | Duración del token (por defecto `1d`) |

## Estructura del proyecto

Cada módulo tiene su `controller` (recibe las requests), su `service` (tiene la lógica) y una carpeta `dto/` (define y valida los datos de entrada).

```
src/
├── main.ts                  # Arranque de la app y validación global
├── generated/prisma/        # Cliente de Prisma (se genera, no se sube a Git)
└── modules/
    ├── app/                 # Módulo raíz
    ├── prisma/              # Conexión a la base de datos
    ├── auth/                # Registro y login
    ├── users/               # CRUD de usuarios
    ├── muscle-groups/       # Grupos musculares
    ├── exercises/           # Ejercicios
    ├── routines/            # Rutinas
    ├── favorito/            # Favoritos (ejercicios o rutinas)
    ├── progress/            # Progreso de rutinas
    └── nutrition/           # Nutrición, dividido en 5 submódulos
        ├── meals/
        ├── nutrition-goals/
        ├── hydration/
        ├── meal-plans/
        └── daily-logs/
```

## Endpoints

Todos devuelven y reciben JSON.

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Crea un usuario y devuelve el usuario y su token |
| POST | `/auth/login` | Valida las credenciales y devuelve el usuario y su token |

### CRUD básico

Estos módulos tienen las mismas 5 rutas: `POST /ruta`, `GET /ruta`, `GET /ruta/:id`, `PATCH /ruta/:id` y `DELETE /ruta/:id`.

| Ruta | Descripción |
|---|---|
| `/users` | Usuarios |
| `/muscle-groups` | Grupos musculares (el `id` es un número) |
| `/exercises` | Ejercicios |
| `/routines` | Rutinas de un usuario |
| `/favorito` | Favoritos: se envía `exercise_id` o `routine_id`, uno solo |
| `/progress` | Registros de progreso de un usuario |

### Nutrición

| Ruta | Operaciones |
|---|---|
| `/nutrition/meals` | CRUD del catálogo de comidas |
| `/nutrition/goals/:userId` | `GET`, `PUT` (crea o actualiza) y `DELETE` de las metas del usuario |
| `/nutrition/hydration` | `PUT` (crea o actualiza el día), `GET ?userId=&fecha=` y `DELETE /:id` |
| `/nutrition/plans` | CRUD del plan semanal. Filtros: `?userId=&dia=` |
| `/nutrition/logs` | CRUD de las comidas del día. Filtros: `?userId=&fecha=` |

Las fechas se envían como `YYYY-MM-DD` y las horas como `HH:mm`.

## Ejemplo de uso

**1. Registrar un usuario** – `POST /auth/register`

```json
{
  "nombre": "Ana Pérez",
  "email": "ana@forja.com",
  "password": "Secreta123",
  "objetivo": "Ganar masa muscular"
}
```

Respuesta (201):

```json
{
  "user": { "id": "…", "nombre": "Ana Pérez", "email": "ana@forja.com" },
  "access_token": "eyJhbGciOi…"
}
```

**2. Iniciar sesión** – `POST /auth/login`

```json
{ "email": "ana@forja.com", "password": "Secreta123" }
```

**3. Crear una comida** – `POST /nutrition/meals`

```json
{
  "nombre": "Pollo con arroz",
  "calorias": 550,
  "proteinas": 42.5,
  "carbohidratos": 60.25,
  "grasas": 12
}
```

**4. Asignarla al plan semanal** – `POST /nutrition/plans`

```json
{
  "user_id": "<id del usuario>",
  "meal_id": "<id de la comida>",
  "dia_semana": "Lunes",
  "tipo_comida": "Almuerzo",
  "hora_sugerida": "13:30"
}
```

## Validaciones y respuestas

Los datos de cada request se validan antes de llegar al service. Si se envía un campo que el DTO no define, la API responde con error.

| Código | Cuándo ocurre |
|---|---|
| 200 / 201 | La operación se realizó |
| 400 | Datos inválidos, UUID mal formado o fecha inexistente |
| 401 | Credenciales incorrectas en el login |
| 404 | El registro no existe |
| 409 | Registro duplicado (por ejemplo, email ya registrado) o elemento en uso |

Las contraseñas se guardan encriptadas con bcrypt y nunca se devuelven en las respuestas.

## Base de datos

El esquema está en `prisma/schema.prisma` y tiene 12 tablas:

| Área | Tablas |
|---|---|
| Usuarios | `users` |
| Entrenamiento | `muscle_groups`, `exercises`, `routines`, `routine_exercises` |
| Favoritos y progreso | `favorites`, `progress_logs` |
| Nutrición | `meals`, `nutrition_goals`, `hydration_logs`, `meal_plans`, `daily_nutrition_logs` |

Los datos de un usuario (rutinas, favoritos, progreso y nutrición) se eliminan automáticamente al borrar al usuario.

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm start:dev` | Servidor en modo desarrollo (se reinicia al guardar) |
| `pnpm build` | Compila el proyecto |
| `pnpm start:prod` | Ejecuta la versión compilada |
| `pnpm lint` | Revisa el código con oxlint |
| `pnpm format` | Da formato al código con Prettier |

## Limitaciones

- Las rutas todavía no están protegidas con JWT: el token se genera al registrarse o iniciar sesión, pero ningún endpoint lo exige.
- La tabla `routine_exercises` existe en la base de datos, pero no tiene endpoints.
- El proyecto no incluye tests automáticos.
