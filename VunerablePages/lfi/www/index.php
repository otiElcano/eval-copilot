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
