# Informe de Auditoría DAST - SQL Injection

Fecha: 2026-04-13T11:00:58
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo
Se realizó un análisis automatizado en busca de inyecciones SQL contra la aplicación. Se encontró una inyección SQL en el parámetro GET "id" de la página principal. Se pudo enumerar el gestor de bases de datos (MySQL/MariaDB), obtener el usuario actual y listar la base de datos objetivo. También se intentó volcar la tabla 'users' del esquema 'sqli_demo' pero los registros aparecieron vacíos en la salida de sqlmap (valores reflejados como <blank>), aunque el volcado se generó en los archivos de sqlmap.

## Fase 1 - Reconocimiento
- Página objetivo fue recuperada correctamente con curl.
- Página contiene un formulario GET con un campo name="id".
- Vector identificado: GET parameter 'id' (ejemplo: /?id=1)

## Fase 2 - Descubrimiento
- Se ejecutó sqlmap con --batch sobre http://web.dev.local:8083/?id=1
- sqlmap detectó varias técnicas válidas de inyección:
  - Boolean-based blind
  - Error-based (EXTRACTVALUE)
  - Time-based blind (SLEEP)
  - UNION query (2 columns)
- Payload de prueba detectado (ejemplo boolean-based): id=2352' OR NOT 7247=7247#&Submit=Submit
- Resultado: back-end DBMS: MySQL (MariaDB fork)

## Fase 3 - Explotación
- Se ejecutó sqlmap para obtener nombre de usuarios y bases de datos:
  - Comando utilizado (ejemplo):
    sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --dbs --current-user --current-db
- Resultado extraído:
  - current user: 'root@%'
  - current database: 'sqli_demo'
  - bases de datos encontradas: information_schema, mysql, performance_schema, sqli_demo, sys
- Se listaron tablas en sqli_demo y se encontró la tabla 'users'.
- Intento de volcado de columnas id,username,password arrojó 8 filas pero todos los campos resultaron como <blank> en la salida de sqlmap. El volcado fue guardado como CSV por sqlmap en su directorio de salida.

## Evidencia (extractos relevantes de sqlmap)
- Detección de inyección (fragmento):
  Parameter: id (GET)
    Type: boolean-based blind
    Payload: id=2352' OR NOT 7247=7247#&Submit=Submit

- Bases de datos enumeradas:
  information_schema, mysql, performance_schema, sqli_demo, sys

- Usuario actual:
  root@%

- Tabla encontrada: sqli_demo.users (8 entries, but blank values in dumped output)

## Fichero(s) generados por sqlmap
- /root/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv
- Varios archivos de log bajo /root/.local/share/sqlmap/output/web.dev.local

## Conclusión
- VULN: Existe vulnerabilidad de SQL Injection en el parámetro GET 'id'.
- IMPACTO: Alta — permite enumerar bases de datos y obtener información sensible (usuario BD). El volcado de datos de la tabla 'users' produjo resultados en blanco; se recomienda inspeccionar el CSV generado por sqlmap para confirmar si los datos legítimos existen o si la tabla realmente contiene campos vacíos.

## Recomendaciones
1. Validar y sanitizar parámetros de entrada (usar prepared statements / parameterized queries).
2. Aplicar mínimos privilegios a la cuenta usada por la aplicación (no usar root@%).
3. Deshabilitar mensajes de error detallados y evitar reflejar consultas SQL/errores al usuario.
4. Revisar y asegurar la tabla 'users' y rotación de contraseñas si se encuentran credenciales en el CSV.

#adicional
Los archivos con salida completa de sqlmap se encuentran en /root/.local/share/sqlmap/output/web.dev.local
