/*
════════════════════════════════════════════════════════════════
  SCRIPTS – CLUB ATALAYA · SALESIANOS SANTANDER
  Archivo: js/scripts.js
════════════════════════════════════════════════════════════════
  Este archivo controla:
  - El menú móvil (hamburguesa)
  - El lightbox de PDFs (capa que aparece al abrir un PDF)
  - Los textos legales colapsables (Leer más / Leer menos)
  - La detección del embed de Instagram (y el fallback)
  - El año automático en el footer
════════════════════════════════════════════════════════════════
*/


/* ─────────────────────────────────────────────
   AÑO AUTOMÁTICO EN EL FOOTER
   ───────────────────────────────────────────── */
// Muestra el año actual sin tener que actualizarlo manualmente
var elAnio = document.getElementById('anioActual');
if (elAnio) {
  elAnio.textContent = new Date().getFullYear();
}


/* ─────────────────────────────────────────────
   MENÚ MÓVIL (HAMBURGUESA)
   ───────────────────────────────────────────── */

// Obtiene referencias al botón y al menú desplegable
var btnMenu   = document.getElementById('menuBtn');
var menuMovil = document.getElementById('menuMovil');

// Al hacer clic en el botón hamburguesa:
if (btnMenu && menuMovil) {
  btnMenu.addEventListener('click', function () {
    var estaAbierto = menuMovil.classList.contains('abierto');
    if (estaAbierto) {
      menuMovil.classList.remove('abierto');
      menuMovil.setAttribute('aria-hidden', 'true');
      btnMenu.setAttribute('aria-label', 'Abrir menú');
    } else {
      menuMovil.classList.add('abierto');
      menuMovil.setAttribute('aria-hidden', 'false');
      btnMenu.setAttribute('aria-label', 'Cerrar menú');
    }
  });
}

// Función para cerrar el menú (se llama desde los enlaces del menú móvil)
function cerrarMenu() {
  if (menuMovil) {
    menuMovil.classList.remove('abierto');
    menuMovil.setAttribute('aria-hidden', 'true');
  }
}


/* ─────────────────────────────────────────────
   LIGHTBOX DE PDFs
   ───────────────────────────────────────────── */

// Referencia al lightbox y al iframe del PDF
var lightbox   = document.getElementById('pdfLightbox');
var pdfFrame   = document.getElementById('pdfFrame');
var lightboxTitulo = document.getElementById('pdfLightboxTitulo');

/**
 * abrirPDF(url, titulo)
 * Abre la capa con el PDF incrustado.
 *
 * Para Google Drive: la URL compartida tiene este formato:
 *   https://drive.google.com/file/d/XXXXX/view?usp=sharing
 * Se transforma automáticamente a formato de previsualización embebida.
 *
 * Si la URL no es de Google Drive, se intenta cargar directamente.
 */
function abrirPDF(url, titulo) {
  if (!lightbox || !pdfFrame) return;

  // Nombre del documento en la cabecera del lightbox
  if (lightboxTitulo) {
    lightboxTitulo.textContent = titulo || 'Documento';
  }

  // Convierte URL de Google Drive a formato embebido
  var urlEmbed = url;
  if (url.indexOf('drive.google.com/file/d/') !== -1) {
    // Extrae el ID del archivo de Drive
    var match = url.match(/\/file\/d\/([^/]+)/);
    if (match && match[1]) {
      urlEmbed = 'https://drive.google.com/file/d/' + match[1] + '/preview';
    }
  }

  pdfFrame.src = urlEmbed;
  lightbox.classList.add('visible');

  // Impide que la página de fondo se desplace mientras el lightbox está abierto
  document.body.style.overflow = 'hidden';
}

/**
 * cerrarPDF()
 * Cierra la capa del PDF y limpia el iframe.
 */
function cerrarPDF() {
  if (!lightbox || !pdfFrame) return;
  lightbox.classList.remove('visible');
  pdfFrame.src = '';  // Detiene la carga del PDF
  document.body.style.overflow = '';  // Restaura el scroll
}

// Cerrar lightbox también al pulsar la tecla Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && lightbox && lightbox.classList.contains('visible')) {
    cerrarPDF();
  }
});


/* ─────────────────────────────────────────────
   TEXTOS LEGALES COLAPSABLES (LEER MÁS)
   ───────────────────────────────────────────── */

/*
  SOLUCIÓN: usamos clases CSS en vez del atributo "hidden"
  porque algunos navegadores tratan hidden como !important
  y el JS no puede sobreescribirlo.
  El bloque empieza con clase "oculto" y se añade/quita por JS.
*/
function toggleLegal(id) {
  var bloque = document.getElementById(id);
  var btnId  = id === 'denuncias' ? 'btnDenuncias' : 'btnDatos';
  var btn    = document.getElementById(btnId);
  if (!bloque || !btn) return;

  var estaOculto = bloque.classList.contains('oculto');

  if (estaOculto) {
    bloque.classList.remove('oculto');
    btn.textContent = 'Leer menos −';
    btn.setAttribute('aria-expanded', 'true');
  } else {
    bloque.classList.add('oculto');
    btn.textContent = 'Leer más +';
    btn.setAttribute('aria-expanded', 'false');
  }
}


/* ─────────────────────────────────────────────
   DETECCIÓN Y FALLBACK DE EMBEDS DE INSTAGRAM
   ───────────────────────────────────────────── */

/*
  Instagram suele bloquear los embeds en webs de terceros.
  Esta función comprueba, tras un tiempo de espera, si el embed
  se ha cargado correctamente. Si no, muestra la imagen de respaldo.
*/

