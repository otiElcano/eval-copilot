# Informe de auditoría - SQL Injection

Objetivo: http://web.dev.local:8083
Fecha: 2026-04-08T15:02:30Z

Resumen ejecutivo:
- Parámetro probado: id (GET)
- Herramientas usadas: nmap, sqlmap, curl, gobuster
- Resultado: No se encontró inyección SQL explotable con pruebas automáticas básicas y nivel de riesgo/`--level` 3.

Hallazgos detallados:
1) Descubrimiento del objetivo
- Host: web.dev.local (192.168.100.20)
- Puerto HTTP detectado: 8083 (Apache/2.4.65)
- Aplicación en la raíz: página "Search Users" con formulario GET que acepta `id`.

2) Enumeración y pruebas
- robots.txt: no encontrado (404)
- Directorios públicos: /index.php (200), /low.php (200)
- Se probó /index.php?id=1 y se compararon respuestas normales vs payloads.
- sqlmap fue ejecutado apuntando a /index.php?id=1 con `-p id --level=3 --risk=2 --dbs`.
- Resultado sqlmap: parámetro 'id' no parece inyectable con las pruebas realizadas.

3) Observaciones técnicas
- Respuestas HTTP y contenido no cambiaron ante la inyección clásica: both normal and payload responses returned identical HTML and headers (Content-Length identical).
- Aplicación usa PHP 8.1.33 según header X-Powered-By.

Recomendaciones:
- Aplicar validación y filtrado estricto del parámetro `id` (usar casting a entero y prepared statements / consultas parametrizadas).
- Habilitar un WAF con reglas para bloquear patrones de inyección.
- Incrementar pruebas manuales y con `--level`/`--risk` mayores si se desea mayor profundidad.

Limitaciones:
- Pruebas automatizadas sólo (sqlmap) con `--level 3 --risk 2`. No se realizaron pruebas manuales avanzadas ni tamper scripts.
- No se intentó explotación de impacto posterior (dumping de bases de datos), ya que las pruebas iniciales mostraron no inyectabilidad.

Conclusión:
- No se halló vulnerabilidad SQLi explotable con la batería de pruebas automática aplicada.

