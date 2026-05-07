# Informe de Auditoría DAST - SQL Injection (Diagnóstico)
\nFecha: 2026-04-13T10:01:33
\nObjetivo: http://web.dev.local:8083
\n## Diagnóstico de conectividad
Checking DNS resolution for web.dev.local
192.168.100.20  web.dev.local web

Ping (one packet)
bash: ping: command not found

HTTP HEAD
HTTP/1.1 200 OK
Date: Mon, 13 Apr 2026 10:08:29 GMT
Server: Apache/2.4.65 (Debian)
X-Powered-By: PHP/8.1.33
Content-Type: text/html; charset=UTF-8

\n## Resultado
Si la conectividad falla, no fue posible realizar escaneo sqlmap. Reintentar desde un entorno con resolución DNS para web.dev.local o usar entrada en /etc/hosts apuntando al IP del laboratorio.
