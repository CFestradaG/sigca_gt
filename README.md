# SIGCA — Centro Armonía
### Sistema Integral de Gestión de Citas y Atención Clínica

> **Centro Armonía**: Especialistas en Psicología Infantil, Neurodesarrollo y Estimulación Auditivo-Verbal (EAV) en Ciudad de Guatemala.

> **Arquitectura:** el proyecto tiene **un solo backend**: `server.ts` + `server/`. La antigua API parcial `backend/` fue retirada para evitar dos contratos y dos instalaciones; la decisión se documenta en [`docs/MAPA_DEL_PROYECTO.md`](docs/MAPA_DEL_PROYECTO.md).
>
> **Estado de revisión (2026-10-16):** el flujo predeterminado usa `server.ts`, Express, Vite y las rutas de `server/`.
>
> **Actualización post-P0 (2026-10-16):** se corrigieron el arranque en producción (Express 5), la autorización/ownership por rol, el `PUT` de citas, RN-20/RN-25/RN-29, el correlativo y la concurrencia de pagos, la suite de pruebas y la UI de cierre de caja. Verificado: `npm test` 22/22, E2E de bloqueantes 43/43, `npm run lint`/`build` OK y `NODE_ENV=production` arranca.

---

## 👥 Integrantes del Equipo y Distribución de Responsabilidades (Sección 13)

