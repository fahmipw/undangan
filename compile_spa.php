<?php

function extractSections($file)
{
  $content = file_get_contents($file);
  preg_match_all('/<section[^>]*>.*?<\/section>/s', $content, $matches);
  return implode("\n", $matches[0]);
}

$mempelai = extractSections('mempelai.html');
$acara = extractSections('acara.html');
$pesan = extractSections('pesan.html');

$indexContent = file_get_contents('backup/index.html');

// Extract the two sections from index.html (Hero and Quote)
preg_match_all('/<section[^>]*>.*?<\/section>/s', $indexContent, $indexMatches);
$heroSection = $indexMatches[0][0] ?? '';
$quoteSection = $indexMatches[0][1] ?? '';

// Transform the Hero section into the Cover Gate
$heroSection = preg_replace('/<section[^>]*>/', '<div id="cover-gate" class="flex flex-col items-center justify-center px-margin-page text-center">', $heroSection, 1);
$heroSection = str_replace('</section>', '</div>', $heroSection);
$heroSection = str_replace('reveal-scale', '', $heroSection);
$heroSection = str_replace('reveal', '', $heroSection);
$heroSection = preg_replace('/<button onclick="navigateTo\([^>]+>/', '<button id="btn-buka" class="w-full py-4 bg-secondary text-surface-container-lowest font-label-caps tracking-widest rounded-lg flex items-center justify-center gap-3 shadow-md hover:bg-primary transition-all active:scale-95 border-b-2 border-primary-container">', $heroSection);

$pesanContent = file_get_contents('pesan.html');
preg_match('/<script>(.*?)<\/script>/s', $pesanContent, $scriptMatch);
$rsvpScript = $scriptMatch[1] ?? '';

$mempelaiContent = file_get_contents('mempelai.html');
preg_match_all('/<script>(.*?)<\/script>/s', $mempelaiContent, $mempelaiScripts);
$lightboxScript = end($mempelaiScripts[1]);

$body = '
<body class="bg-background text-on-surface font-body-md no-scroll selection:bg-secondary-container">

  <!-- COVER GATE -->
  ' . $heroSection . '

  <!-- TOP HEADER -->
  <header class="top-header">
    <div class="top-header-inner">
      <span class="material-symbols-outlined header-icon">park</span>
      <h1>Elvy & Rokim</h1>
      <span class="material-symbols-outlined header-icon">music_note</span>
    </div>
  </header>

  <!-- DOT NAV -->
  <nav id="dot-nav"></nav>

  <!-- SCROLL PROGRESS -->
  <div id="scroll-progress-container" class="fixed top-0 left-0 w-full h-1 z-50">
    <div id="scroll-progress" class="h-full bg-secondary w-0 transition-all duration-100 ease-out"></div>
  </div>

  <!-- MAIN CONTENT -->
  <main class="min-h-screen relative overflow-hidden pb-32">
    <!-- Background Texture -->
    <div class="fixed inset-0 batik-parang-overlay pointer-events-none z-0"></div>
    
    <!-- Central Content Wrapper (Fix for messy layout) -->
    <div class="relative z-10 pt-16 max-w-xl mx-auto">
      
      <div id="mempelai"></div>
      ' . $mempelai . '
      
      <div id="acara" class="pt-16"></div>
      ' . $acara . '
      
      <div id="rsvp" class="pt-16"></div>
      <div id="ucapan"></div>
      ' . $pesan . '

      <!-- Quote from Index -->
      <div class="pt-16"></div>
      ' . $quoteSection . '
    </div>
  </main>

  <!-- FLOATING MUSIC BUTTON -->
  <div class="music-fab">
    <button id="music-toggle" aria-label="Toggle Musik">
      <span class="material-symbols-outlined">music_note</span>
      <div class="ping-ring"></div>
    </button>
  </div>

  <!-- Lightbox Modal -->
  <div id="lightbox" class="fixed inset-0 z-[999] bg-black/90 hidden flex-col items-center justify-center opacity-0 transition-opacity duration-300" onclick="closeLightbox()">
    <button onclick="closeLightbox()" class="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition backdrop-blur z-50">
      <span class="material-symbols-outlined text-3xl">close</span>
    </button>
    <img id="lightbox-img" src="" class="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl scale-95 transition-transform duration-300" onclick="event.stopPropagation()" />
  </div>

  <script src="nav.js"></script>
  <script>
    /* =========================================
       LIGHTBOX LOGIC
       ========================================= */
    ' . $lightboxScript . '
    
    /* =========================================
       RSVP & GUESTBOOK LOGIC
       ========================================= */
    ' . $rsvpScript . '
  </script>
</body>
';

$headMatch = [];
preg_match('/<head>.*?<\/head>/s', $indexContent, $headMatch);
$head = $headMatch[0];

preg_match('/<style>.*?<\/style>/s', $pesanContent, $styleMatch);
if (!empty($styleMatch)) {
  $head = str_replace('</head>', $styleMatch[0] . "\n</head>", $head);
}

$finalHtml = '<!DOCTYPE html>
<html lang="id">
' . $head . '
' . $body . '
</html>';

file_put_contents('index.html', $finalHtml);
echo "SPA index.html successfully generated!\n";

?>