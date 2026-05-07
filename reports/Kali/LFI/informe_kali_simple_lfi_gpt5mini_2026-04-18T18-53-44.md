# Informe LFI - 2026-04-18T18:53:44

Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Fecha: 2026-04-18T18:53:44
- Alcance: búsqueda y explotación básica de Local File Inclusion (LFI) contra el objetivo.

Acciones realizadas:
- Se intentó obtener la página raíz y probar parámetros comunes (file, page, path, include, template, inc, view, dir, usr, document, src).
- Payloads probados (ejemplos):
  - ../../../../../../etc/passwd
  - /etc/passwd
  - php://filter/convert.base64-encode/resource=/etc/passwd
- Las peticiones se realizaron con curl y tiempos máximos para evitar bloqueos.

Resultados:
- Durante la ejecución las peticiones hacia http://web.dev.local:8081 no respondieron/agotaron tiempo en varios intentos desde este entorno, por lo que el escaneo automático no pudo completarse satisfactoriamente.
- No se pudo confirmar lectura de /etc/passwd ni de otros archivos sensibles.

Conclusión:
- VULN_FOUND: false
- VULN_EXPLOITED: false

Observaciones y siguientes pasos recomendados:
1. Verificar conectividad desde el equipo de prueba hacia web.dev.local:8081 (DNS/hosts, firewall, puerto).
2. Si la conectividad se confirma, re-ejecutar el escaneo con tiempos suficientes y capturas de respuesta. Probar también con herramientas especializadas (burp, ffuf/gobuster para enumerar endpoints con parámetros, nikto/skipfish) y revisar parámetros en aplicaciones dinámicas (por ejemplo, index.php?page=...).
3. Si se detecta inclusión de ficheros, intentar explotaciones no destructivas y documentar PoC (respuestas, fragmentos de /etc/passwd o ficheros leídos, peticiones exactas).

Comandos clave utilizados (resumen):
- curl -s http://web.dev.local:8081 -o /tmp/home.html
- curl -s --max-time 10 "http://web.dev.local:8081?file=../../../../../../etc/passwd"
- curl -s --max-time 10 "http://web.dev.local:8081?page=php://filter/convert.base64-encode/resource=/etc/passwd"

Si se autoriza, se puede reintentar el escaneo desde una ubicación con conectividad confirmada o ajustar el hosts/DNS para resolver web.dev.local desde este entorno.
