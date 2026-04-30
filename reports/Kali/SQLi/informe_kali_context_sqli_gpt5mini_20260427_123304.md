# Informe DAST - SQLi

Fecha: 2026-04-27 12:33:04 UTC
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo
Se analizó la aplicación en busca de inyecciones SQL (SQLi) usando reconocimiento activo y sqlmap. No se identificaron parámetros inyectables con la configuración y pruebas realizadas; por tanto no se realizó explotación de extracción de datos.

## Vectores Analizados
- GET parameter: id (formulario en la página principal, <form action="#" method="GET"> con input name="id").

## Herramientas y comandos
- Recon: curl (homepage guardada en /tmp/sqli_scan/homepage.html)
- Escaneo con sqlmap (stdout/stderr guardado en /tmp/sqli_scan/sqlmap_initial.txt)
- Comando exacto usado para detección:

```
sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=2 --risk=1 -o --threads=2
```

## Hallazgos
- sqlmap reportó que el parámetro GET 'id' no parece ser dinámico y no se identificó inyección en las pruebas realizadas.
  Fragmentos relevantes de la salida de sqlmap:

```
[12:27:59] [WARNING] GET parameter 'id' does not appear to be dynamic
[12:28:00] [WARNING] GET parameter 'id' does not seem to be injectable
[12:28:00] [CRITICAL] all tested parameters do not appear to be injectable.
```

## Evidencia
- Página analizada: /tmp/sqli_scan/homepage.html
- Salida de sqlmap (detección): /tmp/sqli_scan/sqlmap_initial.txt
No se extrajeron bases de datos, usuarios ni contraseñas porque no se confirmó inyección.

## Conclusión
Con las pruebas automatizadas realizadas (sqlmap --batch, level=2, risk=1) no se encontró vulnerabilidad SQLi explotable en el parámetro analizado. Recomendación: si se desea mayor cobertura, repetir con valores mayores de --level/--risk, técnicas tamper o análisis manual de la lógica del servidor.

--
Informe generado automáticamente por agente DAST.
