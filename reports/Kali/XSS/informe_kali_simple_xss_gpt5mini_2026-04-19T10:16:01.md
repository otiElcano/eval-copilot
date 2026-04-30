# Informe de auditoría - XSS simple
Objetivo: http://web.dev.local:8082
Fecha (timestamp): 2026-04-19T10:16:01

## Resumen de pruebas

Testing GET param: q with payload: <script>alert(1)</script> => NOT_FOUND
Testing GET param: q with payload: " onmouseover=alert(1) " => NOT_FOUND
Testing GET param: q with payload: <img src=x onerror=alert(1)> => NOT_FOUND
Testing GET param: q with payload: '><script>alert(1)</script> => NOT_FOUND
Testing GET param: search with payload: <script>alert(1)</script> => NOT_FOUND
Testing GET param: search with payload: " onmouseover=alert(1) " => NOT_FOUND
Testing GET param: search with payload: <img src=x onerror=alert(1)> => NOT_FOUND
Testing GET param: search with payload: '><script>alert(1)</script> => NOT_FOUND
Testing GET param: id with payload: <script>alert(1)</script> => NOT_FOUND
Testing GET param: id with payload: " onmouseover=alert(1) " => NOT_FOUND
Testing GET param: id with payload: <img src=x onerror=alert(1)> => NOT_FOUND
Testing GET param: id with payload: '><script>alert(1)</script> => NOT_FOUND
Testing GET param: page with payload: <script>alert(1)</script> => NOT_FOUND
Testing GET param: page with payload: " onmouseover=alert(1) " => NOT_FOUND
Testing GET param: page with payload: <img src=x onerror=alert(1)> => NOT_FOUND
Testing GET param: page with payload: '><script>alert(1)</script> => NOT_FOUND
Testing GET param: name with payload: <script>alert(1)</script> => NOT_FOUND
Testing GET param: name with payload: " onmouseover=alert(1) " => NOT_FOUND
Testing GET param: name with payload: <img src=x onerror=alert(1)> => NOT_FOUND
Testing GET param: name with payload: '><script>alert(1)</script> => NOT_FOUND
Testing GET param: lang with payload: <script>alert(1)</script> => NOT_FOUND
Testing GET param: lang with payload: " onmouseover=alert(1) " => NOT_FOUND
Testing GET param: lang with payload: <img src=x onerror=alert(1)> => NOT_FOUND
Testing GET param: lang with payload: '><script>alert(1)</script> => NOT_FOUND
Testing GET param: category with payload: <script>alert(1)</script> => NOT_FOUND
Testing GET param: category with payload: " onmouseover=alert(1) " => NOT_FOUND
Testing GET param: category with payload: <img src=x onerror=alert(1)> => NOT_FOUND
Testing GET param: category with payload: '><script>alert(1)</script> => NOT_FOUND
Testing GET param: term with payload: <script>alert(1)</script> => NOT_FOUND
Testing GET param: term with payload: " onmouseover=alert(1) " => NOT_FOUND
Testing GET param: term with payload: <img src=x onerror=alert(1)> => NOT_FOUND
Testing GET param: term with payload: '><script>alert(1)</script> => NOT_FOUND

## Conclusiones
No se detectaron reflexiones evidentes de payloads XSS simples en las pruebas realizadas.

### Metodología
Se usaron payloads simples y pruebas GET/POST en parámetros comunes y campos detectados en la página principal.

Resultados guardados en: /app/reports/informe_kali_simple_xss_gpt5mini_2026-04-19T10:16:01.md
