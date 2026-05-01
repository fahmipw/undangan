/* ============================================
   Shared JS - Undangan Pernikahan Digital
  Elvy & Rokim
   ============================================ */

(function () {
  "use strict";

  // Fade-in on page load
  window.addEventListener("load", function () {
    document.body.style.opacity = "1";
  });

  /* ---------- Audio Fade Helpers ---------- */
  function fadeOutAudio(audio, duration, callback) {
    if (!audio || audio.paused) { callback(); return; }
    var startVol = audio.volume;
    var steps = 20;
    var stepTime = duration / steps;
    var stepVol = startVol / steps;
    var timer = setInterval(function () {
      audio.volume = Math.max(0, audio.volume - stepVol);
      if (audio.volume <= 0) {
        clearInterval(timer);
        audio.pause();
        audio.volume = startVol; // restore for next page
        callback();
      }
    }, stepTime);
  }

  function fadeInAudio(audio, targetVol) {
    audio.volume = 0;
    var steps = 20;
    var stepTime = 400 / steps;
    var stepVol = targetVol / steps;
    var timer = setInterval(function () {
      audio.volume = Math.min(targetVol, audio.volume + stepVol);
      if (audio.volume >= targetVol) clearInterval(timer);
    }, stepTime);
  }

  /**
   * Navigate to another page — fade music out first
   */
  window.navigateTo = function (href, e) {
    if (e) e.preventDefault();
    if (href === "index.html") {
      // Kembali ke home → reset musik
      sessionStorage.removeItem("musicPlaying");
      sessionStorage.removeItem("musicTime");
      fadeOutAudio(bgMusic, 300, function () {
        window.location.href = href;
      });
    } else if (bgMusic && !bgMusic.paused) {
      // Simpan posisi, fade out, lalu navigasi
      sessionStorage.setItem("musicPlaying", "1");
      sessionStorage.setItem("musicTime", String(bgMusic.currentTime));
      fadeOutAudio(bgMusic, 300, function () {
        window.location.href = href;
      });
    } else {
      window.location.href = href;
    }
  };

  /* ---------- Bottom Navigation ---------- */
  const NAV_ITEMS = [
    { icon: "home", label: "Home", href: "index.html" },
    { icon: "favorite", label: "Pasangan", href: "mempelai.html" },
    { icon: "calendar_today", label: "Acara", href: "acara.html" },
    { icon: "auto_stories", label: "Pesan", href: "pesan.html" }
  ];

  function getCurrentPage() {
    const path = window.location.pathname;
    const file = path.substring(path.lastIndexOf("/") + 1) || "index.html";
    return file;
  }

  function buildBottomNav() {
    // Don't show bottom nav on index (landing page)
    const current = getCurrentPage();
    if (current === "index.html" || current === "") return;

    const nav = document.createElement("nav");
    nav.className = "bottom-nav";
    nav.setAttribute("aria-label", "Menu Navigasi");

    const inner = document.createElement("div");
    inner.className = "bottom-nav-inner";

    NAV_ITEMS.forEach(function (item) {
      const a = document.createElement("a");
      a.href = item.href;
      const isActive = current === item.href;
      if (isActive) a.classList.add("active");

      // Use transition navigation
      a.addEventListener("click", function (e) {
        if (isActive) { e.preventDefault(); return; }
        navigateTo(item.href, e);
      });

      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined";
      if (isActive) {
        icon.style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
      }
      icon.textContent = item.icon;

      const label = document.createElement("span");
      label.className = "nav-label";
      label.textContent = item.label;

      a.appendChild(icon);
      a.appendChild(label);
      inner.appendChild(a);
    });

    nav.appendChild(inner);
    document.body.appendChild(nav);
  }

  /* ---------- Floating Music Button ---------- */
  var bgMusic = new Audio("lagu.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  // Save music state before page unload
  window.addEventListener("beforeunload", function () {
    if (bgMusic && !bgMusic.paused) {
      sessionStorage.setItem("musicPlaying", "1");
      sessionStorage.setItem("musicTime", String(bgMusic.currentTime));
    }
  });

  function setMusicUI(btn, isPlaying) {
    var icon = btn.querySelector(".material-symbols-outlined");
    var ping = btn.querySelector(".ping-ring");
    if (isPlaying) {
      icon.textContent = "pause";
      ping.style.display = "none";
      btn.style.animation = "spinSlow 3s linear infinite";
    } else {
      icon.textContent = "music_note";
      ping.style.display = "";
      btn.style.animation = "none";
    }
  }

  function buildMusicFab() {
    var current = getCurrentPage();
    if (current === "index.html" || current === "") return;

    var fab = document.createElement("div");
    fab.className = "music-fab";
    fab.innerHTML = '<button id="music-toggle" aria-label="Toggle Musik"><span class="material-symbols-outlined">music_note</span><div class="ping-ring"></div></button>';
    document.body.appendChild(fab);

    var btn = document.getElementById("music-toggle");
    var playing = false;

    // Restore music from previous page
    var wasPlaying = sessionStorage.getItem("musicPlaying") === "1";
    var savedTime = parseFloat(sessionStorage.getItem("musicTime") || "0");

    function startMusic(fromTime) {
      bgMusic.currentTime = fromTime || 0;
      bgMusic.volume = 0; // start silent, fade in
      bgMusic.play().then(function () {
        playing = true;
        sessionStorage.setItem("musicPlaying", "1");
        setMusicUI(btn, true);
        fadeInAudio(bgMusic, 0.5);
      }).catch(function () {
        // Autoplay blocked — will retry on user interaction
        bgMusic.volume = 0.5;
      });
    }

    // If music was playing on previous page, resume
    if (wasPlaying) {
      startMusic(savedTime);
    }

    // Auto-play on mempelai.html (first page after landing)
    if (current === "mempelai.html" && !wasPlaying) {
      startMusic(0);
    }

    // Toggle button
    btn.addEventListener("click", function () {
      if (!playing) {
        startMusic(bgMusic.currentTime);
      } else {
        bgMusic.pause();
        playing = false;
        sessionStorage.setItem("musicPlaying", "0");
        setMusicUI(btn, false);
      }
    });

    // If autoplay was blocked, retry on first user interaction
    if (!playing) {
      document.addEventListener("click", function retryPlay() {
        if (!playing && (wasPlaying || current === "mempelai.html")) {
          startMusic(savedTime || 0);
        }
        document.removeEventListener("click", retryPlay);
      }, { once: true });
    }
  }

  /* ---------- Scroll Reveal ---------- */
  function initScrollReveal() {
    const elements = document.querySelectorAll(".reveal, .reveal-scale, .reveal-stagger");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Live Countdown ---------- */
  function initCountdown() {
    const el = document.getElementById("countdown");
    if (!el) return;

    // Wedding date: Sabtu, 2 Mei 2026, 08:00 WIB (UTC+7)
    const weddingDate = new Date("2026-05-02T08:00:00+07:00").getTime();

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    function update() {
      const now = Date.now();
      let diff = weddingDate - now;

      if (diff <= 0) {
        el.innerHTML = `
          <div class="countdown-item"><span class="countdown-number">00</span><span class="countdown-label">Hari</span></div>
          <span class="countdown-sep">:</span>
          <div class="countdown-item"><span class="countdown-number">00</span><span class="countdown-label">Jam</span></div>
          <span class="countdown-sep">:</span>
          <div class="countdown-item"><span class="countdown-number">00</span><span class="countdown-label">Menit</span></div>
          <span class="countdown-sep">:</span>
          <div class="countdown-item"><span class="countdown-number">00</span><span class="countdown-label">Detik</span></div>`;
        return;
      }

      const days = Math.floor(diff / 86400000); diff %= 86400000;
      const hours = Math.floor(diff / 3600000); diff %= 3600000;
      const mins = Math.floor(diff / 60000); diff %= 60000;
      const secs = Math.floor(diff / 1000);

      el.innerHTML = `
        <div class="countdown-item"><span class="countdown-number">${pad(days)}</span><span class="countdown-label">Hari</span></div>
        <span class="countdown-sep">:</span>
        <div class="countdown-item"><span class="countdown-number">${pad(hours)}</span><span class="countdown-label">Jam</span></div>
        <span class="countdown-sep">:</span>
        <div class="countdown-item"><span class="countdown-number">${pad(mins)}</span><span class="countdown-label">Menit</span></div>
        <span class="countdown-sep">:</span>
        <div class="countdown-item"><span class="countdown-number">${pad(secs)}</span><span class="countdown-label">Detik</span></div>`;
    }

    update();
    setInterval(update, 1000);
  }



  /* ---------- Auto-Navigate on Scroll ---------- */
  var PAGE_ORDER = ["index.html", "mempelai.html", "acara.html", "pesan.html"];

  function initAutoScrollNav() {
    var current = getCurrentPage();
    // Disable auto-scroll on landing page (index)
    if (current === "index.html" || current === "") return;
    var currentIdx = PAGE_ORDER.indexOf(current);
    if (currentIdx === -1) return;

    var navigating = false;
    var touchStartY = 0;

    // Detect overscroll at bottom → go to next page
    // Detect overscroll at top → go to previous page
    function checkScrollEdge() {
      if (navigating) return;

      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight;
      var clientHeight = window.innerHeight;

      // At the very bottom (within 5px tolerance)
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        var nextIdx = currentIdx + 1;
        if (nextIdx < PAGE_ORDER.length) {
          navigating = true;
          navigateTo(PAGE_ORDER[nextIdx]);
        }
      }

      // At the very top
      if (scrollTop <= 0 && currentIdx > 0) {
        // Only trigger on pull-up gesture (handled by wheel/touch)
      }
    }

    // Throttled scroll listener
    var scrollTick = false;
    window.addEventListener("scroll", function () {
      if (!scrollTick) {
        window.requestAnimationFrame(function () {
          checkScrollEdge();
          scrollTick = false;
        });
        scrollTick = true;
      }
    }, { passive: true });

    // Mouse wheel at the top edge → previous page
    window.addEventListener("wheel", function (e) {
      if (navigating) return;
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop <= 0 && e.deltaY < -30 && currentIdx > 0) {
        navigating = true;
        navigateTo(PAGE_ORDER[currentIdx - 1]);
      }
    }, { passive: true });

    // Touch swipe at top edge → previous page
    window.addEventListener("touchstart", function (e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener("touchend", function (e) {
      if (navigating) return;
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var touchEndY = e.changedTouches[0].clientY;
      var diff = touchEndY - touchStartY;

      // Swiping down at the top of page → go to previous
      if (scrollTop <= 0 && diff > 80 && currentIdx > 0) {
        navigating = true;
        navigateTo(PAGE_ORDER[currentIdx - 1]);
      }
    }, { passive: true });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildBottomNav();
    buildMusicFab();
    initScrollReveal();
    initCountdown();
    initAutoScrollNav();
  });

})();
