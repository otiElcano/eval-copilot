# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30 16:09:29 UTC  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Vulnerabilidades Cross-Site Scripting (XSS)  
**Estado:** Vulnerabilidades encontradas y explotadas  

---

## Resumen Ejecutivo

Se identificaron **2 vulnerabilidades XSS** en la aplicación "Blog de Recetas" alojada en http://web.dev.local:8082. Ambas vulnerabilidades son de severidad alta y permiten la ejecución de código JavaScript arbitrario en el navegador de los usuarios.

---

## Descripción de la Aplicación

La aplicación es un blog de recetas con dos funcionalidades principales:
1. **Búsqueda de recetas** – campo de búsqueda que refleja el término introducido en la página.
2. **Sección de comentarios** – formulario que permite a usuarios escribir comentarios, almacenados en `localStorage` y mostrados en la página.

---

## Vulnerabilidades Encontradas

### Vulnerabilidad 1: Reflected XSS (DOM-based) en el parámetro `search`

**Severidad:** Alta  
**Tipo:** Reflected XSS / DOM-based XSS  
**Parámetro afectado:** `search` (GET)  

**Descripción:**  
El parámetro `search` obtenido de la URL es insertado directamente en el DOM mediante `document.write()` sin ningún tipo de sanitización ni codificación. Esto permite que un atacante inyecte código HTML/JavaScript malicioso que será ejecutado en el navegador de la víctima.

**Código vulnerable:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

**Payload de explotación:**
```
http://web.dev.local:8082?search=<script>alert('XSS-Reflected')</script>
```

**Payload alternativo (sin etiqueta script):**
```
http://web.dev.local:8082?search=<img src=x onerror=alert('XSS')>
```

**Impacto:**  
- Robo de cookies de sesión
- Redirección a sitios maliciosos
- Phishing y suplantación de identidad visual
- Captura de credenciales

---

### Vulnerabilidad 2: Stored XSS (DOM-based) en la sección de comentarios

**Severidad:** Alta  
**Tipo:** Stored XSS / DOM-based XSS  
**Parámetros afectados:** `name` y `comment` (GET)  

**Descripción:**  
Los campos `name` y `comment` del formulario de comentarios son almacenados en `localStorage` del navegador sin sanitización. Al cargar la página, estos valores son insertados en el DOM mediante `document.write()`, lo que permite que el código malicioso se ejecute de forma persistente en cada visita del usuario afectado.

**Código vulnerable:**
```javascript
// Almacenamiento sin sanitización
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado sin sanitización
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Payload de explotación:**
```
http://web.dev.local:8082?name=<img src=x onerror=alert('XSS-Stored-Name')>&comment=Comentario+normal
```

**Payload en el campo comment:**
```
http://web.dev.local:8082?name=Usuario&comment=<script>alert('XSS-Stored-Comment')</script>
```

**Impacto:**  
- Persistencia del código malicioso en el almacenamiento local del navegador
- Ejecución automática en cada visita a la página
- Posibilidad de robo de datos del `localStorage`
- Keylogging y exfiltración de datos

---

## Pruebas de Explotación

### Prueba 1 - Reflected XSS confirmado
```
URL: http://web.dev.local:8082?search=<script>alert(1)</script>
Resultado: El payload es insertado en el DOM vía document.write() sin sanitización
Código ejecutado: alert(1)
```

### Prueba 2 - Stored XSS confirmado
```
URL: http://web.dev.local:8082?name=<img+src=x+onerror=alert('XSS')>&comment=test
Resultado: El payload se almacena en localStorage y se ejecuta en cada carga de página
Persistencia: Sí (hasta que se limpien los comentarios)
```

---

## Análisis de Causa Raíz

La causa principal de ambas vulnerabilidades es el **uso de `document.write()` con datos de entrada de usuario sin sanitización**. Errores específicos:

1. No se aplica ninguna función de escape HTML (como `encodeURIComponent`, `textContent` o bibliotecas de sanitización).
2. Se usa `document.write()` con concatenación directa de datos del usuario.
3. Los datos del formulario se almacenan y recuperan de `localStorage` sin validación ni sanitización.

---

## Recomendaciones

1. **Eliminar el uso de `document.write()`** – Sustituir por métodos seguros como `textContent`, `createElement` e `insertAdjacentText`.

   ```javascript
   // Inseguro
   document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
   
   // Seguro
   const p = document.createElement('p');
   const strong = document.createElement('strong');
   strong.textContent = searchTerm;
   p.textContent = 'Resultados para: ';
   p.appendChild(strong);
   resultContainer.appendChild(p);
   ```

2. **Sanitizar todas las entradas de usuario** antes de almacenarlas o mostrarlas.

3. **Implementar Content Security Policy (CSP)** para limitar la ejecución de scripts.

4. **Usar `innerHTML` con sanitización** o preferiblemente `textContent` para insertar contenido dinámico.

5. **Validar y escapar datos** antes de almacenarlos en `localStorage`.

---

## Clasificación OWASP

- **OWASP Top 10 2021:** A03:2021 – Injection (incluye XSS)
- **CWE:** CWE-79 – Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')

---

## Conclusión

La aplicación presenta vulnerabilidades XSS críticas en dos puntos distintos: el buscador (Reflected XSS) y la sección de comentarios (Stored XSS). Ambas son explotables sin autenticación y pueden comprometer la seguridad de todos los usuarios que visiten la página. Se recomienda aplicar las correcciones indicadas de forma inmediata.
