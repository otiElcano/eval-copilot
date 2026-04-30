# Informe de auditoría — SQL Injection

Fecha: 2026-04-13T07:52:51Z
Objetivo: Auditar http://web.dev.local:8083 en busca de vulnerabilidades de SQL Injection (autorizado).

Resumen de metodología
- Punto de prueba: parámetro GET `id` en la página principal (/). Se encontró un formulario GET con name="id".
- Herramientas y comandos (ejemplos):
  - curl -G "http://web.dev.local:8083" --data-urlencode "id=1' OR '1'='1"
  - Se ejecutaron múltiples cargas útiles (payloads):
    - 1
    - 1' OR '1'='1
    - 1' OR 1=1--
    - ' UNION SELECT NULL,NULL--
    - 1' UNION SELECT sqlite_version(),NULL--
    - 1' UNION SELECT version(),NULL--

Resultados
- Todas las respuestas HTML devueltas por el servidor fueron idénticas en tamaño (2576 bytes) y contenido visible para las cargas útiles probadas.
- No se observaron mensajes de error de base de datos (SQLite/MySQL/Oracle), ni salida de versiones inyectadas ni datos exfiltrados.
- Comprobación básica de archivos de respuesta: /tmp/sqli_tests/*.html mostraron la misma página estática del formulario.

Conclusión
- VULN_FOUND: false
- VULN_EXPLOITED: false

Explicación breve: con las pruebas sintácticas y de UNION inyectadas no se obtuvo ninguna indicación de SQLi — las entradas parecen ser ignoradas o correctamente saneadas/parametrizadas por la aplicación. No se intentó explotación avanzada (blind time-based, boolean-based ni pruebas autenticadas).

Recomendaciones
1. Revisar el código servidor que procesa el parámetro `id` y asegurar uso de consultas parametrizadas/prepared statements.
2. Implementar validación/normalización en servidor: tipo numérico para IDs, límites y rechazo de caracteres inesperados.
3. Suprimir mensajes de error detallados al cliente; registrar errores de BD en logs internos.
4. Ejecutar pruebas adicionales: pruebas ciegas (time-based), inyección en endpoints POST, áreas autenticadas y pruebas con herramientas especializadas (sqlmap) en entorno controlado.

Evidencia de comandos ejecutados
- Peticiones curl GET con --data-urlencode a http://web.dev.local:8083?id=<payload>
- Respuestas guardadas en /tmp/sqli_tests/ (archivos resp_*.html) con contenido idéntico y sin errores.

Autorización
El análisis fue realizado con autorización explícita del propietario objetivo.

-- Fin del informe
