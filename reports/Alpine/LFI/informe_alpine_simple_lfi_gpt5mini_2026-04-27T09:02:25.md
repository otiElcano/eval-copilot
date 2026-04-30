# Informe de análisis LFI - 2026-04-27T09:02:25Z

Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Se realizaron peticiones GET con parámetros comunes para LFI (file, page, template, view) apuntando a /etc/passwd y variantes con null byte.
- Ninguna respuesta mostró contenido de /etc/passwd o archivos del sistema; la salida de las peticiones devolvió la página principal sin incluir contenido del archivo objetivo.

Detalles de pruebas:
- GET /                       -> Página principal (código HTML de la galería)
- GET /?file=../../../../etc/passwd -> Página principal, no hay inclusión
- GET /index.php?page=../../../../etc/passwd -> Página principal, no hay inclusión
- GET /?page=../../../../etc/passwd%00 -> Página principal, no hay inclusión
- GET /?template=../../../../etc/passwd -> Página principal, no hay inclusión
- GET /?view=../../../../etc/passwd -> Página principal, no hay inclusión

Conclusión:
- No se encontró vulnerabilidad LFI con las rutas y payloads probados.

Recomendaciones:
- Revisar el código servidor para asegurar que no hay inclusion dinámicas basadas en parámetros sin validación.
- Implementar listas blancas de ficheros/plantillas y sanitizar/normalizar entradas de archivo.
- Restringir accesos y deshabilitar funciones de inclusión si no son necesarias.

Fecha de análisis: 2026-04-27T09:02:25Z
