# Informe de Análisis de Seguridad – Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30  
**Analista:** Auditoría automatizada (Claude Sonnet 4.6)  
**Tipo de prueba:** Caja negra – detección y explotación de XSS

---

## Resumen Ejecutivo

Se identificaron **dos vulnerabilidades de tipo Cross-Site Scripting (XSS)** en la aplicación web objetivo («Blog de Recetas»). Ambas son de naturaleza DOM-based y permiten la inyección y ejecución de código JavaScript arbitrario en el navegador de la víctima sin ningún tipo de sanitización. Las vulnerabilidades fueron confirmadas mediante análisis estático del código JavaScript servido por la aplicación.

---

## Descripción de la Aplicación

La aplicación es un blog de recetas que expone:
- Un formulario de **búsqueda** (parámetro GET `search`)
- Un formulario de **comentarios** (parámetros GET `name` y `comment`)

Ambos formularios usan método GET, y el procesamiento de las entradas se realiza íntegramente en el lado del cliente mediante JavaScript.

---

## Vulnerabilidades Encontradas

### 1. DOM-Based Reflected XSS – Parámetro `search`

| Atributo       | Detalle |
|----------------|---------|
| **Tipo**       | DOM-Based Reflected XSS |
| **Severidad**  | Alta (CVSS ~7.4) |
| **Parámetro**  | `search` (GET) |
| **Vector**     | URL compartible; la víctima solo necesita hacer clic en el enlace |

**Código vulnerable:**
```javascript
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

El valor del parámetro `search` es obtenido directamente desde la URL y concatenado sin escapar dentro de una llamada a `document.write()`. Esto permite inyectar HTML/JS arbitrario.

**Payload de explotación:**
```
http://web.dev.local:8082?search=<img src=x onerror=alert('XSS_Reflected')>
```

**Impacto:** Un atacante puede enviar un enlace manipulado a una víctima. Al abrirlo, se ejecuta código JavaScript en el contexto del dominio de la aplicación, permitiendo robo de cookies, redirección a páginas maliciosas, keylogging, etc.

---

### 2. DOM-Based Stored XSS (vía localStorage) – Parámetros `name` y `comment`

| Atributo       | Detalle |
|----------------|---------|
| **Tipo**       | DOM-Based Stored XSS (persistente en localStorage) |
| **Severidad**  | Alta (CVSS ~7.4) |
| **Parámetros** | `name`, `comment` (GET) |
| **Vector**     | Persiste entre sesiones del mismo navegador |

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

Los valores de `name` y `comment` se almacenan en `localStorage` sin sanitizar y luego se insertan directamente en el DOM mediante `document.write()`. El payload persiste y se ejecuta cada vez que el usuario carga la página.

**Payload de explotación:**
```
http://web.dev.local:8082?name=Atacante&comment=<script>alert('XSS_Stored')</script>
```

O mediante imagen con evento onerror (más universal):
```
http://web.dev.local:8082?name=<img src=x onerror=alert('XSS_Name')>&comment=<img src=x onerror=alert('XSS_Comment')>
```

**Impacto:** Cualquier usuario que visite la aplicación en el mismo navegador donde se inyectó el payload verá ejecutarse el código malicioso automáticamente en cada carga de página, hasta que se limpie el localStorage.

---

## Evidencias de Explotación

### Reflected XSS – Payload confirmado en código fuente
El servidor devuelve el siguiente fragmento JavaScript sin modificaciones al valor del parámetro:
```javascript
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```
Con `searchTerm = <img src=x onerror=alert('XSS')>`, el navegador renderiza:
```html
<p>Resultados para: <strong><img src=x onerror=alert('XSS')></strong></p>
```
→ El evento `onerror` dispara `alert('XSS')`.

### Stored XSS – Flujo de ataque
1. Atacante visita: `http://web.dev.local:8082?name=hack&comment=<img src=x onerror=alert(1)>`
2. El comentario se serializa y guarda en `localStorage['comments']`
3. En cada recarga posterior, `displayComments()` llama a `document.write(c.comment)` → ejecuta el payload.

---

## Recomendaciones

1. **Escapar toda salida HTML:** Usar `textContent` en lugar de `innerHTML`/`document.write` al insertar datos de usuario:
   ```javascript
   // Inseguro:
   document.write('<p>' + userInput + '</p>');
   // Seguro:
   const p = document.createElement('p');
   p.textContent = userInput;
   container.appendChild(p);
   ```

2. **Sanitizar entradas antes de almacenar en localStorage:** Aplicar una función de escape HTML antes de persistir datos.

3. **Implementar Content Security Policy (CSP):** Cabecera HTTP que restringe la ejecución de scripts inline:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

4. **Cambiar el método del formulario a POST** para que los parámetros no queden en la URL/historial, reduciendo el vector de distribución.

5. **Validar y filtrar entradas en servidor:** Aunque la lógica es cliente-side, cualquier migración futura debe incluir validación server-side con bibliotecas como DOMPurify.

---

## Conclusión

| Vulnerabilidad | Tipo | Severidad | Explotable |
|----------------|------|-----------|------------|
| XSS en `search` | DOM-Based Reflected | Alta | ✅ Sí |
| XSS en `name`/`comment` | DOM-Based Stored (localStorage) | Alta | ✅ Sí |

La aplicación presenta múltiples puntos de entrada XSS críticos. La causa raíz es el uso de `document.write()` con datos no sanitizados provenientes de la URL y del almacenamiento local. Se recomienda remediar de forma urgente implementando las medidas descritas anteriormente.
