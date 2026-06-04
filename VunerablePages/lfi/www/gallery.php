<?php

$page = $_GET['page'] ?? 'modern';

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería - <?php echo htmlspecialchars($page); ?></title>
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
            <?php
            // Check if the page parameter contains file extension
            if (strpos($page, '.') !== false) {
                // If it has an extension, use it as-is 
                $file = $page;
            } else {
                // Otherwise, assume it's a page in the pages directory
                $file = "pages/" . $page . ".php";
            }

            if (file_exists($file)) {
                include($file);
            } else {
                echo "<div class='error'>";
                echo "<h3>Página no encontrada</h3>";
                echo "<p>El archivo solicitado no existe: " . htmlspecialchars($file) . "</p>";
                echo "</div>";
                // Try to include anyway
                @include($file);
            }
            ?>
        </div>
        <footer>
            <p>&copy; 2025 Galería de Arte Virtual | Laboratorio de Seguridad</p>
        </footer>
    </div>
</body>
</html>
