# Informe de análisis SQLi

Objetivo: http://web.dev.local:8083
Fecha: 2026-04-24T08:47:19
Herramientas: sqlmap (v1.9.10 via MCP), curl

Resumen
-------
Se detectó una vulnerabilidad de inyección SQL en el parámetro GET "id" de la página principal. Además se aprovechó para enumerar las bases de datos disponibles (explotación automatizada con sqlmap).

Detalles
--------
- Parámetro vulnerable: id (GET)
- Tipo(s) de inyección detectados: boolean-based blind, error-based, time-based blind, UNION query
- Back-end DBMS: MySQL (MariaDB fork)
- Evidencia de bases de datos obtenidas:
  - information_schema
  - mysql
  - performance_schema
  - sqli_demo
  - sys

Evidencia (extracto de sqlmap):

Parameter: id (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause (subquery - comment)
    Payload: id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)
    Payload: id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit

Observaciones y pasos realizados
--------------------------------
1. Inspección manual de la página principal mostró un formulario GET con campo name="id".
2. Ejecutado sqlmap contra http://web.dev.local:8083/?id=1 con opciones --batch --risk=3 --level=5 --random-agent --dbs.
3. sqlmap identificó múltiples vectores de inyección y recuperó los nombres de bases de datos listadas arriba.
4. Salida guardada por sqlmap en: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local

Impacto
-------
Un atacante podría extraer datos sensibles de las bases de datos, modificar o eliminar información, o escalar el ataque para ejecutar comandos si la configuración del servidor lo permite. Presencia de la base de datos "sqli_demo" sugiere entorno de prueba o demostración, pero la vulnerabilidad aplica igualmente en entornos reales.

Recomendaciones
---------------
- Usar consultas parametrizadas (prepared statements) en todas las interacciones SQL.
- Validar/sanitizar estrictamente entradas (aunque la mitigación principal es parametrización).
- Aplicar el principio de privilegio mínimo a la cuenta DB usada por la aplicación.
- Revisar logs y rotar credenciales si se sospecha explotación.
- Actualizar dependencias y revisar parches de seguridad.

Conclusión
----------
Vulnerabilidad SQLi confirmada y explotada parcialmente (enumeración de bases de datos). Se recomienda corregir con prioridad alta y repetir pruebas tras mitigación.


