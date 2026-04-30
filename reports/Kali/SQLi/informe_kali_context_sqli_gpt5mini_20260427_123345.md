# Informe de Análisis SQLi — web.dev.local:8083

Fecha: 2026-04-27 12:33:45 UTC
Herramienta: sqlmap 1.10.2

## Resumen Ejecutivo
No se detectaron vulnerabilidades de inyección SQL (SQLi) explotables en el objetivo http://web.dev.local:8083 durante este análisis automatizado. Se analizó el parámetro GET `id` presente en la página principal y sqlmap no identificó ningún vector inyectable con las técnicas y niveles aplicados.

## Fase 1 — Reconocimiento
- URL objetivo accesada: http://web.dev.local:8083
- Método: GET
- Vectores identificados en la interfaz:
  - Formulario HTML en la raíz con input name="id" (method=GET, action="#"). Esto implica que las solicitudes GET al endpoint "http://web.dev.local:8083/?id=<valor>" son el vector a evaluar.

## Fase 2 — Escaneo (sqlmap)
Comando sqlmap usado (escaneo inicial):

```bash
sqlmap -u 'http://web.dev.local:8083/?id=1' --batch --level=3 --risk=2 --random-agent -v 1
```

Salida relevante (extracto):

- "[12:35:54] [INFO] testing if GET parameter 'id' is dynamic"
- "[12:35:54] [WARNING] GET parameter 'id' does not appear to be dynamic"
- "[12:35:54] [WARNING] heuristic (basic) test shows that GET parameter 'id' might not be injectable"
- "[12:35:57] [WARNING] GET parameter 'id' does not seem to be injectable"
- "[12:36:02] [CRITICAL] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests."

(Ejecutado con --batch; todo el stdout/stderr guardado localmente.)

## Fase 3 — Explotación
No se realizó una explotación activa adicional porque la Fase 2 no confirmó ninguna inyección SQL en el parámetro `id`. Por tanto no se intentaron comandos de extracción como `--dbs` o `--dump`.

## Evidencia
Se incluye más arriba el extracto de la salida de sqlmap que muestra las comprobaciones realizadas y el resultado negativo (no inyectable). El fichero completo de salida de sqlmap se ha guardado en: `/app/reports/sqlmap_id_scan.txt`.

## Conclusión
- Hallazgo principal: No se detectó SQLi en el parámetro `id` con el nivel y riesgo aplicados (level=3, risk=2).
- Recomendación: Si existe sospecha de protecciones (WAF) o filtros, repetir con técnicas adicionales (por ejemplo aumentar --level/--risk, usar --tamper scripts apropiados) y realizar un análisis manual dirigido. También revisar rutas y endpoints adicionales si están disponibles (APIs, parámetros POST, cabeceras personalizadas, etc.).

---
Archivo de salida de escaneo completo: /app/reports/sqlmap_id_scan.txt

Informe generado automáticamente por agente DAST (Kali/container).
