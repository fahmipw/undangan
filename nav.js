/* ============================================
   SPA Controller - Undangan Pernikahan Digital
   Elvy & Rokim — Single Page Application
   ============================================ */

(function () {
  "use strict";

  /* =============================================
     COVER GATE
     ============================================= */
  function initCoverGate() {
    var gate = document.getElementById("cover-gate");
    var btn = document.getElementById("btn-buka");
    if (!gate || !btn) return;

    btn.addEventListener("click", function () {
      // Button press animation
      btn.style.transform = "scale(0.95)";
      setTimeout(function () {
        btn.style.transform = "";
      }, 150);

      // Open the gate
      setTimeout(function () {
        gate.classList.add("opened");
        document.body.classList.remove("no-scroll");

        // Show header, dot nav, music fab, scroll progress
        setTimeout(function () {
          var header = document.querySelector(".top-header");
          var dotNav = document.getElementById("dot-nav");
          var musicFab = document.querySelector(".music-fab");
          var scrollProg = document.getElementById("scroll-progress");

          if (header) header.classList.add("visible");
          if (dotNav) dotNav.classList.add("active");
          if (musicFab) musicFab.classList.add("active");
          if (scrollProg) scrollProg.classList.add("active");

          // Start music
          startMusic(0);

          // Trigger first visible reveals
          initScrollReveal();
        }, 400);

        // Remove gate from DOM after transition
        setTimeout(function () {
          gate.style.display = "none";
        }, 1200);
      }, 200);
    });
  }

  /* =============================================
     AUDIO / MUSIC
     ============================================= */
  var bgMusic = new Audio("lagu.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;
  var musicPlaying = false;

  function fadeInAudio(audio, targetVol) {
    audio.volume = 0;
    var steps = 20;
    var stepTime = 500 / steps;
    var stepVol = targetVol / steps;
    var timer = setInterval(function () {
      audio.volume = Math.min(targetVol, audio.volume + stepVol);
      if (audio.volume >= targetVol) clearInterval(timer);
    }, stepTime);
  }

  function startMusic(fromTime) {
    bgMusic.currentTime = fromTime || 0;
    bgMusic.volume = 0;
    bgMusic.play().then(function () {
      musicPlaying = true;
      updateMusicUI(true);
      fadeInAudio(bgMusic, 0.5);
    }).catch(function () {
      bgMusic.volume = 0.5;
      // Will retry on first user interaction
      document.addEventListener("click", function retryPlay() {
        if (!musicPlaying) {
          startMusic(0);
        }
        document.removeEventListener("click", retryPlay);
      }, { once: true });
    });
  }

  function updateMusicUI(isPlaying) {
    var btn = document.getElementById("music-toggle");
    if (!btn) return;
    var icon = btn.querySelector(".material-symbols-outlined");
    var ping = btn.querySelector(".ping-ring");
    if (isPlaying) {
      icon.textContent = "pause";
      if (ping) ping.style.display = "none";
      btn.style.animation = "spinSlow 3s linear infinite";
    } else {
      icon.textContent = "music_note";
      if (ping) ping.style.display = "";
      btn.style.animation = "none";
    }
  }

  function initMusicToggle() {
    var btn = document.getElementById("music-toggle");
    if (!btn) return;

    btn.addEventListener("click", function () {
      if (!musicPlaying) {
        startMusic(bgMusic.currentTime);
      } else {
        bgMusic.pause();
        musicPlaying = false;
        updateMusicUI(false);
      }
    });
  }

  /* =============================================
     DOT NAVIGATION
     ============================================= */
  var DOT_SECTIONS = [
    { id: "mempelai", label: "Mempelai" },
    { id: "kisah", label: "Kisah" },
    { id: "galeri", label: "Galeri" },
    { id: "acara", label: "Acara" },
    { id: "rsvp", label: "RSVP" },
    { id: "ucapan", label: "Ucapan" }
  ];

  function buildDotNav() {
    var nav = document.getElementById("dot-nav");
    if (!nav) return;

    var track = document.createElement("div");
    track.className = "dot-track";

    DOT_SECTIONS.forEach(function (sec, i) {
      var item = document.createElement("div");
      item.className = "dot-item";
      item.dataset.target = sec.id;

      var circle = document.createElement("div");
      circle.className = "dot-circle";

      var label = document.createElement("span");
      label.className = "dot-label";
      label.textContent = sec.label;

      item.appendChild(circle);
      item.appendChild(label);

      item.addEventListener("click", function () {
        var target = document.getElementById(sec.id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      track.appendChild(item);
    });

    nav.appendChild(track);
  }

  function initDotObserver() {
    var dots = document.querySelectorAll(".dot-item");
    if (!dots.length) return;

    var sectionEls = DOT_SECTIONS.map(function (sec) {
      return document.getElementById(sec.id);
    }).filter(Boolean);

    var currentActive = null;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            if (currentActive === id) return;
            currentActive = id;

            dots.forEach(function (dot) {
              if (dot.dataset.target === id) {
                dot.classList.add("active");
              } else {
                dot.classList.remove("active");
              }
            });
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "-20% 0px -60% 0px"
      }
    );

    sectionEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =============================================
     SCROLL REVEAL (IntersectionObserver)
     ============================================= */
  function initScrollReveal() {
    var elements = document.querySelectorAll(
      ".reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-stagger"
    );
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =============================================
     SCROLL PROGRESS BAR
     ============================================= */
  function initScrollProgress() {
    var bar = document.getElementById("scroll-progress");
    if (!bar) return;

    window.addEventListener("scroll", function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        var percent = (scrollTop / scrollHeight) * 100;
        bar.style.width = percent + "%";
      }
    }, { passive: true });
  }

  /* =============================================
     LIVE COUNTDOWN
     ============================================= */
  function initCountdown() {
    var el = document.getElementById("countdown");
    if (!el) return;

    // Wedding date: Selasa, 9 Juni 2026, 08:00 WIB (UTC+7)
    var weddingDate = new Date("2026-06-09T08:00:00+07:00").getTime();

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    function update() {
      var now = Date.now();
      var diff = weddingDate - now;

      if (diff <= 0) {
        el.innerHTML =
          '<div class="countdown-item"><span class="countdown-number">00</span><span class="countdown-label">Hari</span></div>' +
          '<span class="countdown-sep">:</span>' +
          '<div class="countdown-item"><span class="countdown-number">00</span><span class="countdown-label">Jam</span></div>' +
          '<span class="countdown-sep">:</span>' +
          '<div class="countdown-item"><span class="countdown-number">00</span><span class="countdown-label">Menit</span></div>' +
          '<span class="countdown-sep">:</span>' +
          '<div class="countdown-item"><span class="countdown-number">00</span><span class="countdown-label">Detik</span></div>';
        return;
      }

      var days = Math.floor(diff / 86400000); diff %= 86400000;
      var hours = Math.floor(diff / 3600000); diff %= 3600000;
      var mins = Math.floor(diff / 60000); diff %= 60000;
      var secs = Math.floor(diff / 1000);

      el.innerHTML =
        '<div class="countdown-item"><span class="countdown-number">' + pad(days) + '</span><span class="countdown-label">Hari</span></div>' +
        '<span class="countdown-sep">:</span>' +
        '<div class="countdown-item"><span class="countdown-number">' + pad(hours) + '</span><span class="countdown-label">Jam</span></div>' +
        '<span class="countdown-sep">:</span>' +
        '<div class="countdown-item"><span class="countdown-number">' + pad(mins) + '</span><span class="countdown-label">Menit</span></div>' +
        '<span class="countdown-sep">:</span>' +
        '<div class="countdown-item"><span class="countdown-number">' + pad(secs) + '</span><span class="countdown-label">Detik</span></div>';
    }

    update();
    setInterval(update, 1000);
  }

  /* =============================================
     PARALLAX - Subtle effect on hero backgrounds
     ============================================= */
  function initParallax() {
    var parallaxEls = document.querySelectorAll("[data-parallax]");
    if (!parallaxEls.length) return;

    window.addEventListener("scroll", function () {
      var scrollY = window.scrollY;
      parallaxEls.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = "translateY(" + (scrollY * speed) + "px)";
      });
    }, { passive: true });
  }

  /* =============================================
     INIT
     ============================================= */
  document.addEventListener("DOMContentLoaded", function () {
    initCoverGate();
    buildDotNav();
    initMusicToggle();
    initCountdown();
    initScrollProgress();
    initParallax();

    // Dot observer and scroll reveal start after gate opens
    // (called from initCoverGate after transition)
    // But also set up dot observer in case
    setTimeout(function () {
      initDotObserver();
    }, 500);
  });

})();
