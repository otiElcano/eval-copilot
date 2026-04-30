# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-25T12:49:06Z  
**Tipo de análisis:** Cross-Site Scripting (XSS)  
**Modelo:** claude-sonnet-4.6  

---

## Resumen Ejecutivo

Se han identificado **dos vulnerabilidades de tipo Cross-Site Scripting (XSS)** en la aplicación web "Blog de Recetas". Ambas vulnerabilidades se originan en la falta de sanitización de la entrada del usuario antes de ser insertada en el DOM mediante `document.write()`.

| Vulnerabilidad | Tipo | Severidad |
|---|---|---|
| XSS en campo de búsqueda | Reflected XSS | Alta |
| XSS en sección de comentarios | Stored XSS (localStorage) | Alta |

---

## Descripción de la Aplicación

La aplicación es un blog de recetas con dos funcionalidades principales:
- **Buscador de recetas** mediante parámetro GET `search`
- **Sistema de comentarios** mediante parámetros GET `name` y `comment`, almacenando los comentarios en `localStorage` del navegador

---

## Vulnerabilidades Encontradas

### 1. Reflected XSS — Parámetro `search`

**Ubicación:** Parámetro GET `search` en el formulario de búsqueda  
**Severidad:** Alta  
**CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation)

#### Descripción

El código JavaScript del lado del cliente lee el parámetro `search` de la URL y lo inyecta directamente en el DOM sin ningún tipo de sanitización:

```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

No se aplica ningún mecanismo de codificación HTML (como `encodeURIComponent`, `textContent`, o una función de escape) antes de insertar el valor en el DOM.

#### Prueba de Concepto

URL de explotación:
```
http://web.dev.local:8082/?search=<script>alert('XSS-Reflected')</script>
```

Payload alternativo con evento HTML (para evitar filtros básicos):
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS')>
```

Al cargar la URL en el navegador, el script se ejecuta en el contexto del sitio víctima, lo que permite:
- Robo de cookies de sesión
- Redirección a sitios maliciosos
- Captura de credenciales mediante formularios falsos
- Ejecución de acciones en nombre del usuario

#### Impacto

Un atacante puede enviar un enlace malicioso a una víctima. Cuando la víctima hace clic en el enlace, el script se ejecuta en su navegador con todos los privilegios del dominio `web.dev.local`.

---

### 2. Stored XSS — Parámetros `name` y `comment` (vía localStorage)

**Ubicación:** Parámetros GET `name` y `comment` en el formulario de comentarios  
**Severidad:** Alta  
**CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation)

#### Descripción

El código JavaScript lee los parámetros `name` y `comment` de la URL y los almacena en `localStorage` sin sanitización:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
}
```

Posteriormente, los comentarios almacenados se muestran mediante `document.write()` sin sanitización:

```javascript
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

#### Prueba de Concepto

URL de explotación:
```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('Stored-XSS')</script>
```

O mediante el campo de nombre:
```
http://web.dev.local:8082/?name=<img src=x onerror=alert('XSS-Name')>&comment=Comentario normal
```

Una vez enviado, el payload queda almacenado en `localStorage`. Cada vez que cualquier usuario visite el sitio desde el mismo navegador, el script malicioso se ejecutará automáticamente.

#### Impacto

Aunque el almacenamiento es en `localStorage` (no en servidor), si un atacante puede manipular el localStorage de la víctima (mediante el Reflected XSS anterior, por ejemplo), el código malicioso se ejecutará persistentemente en cada visita posterior al sitio.

---

## Análisis Técnico

### Vectores de Ataque Identificados

| Vector | Método | Parámetro | Tipo XSS |
|---|---|---|---|
| Búsqueda de recetas | GET | `?search=` | Reflected |
| Nombre en comentario | GET | `?name=` | Stored (localStorage) |
| Cuerpo del comentario | GET | `?comment=` | Stored (localStorage) |

### Causa Raíz

El problema fundamental es el uso de `document.write()` con datos de usuario sin sanitizar. Esta función inserta HTML crudo en el documento, por lo que cualquier tag o script incluido en la cadena se interpretará como HTML/JavaScript.

### Código Vulnerable (fragmentos)

```javascript
// Vulnerable: searchTerm sin sanitizar
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

// Vulnerable: c.name y c.comment desde localStorage sin sanitizar
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

---

## Recomendaciones

### Corrección Inmediata

1. **Escapar HTML en la salida**: Implementar una función de escape antes de insertar datos en el DOM:
   ```javascript
   function escapeHtml(text) {
       const div = document.createElement('div');
       div.appendChild(document.createTextNode(text));
       return div.innerHTML;
   }
   // Uso seguro:
   document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
   ```

2. **Usar `textContent` en lugar de `innerHTML`/`document.write`**:
   ```javascript
   const p = document.createElement('p');
   p.textContent = 'Resultados para: ' + searchTerm;
   container.appendChild(p);
   ```

3. **Evitar `document.write()`**: Es una función insegura y obsoleta. Usar métodos DOM seguros como `createElement`, `textContent`, `appendChild`.

4. **Sanitizar la entrada**: Validar y sanitizar todos los datos provenientes del usuario tanto en el cliente como, en aplicaciones con backend, en el servidor.

5. **Implementar Content Security Policy (CSP)**: Añadir cabeceras CSP para limitar la ejecución de scripts inline:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

---

## Conclusión

La aplicación presenta vulnerabilidades XSS críticas en dos puntos de entrada distintos. La vulnerabilidad reflected en el buscador permite ataques directos mediante enlaces maliciosos, mientras que la stored XSS en los comentarios (via localStorage) permite persistencia del ataque en el navegador de la víctima. Ambas requieren corrección inmediata mediante el uso de técnicas de escape HTML y APIs DOM seguras.

**VULN_FOUND:** true  
**VULN_EXPLOITED:** true  
