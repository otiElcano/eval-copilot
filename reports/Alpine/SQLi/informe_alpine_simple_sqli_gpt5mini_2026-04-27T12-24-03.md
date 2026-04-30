# Informe de SQL Injection - web.dev.local:8083

Fecha: 2026-04-27T12:24:03

Resumen:
Se realizó un análisis automatizado con sqlmap contra http://web.dev.local:8083. Se detectó una vulnerabilidad SQL Injection en el parámetro GET `id` del formulario mostrado en la página.

Detalles técnicos:
- Parámetro vulnerable: id (GET)
- Tipo(s) de inyección detectadas:
  - boolean-based blind
  - error-based
  - time-based blind
  - UNION-based (2 columnas)
- DBMS detectado: MySQL (MariaDB fork)
- Tecnología servidor: Apache 2.4.65, PHP 8.1.33, Linux Debian

Bases de datos encontradas:
- information_schema
- mysql
- performance_schema
- sqli_demo
- sys

Tabla(s) de interés en sqli_demo:
- users (columnas: email, first_name, last_name, password, user_id, username)

Datos extraídos (sqli_demo.users):
user_id,email,password,username,last_name,first_name
1,admin@example.com,password123,admin,Doe,John
2,jane@example.com,secret456,jsmith,Smith,Jane
3,bob@example.com,mypass789,bjohnson,Johnson,Bob
4,alice@example.com,qwerty123,awilliams,Williams,Alice
5,charlie@example.com,password,cbrown,Brown,Charlie
6,diana@example.com,secure123,ddavis,Davis,Diana
7,eve@example.com,hackme,emiller,Miller,Eve
8,frank@example.com,admin123,fwilson,Wilson,Frank

Evidencia:
- sqlmap report saved in /home/kali_rdp/.local/share/sqlmap/output/results-04272026_1224pm.csv
- Dumped table CSV: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv

Recomendaciones:
1. Usar consultas parametrizadas (prepared statements) en todas las interacciones con la base de datos.
2. Validar y sanear entradas del usuario en el servidor (restringir tipos y longitudes esperadas).
3. Implementar control de acceso y rotación de credenciales; actualizar contraseñas débiles identificadas.
4. Revisar y endurecer la configuración de la base de datos y del servidor web.

Conclusión:
La aplicación es vulnerable a SQL Injection explotable mediante el parámetro `id`. Se ha extraído la tabla `users` de la base de datos `sqli_demo` como prueba de concepto.

---
Informe generado por: script automatizado (sqlmap) y procesado por asistente.
