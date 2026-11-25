/* ============================================================
   Special Home — سبيشل هوم | script.js
   3D cube · 360° tour · tilt cards · counters · filters · forms
   ============================================================ */
(function () {
  'use strict';

  var WHATSAPP = '201001234567'; // رقم الواتساب (يُستبدل برقم الشركة)
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- Header / Nav ---------------- */
  var header = $('#siteHeader');
  var nav = $('#mainNav');
  var navToggle = $('#navToggle');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 30);
    var toTop = $('#toTop');
    if (toTop) toTop.classList.toggle('show', window.scrollY > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      navToggle.classList.toggle('is-open');
    });
    $$('.nav-link', nav).forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  var toTop = $('#toTop');
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Reveal on scroll (AOS) ---------------- */
  if (window.AOS) {
    AOS.init({ duration: 750, easing: 'ease-out-cubic', once: true, offset: 80, delay: 60 });
  }

  /* ---------------- Animated counters ---------------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var dur = 1800;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('.counter');
  if (counters.length && 'IntersectionObserver' in window) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCounter(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cObs.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute('data-target'); });
  }

  /* ---------------- 3D tilt property cards ---------------- */
  $$('.property-card').forEach(function (card) {
    var inner = $('.card-inner', card) || card;
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      var rx = (0.5 - py) * 10;
      var ry = (px - 0.5) * 12;
      inner.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(14px)';
      var mx = (px * 100).toFixed(1);
      var my = (py * 100).toFixed(1);
      card.style.boxShadow = 'calc(' + (0.5 - px) * 34 + 'px) calc(' + (0.65 - py) * 30 + 'px) 46px rgba(15,23,42,.20)';
      card.style.backgroundImage = 'radial-gradient(600px circle at ' + mx + '% ' + my + '%, rgba(26,86,219,.07), transparent 45%)';
    });
    card.addEventListener('mouseleave', function () {
      inner.style.transform = '';
      card.style.boxShadow = '';
      card.style.backgroundImage = '';
    });
  });

  /* ---------------- Hero 3D Cube (Cairo Skyline) ---------------- */
  function initCube() {
    var canvas = document.getElementById('heroCube');
    if (!canvas || !window.THREE) return;

    var stage = canvas.parentElement;
    var W = function () { return stage.clientWidth; };
    var H = function () { return stage.clientHeight; };

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (err) { showCubeFallback(stage); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W(), H(), false);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 100);
    camera.position.set(0, 0, 7.4);

    var faces = [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=700&q=70',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=700&q=70',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=700&q=70',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=70',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=70',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=700&q=70'
    ];
    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    var mats = faces.map(function (url, i) {
      var mat = new THREE.MeshBasicMaterial({ color: [0x1a56db, 0x0d9488, 0xd97706][i % 3] });
      loader.load(url, function (tex) {
        tex.colorSpace = THREE.SRGBColorSpace || undefined;
        mat.map = tex;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;
      }, undefined, function () { /*保持着色器渐变 كخلفية */ });
      return mat;
    });

    var cube = new THREE.Mesh(new THREE.BoxGeometry(3.3, 3.3, 3.3), mats);
    scene.add(cube);

    // حدود مضيئة
    var edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(3.34, 3.34, 3.34)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
    );
    cube.add(edges);

    // جزيئات خلفية
    var pGeo = new THREE.BufferGeometry();
    var count = 180, pos = new Float32Array(count * 3);
    for (var i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 26;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x9fd6ff, size: 0.07, transparent: true, opacity: 0.65 }));
    scene.add(particles);

    var targetRX = 0, targetRY = 0;
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      targetRY = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
      targetRX = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
    });
    stage.addEventListener('pointerleave', function () { targetRX = 0; targetRY = 0; });

    var last = performance.now();
    var AUTO_PERIOD = 20; // دورة كاملة كل 20 ثانية
    function loop(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      cube.rotation.y += (Math.PI * 2 / AUTO_PERIOD) * dt + targetRY * dt * 1.6;
      cube.rotation.x += (targetRX * 0.9 - cube.rotation.x) * Math.min(dt * 3.4, 1);
      particles.rotation.y += dt * 0.035;
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    function resize() {
      renderer.setSize(W(), H(), false);
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  }

  function showCubeFallback(stage) {
    var fb = document.createElement('div');
    fb.className = 'cube-fallback';
    fb.style.backgroundImage = 'linear-gradient(rgba(6,15,36,.55), rgba(6,15,36,.75)), url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=70)';
    fb.textContent = 'مشاريع Special Home';
    stage.appendChild(fb);
  }

  /* ---------------- Testimonials / Swiper ---------------- */
  if (window.Swiper) {
    if ($('#testiSwiper')) {
      new Swiper('#testiSwiper', {
        slidesPerView: 1,
        spaceBetween: 22,
        loop: true,
        autoplay: { delay: 4200, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: { 760: { slidesPerView: 2 }, 1040: { slidesPerView: 3 } }
      });
    }
    if ($('#galSwiper')) {
      new Swiper('#galSwiper', {
        slidesPerView: 1.15,
        spaceBetween: 16,
        loop: true,
        pagination: { el: '.swiper-pagination', clickable: true },
        breakpoints: { 640: { slidesPerView: 2.2 }, 980: { slidesPerView: 3.4 } }
      });
    }
  }

  /* ---------------- Projects filter ---------------- */
  function initProjectsFilter() {
    var bar = $('#filterBar');
    if (!bar) return;
    var cards = $$('#propertyGrid .property-card');
    var countEl = $('#resultsCount');
    var empty = $('#emptyState');

    function apply() {
      var type = $('#fType').value, city = $('#fCity').value, price = $('#fPrice').value, area = $('#fArea').value;
      var shown = 0;
      cards.forEach(function (c) {
        var ok = true;
        if (type && c.dataset.type !== type) ok = false;
        if (city && c.dataset.city !== city) ok = false;
        if (price) {
          var p = parseFloat(c.dataset.price);
          var pr = price.split('-');
          if (pr.length === 2) { if (p < +pr[0] || p > +pr[1]) ok = false; }
          else if (price === 'low') { if (p >= 3000000) ok = false; }
          else if (price === 'high') { if (p < 8000000) ok = false; }
        }
        if (area) {
          var a = parseFloat(c.dataset.area);
          if (area === 's') { if (a >= 100) ok = false; }
          else if (area === 'm') { if (a < 100 || a > 150) ok = false; }
          else if (area === 'l') { if (a < 150 || a > 200) ok = false; }
          else if (area === 'xl') { if (a < 200) ok = false; }
        }
        c.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown;
      if (empty) empty.style.display = shown ? 'none' : 'block';
    }
    bar.addEventListener('change', apply);
    var reset = $('#resetFilters');
    if (reset) reset.addEventListener('click', function () {
      $$('select', bar).forEach(function (s) { s.value = ''; });
      apply();
    });
    apply();
  }
  initProjectsFilter();

  /* ---------------- Blog search + categories ---------------- */
  function initBlog() {
    var grid = $('#blogGrid');
    if (!grid) return;
    var posts = $$('.post-card', grid);
    var input = $('#blogSearch');
    var empty = $('#blogEmpty');
    var activeCat = 'all';

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;
      posts.forEach(function (p) {
        var okCat = activeCat === 'all' || p.dataset.cat === activeCat;
        var okQ = !q || p.textContent.toLowerCase().indexOf(q) !== -1;
        var ok = okCat && okQ;
        p.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    }
    $$('#blogCats .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('#blogCats .chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        activeCat = chip.dataset.cat;
        apply();
      });
    });
    if (input) input.addEventListener('input', apply);
    apply();
  }
  initBlog();

  /* ---------------- Gallery lightbox ---------------- */
  function initLightbox() {
    var items = $$('.gallery-item');
    if (!items.length) return;
    var lb = $('#lightbox');
    var lbImg = $('#lbImg');
    var lbCap = $('#lbCap');
    var idx = 0;

    var list = items.filter(function (i) { return i.dataset.cat !== 'video'; });

    function show(i) {
      idx = (i + list.length) % list.length;
      var el = list[idx];
      lbImg.src = el.dataset.full || $('img', el).src;
      lbCap.textContent = el.dataset.title || '';
      lb.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function hide() { lb.classList.remove('show'); document.body.style.overflow = ''; }

    items.forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.dataset.cat === 'video') {
          var w = $('#videoSection');
          if (w) w.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        show(list.indexOf(el));
      });
    });
    $('#lbClose').addEventListener('click', hide);
    $('#lbPrev').addEventListener('click', function () { show(idx - 1); });
    $('#lbNext').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) hide(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('show')) return;
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowLeft') show(idx + 1);
      if (e.key === 'ArrowRight') show(idx - 1);
    });
  }
  initLightbox();

  /* ---------------- Gallery category chips ---------------- */
  $$('.gallery-filters .chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $$('.gallery-filters .chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var cat = chip.dataset.gcat;
      $$('.gallery-item').forEach(function (g) {
        g.style.display = (cat === 'all' || g.dataset.cat === cat) ? '' : 'none';
      });
    });
  });

  /* ---------------- 360° Virtual Tour (Three.js) ---------------- */
  function initTour() {
    var canvas = $('#tourCanvas');
    if (!canvas || !window.THREE) return;

    var wrap = canvas.parentElement;
    var loading = $('#tourLoading');
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); }
    catch (e) { if (loading) loading.innerHTML = '<div>تعذّر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز</div>'; return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(72, 1, 0.1, 1100);
    camera.position.set(0, 0, 0.01);

    // أفق مبدئي أثناء التحميل
    var gradCanvas = document.createElement('canvas');
    gradCanvas.width = 64; gradCanvas.height = 64;
    var gctx = gradCanvas.getContext('2d');
    var gr = gctx.createLinearGradient(0, 0, 0, 64);
    gr.addColorStop(0, '#0b2f6b'); gr.addColorStop(.5, '#124a7a'); gr.addColorStop(1, '#0d9488');
    gctx.fillStyle = gr; gctx.fillRect(0, 0, 64, 64);
    var gradTex = new THREE.CanvasTexture(gradCanvas);

    var geo = new THREE.SphereGeometry(500, 60, 40);
    geo.scale(-1, 1, 1);
    var mat = new THREE.MeshBasicMaterial({ map: gradTex });
    var sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);

    var panoURL = canvas.getAttribute('data-pano') ||
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/2294472375_24a3b8ef46_o.jpg';

    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(panoURL, function (tex) {
      if (tex.encoding !== undefined && THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
      mat.map = tex;
      mat.needsUpdate = true;
      if (loading) loading.classList.add('hide');
    }, undefined, function () {
      if (loading) {
        loading.innerHTML = '<div><div class="spinner"></div>تعذّر تحميل المشهد الافتراضي — جرّب التحريك يدويًا</div>';
        setTimeout(function () { loading.classList.add('hide'); }, 1600);
      }
    });

    /* Hotspots */
    var hotspots = $$('.hotspot', wrap).map(function (el) {
      var lon = parseFloat(el.dataset.lon), lat = parseFloat(el.dataset.lat);
      var phi = THREE.MathUtils.degToRad(90 - lat);
      var theta = THREE.MathUtils.degToRad(lon);
      var vec = new THREE.Vector3().setFromSphericalCoords(480, phi, theta);
      return { el: el, vec: vec };
    });

    var infoBox = $('#hotspotInfo');
    var infoTitle = $('#hsTitle'), infoText = $('#hsText');
    var openHS = null;

    hotspots.forEach(function (h) {
      h.el.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (openHS === h.el) { closeInfo(); return; }
        openHS = h.el;
        infoTitle.textContent = h.el.dataset.title;
        infoText.textContent = h.el.dataset.text;
        infoBox.classList.add('show');
        infoBox.dataset.anchor = h.el.dataset.id;
        positionInfo(h);
      });
    });
    function closeInfo() { infoBox.classList.remove('show'); openHS = null; }
    function positionInfo(h) {
      var p = h.vec.clone().project(camera);
      var r = wrap.getBoundingClientRect();
      infoBox.style.left = ((p.x * 0.5 + 0.5) * r.width) + 'px';
      infoBox.style.top = ((-p.y * 0.5 + 0.5) * r.height) + 'px';
    }
    var hsClose = $('#hsClose');
    if (hsClose) hsClose.addEventListener('click', closeInfo);

    /* Camera control */
    var lon = 90, lat = 0, phi = 0, theta = 0;
    var isDown = false, px = 0, py = 0;
    var autoRotate = true, rotDir = 1;
    var zoomFov = 72;

    canvas.addEventListener('pointerdown', function (e) { isDown = true; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointerup', function () { isDown = false; });
    canvas.addEventListener('pointerleave', function () { isDown = false; });
    canvas.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      lon -= (e.clientX - px) * 0.13;
      lat += (e.clientY - py) * 0.13;
      lat = Math.max(-85, Math.min(85, lat));
      px = e.clientX; py = e.clientY;
      if (openHS) { var h = hotspots.filter(function (x) { return x.el === openHS; })[0]; if (h) positionInfo(h); }
    });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoomFov = Math.max(35, Math.min(90, zoomFov + (e.deltaY > 0 ? 4 : -4)));
      camera.fov = zoomFov; camera.updateProjectionMatrix();
    }, { passive: false });

    function resize() {
      var w = wrap.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    var dirVec = new THREE.Vector3();
    function render() {
      if (autoRotate && !isDown) lon += 0.035 * rotDir;
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);
      camera.lookAt(new THREE.Vector3().setFromSphericalCoords(1, phi, theta));
      renderer.render(scene, camera);

      camera.getWorldDirection(dirVec);
      hotspots.forEach(function (h) {
        var p = h.vec.clone().project(camera);
        var visible = dirVec.dot(h.vec.clone().normalize()) > 0.12 && p.z < 1;
        h.el.style.display = visible ? 'grid' : 'none';
        if (visible) {
          var r = wrap.getBoundingClientRect();
          h.el.style.left = ((p.x * 0.5 + 0.5) * r.width) + 'px';
          h.el.style.top = ((-p.y * 0.5 + 0.5) * r.height) + 'px';
        }
      });
      if (openHS && infoBox.classList.contains('show')) {
        var hh = hotspots.filter(function (x) { return x.el === openHS; })[0];
        if (hh) positionInfo(hh);
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    /* Controls */
    var btnZoomIn = $('#zoomIn'), btnZoomOut = $('#zoomOut');
    if (btnZoomIn) btnZoomIn.addEventListener('click', function () { zoomFov = Math.max(35, zoomFov - 9); camera.fov = zoomFov; camera.updateProjectionMatrix(); });
    if (btnZoomOut) btnZoomOut.addEventListener('click', function () { zoomFov = Math.min(90, zoomFov + 9); camera.fov = zoomFov; camera.updateProjectionMatrix(); });

    var btnRotate = $('#rotateBtn');
    if (btnRotate) btnRotate.addEventListener('click', function () {
      autoRotate = !autoRotate;
      btnRotate.style.background = autoRotate ? '' : 'var(--secondary)';
    });

    var btnFs = $('#fsBtn');
    if (btnFs) btnFs.addEventListener('click', function () {
      if (!document.fullscreenElement) { if (wrap.requestFullscreen) wrap.requestFullscreen(); }
      else if (document.exitFullscreen) document.exitFullscreen();
      setTimeout(resize, 220);
    });

    var btnVoice = $('#voiceBtn');
    if (btnVoice) {
      btnVoice.addEventListener('click', function () {
        if (!('speechSynthesis' in window)) { btnVoice.querySelector('span').textContent = 'غير متاح'; return; }
        if (speechSynthesis.speaking) { speechSynthesis.cancel(); btnVoice.classList.remove('playing'); return; }
        var u = new SpeechSynthesisUtterance(
          'أهلاً بك في الجولة الافتراضية لمشروع كايرو فيو ريزيدنس. تقدّم في كل اتجاه لاستكشاف الوحدة، واضغط على النقاط الذهبية للاطلاع على تفاصيل كل منطقة.'
        );
        u.lang = 'ar-EG'; u.rate = 0.95;
        u.onend = function () { btnVoice.classList.remove('playing'); };
        speechSynthesis.speak(u);
        btnVoice.classList.add('playing');
      });
    }
  }
  initTour();

  /* ---------------- Forms → WhatsApp ---------------- */
  function waLink(msg) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg); }

  var booking = $('#bookingForm');
  if (booking) {
    booking.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(booking);
      var msg = 'طلب حجز جولة / استشارة من موقع Special Home\n' +
        'الاسم: ' + (f.get('name') || '-') + '\n' +
        'الهاتف: ' + (f.get('phone') || '-') + '\n' +
        'البريد: ' + (f.get('email') || '-') + '\n' +
        'المشروع: ' + (f.get('project') || '-') + '\n' +
        'الميزانية: ' + (f.get('budget') || '-') + '\n' +
        'الرسالة: ' + (f.get('message') || '-');
      window.open(waLink(msg), '_blank');
      var ok = $('#bookingSuccess');
      if (ok) { ok.classList.add('show'); ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      booking.reset();
    });
  }

  var contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(contactForm);
      var msg = 'رسالة جديدة من موقع Special Home\n' +
        'الاسم: ' + (f.get('name') || '-') + '\n' +
        'الهاتف: ' + (f.get('phone') || '-') + '\n' +
        'البريد: ' + (f.get('email') || '-') + '\n' +
        'الموضوع: ' + (f.get('subject') || '-') + '\n' +
        'الرسالة: ' + (f.get('message') || '-');
      window.open(waLink(msg), '_blank');
      var ok = $('#contactSuccess');
      if (ok) { ok.classList.add('show'); ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      contactForm.reset();
    });
  }

  $$('form.newsletter').forEach(function (newsletter) {
    newsletter.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = $('button', newsletter);
      var old = btn.textContent;
      btn.textContent = 'تم الاشتراك ✓';
      btn.style.background = '#16a34a';
      newsletter.reset();
      setTimeout(function () { btn.textContent = old; btn.style.background = ''; }, 3200);
    });
  });

  /* ---------------- Hero search → projects page ---------------- */
  var heroSearch = $('#heroSearch');
  if (heroSearch) {
    heroSearch.addEventListener('submit', function (e) {
      e.preventDefault();
      var type = $('#hsType') ? $('#hsType').value : '';
      var city = $('#hsCity') ? $('#hsCity').value : '';
      var price = $('#hsPrice') ? $('#hsPrice').value : '';
      var q = [];
      if (type) q.push('type=' + encodeURIComponent(type));
      if (city) q.push('city=' + encodeURIComponent(city));
      if (price) q.push('price=' + encodeURIComponent(price));
      window.location.href = 'projects.html' + (q.length ? '?' + q.join('&') : '');
    });
  }

  /* Prefill filters from query string on projects page */
  (function () {
    var bar = $('#filterBar');
    if (!bar || !window.location.search) return;
    var params = new URLSearchParams(window.location.search);
    [['type', '#fType'], ['city', '#fCity'], ['price', '#fPrice']].forEach(function (pair) {
      var v = params.get(pair[0]);
      var el = $(pair[1]);
      if (v && el) {
        el.value = v;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  })();

  /* ---------------- Boot 3D ---------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCube);
  } else { initCube(); }
})();
