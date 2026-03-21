/*
  SCRIPTS - CLUB ATALAYA v4
  - Slider de carteles por seccion (multiples por seccion)
  - 5 secciones de carteles
  - Comunicados: destacados + lista
  - Redes dinamicas
*/

/* ANo */
var elAnio = document.getElementById('anioActual');
if (elAnio) elAnio.textContent = new Date().getFullYear();

/* MENU MOVIL */
var btnMenu = document.getElementById('menuBtn');
var menuMovil = document.getElementById('menuMovil');
if (btnMenu && menuMovil) {
  btnMenu.addEventListener('click', function () {
    var open = menuMovil.classList.contains('abierto');
    menuMovil.classList[open ? 'remove' : 'add']('abierto');
    menuMovil.setAttribute('aria-hidden', open ? 'true' : 'false');
    btnMenu.setAttribute('aria-label', open ? 'Abrir menu' : 'Cerrar menu');
  });
}
function cerrarMenu() {
  if (menuMovil) { menuMovil.classList.remove('abierto'); menuMovil.setAttribute('aria-hidden', 'true'); }
}

/* LIGHTBOX PDF */
var lightbox = document.getElementById('pdfLightbox');
var pdfFrame = document.getElementById('pdfFrame');
var lightboxTitulo = document.getElementById('pdfLightboxTitulo');
function abrirPDF(url, titulo) {
  if (!lightbox || !pdfFrame) return;
  if (lightboxTitulo) lightboxTitulo.textContent = titulo || 'Documento';
  var urlEmbed = url;
  if (url.indexOf('drive.google.com/file/d/') !== -1) {
    var match = url.match(/\/file\/d\/([^\/]+)/);
    if (match && match[1]) urlEmbed = 'https://drive.google.com/file/d/' + match[1] + '/preview';
  }
  pdfFrame.src = urlEmbed;
  lightbox.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function cerrarPDF() {
  if (!lightbox || !pdfFrame) return;
  lightbox.classList.remove('visible');
  pdfFrame.src = '';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && lightbox && lightbox.classList.contains('visible')) cerrarPDF();
});

/* TEXTOS LEGALES */
function toggleLegal(id) {
  var bloque = document.getElementById(id);
  var btnId = id === 'denuncias' ? 'btnDenuncias' : 'btnDatos';
  var btn = document.getElementById(btnId);
  if (!bloque || !btn) return;
  var oculto = bloque.classList.contains('oculto');
  bloque.classList[oculto ? 'remove' : 'add']('oculto');
  btn.textContent = oculto ? 'Leer menos -' : 'Leer mas +';
  btn.setAttribute('aria-expanded', oculto ? 'true' : 'false');
}

/* WORKER */
var WORKER_URL = 'https://solitary-waterfall-4e04club-atalaya-api.clubatalaya-18e.workers.dev';

