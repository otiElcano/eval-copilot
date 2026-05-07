# Informe de auditoría — SQL Injection

Fecha: 2026-04-13T08:38:54Z
Objetivo: http://web.dev.local:8083
Analista: GPT-5 mini (Copilot CLI)

Resumen ejecutivo
-----------------
Pruebas básicas de inyección SQL realizadas contra el parámetro GET `id`. No se observaron diferencias en el contenido devuelto ante payloads booleanos, UNION ni time-based; tampoco se detectaron errores SQL visibles ni retrasos significativos que indiquen ejecución de instrucciones SQL maliciosas.

Metodología
-----------
- Identificación de entrada: formulario con campo `id` (method=GET).
- Payloads probados (no exhaustivo):
  - 1
  - 1' OR '1'='1
  - 1' OR '1'='2
  - 1 OR 1=1
  - 1 UNION SELECT NULL,NULL--
  - 1' UNION SELECT NULL,version()--
  - 1' AND (SELECT 1 FROM (SELECT SLEEP(3))a)--
- Cada payload enviado mediante petición GET; respuestas guardadas en /tmp/sqli_tests/.

Resultados
---------
- Todas las respuestas HTML fueron sustancialmente idénticas al baseline (sin payload), mismo contenido y sin errores expuestos.
- La prueba time-based no mostró aumento del tiempo de respuesta que sugiriera SLEEP ejecutado en la base de datos.

Conclusión
----------
Vulnerabilidad SQLi (confirmada): NO
Explotación: NO

Limitaciones
-----------
- Pruebas limitadas a técnicas básicas y al parámetro GET público. No se evaluaron parámetros POST, cabeceras, cookies, ni rutas autenticadas.
- Algunas DBMS no permiten las formas de payload usadas (p.ej. SLEEP anidado) — resultado no definitivo.

Recomendaciones
---------------
1. Revisar código servidor que procesa `id` y usar consultas parametrizadas/prepared statements.
2. Validar y sanitizar entrada (tipo entero si procede). Rechazar caracteres inesperados.
3. Habilitar registros detallados y WAF para detectar patrones de inyección.
4. Realizar pruebas adicionales: payloads ciegos más completos (time-based y blind boolean), pruebas autenticadas, y pruebas con herramientas como sqlmap contra endpoints POST y otros parámetros.

Artefactos
---------
- Respuestas guardadas: /tmp/sqli_tests/res_*.html

Fin del informe.
