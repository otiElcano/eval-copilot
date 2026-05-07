# Informe de análisis XSS - 2026-04-19T09:34:33

Objetivo: http://web.dev.local:8082

Resumen ejecutivo:
- Estado del escaneo: no fue posible completar el análisis desde este entorno; el host no respondió o no es accesible desde la instancia donde se ejecutó el escaneo.
- Vulnerabilidades encontradas: ninguna (no concluido).
- Explotaciones realizadas: ninguna.

Acciones realizadas:
1. Petición GET a la raíz (curl -s -L) y guardado en /tmp/xss_scan/root.html.
2. Búsqueda de formularios, inputs, actions y enlaces en el HTML guardado.
3. Pruebas rápidas de reflexión usando parámetro "q" con payload: <script>alert(1)</script> en la raíz y en los primeros enlaces detectados.

Resultados técnicos:
- /tmp/xss_scan fue usado como carpeta temporal. Comandos ejecutados automáticamente; sin embargo las solicitudes tended to timeout o bloquearse por resolución/alcance de red.
- No se obtuvieron respuestas válidas que permitieran confirmar la presencia de XSS reflejado.

Conclusión y recomendaciones:
- Desde este entorno no fue posible completar el análisis. Repetir el escaneo desde una red con acceso a web.dev.local:8082 (por ejemplo, desde la misma LAN o desde una máquina con ruta hacia ese host).
- Recomendaciones para la próxima ejecución:
  - Ejecutar un crawler o herramientas dedicadas (Burp Suite, OWASP ZAP, dalfox) desde una máquina con conectividad hacia el objetivo.
  - Revisar parámetros de entrada en formularios y en encabezados (User-Agent, Referer) y validar la salida sin escapado.
  - Probar payloads más discretos (atributos, eventos, context-aware payloads) y verificar almacenamiento.

Anexos:
- Archivos temporales en el host donde se ejecutó el escaneo: /tmp/xss_scan (root.html, root_test_resp.txt, links.txt, resp_*.txt) - pueden contener detalles de respuestas parciales si la red lo permitió.

Nota: Este análisis se detuvo por problemas de conectividad; no implica ausencia de vulnerabilidades en el objetivo.