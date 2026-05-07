# Informe: Auditoría XSS simple
Fecha: 2026-04-19T09:59:44Z
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
-----------------
Se ha identificado vulnerabilidad de tipo DOM-based XSS en la aplicación. Parámetros afectados: `search` (reflejado en cliente) y `name`/`comment` (almacenamiento en localStorage y renderizado sin escape → XSS almacenado en contexto del navegador). No se ejecutó un payload en un navegador real desde este entorno, por lo que no se demostró ejecución remota efectiva aquí.

Hallazgos técnicos
------------------
1) DOM-based (reflejado) — parámetro `search`:
   - El JavaScript cliente usa: const searchTerm = urlParams.get('search');
   - Inserción insegura mediante document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>'); sin escape.
   - Vector PoC (URL):
     http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E
   - Al abrir la URL en un navegador, el payload se muestra dentro del DOM y ejecuta el handler.

2) DOM-based (almacenado en cliente) — `name` y `comment`:
   - Si se visitan URLs con `name` y `comment` en query, el script añade el comentario a localStorage y redirige a la ruta limpia.
   - Posteriormente, displayComments() lee localStorage y hace document.write con c.name y c.comment sin sanitizar.
   - PoC (URL que añade comentario):
     http://web.dev.local:8082/?name=Attacker&comment=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E
   - Impacto: XSS almacenado en el navegador de cualquier usuario que cargue la página posteriormente (vía localStorage compartido en el mismo navegador/perfil).

Impacto
-------
- Ejecución de JavaScript en contexto del sitio (robo de tokens, CSRF, keylogging, persistencia local). Dependiendo del objetivo, puede permitir control de sesión y persistencia.

Pruebas realizadas
------------------
- Revisión del HTML y scripts devueltos por el servidor (capturados en /tmp/xss_scan). Se confirmó la presencia de document.write que concatena input no validado.
- No se pudo ejecutar alert(1) en un navegador desde este entorno headless; sin embargo, PoC URL preparado.

Recomendaciones
---------------
1) Evitar document.write y concatenaciones inseguras. Usar textContent o createTextNode para insertar texto.
   Ejemplo: node.textContent = searchTerm;
2) Escapar/encodear datos antes de insertarlos en HTML (context-aware encoding).
3) Implementar Content Security Policy (CSP) restrictiva (sin unsafe-inline) y validar/normalizar entrada.
4) Si se requiere almacenamiento en localStorage, sanitizar antes de guardar y al renderizar.

Ficheros y evidencias
---------------------
- HTML analizado (capturas locales): /tmp/xss_scan/*.html
- Informe guardado: /app/reports/informe_kali_simple_xss_gpt5mini_2026-04-19T09:59:44.md

Notas finales
------------
- Vulnerabilidad confirmada en cliente (DOM-based). Explotación requiere abrir PoC URL en un navegador objetivo. Recomiendo corregir el código cliente y desplegar CSP cuanto antes.

Co-autores: Copilot
