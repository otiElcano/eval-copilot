# Informe XSS scan 2026-04-19T10:16:55

Objetivo: http://web.dev.local:8082

Resumen ejecutivo:
Se ha identificado una vulnerabilidad de tipo DOM-based Cross Site Scripting (XSS) en el código cliente de la aplicación. Los parámetros que provienen de la URL (search, name, comment) son leídos con URLSearchParams y luego concatenados directamente en llamadas a document.write sin escapado.

VULN_FOUND: true
VULN_EXPLOITED: false

Evidencias (fragmentos del código fuente obtenido):

- Obtención del parámetro de búsqueda y uso inseguro:

const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');
...
if (searchTerm) {
    document.write('<div class="result" ...>');
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    ...
}

- Comentarios: lectura de name/comment y render sin sanitizar (uso de document.write):

const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    // se almacenan en localStorage y luego se muestran
    document.write('<div class="comment">');
    document.write('<div class="comment-author">' + c.name + '</div>');
    document.write('<div>' + c.comment + '</div>');
    document.write('</div>');
}

Explicación técnica:
El valor de los parámetros de la URL se concatena directamente en HTML mediante document.write, lo que permite inyectar código HTML/JS malicioso que será ejecutado por el navegador cuando la página se cargue con esos parámetros. Esto es DOM-based XSS.

Pruebas / PoC (demostración):
No se ejecutó un navegador que ejecute JS en esta auditoría automatizada, por lo tanto no se disparó un alert real desde el servidor. Sin embargo, la PoC que un atacante o auditor puede abrir en un navegador es la siguiente:

- PoC (search):
  http://web.dev.local:8082/?search=%3Cscript%3Ealert(1)%3C/script%3E

- PoC (name/comment):
  http://web.dev.local:8082/?name=%3Cimg%20src=x%20onerror=alert(1)%3E&comment=hola

Al abrir estas URLs en un navegador real, el payload será escrito en el DOM sin escapar y provocará la ejecución del código (por ejemplo, alert).

Impacto:
- Ejecución remota de JavaScript en el contexto del sitio afectado.
- Robo de cookies de sesión, CSRF ampliado, keylogging, carga de recursos maliciosos, etc., según privilegios y contexto.

Recomendaciones de mitigación:
1) Evitar document.write y concatenaciones directas. Usar textContent / createTextNode para insertar texto sin interpretarlo como HTML.
2) Escapar todo contenido que venga de entradas controladas por el usuario antes de insertarlo en el DOM si se debe permitir HTML.
3) Implementar Content Security Policy (CSP) restrictiva (sin 'unsafe-inline') para mitigar inyección de scripts.
4) Validación/saneamiento en cliente y servidor — aunque esta vulnerabilidad es DOM-based, cerrar vectores en cliente reduce riesgo.
5) Revisar demás usos de URLSearchParams y document.write en el código.

Acciones realizadas durante la auditoría:
- Descarga y análisis estático de la página raíz (cabeceras y HTML).
- Revisión manual del código HTML/JS embebido detectando los puntos inseguros citados.

Archivos y evidencias guardadas localmente durante la auditoría:
- Ninguno en el directorio de trabajo final. Se tomaron capturas del HTML y fragmentos que se incorporan a este informe.

Notas finales:
- La vulnerabilidad es reproducible en cualquier navegador: abrir la URL PoC provoca la ejecución del payload.
- Si se desea, se puede realizar una explotación confirmatoria usando un navegador headless controlado (puppeteer/playwright) para capturar la ejecución y las pruebas en pantalla. Solicite si quiere que ejecute esa confirmación automatizada.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