| Integrante | Rol Asignado | Responsabilidades Principales |
|---|---|---|
| **NERY GEOVANY OSORIO TECÚ 7690 23 22940** | Backend & Base de Datos | Modelos Mongoose, API REST, persistencia MongoDB, endpoints de Pacientes, Responsables, Servicios y Contenido. |
| **MELVIN ESTEBAN RAMOS 7690 23 17316** | Frontend & Integración | Interfaces Vue 3, Vue Router, Pinia, integración con API REST, formularios reactivos, portal público y calendario. |
| **CRUZ FRANCISCO ESTRADA GREGORIO** | Seguridad & Control Financiero | Autenticación JWT, RBAC, gestión de citas (RN-01 a RN-07), pagos, saldos, arqueo de caja diaria y pruebas automatizadas. |

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [Vue 3](https://vuejs.org/) (Composition API `<script setup lang="ts">`), [Vue Router 4](https://router.vuejs.org/) con Navigation Guards por roles, [Pinia](https://pinia.vuejs.org/).
- **Backend**: [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/).
- **Base de Datos**: [MongoDB 6](https://www.mongodb.com/) con modelado [Mongoose](https://mongoosejs.com/).
- **Seguridad**: JSON Web Tokens ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)), Hashing con [bcryptjs](https://github.com/dcodeIO/bcrypt.js).
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) y fuentes de Google Fonts (Inter, Nunito Sans, Material Symbols).
- **Contenedores**: [Docker](https://www.docker.com/) y Docker Compose con red interna y healthcheck.
- **Pruebas y API**: Suite de pruebas automatizadas en TypeScript y colección exportada de Postman.

## 📚 Manuales

- [Manual de usuario](docs/manual_usuario.md): navegación, roles y flujos de trabajo del portal y administración.
- [Manual técnico](docs/manual_tecnico.md): arquitectura, configuración, Docker, API y mantenimiento.

### Estado técnico actual

- `npm run dev` inicia el backend integrado y Vite en el mismo origen para desarrollo local.
- El backend carga sus colecciones desde MongoDB al arrancar; MongoDB y una `JWT_SECRET` de 32 caracteres o más son obligatorios.
- El login usa el contrato del backend integrado, restaura sesión con `/api/auth/me` y no asigna un rol ficticio.
- En **Programar Cita** se puede seleccionar un paciente existente o registrar uno nuevo; para menores, el formulario pide y asocia los datos requeridos del responsable antes de guardar.
- Si al consultar disponibilidad aparece `Cita no encontrada`, reinicia el backend con `npm run dev` para que cargue la ruta `/api/citas/disponibilidad`. Si ejecutas Docker, reconstruye el servicio de la aplicación.
- `compose.yaml` levanta MongoDB y la aplicación web integrada. Mongo no tiene autenticación; esta configuración está pensada para desarrollo y demostraciones locales.

---

## 🚀 Instrucciones de Instalación y Ejecución

Esta es la forma recomendada de probar el proyecto desde una computadora nueva. **Docker ejecuta MongoDB y la aplicación web**; no hace falta instalar Node.js ni correr `npm run dev` para usar esta opción.

### 1. Instalar Git y Docker

- Instala **Git** desde [git-scm.com](https://git-scm.com/downloads) si aún no está disponible en tu computadora.
- En macOS o Windows, instala [Docker Desktop para Mac](https://docs.docker.com/desktop/setup/install/mac-install/) o [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/). En Linux, sigue la [guía oficial de Docker Engine](https://docs.docker.com/engine/install/).
- Abre Docker Desktop y espera a que indique que Docker está iniciado. En Windows, mantén el modo de contenedores Linux, que es el predeterminado.

Comprueba que las herramientas estén disponibles:

```bash
git --version
docker compose version
```

### 2. Clonar el repositorio y preparar `.env`

```bash
git clone https://github.com/CFestradaG/sigca_gt.git
cd sigca_gt
```

Crea el archivo de configuración a partir del ejemplo. En macOS o Linux:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Abre `.env`, busca `JWT_SECRET=` y pega una clave aleatoria de al menos 32 caracteres. En macOS o Linux puedes generar una con `openssl rand -hex 32`. En PowerShell, genera una clave con estos comandos y copia el resultado a `.env`:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
```

Guarda `.env`; no compartas ni publiques ese archivo. Si el puerto `27017` ya está ocupado por otro MongoDB, cambia `MONGO_PORT=27017` por `MONGO_PORT=27018` en `.env`. La aplicación dentro de Docker usa la conexión interna de Compose y no requiere cambios adicionales.

### 3. Construir e iniciar MongoDB y la web

Desde la carpeta `sigca_gt`, ejecuta:

```bash
docker compose -f compose.yaml up --build -d
```

La primera vez Docker descargará las imágenes y construirá la aplicación; puede tardar unos minutos. Comprueba que los servicios estén arriba:

```bash
docker compose -f compose.yaml ps
```

MongoDB debe aparecer como `healthy` y la app como `Up`. Abre [http://localhost:3000](http://localhost:3000). Para comprobar la API, visita [http://localhost:3000/api/health](http://localhost:3000/api/health); debe responder con `"status":"ok"`.

### 4. Iniciar sesión y hacer una primera prueba

Las cuentas de demostración se cargan automáticamente cuando las colecciones están vacías. Inicia sesión desde la web con una de estas cuentas:

| Rol | Correo | Contraseña | Uso principal |
|---|---|---|---|
| **Administrador** | `smorales@centroarmonia.com.gt` | `Admin123!` | Administra usuarios, contenido, servicios, pacientes, citas, pagos, cajas y reportes. |
| **Recepcionista 1** | `recepcion@centroarmonia.com.gt` | `Recep123!` | Registra pacientes y responsables, programa citas, cobra y gestiona su caja. |
| **Recepcionista 2** | `recepcion2@centroarmonia.com.gt` | `Recep123!` | Programa citas y opera la caja alterna. |
| **Profesional EAV** | `acastillo@centroarmonia.com.gt` | `Profe123!` | Consulta su agenda, actualiza citas y asigna materiales. |
| **Profesional Psicología** | `evalencia@centroarmonia.com.gt` | `Profe123!` | Consulta la agenda de psicología infantil y neurodesarrollo. |
| **Profesional Lenguaje** | `mramirez@centroarmonia.com.gt` | `Profe123!` | Consulta su agenda de terapia del lenguaje y articulación. |

Para probar el flujo principal, entra como administrador y revisa servicios y usuarios; luego usa la cuenta de recepción para registrar un paciente y programar una cita. Estas credenciales son solo para demostración local; cámbialas antes de cualquier despliegue.

### 5. Detener y volver a iniciar

Para detener los servicios sin borrar la información guardada:

```bash
docker compose -f compose.yaml down
```

Para iniciarlos de nuevo:

```bash
docker compose -f compose.yaml up -d
```

MongoDB guarda la información en el volumen de Docker `mongo_data`. **No agregues `-v` a `down`** salvo que quieras borrar ese volumen y todos sus datos.

### Solución de problemas comunes

- **Docker daemon o `docker.sock` no disponible:** abre Docker Desktop y espera a que termine de iniciar; después repite el comando `up`.
- **El puerto `27017` está ocupado:** cambia `MONGO_PORT=27017` por `MONGO_PORT=27018` en `.env` y vuelve a ejecutar `docker compose -f compose.yaml up -d`.
- **El puerto `3000` está ocupado:** libera ese puerto o cambia `PORT=3000` por `PORT=3001` en `.env`; abre entonces `http://localhost:3001`.
- **La web no carga o la app se reinicia:** revisa `docker compose -f compose.yaml ps` y `docker compose -f compose.yaml logs --tail=100 app`. Si el log dice `ENOTFOUND mongo`, recrea los contenedores y la red con `docker compose -f compose.yaml down` y luego `docker compose -f compose.yaml up --build -d`. Ese `down` conserva los datos; no uses `-v`.
- **Quieres detener la salida continua de logs:** presiona `Ctrl+C`; esto no detiene los contenedores. Para detenerlos usa `docker compose -f compose.yaml down`.

### Desarrollo local sin contenedor para la aplicación (opcional)

Para modificar el código puedes ejecutar la app con Node.js 20 o superior y mantener MongoDB en Docker. Inicia solo la base de datos con `docker compose -f compose.yaml up -d mongo`, configura `JWT_SECRET` en `.env`, y luego ejecuta:

```bash
npm ci
npm run dev
```

La web local estará en `http://localhost:3000`. No ejecutes al mismo tiempo este modo y la app de Compose: ambos usan el puerto 3000.

### Comandos adicionales de desarrollo

- `npm run seed` inserta fixtures solo en colecciones vacías. Para reiniciar los datos explícitamente, define `SEED_RESET=true`; eso elimina las colecciones SIGCA.
- `npm test` ejecuta `scripts/test-api.ts`.
- `npm run lint` revisa tipos y `npm run build` genera la compilación de producción.

---

## 📋 Matriz de Cumplimiento Declarado de Reglas de Negocio (RN-01 a RN-30)

La tabla describe validaciones que aparecen en el código del backend integrado. Ninguna marca equivale a una prueba end-to-end; el cumplimiento requiere verificar el flujo con MongoDB y las vistas.

| Código | Regla de Negocio | Implementación en Backend | Estado |
|---|---|---|---|
| **RN-01** | No citas traslapadas para el mismo profesional | Validación de intervalo `[horaInicio, horaFin)` en `validateAppointmentRules()` | En código; pendiente de validación end-to-end |
| **RN-02** | Respetar horarios de atención configurados | Validación contra colección `horarios` según el día de la semana | En código; pendiente de validación end-to-end |
| **RN-03** | Paciente, servicio y profesional deben estar activos | Comprobación de estado `activo / ACTIVO` de las 3 entidades | En código; pendiente de validación end-to-end |
| **RN-04** | Menores de 18 años requieren responsable antes de agendar | Cálculo de edad con fecha de nacimiento; exige `responsableIds.length > 0` | En código; pendiente de validación end-to-end |
| **RN-05** | Citas CANCELADAS no pueden pasar a COMPLETADA | Validación de máquina de estados en `changeAppointmentStatus()` | En código; pendiente de validación end-to-end |
| **RN-06** | Citas COMPLETADAS no pueden reprogramarse | Bloqueo de mutación de fecha/hora en citas en estado COMPLETADA | En código; pendiente de validación end-to-end |
| **RN-07** | Servicios inactivos no pueden seleccionarse | Filtro y validación de estado del servicio antes de crear cita | En código; pendiente de validación end-to-end |
| **RN-08** | Usuarios inactivos no pueden iniciar sesión | Rechazo en endpoint `POST /api/auth/login` con código HTTP 403 | En código; pendiente de validación end-to-end |
| **RN-09** | Materiales solo a pacientes activos | Validación de estado activo en `POST /api/materiales/:id/asignar` | En código; pendiente de validación end-to-end |
| **RN-10** | Operaciones privadas requieren autenticación/autorización | Middlewares `authenticateToken` y `requireRole` en Express | En código; pendiente de validación end-to-end |
| **RN-11** | No citas en fechas u horas pasadas | Verificación de fecha y hora actual al programar | En código; pendiente de validación end-to-end |
| **RN-12** | Hora de fin calculada con duración del servicio | `horaFin = horaInicio + duracionMinutos` | En código; pendiente de validación end-to-end |
| **RN-13** | CANCELADAS y COMPLETADAS no bloquean horarios futuros | Exclusión de citas canceladas y completadas en verificación de traslape | En código; pendiente de validación end-to-end |
| **RN-14** | Pacientes inactivos no pueden recibir nuevas citas | Validación de `paciente.estado === 'ACTIVO'` | En código; pendiente de validación end-to-end |
| **RN-15** | Pagos asociados a citas existentes | Validación de existencia de `citaId` | En código; pendiente de validación end-to-end |
| **RN-16** | Monto de pago > 0 | Validación estricta `montoQ > 0` | En código; pendiente de validación end-to-end |
| **RN-17** | Total pagado no supera precio de la cita | Control `totalPagado + montoQ <= precioQ` | En código; pendiente de validación end-to-end |
| **RN-18** | Saldo pendiente calculado automáticamente | `saldo = roundQ(precioQ - totalPagosValidos)` | En código; pendiente de validación end-to-end |
| **RN-19** | Pagos anulados no cuentan en saldo ni ingresos | Exclusión de pagos con `estado === 'ANULADO'` en cálculos | En código; pendiente de validación end-to-end |
| **RN-20** | Pagos vinculados a caja abierta del usuario | Asociación obligatoria a caja con `estado === 'ABIERTA'` | En código; pendiente de validación end-to-end |
| **RN-21** | No pagos en cajas cerradas | Rechazo de transacciones sobre cajas cerradas | En código; pendiente de validación end-to-end |
| **RN-22** | Una sola caja abierta por usuario | Restricción en `POST /api/cajas/abrir` | En código; pendiente de validación end-to-end |
| **RN-23** | Cierre calcula totales por método y esperado | Sumatorias por EFECTIVO, TRANSFERENCIA, TARJETA y total | En código; pendiente de validación end-to-end |
| **RN-24** | Historial de movimientos conservado | Registro inmutable de ingresos y egresos en la caja | En código; pendiente de validación end-to-end |
| **RN-25** | Solo usuarios autorizados registran pagos y cierran caja | RBAC verificado en endpoints financieros | En código; pendiente de validación end-to-end |
| **RN-26** | Pagos no se eliminan físicamente | `DELETE /api/pagos/:id` bloqueado con HTTP 405 | En código; pendiente de validación end-to-end |
| **RN-27** | Cita con pagos válidos no puede cancelarse | Exige anular pagos primero en caja abierta antes de cancelar | En código; pendiente de validación end-to-end |
| **RN-28** | Precisión monetaria de dos decimales | Estrategia de centavos enteros con función `roundQ()` | En código; pendiente de validación end-to-end |
| **RN-29** | Auditoría de fecha y usuario en pagos/anulaciones | Registro de `usuarioId`, `atendidoPor`, `anuladoPor` y timestamps | En código; pendiente de validación end-to-end |
| **RN-30** | Validación de datos y códigos HTTP apropiados | 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict | En código; pendiente de validación end-to-end |

---

## 📮 Colección Postman

El archivo `SIGCA-Centro-Armonia.postman_collection.json` se encuentra en la raíz del repositorio. Incluye:
- Manejo dinámico de variables de entorno (`baseUrl`, `adminToken`, `recepToken`, `profToken`).
- Solicitudes organizadas por carpetas para todos los endpoints.
- Scripts de prueba automatizados en JavaScript que guardan tokens al iniciar sesión y validan los estados de respuesta HTTP.

---

## 🧪 Procedimiento de Evaluación Funcional (Sección 16)

Para demostrar el sistema frente al docente:
> **Pendiente de validación end-to-end:** la inspección de código no sustituye correr la secuencia con MongoDB.

1. **Iniciar sesión como Administrador**: usar las credenciales de demostración después de iniciar la aplicación integrada con MongoDB.
2. **Registrar un paciente**: Ir a *Pacientes* y crear un nuevo registro.
3. **Asociar un responsable**: Asignar un tutor legal o padre de familia.
4. **Crear un servicio con precio**: En *Servicios*, registrar una nueva especialidad (ej. Estimulación Sensorial, Q350).
5. **Programar una cita**: Agendar en una fecha futura.
6. **Intentar programar cita en horario ocupado**: Comprobar el bloqueo inmediato de traslape (RN-01).
7. **Confirmar la cita**: Cambiar estado de PENDIENTE a CONFIRMADA.
8. **Consultar en Calendario**: Visualizar la cita en la vista de cuadrícula mensual.
9. **Abrir caja con monto inicial**: En *Caja Diaria*, abrir turno con Q200.00.
10. **Registrar abono parcial**: Pagar Q150.00 de una cita de Q350.00.
11. **Consultar saldo pendiente**: Verificar que refleja automáticamente Q200.00 de saldo y estado PARCIAL.
12. **Registrar segundo pago**: Abonar los Q200.00 restantes.
13. **Verificar estado PAGADO**: Comprobar que el saldo es Q0.00 y el estado cambia a PAGADO.
14. **Consultar comprobante**: Generar e imprimir el comprobante con correlativo interno `REC-2026-XXXX`.
15. **Registrar pagos multimetodo**: Efectivo, Transferencia y Tarjeta.
16. **Consultar ingresos del día**: Ver el desglose discriminado en la vista de caja.
17. **Arqueo y efectivo contado**: Ingresar el monto físico contado en caja.
18. **Cerrar la caja**: Verificar el cálculo automático de sobrante o faltante.
19. **Verificar bloqueo en caja cerrada**: Intentar registrar un pago adicional y comprobar que es rechazado (RN-21).
20. **Cambiar de rol a Profesional**: Probar ingresar a *Usuarios* y verificar que el guard de interfaz bloquea el acceso por permisos insuficientes.
