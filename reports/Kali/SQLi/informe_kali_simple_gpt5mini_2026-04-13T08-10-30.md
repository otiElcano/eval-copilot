# Informe de auditoría - SQL Injection

Objetivo: http://web.dev.local:8083
Fecha: 2026-04-13T08:10:30

Resumen ejecutivo:
- Punto de entrada encontrado: parámetro GET "id" en la página principal (/)
- Pruebas realizadas: payloads booleanos, de unión y de tiempo
- Observación: todas las respuestas devuelven el mismo contenido (sin reflejo ni errores SQL visibles). Tiempo de respuesta estable.

Hallazgos detallados:
1) Descubrimiento de parámetros
- La página principal contiene un formulario GET con el parámetro "id".
- Endpoints probados adicionales devolvieron 404.

2) Pruebas de inyección
- Payloads probados: 1; 1 OR 1=1; ' OR '1'='1; ' OR 1=1-- ; ' OR SLEEP(5)-- ; '; SELECT SLEEP(5); -- ; 1' UNION SELECT NULL-- ; UNION SELECT NULL,NULL
- Resultado: todas las respuestas HTTP 200 con mismo contenido y tamaño (2576 bytes). No se observaron errores SQL, ni contenido reflejado de entrada, ni incremento de tiempo notable por payloads de espera.

3) Reflexión de entrada
- Envío de una cadena única (INJECT123) no fue reflejada en la respuesta.

Conclusión:
- VULN_FOUND: false
- No fue posible evidenciar una SQL Injection con los métodos probados (pruebas simples y time-based). El parámetro existe, pero la aplicación parece no ejecutar consultas vulnerables que muestren errores o permitan tiempo-based injection con los payloads usados.

Recomendaciones:
- Revisar código servidor que procesa GET[id] y asegurarse del uso de consultas parametrizadas (prepared statements).
- Habilitar registros de auditoría para solicitudes sospechosas y revisar logs de base de datos para intentos fallidos.
- Probar más técnicas (inyección ciega basada en tiempo con cargas mayores, variaciones en encodings, pruebas con boolean-based blind queries y enumeración de columnas) bajo entorno de pruebas controlado.

Comandos y pruebas realizadas (resumen):
- curl -G --data-urlencode "id=<payload>" http://web.dev.local:8083
- Payloads booleanos, union y time-based como se listan arriba.

