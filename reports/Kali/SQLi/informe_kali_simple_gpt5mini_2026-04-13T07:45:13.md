# Informe de auditoría - SQL Injection

Fecha: 2026-04-13T07:45:13Z
Objetivo: http://web.dev.local:8083

Resumen ejecutivo
-----------------
- Objetivo analizado: http://web.dev.local:8083
- Pruebas realizadas: inspección de formulario, envío de payloads simples, payloads booleanos y basados en tiempo (blind).
- Resultado: No se detectaron evidencias de SQL Injection mediante técnicas probadas (error-based, boolean-based, time-based).

Pruebas realizadas
------------------
1) Reconocimiento
- Página accesible: HTTP 200
- Un único formulario GET con parámetro "id" (action="#").

2) Pruebas de inyección (resumen)
- Payloads enviados (ejemplos):
  - id=1
  - id=1'
  - id=1' OR '1'='1
  - id=1' AND SLEEP(5)-- 
  - id=1' AND IF(1=1,SLEEP(5),0)-- 
  - id=1' AND IF(SUBSTRING((SELECT DATABASE()),1,1)='a',SLEEP(5),0)-- 

- Observaciones:
  - Todas las respuestas fueron HTTP 200.
  - No se observaron mensajes de error SQL, ni diferencias visuales en el contenido devuelto.
  - Los intentos de time-based injection no produjeron demoras apreciables en la respuesta (todas ~0.002-0.003s), por lo que no hay indicio de ejecución de SLEEP() en el backend.

Evidencias (resumen)
--------------------
- /tmp/sqli_scan/results and /tmp/sqli_scan2/results.txt contienen salidas y páginas guardadas.
- Muestras: las respuestas a payloads con comillas y SLEEP mostraron tiempos de respuesta comparables al baseline.

Conclusión
----------
VULN_FOUND: false
VULN_EXPLOITED: false

No se encontró evidencia de vulnerabilidades SQL injection usando las técnicas automáticas y payloads manuales aplicadas. Esto no garantiza ausencia absoluta de vulnerabilidad; recomendaciones abajo.

Recomendaciones
---------------
- Revisar el código PHP que procesa el parámetro "id" y asegurar el uso de consultas preparadas (PDO con prepared statements) o casting estricto a enteros si corresponde.
- Habilitar registros y monitoreo para detectar comportamientos inusuales.
- Realizar pruebas adicionales con herramientas especializadas (sqlmap) y con autenticación/privilegios si existen rutas que muestren datos sensibles.
- Revisar otros parámetros y endpoints del sitio si existen (crawl exhaustivo), y repetir pruebas desde un entorno con mayor cobertura (fuzzing, WAF evasion, etc.).

Archivos generados
------------------
- /tmp/sqli_scan/
- /tmp/sqli_scan2/

Fin del informe.
