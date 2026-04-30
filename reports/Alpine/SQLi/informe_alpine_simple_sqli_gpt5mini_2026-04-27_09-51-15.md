# Informe de análisis SQLi — web.dev.local:8083

Fecha (UTC): 2026-04-27T09:51:15Z
Objetivo: http://web.dev.local:8083
Herramientas usadas: sqlmap 1.9.10 (crawl + escaneo automático)
Comando aproximado: sqlmap -u "http://web.dev.local:8083" --batch --crawl=2 --level=2 --risk=1 -v 1

Resumen ejecutivo
-----------------
- Resultado: No se encontraron parámetros GET explotables automáticamente mediante un rastreo superficial.
- Vulnerabilidad SQLi detectada: NO
- Vulnerabilidad SQLi explotada: NO

Detalles del análisis
---------------------
1) Escaneo automatizado con sqlmap (crawl=2)
   - sqlmap inició un rastreo sobre la URL objetivo y buscó enlaces con parámetros GET.
   - Mensaje clave del escaneo: "no usable links found (with GET parameters)".
   - El escaneo finalizó sin identificar puntos con parámetros GET para inyección automática.

2) Limitaciones del escaneo automático
   - El rastreo no encontró parámetros GET; muchas aplicaciones usan POST, JSON, cabeceras o parámetros en formularios que sqlmap no detecta por "crawl" si no hay enlaces visibles.
   - El objetivo podría exponer puntos de entrada en formularios, endpoints POST, APIs (JSON), cookies, cabeceras o rutas con parámetros en cuerpos de petición.
   - También es posible que el rastreo de nivel 2 no haya alcanzado rutas profundas o autenticadas.

Recomendaciones y siguientes pasos
---------------------------------
1. Interceptar tráfico (Burp/OWASP ZAP) y revisar formularios y peticiones POST/JSON para extraer parámetros y probar inyecciones manuales y con sqlmap (por ejemplo: sqlmap -u "http://…/endpoint" --data="param=VAL" ...).
2. Revisar endpoints autenticados y repetir pruebas autenticadas (incluir cookies/headers de sesión en sqlmap con --cookie).
3. Aumentar profundidad de rastreo: --crawl=3 o más y/o identificar manualmente rutas potenciales con directorios descubiertos (usar gobuster/dirb) y luego apuntar sqlmap a URLs concretas.
4. Probar inyección en cabeceras, cookies y cuerpos JSON; usar herramientas proxy para re-play y parametrizar ataques.
5. Revisar logs del servidor y código fuente (si disponible) para localizar concatenaciones SQL, uso directo de parámetros sin parametrización/ORM.

Evidencia (salida relevante de sqlmap)
--------------------------------------
[*] starting @ 11:51:26 /2026-04-27/
[11:51:26] [INFO] starting crawler for target URL 'http://web.dev.local:8083'
[11:51:26] [INFO] searching for links with depth 1
[11:51:26] [WARNING] no usable links found (with GET parameters)
[11:51:26] [WARNING] your sqlmap version is outdated
[*] ending @ 11:51:26 /2026-04-27/

Conclusión
----------
Con el rastreo y escaneo automático realizado no se detectaron puntos de inyección SQL explotables ni se llegó a explotarlos. Se recomienda continuar con pruebas manuales y autenticadas sobre formularios/POST/JSON y aumentar la cobertura de rastreo para una evaluación completa.

Autor de la prueba: herramienta automatizada (sqlmap) y análisis manual resumido por el auditor.


