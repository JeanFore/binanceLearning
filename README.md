# Binance Learning Arbitrage

Aplicacion Next.js para organizar aprendizaje de arbitraje en Binance en modo educativo. Incluye dashboard, Postgres local, Prisma Client, rutas API para un agente y una coleccion Postman.

## Ejecutar

Requiere Docker Desktop corriendo para usar el Postgres local definido en `docker-compose.yml`.

```bash
npm install
npm run docker:up
npm run setup
npm run dev
```

La app queda en `http://localhost:3000`.

Variables disponibles en `.env`:

```bash
DATABASE_URL="postgresql://binance:binance@localhost:5433/binance_learning?schema=public"
AGENT_API_KEY="dev-agent-key"
```

Si usas un Postgres externo, reemplaza `DATABASE_URL` y ejecuta `npm run setup`.

## Scripts

- `npm run dev`: servidor Next.
- `npm run build`: build de produccion.
- `npm run db:generate`: genera Prisma Client.
- `npm run docker:up`: levanta Postgres local en Docker.
- `npm run docker:down`: apaga Postgres local.
- `npm run db:push`: crea/actualiza tablas en Postgres con Prisma.
- `npm run db:seed`: carga curso, clases, aprendiz inicial y nota de seguridad.
- `npm run setup`: ejecuta `db:push` y `db:seed`.
- `npm run db:studio`: abre Prisma Studio.

## API para el agente

Todas las rutas de agente usan `x-agent-api-key: dev-agent-key` o `Authorization: Bearer dev-agent-key`.

- `GET /api/health`: estado de DB.
- `GET /api/catalog`: curso, modulos y clases.
- `GET /api/learners`: aprendices.
- `POST /api/learners`: crea aprendiz.
- `GET /api/agent/context`: contexto completo para decidir la siguiente clase.
- `GET /api/agent/progress`: progreso del aprendiz.
- `POST /api/agent/progress`: crea o actualiza avance de clase.
- `GET /api/agent/content`: borradores de contenido creados por el agente.
- `POST /api/agent/content`: crea contenido complementario.
- `PATCH /api/agent/content/:id`: edita estado, titulo o cuerpo de un borrador.
- `GET /api/agent/notes`: notas del agente.
- `POST /api/agent/notes`: guarda notas de avance, dudas o reglas.

## Postman

Importa `postman/binance-learning-agent.postman_collection.json`.

Variables de la coleccion:

- `baseUrl`: `http://localhost:3000`
- `agentApiKey`: `dev-agent-key`
- `learnerId`: se autocompleta al consultar aprendices o contexto.
- `courseSlug`: se autocompleta desde catalogo.
- `lessonId`: `binance-arbitraje-fundamentos-1-lesson-1`
- `contentDraftId`: se autocompleta al crear contenido complementario.

Flujo recomendado para el agente:

1. Ejecutar `00 - Estado / Health de API y base de datos`.
2. Ejecutar `01 - Consultas source del agente / Catalogo completo`.
3. Ejecutar `01 - Consultas source del agente / Aprendices disponibles`.
4. Usar `Contexto completo para decidir siguiente accion` como consulta principal.
5. Leer `Progreso`, `Notas` y `Contenido generado` segun necesite contexto adicional.

La carpeta `02 - Escrituras opcionales del agente` permite registrar avance, notas o material complementario cuando el agente necesite persistir cambios.

La app no ejecuta ordenes ni se conecta a trading real. El contenido esta limitado a aprendizaje, simulacion, bitacora y evaluacion de riesgo.
