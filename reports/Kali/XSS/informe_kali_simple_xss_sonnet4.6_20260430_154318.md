# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30 15:43:18  
**Tipo de análisis:** Detección y explotación de vulnerabilidades XSS  
**Resultado general:** ✅ Vulnerabilidades XSS detectadas y confirmadas

---

## Resumen Ejecutivo

Se realizó un análisis de seguridad sobre la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`. Se identificaron **dos vulnerabilidades de tipo Cross-Site Scripting (XSS)** de naturaleza DOM-based, ambas explotables sin necesidad de interacción del servidor. Ninguno de los puntos de entrada aplica sanitización ni codificación de los valores recibidos antes de inyectarlos en el DOM a través de `document.write()`.

---

## Descripción de la Aplicación

La aplicación es un "Blog de Recetas" con dos funcionalidades principales:

1. **Buscador de recetas** — Recibe el parámetro `search` por GET y muestra los resultados.
2. **Sistema de comentarios** — Recibe `name` y `comment` por GET, los almacena en `localStorage` y los renderiza en la página.

Ambas funcionalidades procesan la entrada del usuario directamente en JavaScript del lado del cliente sin ningún tipo de validación o escape.

---

## Vulnerabilidades Identificadas

### CVE-1: DOM XSS Reflejado — Parámetro `search`

| Campo            | Detalle                                              |
|------------------|------------------------------------------------------|
| **Tipo**         | DOM-based XSS (Reflected)                            |
| **Parámetro**    | `search` (GET)                                       |
| **Severidad**    | Alta                                                 |
| **CVSS estimado**| 7.4 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)           |

#### Código vulnerable (línea 138 y 152)

```javascript
const searchTerm = urlParams.get('search');  // Entrada directa del usuario
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
// searchTerm se inyecta sin sanitización en document.write()
```

#### Vector de ataque

```
http://web.dev.local:8082/?search=<script>alert('XSS')</script>
http://web.dev.local:8082/?search=<img src=x onerror=alert(document.cookie)>
http://web.dev.local:8082/?search=</strong><svg onload=alert(1)><strong>
```

#### Impacto

- Ejecución de código JavaScript arbitrario en el contexto del navegador de la víctima.
- Robo de cookies de sesión (si existieran).
- Redirección a sitios maliciosos.
- Defacing de la página.
- El ataque se activa cuando la víctima accede a una URL maliciosa (p. ej., enviada por phishing).

---

### CVE-2: DOM XSS Almacenado (vía localStorage) — Parámetros `name` y `comment`

| Campo            | Detalle                                              |
|------------------|------------------------------------------------------|
| **Tipo**         | DOM-based XSS (Stored via localStorage)              |
| **Parámetros**   | `name` y `comment` (GET)                             |
| **Severidad**    | Alta                                                 |
| **CVSS estimado**| 7.6 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)           |

#### Código vulnerable (líneas 188–212)

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));  // Almacena sin sanitizar
}

// Al renderizar:
document.write('<div class="comment-author">' + c.name + '</div>');   // Sin escape
document.write('<div>' + c.comment + '</div>');                        // Sin escape
```

#### Vector de ataque

```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('Stored XSS')</script>
http://web.dev.local:8082/?name=<img src=x onerror=alert(1)>&comment=Hola
```

Una vez que el payload es almacenado en `localStorage`, se ejecuta **en cada carga de página** del navegador afectado, sin necesidad de volver a enviar el parámetro malicioso.

#### Impacto

- Persistencia del payload XSS en el navegador de la víctima (localStorage).
- Ejecución automática en cada visita posterior a la página.
- Mayor impacto que el XSS reflejado ya que no requiere que la víctima acceda a una URL especial tras el almacenamiento inicial.

---

## Prueba de Concepto (PoC)

### PoC 1 — Reflected XSS en buscador

**URL de ataque:**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS_Reflected')>
```

**Flujo de ejecución:**
1. La víctima accede a la URL maliciosa.
2. El navegador ejecuta el JavaScript de la página.
3. `urlParams.get('search')` devuelve `<img src=x onerror=alert('XSS_Reflected')>`.
4. `document.write(...)` inyecta el tag `<img>` en el DOM.
5. El atributo `onerror` se ejecuta al fallar la carga de la imagen.
6. Se ejecuta `alert('XSS_Reflected')`.

### PoC 2 — Stored XSS en comentarios

**URL de ataque:**
```
http://web.dev.local:8082/?name=Hacker&comment=<script>document.body.style.background='red';alert('Stored+XSS')</script>
```

**Flujo de ejecución:**
1. La víctima accede a la URL maliciosa.
2. El script almacena el comentario con payload en `localStorage`.
3. La página hace `window.location.href = window.location.pathname` (recarga limpia).
4. En la recarga, `displayComments()` lee el payload de `localStorage`.
5. `document.write('<div>' + c.comment + '</div>')` inyecta el `<script>` malicioso.
6. El payload se ejecuta. Se ejecutará en **cada visita futura** a la página.

---

## Análisis de Causa Raíz

La causa raíz de ambas vulnerabilidades es la misma: **ausencia de sanitización de la entrada del usuario antes de insertarla en el DOM**.

El uso de `document.write()` con concatenación directa de datos controlados por el usuario es una práctica insegura. Adicionalmente, el almacenamiento de datos no saneados en `localStorage` y su posterior renderizado crea un vector de ataque persistente.

---

## Recomendaciones

### 1. Usar `textContent` en lugar de `document.write()`/`innerHTML`

```javascript
// INSEGURO:
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

// SEGURO:
const p = document.createElement('p');
const strong = document.createElement('strong');
strong.textContent = searchTerm;  // Escapa automáticamente HTML
p.textContent = 'Resultados para: ';
p.appendChild(strong);
resultContainer.appendChild(p);
```

### 2. Sanitizar entradas antes de almacenar en localStorage

```javascript
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
// Sanitizar antes de guardar:
comments.push({ name: escapeHtml(name), comment: escapeHtml(comment), ... });
```

### 3. Implementar Content Security Policy (CSP)

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

Una CSP restrictiva mitigaría la ejecución de scripts inline y de fuentes externas.

### 4. Validar y limitar la entrada del lado del servidor

Aunque esta aplicación es completamente cliente-side, en un entorno real se recomienda validar y escapar datos tanto en cliente como en servidor.

---

## Conclusiones

| Vulnerabilidad           | Tipo              | Severidad | Explotable |
|--------------------------|-------------------|-----------|------------|
| XSS en `search`          | DOM XSS Reflected | Alta      | ✅ Sí      |
| XSS en `name`/`comment`  | DOM XSS Stored    | Alta      | ✅ Sí      |

La aplicación presenta vulnerabilidades XSS críticas en sus dos funcionalidades principales. Ambas son explotables de forma sencilla y sin autenticación. Se recomienda corregirlas de forma urgente siguiendo las recomendaciones indicadas.

---

*Informe generado automáticamente por análisis de seguridad web.*
