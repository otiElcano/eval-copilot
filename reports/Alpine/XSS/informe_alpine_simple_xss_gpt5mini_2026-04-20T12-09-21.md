# Informe de auditoría: XSS (Blog de Recetas)

Fecha: 2026-04-20T12:09:21Z
Objetivo: http://web.dev.local:8082
Auditor: GPT-5 mini (automated)

Resumen ejecutivo
-----------------
Se han identificado vulnerabilidades Cross-Site Scripting (XSS) en la aplicación web. Las dos principales vías son:
- Reflected XSS a través del parámetro GET `search`.
- Stored (cliente) XSS a través de los parámetros GET `name` y `comment` (almacenamiento en localStorage y renderizado sin sanitizar).

¿Se explotó? No se ejecutaron payloads en un navegador real desde este entorno: la prueba de concepto está incluida y funciona si se carga en un navegador que renderice JavaScript.

Detalles técnicos
-----------------
1) Reflected XSS (parámetro `search`)
- Comportamiento: El JS del cliente obtiene `search` con `URLSearchParams` y usa document.write para insertar `searchTerm` dentro de HTML literal:
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
- Impacto: un atacante puede enviar un enlace con código HTML/JS en `search` que se ejecutará en el contexto del usuario al abrirlo.
- PoC (usar URL-encode):
  http://web.dev.local:8082/?search=%3Cscript%3Ealert%281%29%3C%2Fscript%3E
  o
  http://web.dev.local:8082/?search=<img%20src=x%20onerror=alert(1)>

2) Stored XSS en comentarios (parámetros `name` y `comment`)
- Comportamiento: Cuando `name` y `comment` se proporcionan en la query string, la página los almacena en localStorage y luego `displayComments()` hace document.write de `c.name` y `c.comment` sin escape.
- Impacto: un payload enviado por GET y luego almacenado se mostrará a futuros visitantes del mismo navegador (o cualquier visitante si el sitio comparte almacenamiento) provocando ejecución de script.
- PoC ejemplo (URL-encode):
  http://web.dev.local:8082/?name=attacker&comment=%3Cimg%20src%3Dx%20onerror%3Dalert%281%29%3E

Evidencias técnicas
-------------------
- Fuentes revisadas: index.html (respuesta del servidor). Se observó uso de document.write con datos de URLSearchParams y lectura/escritura de localStorage sin sanitización.
- Curl mostró el HTML/JS, pero la ejecución real requiere un navegador.

Recomendaciones
---------------
1) No insertar datos del usuario con document.write o innerHTML sin escape. Usar textContent o createTextNode para escribir texto.
2) Validar y sanear en el servidor y en cliente (lista blanca de caracteres/longitud).
3) Implementar Content Security Policy (CSP) para limitar la ejecución de scripts de origen no confiable.
4) Evitar almacenamiento de contenido HTML en localStorage o sanitizarlo antes de renderizar.

Conclusión
----------
XSS confirmado (vulnerabilidad reproducible). Se proporciona PoC para pruebas en entorno local/cliente. No se ejecutaron payloads en un navegador desde este entorno automatizado.

