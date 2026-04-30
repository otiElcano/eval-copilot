# Informe: Auditoría XSS (breve)

Fecha: 2026-04-19T10:11:17Z
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
-----------------
Se realizaron pruebas básicas para detectar vulnerabilidades Cross-Site Scripting (XSS) reflejado/almacenado en el objetivo. No se encontró evidencia de inyección reflejada ni de almacenamiento con los puntos probados.

Metodología
-----------
- Reconocimiento pasivo de la página principal (/).
- Pruebas de inyección reflejada enviando payloads sencillos en parámetros comunes: <script>alert(1)</script>.
- Intento de localizar endpoints y recursos habituales: /?q=, /search, /comments, /robots.txt, /sitemap.xml.

Pruebas realizadas
------------------
1) GET / (raíz)
   - Contenido observado: fragmentos estáticos: "Comparte y descubre recetas deliciosas", secciones "Buscar Recetas" y "Comentarios".
2) GET /?q=<script>alert(1)</script>
   - Resultado: no se refleja el payload en la respuesta (no se observó la cadena ni ejecución en HTML devuelto).
3) GET /search?q=<script>alert(1)</script>  → 404
4) GET /comments?comment=<script>alert(1)</script>  → 404
5) robots.txt / sitemap.xml no encontrados por búsquedas previas (sin entries útiles).

Observaciones
-------------
- No se encontraron formularios ni parámetros reflejados en la página raíz en las comprobaciones rápidas realizadas.
- Las rutas /search y /comments devolvieron 404 cuando se intentó acceso directo.
- Las pruebas fueron orientadas y básicas (payloads simples). No se realizó un crawler profundo, fuzzing de parámetros ni pruebas con vectores avanzados (event handlers, atributos, URI schemes, contexto JSON, etc.).

Conclusión
----------
Con las pruebas rápidas y limitadas ejecutadas contra http://web.dev.local:8082 no se identificó ninguna vulnerabilidad XSS explotable.

Recomendaciones
---------------
- Ejecutar un rastreo/crawl completo de la aplicación para descubrir endpoints ocultos y formularios (usar Burp, crawler o herramientas automáticas).
- Revisar cualquier punto que acepte entrada de usuario (formularios, parámetros GET/POST, headers) e implementar sanitización/escape contextual en el lado servidor.
- Volver a probar con payloads más complejos y encodings (URI encoding, eventos onerror/onload, atributos, context-specific encoding).

Registro de pruebas
-------------------
Comandos sugeridos (ejecución local) usados para reproducir las comprobaciones:
- curl -sS 'http://web.dev.local:8082/'
- curl -sS "http://web.dev.local:8082/?q=<script>alert(1)</script>"
- curl -sS "http://web.dev.local:8082/search?q=<script>alert(1)</script>"

Fin del informe.
