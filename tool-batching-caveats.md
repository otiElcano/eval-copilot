# Casuística: batch de tools MCP, eventos del SDK y consecuencias

Este documento explica por qué en algunos `iterations` de `eval-copilot` varias invocaciones de tools aparecen con el mismo `durationMs` y/o con el mismo `output`/error, aunque en el servidor MCP sólo una herramienta haya fallado (por ejemplo, `nikto`). Está escrito en español y contiene causas, diagnóstico y mitigaciones prácticas.

## Resumen rápido

- El LLM puede emitir varias llamadas a `tools` en paralelo dentro de un mismo turno (un "batch" de tool calls).
- El SDK/bridge que medía `tool.execution_start` y `tool.execution_complete` puede entregar eventos `execution_complete` de ese batch todos juntos (o propagar un error del batch entero), lo que causa que:
  - Todas las herramientas parezcan haber durado lo mismo (tiempo hasta la llegada del evento `complete`, normalmente dominado por la más lenta del lote).
  - Un error de una herramienta (ej. timeout en `nikto`) pueda marcar todos los resultados del batch como error en el cliente/SDK, incluso si otras tools terminaron correctamente en el servidor MCP.

## ¿Qué sucede técnicamente? (paso a paso)

1. El asistente (modelo) lanza N llamadas a tools en paralelo en un único turno.
2. `SessionEventCollector` (en `src/SessionEventCollector.ts`) registra un `tool.execution_start` por cada `toolCallId` con su `Date.now()` local.
3. El servidor MCP ejecuta las tools — éstas pueden ejecutarse secuencialmente en el servidor (o en contenedores/colas) y completar en distintos tiempos.
4. El SDK/bridge (cliente que comunica con el MCP) puede:
   - Entregar los eventos `tool.execution_complete` de forma agrupada cuando tiene todos los resultados listos, o
   - En caso de fallo a nivel MCP para una llamada del batch, emitir un error de protocolo que el cliente interpreta como fallo del batch entero.
5. `SessionEventCollector` calcula `durationMs = Date.now() - startTime` al recibir `tool.execution_complete`. Si los `complete` llegan juntos o se descarta el resultado por un error del batch, varias entradas reciben el mismo `durationMs` y/o el mismo `result` (por ejemplo el error MCP `-32001: Request timed out`).

> Nota: el código de `SessionEventCollector` hace lo correcto asociando por `toolCallId`, pero depende de la granularidad y la semántica de los eventos que envia el SDK.

## Evidencias observadas

- En tu log MCP, `dirb` y `gobuster` completaron a ~13:00:03, `nikto` hizo timeout a 13:03:03, y `nmap` completó a 13:03:10.
- En el reporte (`eval_report_...html`) las 4 herramientas aparecen con `durationMs` ≈ 180s y con el mismo error de MCP para la iteración problemática.

Esto indica que el SDK/bridge devolvió los `complete` juntos o propagó el error de `nikto` a todo el batch.

## Consecuencias

- Métricas de latencia en UI: infladas o idénticas entre tools del mismo batch.
- Resultados de tools: pérdidas o sobrescritura de outputs correctos cuando un fallo de protocolo contamina el batch.
- Dificultad para depurar a partir del cliente: hay que consultar los logs del servidor MCP para el timing y la salida real de cada tool.

## Mitigaciones y recomendaciones

1. Corto plazo (workarounds en `eval-copilot` sin tocar el SDK):
   - Evitar lanzar herramientas MCP largas en paralelo con herramientas rápidas dentro del mismo turno. Serializar llamadas desde el prompt/runner cuando sea posible.
   - Añadir indicación en la UI/reportes que marque cuándo los resultados provienen de un batch SDK ("SDK-batched results — timings reflect arrival, not per-tool runtime").
   - Si el SDK reporta `(pending)` o un error de batch, extraer y mostrar los logs del servidor MCP (si están disponibles) junto al resultado.

2. Medio plazo (cambios en `eval-copilot`):
   - Detectar errores MCP que son de protocolo y, cuando ocurran, intentar reintentar solo la tool errante en lugar de tratar todos como fallos.
   - Registrar el `toolCallId` y, si el servidor MCP devuelve algún campo con timestamps/metadata por tool, usar esos timestamps en vez de `Date.now()` para `durationMs`.
   - En `SessionEventCollector`, manejar explícitamente `toolCallId` faltantes (evitar colapsarlos a `""`) y añadir trazas `traceEvents` para facilitar diagnóstico.

3. Largo plazo (ideal):
   - Solicitar al proveedor del SDK/bridge que haga que los errores de una tool no contaminen el batch entero: el SDK debería retornar resultados parciales por `toolCallId` y reportar errores por herramienta.
   - Mejorar el protocolo para incluir timestamps de inicio/fin por herramienta y resultados individuales atómicos.

## Recomendación práctica inmediata para tu entorno

- Para reproducir y depurar, compare los outputs en:
  - Logs del servidor MCP (ej.: `which nikto` / ejecuciones y timeouts) — estos contienen los tiempos y salidas reales.
  - El HTML generado por `eval-copilot` — que refleja lo que recibió el SDK.
- Si necesitas reports fiables de latencia/outputs, añade una opción en `runner` para forzar ejecución secuencial de tools (opcional por tipo de tool), p. ej. `--serial-tools`.

## Fragmentos de código sugeridos (idea rápida)

- Evitar colapsar `toolCallId` vacío en `SessionEventCollector`:

```ts
const toolCallId = e?.data?.toolCallId ?? undefined;
if (!toolCallId) {
  // log trace, asignar id temporal único o ignorar — no usar "" como clave compartida
}
```

- Marcar en la UI cuando los `complete` llegan agrupados:

```ts
if (allCompletesArrivedAtSameTimestamp()) {
  showBanner('Resultados entregados en batch por el SDK — duraciones pueden ser el tiempo hasta el último resultado');
}
```

## Conclusión

Lo que ves en el reporte (4 tools con mismo `durationMs` y el mismo error) es consistente con un SDK/bridge que agrupa/propaga resultados/errores de un batch de tool calls. No es un bug del `SessionEventCollector` per se; es una limitación en la visibilidad/semántica que provee el SDK frente al MCP. Para evitarlo en el corto plazo, serializa invocaciones críticas o añade lógica de reintento/aislamiento por tool.

---

Documento generado automáticamente por asistencia. Si quieres, implemento:

- un `--serial-tools` en `src/index.ts`/`runner.ts` que fuerce llamadas secuenciales, o
- un parche en `SessionEventCollector` para añadir trazas y manejar toolCallId vacíos.

Indica cuál prefieres y lo implemento.
