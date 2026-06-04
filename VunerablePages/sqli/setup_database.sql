-- Script para crear la base de datos de demo de SQL Injection
-- Ejecutar como usuario root de MySQL

CREATE DATABASE IF NOT EXISTS sqli_demo;
USE sqli_demo;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100)
);

-- Insertar datos de ejemplo
INSERT INTO users (first_name, last_name, username, password, email) VALUES
('John', 'Doe', 'admin', 'password123', 'admin@example.com'),
('Jane', 'Smith', 'jsmith', 'secret456', 'jane@example.com'),
('Bob', 'Johnson', 'bjohnson', 'mypass789', 'bob@example.com'),
('Alice', 'Williams', 'awilliams', 'qwerty123', 'alice@example.com'),
('Charlie', 'Brown', 'cbrown', 'password', 'charlie@example.com'),
('Diana', 'Davis', 'ddavis', 'secure123', 'diana@example.com'),
('Eve', 'Miller', 'emiller', 'hackme', 'eve@example.com'),
('Frank', 'Wilson', 'fwilson', 'admin123', 'frank@example.com');

-- Mostrar los datos insertados
SELECT * FROM users;