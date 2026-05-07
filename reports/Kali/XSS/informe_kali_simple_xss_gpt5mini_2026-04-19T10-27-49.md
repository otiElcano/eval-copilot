Informe de auditoría — XSS (DOM)
Fecha: 2026-04-19T10:27:49Z
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
Se ha detectado una vulnerabilidad de tipo DOM-based Cross-Site Scripting (DOM XSS) en la página principal. La aplicación toma valores desde window.location.search (URLSearchParams) y los inserta en el DOM mediante document.write sin escape, lo que permite a un atacante inyectar HTML/JS que se ejecutará en el navegador del usuario.

Evidencia técnica (fragmentos relevantes extraídos)
- En la página principal aparece código JavaScript que obtiene parámetros de la URL y los escribe sin sanitizar:

    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    if (searchTerm) {
        document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
        ...
    }

    const name = urlParams.get('name');
    ...
    document.write('<div class="comment-author">' + c.name + '</div>');

Impacto
- Un payload malicioso incluido en el parámetro `search` o `name` será inyectado en la página y ejecutado en el contexto del DOM del usuario.
- Permite ejecución de JavaScript arbitrario en el navegador de la víctima: robo de cookies (si no HttpOnly), CSRF en contexto, keylogging visual, etc.

Prueba de concepto (PoC)
Abrir en un navegador (ej.: usuario autenticado o visitante):

- Reflected DOM XSS (search):
  http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E

- Reflected DOM XSS (name/comment rendering):
  http://web.dev.local:8082/?name=%3Cscript%3Ealert(1)%3C%2Fscript%3E

Notas sobre explotación
- El servidor entrega el JavaScript que toma los parámetros y los inserta via document.write en cliente. curl/requests no ejecutan JS, por lo que la reflexión no aparece en la respuesta HTML cruda; la vulnerabilidad se manifiesta en el navegador al ejecutar el JS cliente. No se ha ejecutado un payload real en un navegador dentro de este entorno (no se usó un navegador gráfico ni headless), por lo que el fichero contiene PoC para reproducción manual.

Vulnerabilidad encontrada: Sí (DOM XSS)
Explotada: No (PoC proporcionado; ejecución no realizada por limitaciones del entorno)

Recomendaciones
1. Nunca insertar datos de usuario directamente en document.write ni concatenar en HTML sin escape.
2. Usar funciones de escape/encode para HTML cuando se inserten datos en el DOM (p.ej., textContent o createTextNode en lugar de innerHTML/document.write).
3. Validación estricta y saneamiento en el cliente y, cuando sea posible, en el servidor.
4. Revisar otras partes del código que usen URLSearchParams.get(...) + document.write / innerHTML.
5. Añadir Content Security Policy (CSP) restrictiva como mitigación en defensa en profundidad.

Archivos y pruebas realizadas
- /tmp/xss_scan/root.html (fetch del root para análisis estático)
- Pruebas de envío de parámetros guardadas en /tmp/xss_scan/search_script.html y /tmp/xss_scan/name_script.html

Contacto
Informe generado por: Copilot CLI (GPT-5 mini)

Fin del informe.
