# SIGCA — Centro Armonía

Sistema Integral de Gestión de Citas y Atención para un centro de psicología infantil, neurodesarrollo y estimulación auditivo-verbal. Proyecto Final Integrador — Vue.js, Node.js, Express y MongoDB.

> **Estado:** repositorio de entrega en construcción por hitos. El código se incorpora por módulos en commits de cada integrante; `main` solo recibe trabajo revisado.

## Equipo

| Integrante | GitHub | Rol principal |
|---|---|---|
| CRUZ FRANCISCO ESTRADA GREGORIO | [@CFestradaG](https://github.com/CFestradaG) | Seguridad, control financiero, QA y despliegue |
| MELVIN ESTEBAN RAMOS ALVAREZ | [@mramosa11](https://github.com/mramosa11) | Frontend, integración y experiencia de usuario |
| NERY GEOVANY OSORIO TECÚ | [@nosoriot123](https://github.com/nosoriot123) | Backend, API REST y base de datos |

## Stack

- **Frontend:** Vue 3, Pinia, Vue Router, Tailwind CSS, Vite.
- **Backend:** Node.js, Express 5, TypeScript.
- **Base de datos:** MongoDB + Mongoose.
- **Seguridad:** JWT, bcrypt, autorización por roles.
- **Entrega:** Docker/Compose, Postman, seed de datos ficticios.

## Estado de la entrega

| Hito | Fecha | Alcance |
|---|---|---|
| Avance 1 | 21/10/2026 | Repositorio, README, configuración, autenticación/usuarios, portal inicial |
| Avance 2 | 26/10/2026 | Pacientes, responsables, citas, calendario, materiales y reglas RN |
| Entrega final | 30/10/2026 | Pagos, caja, seguridad, pruebas, contenido, evidencias y release |

El detalle de tareas está en los [issues del repositorio](https://github.com/CFestradaG/sigca_gt/issues) y en los milestones.

## Ramas

| Rama | Uso |
|---|---|
| `main` | Entrega estable; recibe merges revisados |
| `feature` | Integración de código por módulos |
| `docs` | Diseños de Google Stitch, mapas, capturas y evidencias |

Flujo: issue → rama → commits propios → PR → revisión → merge. Cada integrante commitea desde su cuenta; no se aceptan commits vacíos ni hechos por otra persona.

## Estructura prevista

```text
src/                  Frontend Vue 3
server/               API Express, rutas, modelos y repositorio
scripts/              Seed y pruebas
docs/07-diseno/       Diseños y referencias visuales
Dockerfile            Imagen de producción
compose.yaml          MongoDB + aplicación
```

## Ejecución

Los comandos se completan cuando se incorpore la configuración base ([issue #3](https://github.com/CFestradaG/sigca_gt/issues/3)):

```bash
npm install
cp .env.example .env
npm run dev        # API + Vite en http://localhost:3000
npm run build
npm test
npm run seed
```

Variables mínimas: `MONGODB_URI` y `JWT_SECRET` (32+ caracteres). No se versiona `.env`.

## Evidencias

- Diseños y prototipos en la rama `docs`.
- Issues y PRs por hito, con criterios de aceptación.
- Capturas del portal, administración, calendario, pagos y caja.
- Resultados de `npm test`, Postman y build de producción.
- Tag `v1.0.0` y ZIP de Canvas al cierre.

## Notas

Proyecto académico con datos ficticios. No usar datos reales de pacientes ni credenciales reales. El README se actualiza al cierre de cada hito.
