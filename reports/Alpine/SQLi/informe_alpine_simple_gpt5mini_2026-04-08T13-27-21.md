# Informe de auditoría — SQL Injection

Objetivo: http://web.dev.local:8083
Fecha: 2026-04-08T13:27:21Z

Resumen ejecutivo
-----------------
- Vulnerabilidad encontrada: Sí (SQL Injection en parámetro GET `id` del formulario de búsqueda).
- Vulnerabilidad explotada: Sí (explotación automatizada con sqlmap para enumerar bases de datos, tablas y volcar la tabla `users`).

Hallazgos técnicos
------------------
1) Página objetivo
- Página con formulario GET: campo `id` (name="id").

2) Detección
- Herramienta: sqlmap (v1.9.10#stable, instalada en el entorno de pruebas).
- sqlmap identificó múltiples vectores de inyección en `id`:
  - boolean-based blind
  - error-based
  - time-based (SLEEP)
  - UNION-based (2 columnas)
- DBMS identificado: MySQL (MariaDB fork).

3) Explotación y resultados
- Bases de datos enumeradas: information_schema, mysql, performance_schema, sqli_demo, sys
- Base de datos vulnerable de interés: sqli_demo
- Tablas en sqli_demo: `users`
- Volcado de `sqli_demo.users`: 8 filas extraídas (columnas: user_id, email, password, username, last_name, first_name)
  Ejemplos de filas extraídas:
  - admin@example.com : password123 (usuario admin)
  - jane@example.com : secret456
  - etc. (ver CSV de sqlmap para completo)
- Los datos se exportaron a: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv (ruta en el entorno donde corrió sqlmap).

Impacto
-------
- Exposición de credenciales y correos electrónicos de usuarios. Si las contraseñas están en texto plano (como muestra el volcado), impacto crítico: acceso directo a cuentas y posible pivoteo lateral.
- Divulgación de esquema y metadatos de la base de datos.

Pruebas realizadas
------------------
- Fetch del HTML para identificar el formulario GET `id`.
- Ejecución de sqlmap con opciones: --forms --batch --level=3 --risk=2
- Confirmación de inyección y volcado de la tabla `users`.

Recomendaciones
---------------
1) Corrección inmediata
- Usar consultas parametrizadas / prepared statements para todas las consultas que usan input del usuario.
- Validación y saneamiento estricto (whitelist) del parámetro `id` (p. ej., aceptar solo enteros si corresponde).
- Evitar mostrar errores de la base de datos en la respuesta al usuario.

2) Mitigaciones adicionales
- Implementar WAF con reglas para SQLi como medida temporal.
- Forzar almacenamiento de contraseñas con hashing fuerte (bcrypt/Argon2) y salado; nunca almacenar contraseñas en texto plano.
- Revisar el resto de endpoints para patrones similares.

3) Seguimiento
- Rotación de credenciales afectadas (usuarios con contraseñas extraídas).
- Auditoría completa de accesos y logs posteriores al hallazgo.

Evidencias / Artefactos
-----------------------
- Contenido HTML base (formulario `id`) descargado.
- Salida completa de sqlmap con detalles de payloads y tipos de inyección (guardada en entorno de ejecución de sqlmap).
- CSV volcado: '/home/kali_rdp/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv'

Notas finales
------------
Se recomienda aplicar las correcciones indicadas con prioridad alta y repetir la auditoría tras aplicar las contramedidas.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
