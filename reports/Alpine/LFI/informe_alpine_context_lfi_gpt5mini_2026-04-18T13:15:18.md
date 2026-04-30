# Informe LFI - web.dev.local:8081

Fecha: 2026-04-18T13:15:18Z

Objetivo: Auditar Local File Inclusion (LFI) en http://web.dev.local:8081

Resumen ejecutivo:
Se intentó identificar y explotar vulnerabilidades LFI en la aplicación web. Se probaron payloads comunes de traversal y el uso del wrapper php://filter para leer /etc/passwd. Las respuestas del servidor no devolvieron contenido de ficheros del sistema ni errores de path disclosure. No se logró extraer archivos sensibles.

Detalles del análisis:
- Reconocimiento:
  - Nmap: Apache httpd 2.4.65 en puerto 8081.
- Puntos de entrada probados:
  - Parámetro GET: page
  - Cabeceras y cuerpos: se revisaron mediante solicitudes directas
- Comandos y herramientas usados:
  - Nmap: nmap -sV -Pn -p 8081 web.dev.local
  - Curl: varias solicitudes con payloads de LFI
  - Web fetch (herramienta interna): visitas a /?page=../../../../etc/passwd y php://filter/.../etc/passwd
- Payloads probados:
  - ../../../../etc/passwd
  - ../../../../../../etc/passwd%00
  - php://filter/read=convert.base64-encode/resource=../../../../etc/passwd

Resultados:
- VULN_FOUND: false
- VULN_EXPLOITED: false

Observaciones:
- La aplicación no mostró contenido de ficheros ni errores que permitan confirmar LFI.
- Recomendación: revisar logs del lado servidor y probar fuzzing más exhaustivo localmente con SecLists y ffuf/wfuzz para detectar rutas internas y parámetros adicionales.

Fin del informe.
