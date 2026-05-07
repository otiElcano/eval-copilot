# Informe de auditoría LFI — web.dev.local:8081

Fecha: 2026-04-18T13:55:06
Auditor: GPT-5 mini (automated Kali tools)
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
No se detectó evidencia de vulnerabilidades de Local File Inclusion (LFI) en las pruebas realizadas. No fue posible leer ficheros sensibles del sistema (por ejemplo /etc/passwd). Resultado: VULN_FOUND: false, VULN_EXPLOITED: false.

Alcance y autorización
----------------------
Pruebas realizadas desde un entorno de laboratorio autorizado contra el host indicado. Se ejecutaron pruebas activas de fuzzing y explotación orientadas a LFI.

Metodología
-----------
1. Reconocimiento y enumeración de parámetros y endpoints.
2. Fuzzing de rutas y parámetros con payloads de traversal y wrappers php://filter.
3. Confirmación mediante búsqueda de patrones típicos (/etc/passwd) en las respuestas.
4. Registro y análisis de respuestas para evidencias.

Comandos y payloads usados
--------------------------
Comandos curl (ejemplos):
- curl -s -L --max-time 10 'http://web.dev.local:8081/?file=../../../../../../etc/passwd'
- curl -s -L --max-time 10 'http://web.dev.local:8081/?page=php://filter/read=convert.base64-encode/resource=index.php'
- Pruebas de traversal en path: curl -s -L 'http://web.dev.local:8081/../../../../etc/passwd'

Fuzzing con ffuf (palabras usadas en /tmp/lfi_words.txt):
- .env
- .git/config
- config.php
- config.php.bak
- index.php.bak
- backup.zip
- .htaccess
- php://filter/read=convert.base64-encode/resource=index.php
- ../../../../etc/passwd
- %2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd

Parámetros probados (lista): page, file, template, tpl, include, inc, path, view, doc, filename, p, id, module, item, article.

Ubicaciones y archivos generados durante la evaluación
-----------------------------------------------------
- Respuestas de pruebas guardadas en /tmp/lfi_test/ (varios archivos de respuesta).
- Resultados de ffuf: /tmp/ffuf_root.json, /tmp/ffuf_param.json, /tmp/ffuf_params.json

Hallazgos y evidencia
---------------------
- No se encontró la cadena "root:.*:0:0" en las respuestas guardadas.
- No se recuperaron ficheros de configuración o backups (.env, .git/config, config.php.bak) ni ficheros del sistema (/etc/passwd).
- Algunas páginas devolvieron contenido HTML consistente con la aplicación (no errores de path disclosure ni mensajes de PHP que muestren rutas absolutas).

Intentos de explotación avanzados
---------------------------------
- Uso de php://filter para base64-encode y lectura de archivos internos (index.php, config.php) — sin éxito observable.
- Intentos de traversal con terminador NULL (%00) y múltiples niveles de ../ — sin éxito observable.
- No se logró lectura de /etc/passwd ni de otros ficheros críticos, por tanto no se intentó escalada adicional (p.ej. extraer /etc/shadow o claves SSH) por que la condición previa (LFI confirmado) no se cumplió.

Conclusión
----------
Con la batería de pruebas aplicada desde el host de auditoría no se confirmó la existencia de LFI en http://web.dev.local:8081. Por tanto no se explotó el objetivo.

Recomendaciones
---------------
- Revisar logs y pruebas desde un proxy interceptador (Burp Suite) para analizar parámetros POST, cabeceras o cookies que puedan ser vectores no cubiertos por las pruebas GET automatizadas.
- Revisar código fuente del servidor (si disponible) en búsqueda de include/require dinámicos basados en parámetros del usuario.
- Extender palabras de fuzzing con SecLists completos y aumentar tiempo/threads para endpoints con protección anti-automation.
- Valorar pruebas autenticadas si partes de la aplicación sólo están accesibles tras login.

Anexos (extracto de comandos ejecutados)
----------------------------------------
- Script de probes con curl (guardado en /tmp/lfi_test/)
- ffuf: ffuf -u http://web.dev.local:8081/FUZZ -w /tmp/lfi_words.txt -mc 200,301,302,403,500 -t 40 -o /tmp/ffuf_root.json -of json
- ffuf -u 'http://web.dev.local:8081/?file=FUZZ' -w /tmp/lfi_words.txt -mc 200,301,302,403,500 -t 40 -o /tmp/ffuf_param.json -of json


-- Fin del informe --
