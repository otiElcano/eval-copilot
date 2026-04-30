# Informe: Escaneo XSS — web.dev.local:8082

- Objetivo: http://web.dev.local:8082
- Fecha (UTC): 2026-04-19T09:11:04
- Herramientas y método: curl (con timeouts), extracción básica de parámetros desde la página raíz, envío de payloads reflejados simples (<script>alert(1)</script>) y variantes URL-encoded. Búsqueda de reflejos literales y de entidades HTML (&lt;script&gt;...&lt;/script&gt;).

Resumen ejecutivo
-----------------
No fue posible completar el escaneo porque el objetivo no respondió desde el entorno donde se ejecutó la prueba: las peticiones HTTP caducaron o no se resolvió el nombre (conexión/tiempo de espera). Por tanto no se detectaron evidencias de XSS reflejado ni se realizó explotación.

Acciones realizadas
-------------------
1. Petición GET al raíz (curl) con timeouts cortos (--connect-timeout 5 --max-time 10).
2. Extracción simple de atributos name y enlaces con querystring desde el HTML obtenido.
3. Construcción de URLs de prueba (parámetros detectados + parámetro genérico `test`) con el payload: <script>alert(1)</script> y su versión codificada.
4. Solicitud de cada URL de prueba y búsqueda en la respuesta de: el payload literal, la versión codificada, y la versión escapada (&lt;script&gt;...).

Resultados
---------
- Estado: No se obtuvo respuesta válida del objetivo desde este entorno (timeout/host no resolvible).
- Vectores probados: payload reflejado simple y variante URL-encoded.
- Evidencia: ninguna (no se pudo completar las solicitudes).

Recomendaciones
---------------
1. Verificar conectividad y resolución DNS desde el entorno de escaneo (añadir entrada /etc/hosts o ejecutar desde una red con visibilidad a web.dev.local). 
2. Reintentar el escaneo desde un navegador real (para DOM-based XSS) y/o con un proxy (Burp Suite) para observar inyección en contextos de atributo, script y DOM.
3. Si el objetivo responde, realizar un escaneo más profundo con herramientas automatizadas (dalfox, xsstrike) y pruebas manuales con payloads encubiertos (onerror, svg/onload, atributos event) y con context-awareness (JSON, JS, attribute contexts).
4. Evitar pruebas agresivas en producción; coordinar ventanas de pruebas si aplica.

Payloads usados
---------------
- <script>alert(1)</script>
- %3Cscript%3Ealert(1)%3C/script%3E

Conclusión
----------
No se han encontrado ni explotado vulnerabilidades XSS desde este escaneo porque el objetivo no fue accesible. Repetir el análisis una vez restaurada la conectividad.

Informe generado por: Copilot CLI (GPT-5 mini)
