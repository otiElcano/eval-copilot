# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30 16:16:40  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Cross-Site Scripting (XSS)  
**Analista:** Automated Security Audit

---

## Resumen Ejecutivo

Se identificaron **dos vulnerabilidades Cross-Site Scripting (XSS)** en la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`. Ambas vulnerabilidades son de severidad **Alta** y permiten la inyección y ejecución de código JavaScript arbitrario en el contexto del navegador de la víctima.

---

## Descripción de la Aplicación

La aplicación web es un Blog de Recetas que presenta:
- Un módulo de búsqueda de recetas (parámetro GET `search`)
- Un módulo de comentarios con formulario (parámetros GET `name` y `comment`)

Toda la lógica de renderizado se realiza en el lado del cliente mediante JavaScript y la función `document.write()`, sin ningún tipo de sanitización de entradas.

---

## Vulnerabilidades Encontradas

### VUL-001: Reflected XSS en el parámetro `search`

| Campo | Detalle |
|-------|---------|
| **Tipo** | Cross-Site Scripting Reflejado (Reflected XSS) |
| **Severidad** | Alta |
| **Parámetro afectado** | `search` (método GET) |
| **URL vulnerable** | `http://web.dev.local:8082/?search=<PAYLOAD>` |
| **CVSS v3** | 7.4 (Alto) |

**Descripción:**  
El parámetro `search` de la URL es leído directamente mediante `URLSearchParams` y volcado sin ningún tipo de codificación o filtrado en el DOM a través de `document.write()`. El código vulnerable es:

```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

**Prueba de concepto (PoC):**

```
http://web.dev.local:8082/?search=<script>alert(document.cookie)</script>
```

```
http://web.dev.local:8082/?search=<img src=x onerror=alert(1)>
```

**Impacto:**  
Un atacante puede distribuir una URL maliciosa que, al ser visitada por la víctima, ejecuta código JavaScript arbitrario en el contexto del navegador. Esto permite:
- Robo de cookies de sesión
- Redirección a sitios maliciosos
- Captura de credenciales
- Defacement de la página

---

### VUL-002: Stored XSS en el módulo de comentarios

| Campo | Detalle |
|-------|---------|
| **Tipo** | Cross-Site Scripting Almacenado (Stored XSS) |
| **Severidad** | Alta |
| **Parámetros afectados** | `name`, `comment` (método GET) |
| **URL vulnerable** | `http://web.dev.local:8082/?name=<PAYLOAD>&comment=<PAYLOAD>` |
| **CVSS v3** | 8.2 (Alto) |

**Descripción:**  
Los parámetros `name` y `comment` son almacenados directamente en `localStorage` del navegador sin sanitización y posteriormente renderizados sin codificación mediante `document.write()`. El código vulnerable es:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

// Se almacena sin sanitización
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Se muestra sin sanitización
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Prueba de concepto (PoC):**

```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert(document.cookie)</script>
```

```
http://web.dev.local:8082/?name=<img src=x onerror=alert('XSS en nombre')>&comment=Comentario normal
```

**Impacto:**  
El payload inyectado queda almacenado en `localStorage` y se ejecuta **cada vez que el usuario visita la página**, incluso tras recargarla. Aunque el almacenamiento es local al navegador del usuario que lo introduce, en un contexto multi-usuario compartido (kiosks, equipos compartidos) esto podría afectar a otros usuarios.

---

## Explotación Realizada

### Explotación de VUL-001 (Reflected XSS)

**Payload utilizado:**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert(document.cookie)>
```

**Mecanismo:** El valor del parámetro `search` es descodificado por `URLSearchParams` y escrito directamente en el DOM mediante `document.write()`, interpretando las etiquetas HTML y ejecutando el código JavaScript asociado.

**Resultado:** El navegador ejecuta `alert(document.cookie)` al procesar la etiqueta `<img>` con el evento `onerror`.

### Explotación de VUL-002 (Stored XSS)

**Payload utilizado:**
```
http://web.dev.local:8082/?name=Hacker&comment=<script>alert('XSS%20Almacenado')</script>
```

**Mecanismo:** El comentario malicioso es almacenado en `localStorage`. En cada visita posterior a la página, el script `displayComments()` vuelca el contenido sin sanitizar mediante `document.write()`, ejecutando el JavaScript inyectado.

**Resultado:** El payload se ejecuta persistentemente en cada carga de la página hasta que se limpian los comentarios.

---

## Recomendaciones

### Mitigación Inmediata

1. **Escapar salidas HTML:** Utilizar funciones de escape antes de insertar datos en el DOM:

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// En lugar de:
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

// Usar:
document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
```

2. **Evitar `document.write()`:** Reemplazar por manipulación segura del DOM:

```javascript
const resultDiv = document.createElement('div');
const p = document.createElement('p');
p.textContent = 'Resultados para: ' + searchTerm; // textContent escapa automáticamente
resultDiv.appendChild(p);
document.getElementById('search-results').appendChild(resultDiv);
```

3. **Implementar Content Security Policy (CSP):**

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self';">
```

### Mitigaciones a Largo Plazo

- Implementar validación de entradas tanto en cliente como en servidor
- Migrar el almacenamiento de comentarios a un backend con base de datos y sanitización server-side
- Utilizar frameworks modernos (React, Vue, Angular) que escapan el contenido por defecto
- Realizar auditorías de seguridad periódicas
- Implementar un WAF (Web Application Firewall)

---

## Conclusión

La aplicación presenta vulnerabilidades XSS críticas tanto de tipo reflejado como almacenado, originadas por el uso directo de datos no sanitizados en `document.write()`. Se recomienda corregir estas vulnerabilidades de inmediato, ya que representan un riesgo significativo para los usuarios de la aplicación.

| Vulnerabilidad | Tipo | Severidad | Estado |
|----------------|------|-----------|--------|
| VUL-001: `search` param | Reflected XSS | Alta | ⚠️ Explotable |
| VUL-002: `comment`/`name` params | Stored XSS | Alta | ⚠️ Explotable |

---

*Informe generado automáticamente por análisis de seguridad - 2026-04-30*
