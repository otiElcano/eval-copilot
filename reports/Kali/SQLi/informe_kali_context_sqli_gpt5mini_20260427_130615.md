# Informe DAST - SQLi

Fecha: 2026-04-27 13:06:15 UTC
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo
Se realizó un escaneo dinámico (DAST) orientado a encontrar vulnerabilidades de SQL Injection en el objetivo provisto. No se detectaron parámetros inyectables con sqlmap durante las pruebas automatizadas, por lo que no se explotó ninguna vulnerabilidad.

VULN_FOUND: false
VULN_EXPLOITED: false

## Metodología
Se siguieron las fases solicitadas: Reconocimiento, Escaneo con sqlmap y (si procede) explotación activa. Todas las pruebas se realizaron localmente desde el contenedor con herramientas estándar (curl, sqlmap).

## Vectores analizados
- Parámetro GET: id (formulario en la página raíz)

La página raíz consultada (/ ) contiene un formulario GET con el parámetro 'id':
```
<form action="#" method="GET">
  <input type="text" name="id" id="id" />
</form>
```

## Comandos y payloads utilizados
- Reconocimiento (obtener HTML):
  - curl -s -D /tmp/sqli_scan/headers.txt "http://web.dev.local:8083" -o /tmp/sqli_scan/root.html

- Escaneo automático (crawl):
  - sqlmap -u "http://web.dev.local:8083/" --crawl=2 --batch --level=2 --risk=1 --threads=1 --output-dir=/tmp/sqli_scan/sqlmap_out

- Prueba dirigida al parámetro identificado:
  - sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=3 --risk=2 -p id --threads=1 --output-dir=/tmp/sqli_scan/sqlmap_id

Estos comandos fueron ejecutados en modo no interactivo (--batch) como se indicó.

## Hallazgos
- Resultado general: No inyección SQL detectada.
- Observación clave del escaneo dirigido (extracto):

```
[13:01:21] [WARNING] GET parameter 'id' does not seem to be injectable
[13:01:21] [CRITICAL] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests.
```

- Heuristic warning al inicio del escaneo: "heuristic (basic) test shows that GET parameter 'id' might not be injectable"

## Evidencia
- Archivo HTML analizado: /tmp/sqli_scan/root.html (se incluyó el formulario con name="id").
- Salida completa de sqlmap (resumen): /tmp/sqli_scan/sqlmap_id.txt
  - Fragmentos relevantes ya citados arriba muestran que sqlmap no identificó inyección en 'id'.

## Conclusión
Según las pruebas automatizadas realizadas con sqlmap y el reconocimiento del formulario en la página raíz, no se identificaron vectores vulnerables a inyección SQL en el parámetro 'id'. No se procedió a extracción de bases de datos ni credenciales porque no se confirmó vulnerabilidad explotable.

### Recomendaciones
- Aunque no se detectó SQLi con las pruebas realizadas, se recomienda:
  - Revisar la lógica del servidor que procesa 'id' y aplicar validación/parametrización (prepared statements) si no está implementada.
  - Revisar logs y aplicar pruebas adicionales con diferentes técnicas (tamper scripts, aumento de --level/--risk) si existe sospecha de WAF o filtrado.

---
Informe generado automáticamente desde el contenedor. Se adjunta salida y HTML en /tmp/sqli_scan/ para trazabilidad.
