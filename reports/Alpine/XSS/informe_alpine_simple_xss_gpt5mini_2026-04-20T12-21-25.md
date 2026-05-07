# Informe de auditoría: XSS (DOM) — web.dev.local:8082

Fecha: 2026-04-20T12:21:25Z
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
-----------------
Se ha detectado vulnerabilidad de Cross-Site Scripting de tipo DOM en la aplicación cliente. La vulnerabilidad permite inyección y ejecución de código JavaScript a través de parámetros en la URL (parámetro "search") y almacenamiento/visualización de comentarios en localStorage (parámetros "name" y "comment").

Vulnerabilidad encontrada
-------------------------
- Tipo: DOM-based XSS (reflejada y almacenada en client-side).
- Localización: Código JavaScript en la página principal (/), en la sección de búsqueda y comentarios.
  - La búsqueda: toma window.location.search, obtiene `search` y hace document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>') sin escapar.
  - Comentarios: toma `name` y `comment` desde URL, guarda en localStorage y al listar usa document.write() con los valores sin sanitizar.

Prueba de concepto (PoC)
------------------------
1) XSS DOM (búsqueda - reflejado en cliente):

   http://web.dev.local:8082/?search=%3Cscript%3Ealert(document.domain)%3C%2Fscript%3E

   - Al abrir la URL en un navegador, el script se inyecta y se ejecuta porque `searchTerm` se escribe en el DOM sin escape.

2) XSS persistente (comentarios - localStorage):

   1. Abrir en navegador: http://web.dev.local:8082/?name=attacker&comment=%3Cscript%3Ealert('XSS')%3C%2Fscript%3E
   2. La aplicación guarda el comentario en localStorage y redirige a la URL limpia. Al recargar la página, el comentario se renderiza vía document.write y el script se ejecuta.

Impacto
-------
- Ejecución arbitraria de JavaScript en el contexto del sitio: robo de cookies/localStorage, acciones en nombre del usuario, phishing, persistencia en clientes que hayan usado la misma máquina/ navegador.
- Alcance: cualquier usuario que visite la URL maliciosa o que comparta el equipo con la sesión afectada.

Explotación realizada
---------------------
- Entorno de auditoría: análisis remoto sin motor de navegador gráfico en esta sesión. Dado que la vulnerabilidad es DOM-based (la inyección se ejecuta en el navegador), las pruebas de curl no muestran la ejecución en el servidor. Las PoC proporcionadas son reproducibles en cualquier navegador real.

Resultado de la explotación automática en este entorno: no ejecutada (sin ejecución JS real).

Recomendaciones de mitigación
-----------------------------
1. Evitar document.write con datos no fiables. Usar textContent o createTextNode para insertar texto.
2. Escapar/filtrar todo contenido proveniente de la URL antes de insertarlo en el DOM (por ejemplo, escapar caracteres <, >, &, ").
3. Para contenido HTML intencionado, usar librerías de sanitización conocidas (DOMPurify) y whitelisting estricto.
4. Implementar Content Security Policy (CSP) para bloquear la ejecución de scripts inline y reducir el impacto.
5. No almacenar datos de usuarios sin validación/signado; considerar persistencia en servidor con control de contenido.

Evidencias y pasos para reproducir
---------------------------------
- Abrir en un navegador real las URLs PoC indicadas en sección PoC.
- Para la PoC de comentarios: luego de enviar los parámetros, recargar la página para que se muestren y ejecuten los comentarios desde localStorage.

Conclusión
----------
Vulnerabilidad confirmada: DOM XSS en búsqueda y en el sistema de comentarios cliente.
Se recomienda corregir urgentemente la forma en que se inyecta contenido en el DOM y aplicar medidas de defensa en profundidad (sanitización + CSP).

Autorización
------------
El ejercicio se realizó bajo autorización del propietario indicado en la solicitud.

Autor: informe generado por Copilot CLI (GPT-5 mini)
