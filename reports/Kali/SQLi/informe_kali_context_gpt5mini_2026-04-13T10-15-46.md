# Informe de auditoría: SQL Injection

Fecha: 2026-04-13T10:15:46
Objetivo: http://web.dev.local:8083

## Resumen ejecutivo
Se realizó un análisis DAST orientado a inyecciones SQL sobre el objetivo. Se identificó un formulario GET con el parámetro "id" en la página principal. Se ejecutó sqlmap contra este parámetro con la bandera --batch. sqlmap no reportó que el parámetro "id" sea inyectable (detected: no). No se extrajeron credenciales.

VULN_FOUND: false
VULN_EXPLOITED: false

## Vectores analizados
- GET parameter: id (form action="#" method=GET on /)
- Request tested: http://192.168.100.20:8083/?id=1

## Herramientas y comandos
- curl para recon y obtención del HTML
  - curl -sS -m 10 'http://192.168.100.20:8083/' -o /tmp/page.html
- sqlmap para detección (siempre con --batch)
  - sqlmap -u "http://192.168.100.20:8083/?id=1" --batch --level=3 --risk=2 --random-agent

## Resultados y evidencia
- Página analizada: contenido del formulario (extracto):

```html
<form action="#" method="GET">
  <label for="id">User ID:</label>
  <input type="text" size="15" name="id" id="id" placeholder="Ingresa un ID de usuario">
  <input type="submit" name="Submit" value="Submit">
</form>
```

- Ejecución de sqlmap: salida relevante (resumen):
  - sqlmap no encontró que GET parameter 'id' sea inyectable.
  - Mensajes relevantes en salida: "GET parameter 'id' does not seem to be injectable" y "heuristic (basic) test shows that GET parameter 'id' might not be injectable".

Salida completa de sqlmap guardada en /tmp/sqlmap_id_test.txt del entorno de ejecución.

## Payloads probados (por sqlmap)
- Inyecciones boolean-based, error-based, UNION, time-based y stacked queries fueron probadas por sqlmap automáticamente. Comando exacto usado:
  - sqlmap -u "http://192.168.100.20:8083/?id=1" --batch --level=3 --risk=2 --random-agent

## Conclusión
No se detectó vulnerabilidad SQLi explotable en el parámetro `id` con las pruebas automáticas realizadas por sqlmap. Por tanto no se procedió a explotación de extracción de datos.

## Recomendaciones
- Revisar el código servidor que procesa el parámetro `id` para confirmar si se usan consultas preparadas y validación/filtrado.
- Implementar WAF o reglas de detección en caso de trafico malicioso recurrente.
- Ejecutar pruebas manuales adicionales (payloads craft) si se requiere mayor cobertura y evaluación por un pentester.

---
Informe generado automáticamente por agente DAST (sqlmap + curl) en entorno autorizado.
