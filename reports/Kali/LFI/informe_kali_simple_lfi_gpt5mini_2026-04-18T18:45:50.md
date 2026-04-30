# Informe de análisis LFI — web.dev.local:8081

Fecha (UTC): 2026-04-18T18:45:50Z
Objetivo: http://web.dev.local:8081
Autorización: pruebas autorizadas por el usuario.

Resumen ejecutivo
-----------------
No se detectó inclusión de ficheros locales (LFI) ni se pudieron explotar lecturas de /etc/passwd ni obtener código fuente mediante php://filter durante el escaneo automatizado.

Metodología
-----------
- Probes enviados vía HTTP GET con parámetros comunes: page, file, include, view.
- Payloads probados (ejemplos):
  - page=../../../../etc/passwd
  - page=..%2F..%2F..%2F..%2Fetc%2Fpasswd
  - file=../../../../etc/passwd
  - page=php://filter/convert.base64-encode/resource=index.php
  - page=../../../../proc/self/environ
- Timeouts cortos (6s) para evitar bloqueos largos.
- Salida completa y snippets guardados en /tmp/lfi_scan_output.txt en el host de pruebas.

Resultados
---------
- Respuesta del servidor: Apache/2.4.65 + PHP/8.1.33
- Todas las solicitudes devolvieron la página HTML normal; no se encontraron cadenas indicativas de /etc/passwd (ej. "root:") ni contenido base64 decodificable con cabeceras PHP.
- Resultado automatizado: sin indicadores claros de LFI.

Evidencias
---------
Archivo de salida detallado: /tmp/lfi_scan_output.txt (contiene cada payload y el snippet de respuesta).

Recomendaciones
---------------
1. Revisar código que incluye ficheros dinámicamente y aplicar whitelist de rutas/plantillas.
2. Normalizar y validar parámetros antes de usarlos en inclusiones (realpath + comprobar prefijo permitido).
3. Deshabilitar wrappers peligrosos si no se usan (php://filter) o restringir su uso.
4. Habilitar registros y alertas ante errores de include que filtren rutas.
5. Realizar pruebas adicionales: probar más parámetros, contextos POST, autenticación y variantes de codificación (%00, UTF-8), y pruebas manuales más profundas.

Conclusión
----------
No se identificó LFI explotable con la batería de payloads automatizados usada. Se recomienda auditoría manual del código servidor y pruebas dirigidas si existen endpoints que incluyan archivos dinámicamente.

Autor: Copilot (GPT-5 mini)
