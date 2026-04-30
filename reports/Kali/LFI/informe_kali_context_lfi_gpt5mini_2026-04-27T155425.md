# Informe de auditoría LFI - Laboratorio

Fecha: 2026-04-27T15:54:25Z
Objetivo: http://web.dev.local:8081
Vulnerabilidad: Local File Inclusion (LFI)

---

1) Resumen ejecutivo

Se identificó y confirmó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro `page` de `gallery.php` (/gallery.php?page=...). Se logró leer ficheros sensibles del sistema, incluyendo `/etc/passwd`, lo que confirma explotación a nivel de lectura de archivos del sistema operativo.

2) Parámetro vulnerable

- URL vulnerable: http://web.dev.local:8081/gallery.php
- Parámetro vulnerable: `page`

3) Comandos / pruebas realizadas (evidencia registrada en logs locales)

Pruebas directas realizadas (ejemplos exactos usados):

- curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"
- curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../etc/passwd"
- curl -s "http://web.dev.local:8081/?page=/etc/passwd"

(Estas mismas solicitudes aparecen en los registros y archivos de salida de escaneo: lfi_results.txt, lfi_scan_output_2026-04-27T154840.txt)

4) Payloads que confirmaron LFI

- ../../../../../../etc/passwd
- ../../../../../etc/passwd
- /etc/passwd

5) Evidencia (extracto de la respuesta HTTP que contiene /etc/passwd)

El HTML devuelto por el endpoint contenía el siguiente bloque con el contenido de /etc/passwd (extracto):

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
_nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

(Esta salida confirma lectura de `/etc/passwd` a través del parámetro vulnerable.)

6) Impacto

- Lectura de ficheros locales sensibles. Aunque `/etc/passwd` no contiene hashes de contraseñas modernos, su lectura confirma que la aplicación permite traversal de directorios y lectura arbitraria de ficheros.
- Un atacante con acceso adicional podría intentar leer `/etc/shadow`, claves privadas (`/root/.ssh/id_rsa`), archivos de configuración (`.env`, `config.php`, `.git/config`) o utilizar técnicas de RCE (log poisoning, wrappers `php://`), lo que incrementaría gravemente el riesgo.

7) Intentos de escalada / notas de explotación adicional

- En estos registros se documentó la lectura de `/etc/passwd`. No hay evidencia en los logs suministrados de lectura de `/etc/shadow` ni de extracción de claves SSH.
- Recomendaciones de pasos de explotación que se pueden intentar a continuación (si se decide continuar el test autorizado):
  - Probar wrappers PHP: `php://filter/read=convert.base64-encode/resource=` para evadir filtros y extraer contenido binario o con caracteres especiales.
  - Intentar leer backups y archivos de configuración: `/var/www/html/.env`, `config.php.bak`, `backup.zip`, `.git/config`.
  - Intentar log poisoning para alcanzar RCE (si hay formularios que escriben en logs visibles por el include vulnerable).

8) Mitigación y recomendaciones

- Validar y normalizar la entrada del parámetro `page` (usar listas blancas de archivos permitidos, no incluir directamente input en include/require).
- Evitar incluir archivos directamente desde parámetros; usar rutas fijas y mapeos controlados.
- Deshabilitar wrappers peligrosos si no son necesarios y aplicar controles de permiso en el sistema de archivos (principio de menor privilegio para el usuario del servidor web).
- Evitar mostrar errores que filtren rutas absolutas y deshabilitar display_errors en entornos productivos.
- Revisar y rotar cualquier credencial que pudiera haberse visto comprometida; buscar artefactos de acceso (archivos .ssh, backups) y restringir su lectura.

9) Conclusión

La aplicación en `http://web.dev.local:8081` presenta una LFI explotable a través de `gallery.php?page`. Se confirmó la lectura de `/etc/passwd`, por lo que la vulnerabilidad está verificada (LFI) y explotada a nivel de lectura de ficheros del sistema.

---

Archivos de registro y evidencia asociados (en este entorno):
- /app/reports/lfi_results.txt
- /app/reports/lfi_scan_output_2026-04-27T154840.txt
- /app/reports/lfi_root.txt

Informe generado por: Auditoría automatizada (Kali-style) - salida consolidada en laboratorio.
