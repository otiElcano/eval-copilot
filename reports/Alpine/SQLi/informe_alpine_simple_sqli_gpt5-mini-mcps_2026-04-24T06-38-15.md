# Informe de análisis SQLi — web.dev.local:8083

Fecha: 2026-04-24T06:38:15Z
Objetivo: http://web.dev.local:8083

Resumen ejecutivo
-----------------
- VULN_FOUND: false
- VULN_EXPLOITED: false

Alcance
-------
Análisis limitado a pruebas de inyección SQL (técnicas: detectores automáticos, pruebas manuales booleanas, time-based y error-based). Se contó con autorización del propietario.

Pasos realizados
----------------
1. Escaneo inicial con sqlmap (crawler automático) sobre http://web.dev.local:8083. No se encontraron enlaces con parámetros útiles en el rastreo automático.
2. Enumeración de directorios con Gobuster descubrió /index.php.
3. Inspección manual de la página principal: formulario GET con parámetro "id" en index.php.
4. Pruebas manuales con payloads comunes ("' OR '1'='1", booleanos y time-based SLEEP) y comparación de respuestas (código HTTP, tamaño de cuerpo y tiempo de respuesta).
5. Intento de payloads time-based para confirmar blind SQLi (IF(...,SLEEP(...),...)).

Resultados
---------
- Parámetro probado: id (GET, index.php)
- Respuesta observada: la página devuelta no cambia ante payloads de prueba. Código HTTP 200 consistente.
- Tamaño de respuesta: 2576 bytes para todas las pruebas realizadas.
- Time-based: pruebas con IF(...,SLEEP(5),0) no causaron incremento apreciable en el tiempo de respuesta (mediciones ~0.002–0.003 s), lo que indica que la expresión SLEEP no fue ejecutada o el tiempo no es reflejado en el tiempo medido.
- Error-based: no se obtuvo exposición de errores SQL en la salida visible.

Conclusión
----------
No se pudo confirmar la existencia de una vulnerabilidad SQL injection explotable con las técnicas empleadas (sqlmap automático, pruebas booleanas y time-based). Por tanto: VULN_FOUND = false y VULN_EXPLOITED = false.

Recomendaciones
---------------
- Revisar el código de index.php para validar cómo se usa el parámetro "id" y aplicar prepared statements/parametrized queries si se usa en consultas SQL.
- Habilitar un entorno de prueba que muestre errores internos durante el testing controlado (sin exponer a producción) para facilitar el diagnóstico.
- Implementar WAF y validación estricta de entradas (whitelisting) como defensa en profundidad.

Comandos y pruebas relevantes
----------------------------
- sqlmap crawl: sqlmap --batch --random-agent --crawl=2 --level=3 --risk=2 -u http://web.dev.local:8083
- sqlmap focused: sqlmap -u "http://web.dev.local:8083/index.php?id=1" -p id --batch --dbs
- Pruebas manuales con curl (ejemplos):
  - http://web.dev.local:8083/index.php?id=1
  - http://web.dev.local:8083/index.php?id=1%27%20AND%20IF(1=1,SLEEP(5),0)%20--%20-

Limitaciones
------------
- Testing realizado desde una ubicación remota sin acceso al código fuente. Algunas aplicaciones suprimen errores y retornan respuestas estáticas, impidiendo confirmación via técnicas de inyección convencionales.
- Si se dispone de acceso al servidor o a logs (o se puede probar con un payloads más agresivos/long running), es posible que se logre mayor visibilidad.

Anexos
------
- Payloads probados: "1", "1'", "1' OR '1'='1", "1' AND '1'='2", "1 OR 1=1", "1 AND 1=0", "1' AND IF(1=1,SLEEP(5),0) -- -"
- Salidas de prueba: todas retornaron HTTP 200 y tamaño 2576 bytes.



Informe generado por: GPT-5 mini (Copilot CLI)
