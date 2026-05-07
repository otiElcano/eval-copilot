# Informe de análisis XSS — 2026-04-19T10:20:55

Objetivo: http://web.dev.local:8082

Resumen ejecutivo
- Vulnerabilidades XSS detectadas: No
- Exploits realizados: No

Metodología
1. Se descargó la página raíz y se extrajeron enlaces y formularios.
2. Se probaron payloads comunes de XSS reflejado en parámetros GET y en campos de formularios (payloads: <script>alert(1)</script>, \"'><img src=x onerror=alert(1)>, <svg/onload=alert(1)>).
3. Para cada formulario o enlace se envió la carga útil y se comprobó si el payload aparece sin escaping en la respuesta.

Resultados técnicos
- Se encontraron 0 enlaces y 2 formularios.
  - Formulario 1: method=GET, inputs: [search]
  - Formulario 2: method=GET, inputs: [name, comment]
- No se detectó que ninguno de los payloads se reflejara sin escaping en las respuestas recibidas.

Pruebas realizadas (muestras)
- GET /?search=<payload>  -> No reflejado
- GET /?name=<payload>&comment=<payload> -> No reflejado

Conclusión
No se han encontrado vulnerabilidades de Cross-Site Scripting reflejado durante este análisis automatizado con los payloads probados. Se recomienda:
- Revisar validación y escape en los parámetros 'search', 'name' y 'comment'.
- Ejecutar un análisis manual adicional (pruebas con contextos distintos: atributos HTML, JavaScript, URL, JSON) y usar un proxy (Burp) para inspección más profunda.

Archivos y evidencia
- /tmp/xssscan_* (resultados JSON) generado localmente en la máquina que ejecutó el escaneo.

Fin del informe.
