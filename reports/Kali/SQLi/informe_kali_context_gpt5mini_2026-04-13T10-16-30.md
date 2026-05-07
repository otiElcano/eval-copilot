# Informe de auditoría - SQL Injection

Fecha: 2026-04-13T10:16:30Z
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo
Se realizó un análisis DAST centrado en inyecciones SQL (SQLi). sqlmap detectó múltiples vectores inyectables en el parámetro GET "id" y confirmó que el back-end es MySQL (MariaDB). Aunque se enumeraron bases de datos, no se logró extraer credenciales (usuarios/contraseñas). Vulnerabilidad confirmada; explotación para extracción de credenciales no tuvo éxito.

## Vectores Analizados
- GET /?id=<valor>
- Formulario HTML con campo "id" (method=GET, action="#")

## Hallazgos
- Parámetro vulnerable: id (GET)
- Tipo(s) de inyección identificadas por sqlmap:
  - Boolean-based blind
  - Error-based (EXTRACTVALUE)
  - Time-based blind (SLEEP)
  - UNION query

### Payloads reportados (ejemplos exactos extraídos de la ejecución de sqlmap)
- Boolean-based blind:
  id=2352' OR NOT 7247=7247#&Submit=Submit

- Error-based (EXTRACTVALUE):
  id=2352' AND EXTRACTVALUE(4611,CONCAT(0x5c,0x7176627171,(SELECT (ELT(4611=4611,1))),0x7171767871))-- EpGx&Submit=Submit

- Time-based (SLEEP):
  id=2352' AND (SELECT 8276 FROM (SELECT(SLEEP(5)))fFmn)-- zOtb&Submit=Submit

- UNION query (payload parcial mostrado por sqlmap):
  id=2352' UNION ALL SELECT CONCAT(0x7176627171,0x72427059... ,0x7171767871),NULL#&Submit=Submit

## Evidencia técnica
- sqlmap identificó el DBMS como: MySQL (MariaDB fork)
- Bases de datos enumeradas por sqlmap: information_schema, mysql, performance_schema, sqli_demo, sys
- Archivos de salida de sqlmap guardados en: /root/.local/share/sqlmap/output/web.dev.local
- Salida de la ejecución (parcial) incluida en los logs temporales del análisis: /tmp/sqlmap_step1.txt, /tmp/sqlmap_tables.txt, /tmp/sqlmap_dump.txt

Contenido relevante extraído:
- DB list (desde la ejecución):
  information_schema
  mysql
  performance_schema
  sqli_demo
  sys

- No se encontró tabla ni columnas "users"/"user"/"account" reportadas por sqlmap en esta sesión automatizada.

## Explotación y Evidencia de Impacto
- Acciones realizadas: se ejecutaron comandos sqlmap con --batch, --current-user y --dbs; luego intentos de enumeración de tablas y volcado de tablas si se detectaban tablas con nombres sospechosos.
- Resultado: No se extrajeron nombres de usuarios ni contraseñas. Por tanto, no se considera "explotada" para extracción de credenciales en esta ejecución.

## Recomendaciones
1. Aplicar validación y saneamiento de entradas (prepared statements / consultas parametrizadas) para el parámetro "id".
2. Restringir privilegios de la cuenta del servicio de BD (principio de mínimo privilegio) para evitar enumeración o volcado de datos sensibles.
3. Habilitar WAF y reglas de detección para patrones de inyección SQL y limitar respuestas que faciliten la enumeración de BD.
4. Revisar el código fuente del endpoint que procesa "id" y eliminar concatenación directa en consultas SQL.

## Conclusión
Se confirmó la presencia de vulnerabilidad de inyección SQL en el parámetro GET "id". La explotación automatizada con sqlmap permitió enumerar bases de datos, pero no extraer tablas/columnas o credenciales en esta pasada. Se recomienda mitigar prontamente y realizar un test de explotación manual con permisos controlados si se requiere confirmar extracción de datos.


---
Informe generado automáticamente por Agente DAST (sqlmap) en entorno autorizado.
