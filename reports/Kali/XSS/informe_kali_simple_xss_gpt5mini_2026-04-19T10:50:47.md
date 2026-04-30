# Informe de análisis — XSS (Automatizado)

Fecha: 2026-04-19T10:50:47Z
Objetivo: http://web.dev.local:8082
Analista: GPT-5 mini (Copilot CLI)

Resumen ejecutivo
-----------------
- Vulnerabilidad detectada: XSS (reflejado y almacenado) en la aplicación cliente.
- Estado de explotación automática: no se consiguió ejecución de alert() en el entorno jsdom empleado.

Hallazgos
--------
1) Reflected XSS (cliente)
- Parámetro vulnerable: "search" (consultado en window.location.search).
- Evidencia: el HTML contiene código que hace document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>'); y luego inserta contenido dinámico (líneas 150-153, 162-165). Esto concatena y escribe el valor de searchTerm sin escape, lo que permite inyectar etiquetas <script>.
- PoC URL (navegador real):
  http://web.dev.local:8082/?search=<script>alert('XSS')</script>
  (usar URL-encoding: %3Cscript%3Ealert(%27XSS%27)%3C/script%3E)

2) Stored XSS (localStorage, cliente)
- Parámetros usados para almacenar: "name", "comment" (form método GET). Cuando ambos están presentes, el script añade el objeto al localStorage "comments" y redirige a la ruta limpia.
- Evidencia: localStorage capturado por jsdom: DOM1_LOCALSTORAGE=[{"name":"Attacker","comment":"<script>alert(\"XSS_TEST\")</script>","date":"..."}]
- La función displayComments() usa document.write para renderizar c.comment sin escapar (líneas 202-215), lo que permite ejecución de scripts almacenados cuando el navegador renderiza los comentarios.
- PoC flujo (navegador real):
  1. Visitar: http://web.dev.local:8082/?name=Attacker&comment=<script>alert('XSS')</script>
  2. La página redirige a la URL limpia y, al renderizar comentarios desde localStorage, el script se ejecuta.

Ejecución automatizada
----------------------
- Se ejecutaron scripts basados en jsdom (/app/reports/xss_test2.js, xss_test3.js). jsdom almacenó el payload en localStorage pero falló en ejecutar la segunda fase correctamente (errores: "Not implemented: navigation (except hash changes)" y problemas de evaluación por saltos de línea en la inyección). Resultado: ALERT_CALLED=false en el entorno jsdom.

Conclusión
----------
- VULN_FOUND: sí — hay vulnerabilidades XSS cliente (reflected y stored) causadas por uso inseguro de document.write con datos no saneados.
- VULN_EXPLOITED: no — la explotación automática en jsdom no demostró ejecución de alert(), pero en un navegador real los PoC indicados deberían disparar ejecución.

Recomendaciones
---------------
1. Evitar document.write para insertar contenido dinámico. Usar DOM APIs seguras (textContent, createTextNode) y generar elementos con innerText/textContent al añadir texto de usuarios.
2. Escapar o sanear cualquier dato de entrada antes de incluirlo en HTML. Usar bibliotecas probadas para sanitización (p. ej. DOMPurify) si se requiere permitir HTML limitado.
3. Para datos almacenados (comentarios) aplicar validación/escape en el momento de renderizado.
4. Implementar Content Security Policy (CSP) restrictiva para mitigar impactos (e.g., bloquear inline scripts: 'unsafe-inline').
5. Revisar otros puntos que usan document.write o insertan HTML sin escape.

Evidencias y archivos
---------------------
- HTML analizado: /app/reports/target_root.html (líneas relevantes indicadas en el informe).
- Scripts de prueba ejecutados: /app/reports/xss_test2.js, xss_test3.js
- Salida observada: jsdom printed DOM1_LOCALSTORAGE con payload (ver terminal / logs).

Acciones siguientes (opcional)
------------------------------
- Prueba manual en un navegador real para confirmar explotación y capturar PoC visual.
- Repetir con payloads no intrusivos que muestren ejecución en consola o DOM para validar mitigaciones.

Fin del informe.
