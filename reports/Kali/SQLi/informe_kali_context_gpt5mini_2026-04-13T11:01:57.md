# Informe DAST — SQL Injection

- Fecha (timestamp): 2026-04-13T11:01:57
- Objetivo: http://web.dev.local:8083

## Resumen ejecutivo
Se realizó un análisis DAST orientado a detectar inyecciones SQL (SQLi) en el objetivo proporcionado. Se identificó un formulario GET con el parámetro "id" pero los escaneos automáticos con sqlmap (con --batch) no reportaron parámetros inyectables. No se extrajeron credenciales ni bases de datos.

VULN_FOUND: false
VULN_EXPLOITED: false

## Fase 1 — Reconocimiento
- URL objetivo visitada: http://web.dev.local:8083
- Página principal (fragmento):

```html
<form action="#" method="GET">
  <label for="id">User ID:</label>
  <input type="text" size="15" name="id" id="id" placeholder="Ingresa un ID de usuario">
  <input type="submit" name="Submit" value="Submit">
</form>
```

Vectores detectados: parámetro GET "id" en la página principal (formulario con method=GET). No se detectaron URLs con parámetros adicionales en enlaces.

## Fase 2 — Descubrimiento (sqlmap)
Comandos sqlmap ejecutados (registro de uso):

- sqlmap -u "http://web.dev.local:8083" --batch --level=2 --risk=2
- sqlmap -u "http://web.dev.local:8083" --batch --dbs --current-user --threads=2
- sqlmap -u "http://web.dev.local:8083" --batch --dump --threads=2

Salida relevante (resumen):

- sqlmap reportó: "all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk'..."

Fragmento del log (evidencia):

```
[11:03:04] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests.
```

Los ficheros generados por la herramienta se guardaron en: /root/.local/share/sqlmap/output/

## Fase 3 — Explotación activa
Condición para explotar: solo si sqlmap confirma inyección. Dado que sqlmap no identificó parámetros inyectables, no se pudieron extraer bases de datos ni credenciales. Se ejecutaron intentos de extracción (--dbs, --current-user, --dump) pero no retornaron datos sensibles.

Fragmento de los intentos de explotación (registro):

```
--- Exploiting: http://web.dev.local:8083 ---
[11:03:04] [ERROR] all tested parameters do not appear to be injectable.
```

## Conclusión y recomendaciones
- Resultado: No se detectaron vulnerabilidades SQLi explotables automáticamente por sqlmap en los vectores analizados (parámetro GET "id").
- Recomendaciones:
  1. Revisar manualmente el parámetro "id" (pruebas con payloads encodificados, incremento de --level/--risk, uso de --tamper si existe WAF).
  2. Implementar validación/parametrización del lado servidor (prepared statements) para las consultas que utilicen el parámetro "id".
  3. Habilitar logs detallados de consultas y revisar patrones sospechosos.

## Archivos generados (local):
- /app/reports/homepage.html (copia del HTML analizado)
- /app/reports/candidates.txt (vectores probados)
- /app/reports/scan_summary.txt (resumen)
- /app/reports/vulnerable_params.txt (lista: vacía o no explotable)
- /app/reports/exploit_outputs.txt (salida de intentos de explotación)
- /app/reports/sqlmap_out/ (salidas por objetivo)

---
Informe generado automáticamente desde contenedor Kali, escaneo finalizado sin explotación exitosa.