/* SLIDER DE CARTELES */
function crearSlider(contenedor, carteles) {
  if (!carteles || !carteles.length) return;
  if (carteles.length === 1) {
    var c = carteles[0];
    var url = WORKER_URL + '/api/archivo/' + encodeURIComponent(c.key);
    var img = document.createElement('img');
    img.src = url; img.alt = 'Cartel'; img.className = 'cartel-imagen';
    img.onerror = function () { contenedor.classList.add('cartel-vacio'); };
    if (c.enlace) {
      var a = document.createElement('a');
      a.href = c.enlace; a.target = '_blank'; a.rel = 'noopener'; a.className = 'cartel-enlace';
      a.appendChild(img); contenedor.appendChild(a);
    } else { contenedor.appendChild(img); }
    return;
  }
  contenedor.style.position = 'relative'; contenedor.style.overflow = 'hidden';
  var track = document.createElement('div');
  track.style.cssText = 'display:flex;transition:transform .4s ease;will-change:transform';
  carteles.forEach(function (c) {
    var slide = document.createElement('div'); slide.style.cssText = 'min-width:100%;position:relative';
    var url = WORKER_URL + '/api/archivo/' + encodeURIComponent(c.key);
    var img = document.createElement('img');
    img.src = url; img.alt = 'Cartel'; img.className = 'cartel-imagen'; img.style.width = '100%';
    img.onerror = function () { slide.style.display = 'none'; };
    if (c.enlace) {
      var a = document.createElement('a'); a.href = c.enlace; a.target = '_blank'; a.rel = 'noopener';
      a.appendChild(img); slide.appendChild(a);
    } else { slide.appendChild(img); }
    track.appendChild(slide);
  });
  contenedor.appendChild(track);
  var btnStyle = 'position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.45);color:#fff;border:none;border-radius:50%;width:30px;height:30px;font-size:1rem;cursor:pointer;z-index:5;display:flex;align-items:center;justify-content:center;';
  var prev = document.createElement('button'); prev.innerHTML = '&#8249;'; prev.setAttribute('aria-label','Anterior'); prev.style.cssText = btnStyle + 'left:6px';
  var next = document.createElement('button'); next.innerHTML = '&#8250;'; next.setAttribute('aria-label','Siguiente'); next.style.cssText = btnStyle + 'right:6px';
  var dots = document.createElement('div'); dots.style.cssText = 'position:absolute;bottom:6px;left:0;right:0;display:flex;justify-content:center;gap:5px;z-index:5';
  carteles.forEach(function (_, i) {
    var dot = document.createElement('span');
    dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,' + (i===0?'1':'.5') + ');display:inline-block;cursor:pointer';
    dots.appendChild(dot);
  });
  var current = 0;
  function goTo(idx) {
    current = (idx + carteles.length) % carteles.length;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    Array.from(dots.children).forEach(function (d, i) { d.style.background = 'rgba(255,255,255,' + (i===current?'1':'.5') + ')'; });
  }
  prev.onclick = function () { goTo(current - 1); };
  next.onclick = function () { goTo(current + 1); };
  Array.from(dots.children).forEach(function (d, i) { d.onclick = function () { goTo(i); }; });
  var timer = setInterval(function () { goTo(current + 1); }, 5000);
  contenedor.addEventListener('mouseenter', function () { clearInterval(timer); });
  contenedor.addEventListener('mouseleave', function () { timer = setInterval(function () { goTo(current + 1); }, 5000); });
  contenedor.appendChild(prev); contenedor.appendChild(next); contenedor.appendChild(dots);
}

function cargarCarteles() {
  fetch(WORKER_URL + '/api/carteles')
    .then(function (r) { return r.json(); })
    .then(function (cfg) {
      ['oratorio','centrojuvenil'].forEach(function(sec){
        var idImg = sec==='oratorio'?'cartelOratorio':'cartelCentroJuvenil';
        var imgEl = document.getElementById(idImg);
        if (!imgEl) return;
        var carteles = cfg[sec] || [];
        if (!carteles.length) return;
        var contenedor = imgEl.parentElement;
        if (carteles.length > 1) { imgEl.style.display='none'; crearSlider(contenedor, carteles); }
        else {
          imgEl.src = WORKER_URL+'/api/archivo/'+encodeURIComponent(carteles[0].key);
          if (carteles[0].enlace) {
            var a=document.createElement('a'); a.href=carteles[0].enlace; a.target='_blank'; a.rel='noopener';
            imgEl.parentNode.insertBefore(a,imgEl); a.appendChild(imgEl);
          }
        }
      });
      ['somalo','musicales','catecumenado'].forEach(function(sec){
        var wrapper = document.getElementById('slider-'+sec);
        if (!wrapper) return;
        var carteles = cfg[sec] || [];
        if (!carteles.length) { wrapper.style.display='none'; return; }
        wrapper.style.display='block';
        crearSlider(wrapper, carteles);
      });
    }).catch(function(){});
}

