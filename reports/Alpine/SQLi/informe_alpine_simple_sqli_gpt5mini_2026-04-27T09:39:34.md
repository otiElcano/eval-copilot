Informe de análisis SQLi — objetivo: http://web.dev.local:8083
Fecha: 2026-04-27T09:39:34Z
Herramienta: sqlmap 1.9.10 (escaneo automatizado)

Resumen ejecutivo
- VULN_FOUND: false
- VULN_EXPLOITED: false

Metodología
Se ejecutó sqlmap contra la URL objetivo para detectar inyecciones SQL en parámetros HTTP habituales y cabeceras (User-Agent, Referer). Opciones utilizadas: --batch --level=3 --risk=2.

Resultados
- sqlmap no detectó parámetros inyectables. Durante el escaneo se probaron técnicas boolean-based blind, error-based, time-based y UNION/stacked queries.
- Parámetros/cabeceras probadas explícitamente: User-Agent (no inyectable), Referer (no inyectable).
- Mensaje relevante de sqlmap: "all tested parameters do not appear to be injectable". Se recomendó aumentar --level/--risk o emplear tamper scripts si se sospecha de WAF.

Salida (fragmento relevante)
[CRITICAL] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent'

Recomendaciones
1. Revisar logs del servidor y parámetros POST/GET manualmente para identificar entradas que sqlmap pueda haber pasado por alto (formularios, parámetros JSON, cabeceras personalizadas).
2. Aumentar temporalmente --level y --risk y ejecutar sqlmap con --random-agent; si existe un WAF, probar tamper scripts adecuados.
3. Realizar pruebas manuales dirigidas sobre formularios y puntos de entrada que acepten datos del usuario (inputs, cookies, cabeceras personalizadas).
4. Como medidas de mitigación permanentes: usar consultas parametrizadas (prepared statements), ORM con escaping, y validar/sanitizar entradas en el servidor.

Conclusión
No se encontró evidencia automatizada de SQL Injection en el objetivo con el nivel de pruebas ejecutadas. Si se desea una mayor profundidad, ejecutar pruebas adicionales con mayor nivel/riesgo y técnicas tampering/manuales.

Anexos
- Comando ejecutado: sqlmap -u "http://web.dev.local:8083" --batch --level=3 --risk=2
- Output completo disponible bajo petición.
