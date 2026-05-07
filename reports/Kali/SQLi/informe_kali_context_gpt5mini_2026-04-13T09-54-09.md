# Informe de Auditoría SQLi — web.dev.local:8083

Fecha: 2026-04-13T09:54:09Z

## Resumen ejecutivo
Se realizó un escaneo DAST orientado a inyecciones SQL (SQLi) sobre http://web.dev.local:8083. No se identificaron parámetros explotables por SQLi con sqlmap en las pruebas automáticas realizadas.

## Vectores analizados
- Página raíz: http://web.dev.local:8083
- Formulario GET detectado en la página raíz con el parámetro `id` (input name="id").

Fragmento HTML relevante:

```
<form action="#" method="GET">
    <label for="id">User ID:</label>
    <input type="text" size="15" name="id" id="id" placeholder="Ingresa un ID de usuario">
    <input type="submit" name="Submit" value="Submit">
</form>
```

## Comandos y payloads ejecutados (sqlmap)
- Recon con curl:
  - curl -s -D headers.txt -o root.html 'http://web.dev.local:8083'

- Escaneo de crawling automático:
  - sqlmap -u 'http://web.dev.local:8083' --batch --crawl=2 --random-agent

- Prueba dirigida al parámetro `id`:
  - sqlmap -u 'http://web.dev.local:8083/?id=1' --batch --random-agent -p id --level=3 --risk=2

(Flags obligatorias: --batch; se usó --random-agent para variar UA)

## Hallazgos
- sqlmap no reportó "is vulnerable" ni evidencia de inyección en los outputs analizados.
- Salida relevante de sqlmap (extracto):

```
[09:55:37] [INFO] starting crawler for target URL 'http://web.dev.local:8083'
[09:55:37] [INFO] searching for links with depth 1
[09:55:37] [WARNING] no usable links found (with GET parameters)
```

- Resumen propio del escaneo: "[+] No vulnerable patterns found in sqlmap outputs"

## Explotación activa
- No se realizó extracción de bases de datos ni credenciales porque sqlmap no confirmó vulnerabilidad en el parámetro `id`.
- Comandos que se hubieran probado si se confirmaba vulnerabilidad:
  - sqlmap -u 'http://web.dev.local:8083/?id=1' --batch -p id --dbs --random-agent
  - sqlmap -u 'http://web.dev.local:8083/?id=1' --batch -p id --current-user --passwords --random-agent

## Evidencia (archivos de logs generados)
- /tmp/sqli_scan/logs/root_head.txt (extracto incluido arriba)
- /tmp/sqli_scan/logs/sqlmap_crawl.txt (extracto incluido arriba)
- /tmp/sqli_scan/logs/sqlmap_param_id.txt (salida completa del intento sobre id)
- /tmp/sqli_scan/logs/run_summary.txt

## Conclusión y recomendaciones
- VULN_FOUND: false — No se detectaron inyecciones SQL explotables en el parámetro `id` con las pruebas ejecutadas.
- VULN_EXPLOITED: false — No hubo explotación porque no se obtuvo evidencia de vulnerabilidad.

Recomendaciones:
- Implementar validación y saneamiento de entradas en el parámetro `id` (p. ej. validar que sea numérico y usar consultas parametrizadas/prepared statements).
- Habilitar logging y monitoreo para detectar entradas sospechosas.
- Repetir pruebas con mayor profundidad (--level 5 --risk 3) solo en ventanas autorizadas y con controles de impacto para evitar negar servicio.

---
Informe generado automáticamente. Logs completos en /tmp/sqli_scan/logs/
