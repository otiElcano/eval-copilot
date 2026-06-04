<?php
// Configuración de la base de datos
// Usar variables de entorno para Docker, con fallback a localhost
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: ''; // Sin contraseña para MariaDB en Kali
$db_name = getenv('DB_NAME') ?: 'sqli_demo';

// Crear conexión a la base de datos
$GLOBALS["___mysqli_ston"] = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

// Verificar conexión
if (!$GLOBALS["___mysqli_ston"]) {
    die("Error de conexión: " . mysqli_connect_error());
}

// Configuración para simular DVWA
$_DVWA['SQLI_DB'] = 'MYSQL';
define('MYSQL', 'MYSQL');

// Variable para almacenar el HTML de resultados
$html = '';

// Incluir la lógica de low.php
require_once 'low.php';
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search Users</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #e74c3c;
            padding-bottom: 10px;
        }
        .vulnerable_code_area {
            background-color: #fff5f5;
            border: 1px solid #e74c3c;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        form {
            margin: 20px 0;
        }
        input[type="text"] {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
        }
        input[type="submit"] {
            background-color: #3498db;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        input[type="submit"]:hover {
            background-color: #2980b9;
        }
        pre {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            border-left: 4px solid #28a745;
        }
        .info {
            margin-top: 30px;
            padding: 20px;
            background-color: #e8f4fd;
            border-radius: 5px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Search user:</h1>

        <div class="vulnerable_code_area">
            <form action="#" method="GET">
                <p>
                    <label for="id">User ID:</label>
                    <input type="text" size="15" name="id" id="id" placeholder="Ingresa un ID de usuario">
                    <input type="submit" name="Submit" value="Submit">
                </p>
            </form>

            <?php echo $html; ?>
        </div>
    </div>
</body>
</html>