function cargarComunicados() {
  fetch(WORKER_URL + '/api/comunicados')
    .then(function(r){return r.json();})
    .then(function(lista){
      var destacados=lista.filter(function(p){return p.modo==='destacado';});
      var enLista=lista.filter(function(p){return p.modo==='lista';});
      var grid=document.getElementById('comunicadosGrid');
      var listaEl=document.getElementById('comunicadosLista');
      if(grid&&destacados.length){
        grid.innerHTML='';
        destacados.forEach(function(p){
          var fecha=new Date(p.fecha).toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'});
          var url=WORKER_URL+'/api/archivo/'+encodeURIComponent(p.key);
          var art=document.createElement('article');art.className='pdf-tarjeta';art.style.cursor='pointer';
          art.innerHTML='<div class="pdf-icono"><svg viewBox="0 0 48 48" width="48" height="48" fill="none"><rect width="48" height="48" rx="8" fill="#C8102E" opacity="0.12"/><path d="M14 8h14l10 10v22a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2z" fill="#C8102E" opacity="0.2" stroke="#C8102E" stroke-width="1.5"/><path d="M28 8v10h10" stroke="#C8102E" stroke-width="1.5" fill="none"/></svg></div><div class="pdf-info"><h3 class="pdf-titulo">'+p.titulo+'</h3><p class="pdf-fecha"><time>'+fecha+'</time></p></div>';
          var btn=document.createElement('button');btn.className='pdf-tarjeta-btn';btn.textContent='Ver PDF';
          (function(u,t){btn.onclick=function(e){e.stopPropagation();abrirPDF(u,t);};art.onclick=function(){abrirPDF(u,t);};})(url,p.titulo);
          art.appendChild(btn);grid.appendChild(art);
        });
      }
      if(listaEl&&enLista.length){
        listaEl.style.display='block';
        var ul=listaEl.querySelector('ul')||document.createElement('ul');
        ul.innerHTML='';ul.style.cssText='list-style:none;padding:0;margin:0';
        enLista.forEach(function(p){
          var url=WORKER_URL+'/api/archivo/'+encodeURIComponent(p.key);
          var fecha=new Date(p.fecha).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'});
          var li=document.createElement('li');li.style.cssText='padding:8px 0;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px';
          li.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><a href="'+url+'" target="_blank" style="color:#27a49b;font-weight:600;text-decoration:none;flex:1">'+p.titulo+'</a><span style="font-size:.78rem;color:#aaa">'+fecha+'</span>';
          ul.appendChild(li);
        });
        if(!listaEl.querySelector('ul'))listaEl.appendChild(ul);
      } else if(listaEl){listaEl.style.display='none';}
    }).catch(function(){});
}

function cargarRedes(){
  fetch(WORKER_URL+'/api/redes').then(function(r){return r.json();}).then(function(redes){
    if(!redes||!redes.length)return;
    var cont=document.getElementById('redesSociales');
    if(!cont)return;
    cont.innerHTML='';
    var SVG={
      instagram:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
      facebook:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
      flickr:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M5.334 6.666C2.39 6.666 0 9.057 0 12s2.39 5.334 5.334 5.334c2.942 0 5.332-2.39 5.332-5.334 0-2.942-2.39-5.334-5.332-5.334zm13.332 0c-2.942 0-5.332 2.392-5.332 5.334 0 2.944 2.39 5.334 5.332 5.334C21.61 17.334 24 14.944 24 12c0-2.943-2.39-5.334-5.334-5.334z"/></svg>',
      whatsapp:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
      web:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
      otro:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>'
    };
    redes.forEach(function(r){
      var a=document.createElement('a');a.href=r.url;a.target='_blank';a.rel='noopener';
      a.className='red-social-icono';a.setAttribute('aria-label',r.nombre);
      var circulo=document.createElement('div');circulo.className='rsi-circulo rsi-'+(r.icono||'otro');
      circulo.innerHTML=(SVG[r.icono]||SVG.otro)+'<span class="rsi-etiqueta">'+r.nombre+'</span>';
      var nombre=document.createElement('span');nombre.className='rsi-nombre';nombre.textContent=r.nombre;
      a.appendChild(circulo);a.appendChild(nombre);cont.appendChild(a);
    });
  }).catch(function(){});
}

function comprobarEmbedInstagram(idEmbed,idFallback){
  var w=document.getElementById(idEmbed),f=document.getElementById(idFallback);
  if(!w||!f)return;
  setTimeout(function(){if(!w.querySelector('iframe')){w.style.display='none';f.classList.add('visible');}},4000);
}
comprobarEmbedInstagram('igOratorio','igOratorioFallback');
comprobarEmbedInstagram('igCJ','igCJFallback');

cargarCarteles();
cargarComunicados();
cargarRedes();