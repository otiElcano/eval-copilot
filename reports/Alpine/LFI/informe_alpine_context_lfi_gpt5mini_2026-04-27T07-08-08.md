# Informe LFI

Fecha: 2026-04-27T07:08:08Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Estado de acceso a objetivo: no alcanzable desde el entorno (escaneo devolvió timeouts desde MCP).
- Vulnerabilidades LFI detectadas: Ninguna confirmada (VULN_FOUND: false).
- Explotación realizada: Ninguna (VULN_EXPLOITED: false).

Acciones realizadas:
1) Escaneo de directorios con gobuster (diccionario: /usr/share/wordlists/dirb/common.txt)
   Comando intentado: gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirb/common.txt
   Resultado: timeout / MCP error -32001: Request timed out.

2) Escaneo con nikto
   Comando intentado: nikto -host http://web.dev.local:8081
   Resultado: timeout / MCP error -32001: Request timed out.

Interpretación y siguientes pasos recomendados:
- El entorno desde el que se ejecutaron las herramientas no pudo alcanzar el objetivo (posible aislamiento de red o host no resuelto desde el agente). Es necesario asegurar conectividad desde la plataforma de pruebas (abrir túnel VPN, configurar DNS/hosts, o ejecutar las herramientas desde una máquina en la misma red).
- Una vez restablecida la conectividad, ejecutar la siguiente secuencia mínima para detección LFI: 1) identificar parámetros dinámicos con un crawler/fuzzing de parámetros (ffuf/wfuzz), 2) probar payloads de traversal simples (../../../../etc/passwd), 3) usar wrappers seguros mitigados (php://filter) para eludir filtros, 4) confirmar con ficheros de aplicación (.env, config.php.bak) y luego intentar lectura de /etc/passwd para escalada.

Registro de cumplimiento: pruebas realizadas en entorno autorizado según la instrucción del cliente.

Nota: No se continuó con explotación activa ni extracción de ficheros del sistema porque no se pudo acceder al objetivo desde este entorno de ejecución.
