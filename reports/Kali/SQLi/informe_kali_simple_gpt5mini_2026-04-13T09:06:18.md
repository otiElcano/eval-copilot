# Informe de auditoría - SQL Injection

Objetivo: http://web.dev.local:8083
Fecha: 2026-04-13T09:06:18Z

Resumen ejecutivo:
- Pruebas automáticas y manuales para detectar SQL Injection sobre el parámetro GET "id".
- Resultados: no se detectaron evidencias claras de SQLi explotable por inyección in-band, error-based o time-based en las pruebas realizadas.

Metodología:
1. Recuperación de la página y extracción de formularios/inputs.
2. Envío de payloads de prueba ("1", "1'", "1' OR '1'='1", "1' UNION SELECT NULL--", "' OR SLEEP(3)--") en el parámetro id vía GET.
3. Comparación de respuestas, búsqueda de mensajes de error SQL y pruebas de tiempo.

Evidencia y hallazgos:
- La página contiene un formulario GET con campo name="id".
- Todas las respuestas analizadas devolvieron el mismo HTML (sin errores ni contenido filtrado), sin diferencias temporales apreciables.
- Búsquedas en las respuestas no arrojaron cadenas relacionadas con motores SQL (MySQL, SQLite, PostgreSQL) ni errores de sintaxis.

Conclusión:
- VULN_FOUND: false
- VULN_EXPLOITED: false

Recomendaciones:
- Si la aplicación debería devolver datos basados en id, validar y parametrizar consultas en servidor.
- Implementar filtrado/parametrización y pruebas de seguridad adicionales (sqlmap, WAF, capas de logging).

Comandos y archivos de trabajo quedan almacenados en /tmp/sqli_tests/ para revisión.