/**
 * comprobarEmbedInstagram(idEmbed, idFallback)
 * @param {string} idEmbed    - ID del contenedor del embed
 * @param {string} idFallback - ID del enlace de respaldo
 */
function comprobarEmbedInstagram(idEmbed, idFallback) {
  var wrapper  = document.getElementById(idEmbed);
  var fallback = document.getElementById(idFallback);
  if (!wrapper || !fallback) return;

  // Espera 4 segundos para dar tiempo al script de Instagram
  setTimeout(function () {
    // Si no se ha generado un iframe dentro del embed, significa que falló
    var iframe = wrapper.querySelector('iframe');
    if (!iframe) {
      // Ocultar el bloque del embed y mostrar el fallback
      wrapper.style.display = 'none';
      fallback.classList.add('visible');
    }
  }, 4000);
}

// Comprobar los dos embeds: Oratorio y Centro Juvenil
comprobarEmbedInstagram('igOratorio', 'igOratorioFallback');
comprobarEmbedInstagram('igCJ',       'igCJFallback');

/*
  NOTA TÉCNICA: si Instagram sigue bloqueando el embed,
  la solución de respaldo es:
  1. Haz capturas de pantalla de los highlights de Instagram
  2. Guárdalas como:
       imagenes/secciones/oratorio-preview.jpg
       imagenes/secciones/centrojuvenil-preview.jpg
  3. Las tarjetas mostrarán esa imagen con un enlace a Instagram
*/



/* ─────────────────────────────────────────────
   INTEGRACIÓN CON EL WORKER (CARTELES Y PDFs)
   ─────────────────────────────────────────────
   Carga dinámicamente los carteles y comunicados
   desde el panel de administración del Worker.
   Si el Worker no tiene nada, se muestran los
   contenidos estáticos que ya había en el HTML.
   ───────────────────────────────────────────── */

var WORKER_URL = 'https://solitary-waterfall-4e04club-atalaya-api.clubatalaya-18e.workers.dev';

/* -- Carga los carteles activos -- */
function cargarCarteles() {
  fetch(WORKER_URL + '/api/carteles')
    .then(function(r) { return r.json(); })
    .then(function(cfg) {
      if (cfg.oratorio && cfg.oratorio.key) {
        var imgO = document.getElementById('cartelOratorio');
        if (imgO) {
          imgO.src = WORKER_URL + '/api/archivo/' + encodeURIComponent(cfg.oratorio.key);
          imgO.onerror = function() { this.parentElement.classList.add('cartel-vacio'); };
        }
      }
      if (cfg.centrojuvenil && cfg.centrojuvenil.key) {
        var imgC = document.getElementById('cartelCentroJuvenil');
        if (imgC) {
          imgC.src = WORKER_URL + '/api/archivo/' + encodeURIComponent(cfg.centrojuvenil.key);
          imgC.onerror = function() { this.parentElement.classList.add('cartel-vacio'); };
        }
      }
    })
    .catch(function() {
      /* Si falla el Worker, los carteles estáticos del HTML permanecen */
    });
}

/* -- Carga los comunicados PDF publicados -- */
function cargarComunicados() {
  fetch(WORKER_URL + '/api/comunicados')
    .then(function(r) { return r.json(); })
    .then(function(lista) {
      if (!lista.length) return; /* Sin PDFs: se muestran las tarjetas estáticas */
      var grid = document.getElementById('comunicadosGrid');
      if (!grid) return;
      /* Reemplaza las tarjetas estáticas con las del Worker */
      grid.innerHTML = '';
      lista.forEach(function(p) {
        var fecha = new Date(p.fecha).toLocaleDateString('es-ES', {
          day: '2-digit', month: 'long', year: 'numeric'
        });
        var url = WORKER_URL + '/api/archivo/' + encodeURIComponent(p.key);

        var art = document.createElement('article');
        art.className = 'pdf-tarjeta';
        art.innerHTML =
          '<div class="pdf-icono">' +
            '<svg viewBox="0 0 48 48" width="48" height="48" fill="none">' +
              '<rect width="48" height="48" rx="8" fill="#C8102E" opacity="0.12"/>' +
              '<path d="M14 8h14l10 10v22a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2z" fill="#C8102E" opacity="0.2" stroke="#C8102E" stroke-width="1.5"/>' +
              '<path d="M28 8v10h10" stroke="#C8102E" stroke-width="1.5" fill="none"/>' +
            '</svg>' +
          '</div>' +
          '<div class="pdf-info">' +
            '<h3 class="pdf-titulo">' + p.titulo + '</h3>' +
            '<p class="pdf-fecha"><time>' + fecha + '</time></p>' +
          '</div>';

        var btn = document.createElement('button');
        btn.className = 'pdf-tarjeta-btn';
        btn.textContent = 'Ver PDF';
        btn.setAttribute('aria-label', 'Ver ' + p.titulo);

        /* Closure para capturar url y titulo correctamente en el bucle */
        (function(u, t) {
          btn.onclick = function() { abrirPDF(u, t); };
          art.onclick = function(e) {
            if (!e.target.closest('button')) abrirPDF(u, t);
          };
        })(url, p.titulo);

        art.appendChild(btn);
        grid.appendChild(art);
      });
    })
    .catch(function() {
      /* Si falla el Worker, las tarjetas estáticas del HTML permanecen */
    });
}

/* Ejecutar al cargar la página */
cargarCarteles();
cargarComunicados();
