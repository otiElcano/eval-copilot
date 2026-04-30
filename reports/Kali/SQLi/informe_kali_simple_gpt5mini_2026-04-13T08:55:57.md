# Informe de análisis SQLi

Objetivo: http://web.dev.local:8083
Fecha: 2026-04-13T08:55:57Z

Resumen ejecutivo:
- VULN_FOUND: true
- VULN_EXPLOITED: false

Descripción y alcance:
Se analizó la página principal (/), que contiene un formulario GET con el parámetro "id". El objetivo fue identificar y explotar vulnerabilidades de inyección SQL.

Metodología y pruebas realizadas:
- Inspección del formulario en root (GET, name="id").
- Pruebas de payloads comunes: 1, 1', 1'--, ' OR '1'='1, -1' OR '1'='1, UNION SELECT ...
- Pruebas de error-based SQLi (comprobación de mensajes de error devueltos).
- Pruebas de time-based SQLi: payloads con SLEEP (MySQL: SLEEP(4), Postgres: pg_sleep(4)).
- Pruebas de enumeración con UNION SELECT (variando número de columnas).
- Intento de extracción: UNION SELECT concat(user,0x3a,password) FROM users

Resultados y evidencia:
- Respuestas con mensajes de error SQL indicaron que la entrada no se sanitiza correctamente. Ejemplos observados en respuestas:
  - "Uncaught mysqli_sql_exception: You have an error in your SQL syntax; ... near ''''' at line 1 in /var/www/html/low.php:11"
  - "Uncaught mysqli_sql_exception: FUNCTION sqli_demo.pg_sleep does not exist in /var/www/html/low.php:11"
  - "Uncaught mysqli_sql_exception: The used SELECT statements have a different number of columns in /var/www/html/low.php:11"
- Time-based payloads con SLEEP no produjeron retrasos observables en las peticiones (respuesta ~0.005s), por lo que no se confirmó blind time-based SQLi en el entorno actual.
- UNION tests devolvieron errores relacionados con número de columnas; no se logró exfiltrar datos visibles con el payload probado.
- Intento de extracción mediante UNION SELECT no devolvió credenciales ni filas legibles.

Conclusión:
- La aplicación presenta vulnerabilidad de inyección SQL de tipo error-based (entrada "id" no gestionada correctamente) — VULN_FOUND: true.
- No se consiguieron extraer datos sensibles durante este análisis con los payloads probados — VULN_EXPLOITED: false.

Recomendaciones (prioritarias):
1. Usar consultas preparadas (parameterized queries) y ligar parámetros en todas las consultas que usen datos del usuario.
2. Validar y normalizar entrada (tipo, longitudes, permit/deny lists) y convertir a entero si corresponde (por ejemplo, cast a entero para id).
3. Restringir el usuario de la base de datos con privilegios mínimos; evitar acceso a funciones peligrosas.
4. Suprimir mensajes de error detallados en producción; registrar errores internamente sin mostrarlos al usuario.
5. Implementar Web Application Firewall (WAF) y reglas para bloquear payloads comunes hasta que se remedie el código.

Archivos de soporte y comandos usados (ejemplos):
- GET: /?id=1
- Error payload: /?id=1'
- UNION test: /?id=-1'%20UNION%20SELECT%201,2,3--
- Time test (MySQL): /?id=1'%20AND%20SLEEP(4)--
- Comandos curl usados para timing y extracción de prueba.

Si se desea, continuar con:
- Enumeración precisa del número de columnas y columnas reflectantes para obtener una carga UNION válida.
- Escaneo de tablas y columnas disponibles (information_schema) con payloads blind/boolean-based si extracción directa continúa fallando.

Informe generado automáticamente por Copilot CLI.
