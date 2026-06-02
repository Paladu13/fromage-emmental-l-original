// ===== Loading Screen =====
(function() {
  var loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;

  function hideLoadingScreen() {
    loadingScreen.classList.add('hidden');
    // Restore body scroll after loading screen fades out
    setTimeout(function() {
      loadingScreen.style.display = 'none';
    }, 700);
  }

  // Attendre que tout soit chargé (images, polices, etc.)
  if (document.readyState === 'complete') {
    // Déjà chargé, attendre juste un peu pour l'animation
    setTimeout(hideLoadingScreen, 2200);
  } else {
    // Attendre le chargement complet puis ajouter un délai
    window.addEventListener('load', function() {
      // Un délai pour que la barre de progression ait le temps de se remplir
      setTimeout(hideLoadingScreen, 2200);
    });
    // Sécurité : cacher après 5s max même si pas tout chargé
    setTimeout(function() {
      if (!loadingScreen.classList.contains('hidden')) {
        hideLoadingScreen();
      }
    }, 5000);
  }
})();

// ===== Carousel =====
(function() {
  var track = document.getElementById('carousel-track');
  var prevBtn = document.getElementById('carousel-prev');
  var nextBtn = document.getElementById('carousel-next');
  var dots = document.querySelectorAll('.carousel-dot');
  var page = 0;
  var maxPage = 2; // 0, 1, 2

  function updateCarousel() {
    if (!track) return;
    track.style.transform = 'translateX(-' + (page * 25) + '%)';
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === page);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      page = Math.max(0, page - 1);
      updateCarousel();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      page = Math.min(maxPage, page + 1);
      updateCarousel();
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      page = parseInt(dot.getAttribute('data-page'));
      updateCarousel();
    });
  });
})();

// ===== Mobile Menu avec animation =====
(function() {
  var hamburgerBtn = document.getElementById('menu-btn');
  var overlay = document.getElementById('mobile-overlay');
  var closeBtn = document.getElementById('mobile-close');
  var menuLinks = document.querySelectorAll('.mobile-menu a');

  function openMenu() {
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', openMenu);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  // Close on overlay click
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeMenu();
    });
  }

  // Close on link click
  menuLinks.forEach(function(link) {
    link.addEventListener('click', closeMenu);
  });
})();

// ===== Scroll Reveal Animations =====
(function() {
  // Add .reveal classes to key sections
  var sections = [
    { selector: '.origin-left', className: 'reveal-left' },
    { selector: '.origin-right', className: 'reveal-right' },
    { selector: '.fabrication-steps', className: 'reveal' },
    { selector: '.taste-left', className: 'reveal-left' },
    { selector: '.accords-right', className: 'reveal-right' },
    { selector: '.poem-card', className: 'reveal' },
    { selector: '.recipe-left', className: 'reveal-left' },
    { selector: '.recipe-right', className: 'reveal-right' },
    { selector: '.footer-grid', className: 'reveal' }
  ];

  sections.forEach(function(item) {
    var el = document.querySelector(item.selector);
    if (el) el.classList.add(item.className);
  });

  // IntersectionObserver
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function(el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function(el) {
      el.classList.add('visible');
    });
  }
})();

// ===== YouTube Video — API IFrame YouTube avec détection d'erreur =====
(function() {
  var videoId = 'StWeAtdj99k';
  var videoContainer = document.querySelector('.origin-video');
  var youtubeUrl = 'https://www.youtube.com/watch?v=' + videoId;
  var player = null;
  var playerReady = false;

  function openOnYouTube() {
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  }

  function showErrorOverlay() {
    if (!videoContainer) return;
    if (videoContainer.querySelector('.youtube-error-overlay')) return;

    // Nettoyer ce que createPlayer a pu laisser
    var oldPlayerDiv = videoContainer.querySelector('div[id^="youtube-player-"]');
    if (oldPlayerDiv) oldPlayerDiv.remove();
    var oldIframe = videoContainer.querySelector('iframe');
    if (oldIframe) oldIframe.remove();

    // Remettre le container dans son état d'origine
    videoContainer.style.position = '';
    videoContainer.style.paddingBottom = '';
    videoContainer.style.overflow = 'hidden';
    videoContainer.style.backgroundColor = '';
    videoContainer.style.borderRadius = '0.75rem';

    var img = videoContainer.querySelector('img');
    if (img) {
      img.style.display = 'block';
      img.style.position = '';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.objectFit = 'cover';
      img.style.opacity = '0.5';
    }

    var playOverlay = videoContainer.querySelector('.origin-play-overlay');
    if (playOverlay) playOverlay.style.display = 'none';

    var errorDiv = document.createElement('div');
    errorDiv.className = 'youtube-error-overlay';
    errorDiv.style.cssText = 'position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);color:white;text-align:center;padding:1.5rem;';

    errorDiv.innerHTML =
      '<p style="margin:0 0 0.25rem;font-size:1rem;font-weight:600;">Lecture non disponible</p>' +
      '<p style="margin:0 0 0.75rem;font-size:0.8rem;opacity:0.7;">Cette vidéo ne peut pas être lue sur le site.</p>' +
      '<button style="padding:0.5rem 1.25rem;font-size:0.85rem;font-weight:600;border:none;border-radius:2rem;background:#C8860A;color:#fff;cursor:pointer;transition:background 0.2s;">Voir sur YouTube</button>' +
      '<button style="margin-top:0.5rem;padding:0.35rem 1rem;font-size:0.8rem;font-weight:500;border:1px solid rgba(255,255,255,0.4);border-radius:2rem;background:transparent;color:rgba(255,255,255,0.8);cursor:pointer;transition:background 0.2s;">Fermer</button>';

    var watchBtn = errorDiv.querySelectorAll('button')[0];
    var closeBtn = errorDiv.querySelectorAll('button')[1];

    watchBtn.addEventListener('mouseenter', function() { watchBtn.style.background = '#D49718'; });
    watchBtn.addEventListener('mouseleave', function() { watchBtn.style.background = '#C8860A'; });
    watchBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); openOnYouTube(); });

    closeBtn.addEventListener('mouseenter', function() { closeBtn.style.background = 'rgba(255,255,255,0.15)'; });
    closeBtn.addEventListener('mouseleave', function() { closeBtn.style.background = 'transparent'; });
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // Restaurer l'état initial exact
      errorDiv.remove();
      if (img) {
        img.style.display = '';
        img.style.position = '';
        img.style.width = '';
        img.style.height = '';
        img.style.objectFit = '';
        img.style.opacity = '';
      }
      if (playOverlay) playOverlay.style.display = '';
      videoContainer.style.position = '';
      videoContainer.style.paddingBottom = '';
      videoContainer.style.overflow = '';
      videoContainer.style.backgroundColor = '';
      videoContainer.style.borderRadius = '';
      playerReady = false;
      player = null;
    });

    videoContainer.appendChild(errorDiv);
  }

  // Charger l'API YouTube si pas déjà fait
  function ensureYouTubeAPI(callback) {
    if (window.YT && window.YT.Player) {
      callback();
      return;
    }
    // Ajouter le script API une seule fois
    if (document.querySelector('script[src*="www.youtube.com/iframe_api"]')) {
      var checkInterval = setInterval(function() {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          callback();
        }
      }, 100);
      return;
    }
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);
    window.onYouTubeIframeAPIReady = callback;
  }

  function createPlayer() {
    if (!videoContainer) return;

    videoContainer.style.position = 'relative';
    videoContainer.style.paddingBottom = '56.25%';
    videoContainer.style.overflow = 'hidden';
    videoContainer.style.backgroundColor = '#000';
    videoContainer.style.borderRadius = '0.75rem';

    var img = videoContainer.querySelector('img');
    var overlay = videoContainer.querySelector('.origin-play-overlay');
    if (img) img.style.display = 'none';
    if (overlay) overlay.style.display = 'none';

    // Créer le conteneur pour le player
    var playerDiv = document.createElement('div');
    playerDiv.id = 'youtube-player-' + Date.now();
    playerDiv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    videoContainer.appendChild(playerDiv);

    // Attendre que l'API soit prête puis créer le player
    ensureYouTubeAPI(function() {
      createYTPlayer(playerDiv);
    });
  }

  function createYTPlayer(playerDiv) {
    player = new YT.Player(playerDiv.id, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        rel: 0,
        playsinline: 1,
        modestbranding: 1,
        hl: 'fr'
      },
      events: {
        'onReady': function() {
          playerReady = true;
          player.playVideo();
        },
        'onError': function(event) {
          // Erreur détectée (ex: 150 = vidéo non intégrable, 2 = invalid param, 101/100 = owner blocking)
          if (player && player.destroy) player.destroy();
          showErrorOverlay();
        },
        'onStateChange': function(event) {
          // Si le player passe directement à l'état "non démarré" (-1) ou s'il est bloqué
          if (event.data === -1 && !playerReady) {
            // Parfois le player ne peut pas démarrer
          }
          if (event.data === YT.PlayerState.UNSTARTED && !playerReady) {
            // Si au bout de 5s la vidéo n'a pas commencé, considérer comme erreur
            setTimeout(function() {
              if (player && player.getPlayerState && player.getPlayerState() === YT.PlayerState.UNSTARTED) {
                if (player && player.destroy) player.destroy();
                showErrorOverlay();
              }
            }, 5000);
          }
        }
      }
    });
  }

  function loadVideo() {
    if (!videoContainer) return;

    // Déjà chargé ?
    if (videoContainer.querySelector('iframe')) return;
    if (videoContainer.querySelector('.youtube-error-overlay')) return;

    createPlayer();
  }

  // Bouton play de la section Origine
  var playBtn = document.getElementById('video-play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loadVideo();
    });
  }

  // Bouton "Voir la vidéo" du Hero
  var heroVideoBtn = document.querySelector('.btn-video');
  if (heroVideoBtn) {
    heroVideoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loadVideo();
      if (videoContainer) {
        var top = videoContainer.getBoundingClientRect().top + window.pageYOffset - 64;
        window.smoothScrollTo(top, 800);
      }
    });
  }
})();

// ===== Scroll Progress Bar =====
(function() {
  var progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  function updateProgress() {
    var scrollTop = window.pageYOffset;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress);
  window.addEventListener('resize', updateProgress);
  // Initial update
  updateProgress();
})();

// ===== Scroll Indicator Hide =====
(function() {
  var indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  var onScroll = function() {
    if (window.scrollY > 150) {
      indicator.classList.add('hidden');
    } else {
      indicator.classList.remove('hidden');
    }
  };

  window.addEventListener('scroll', onScroll);
  // Initial check
  onScroll();
})();

// ===== CHRONO + CHILL + SCREAMER =====
(function() {
  var chronoTimeEl = document.getElementById('chrono-time');
  var chronoEl = document.getElementById('chrono');
  var screamerOverlay = document.getElementById('screamer-overlay');
  var screamerInvite = document.getElementById('screamer-invite');
  var screamerContent = document.getElementById('screamer-content');
  var screamerMedias = document.getElementById('screamer-medias');
  var screamerBtn = document.getElementById('screamer-btn');
  var chillAudio = document.getElementById('chill-audio');
  var chillVolumeSlider = document.getElementById('chill-volume');

  var timerSeconds = 120;
  var screamerFileName = 'screamer.gif';
  var screamerVolume = 100;
  var timerInterval = null;
  var isScreamerActive = false;
  var isScreamerPlayed = false;
  var remainingSeconds = 0;
  var timerPaused = false;

  // Récupérer la config depuis le serveur
  function loadConfig(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/screamer-config', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var cfg = JSON.parse(xhr.responseText);
        timerSeconds = cfg.timerSeconds || 120;
        screamerFileName = cfg.screamerFileName || 'screamer.gif';
        screamerVolume = cfg.screamerVolume !== undefined ? cfg.screamerVolume : 100;
      }
      callback();
    };
    xhr.onerror = function() {
      callback();
    };
    xhr.send();
  }

  // Formater le temps en M:SS
  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // Mettre à jour l'affichage du chrono
  function updateChronoDisplay() {
    if (chronoTimeEl) {
      chronoTimeEl.textContent = formatTime(remainingSeconds);
    }
  }

  // Charger et jouer la musique chill
  function loadChillMusic() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/chill-list', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var files = JSON.parse(xhr.responseText);
        if (files && files.length > 0 && chillAudio) {
          chillAudio.src = 'chill/' + encodeURIComponent(files[0].name);
          chillAudio.volume = chillVolumeSlider ? (chillVolumeSlider.value / 100) : 0.3;
          chillAudio.play().catch(function() {});
        }
      }
    };
    xhr.send();
  }

  // Arrêter la musique chill
  function stopChillMusic() {
    if (chillAudio) {
      chillAudio.pause();
      chillAudio.currentTime = 0;
    }
  }

  // Jouer tout le screamer (sons + média) — appelé UNE FOIS quand on clique "Ouvrir"
  function playScreamerFull() {
    if (isScreamerPlayed) return;
    isScreamerPlayed = true;

    // Cacher l'invitation, montrer le contenu screamer dans le même overlay
    if (screamerInvite) screamerInvite.style.display = 'none';
    if (screamerContent) screamerContent.style.display = 'flex';

    // Arrêter la musique chill définitivement
    stopChillMusic();

    // Vider les médias précédents
    if (screamerMedias) screamerMedias.innerHTML = '';

    // Volume des sons screamer (0-1)
    var vol = Math.min(1, Math.max(0, screamerVolume / 100));

    // Récupérer la liste des fichiers dans /musique
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/musique-list', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var files = JSON.parse(xhr.responseText);

        // Jouer tous les sons en même temps
        files.forEach(function(file) {
          var audioExts = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.wma'];
          if (audioExts.indexOf(file.ext) !== -1) {
            var audio = document.createElement('audio');
            audio.src = 'musique/' + encodeURIComponent(file.name);
            audio.volume = vol;
            audio.loop = true;
            audio.play().catch(function() {});
            audio.style.display = 'none';
            document.body.appendChild(audio);
          }
        });

        // Afficher le screamer (GIF/image/vidéo)
        if (screamerMedias) {
          var ext = screamerFileName.split('.').pop().toLowerCase();
          var mediaUrl = 'public/' + encodeURIComponent(screamerFileName);

          if (ext === 'mp4' || ext === 'webm' || ext === 'ogg' || ext === 'mov') {
            var video = document.createElement('video');
            video.src = mediaUrl;
            video.autoplay = true;
            video.loop = true;
            video.playsInline = true;
            video.muted = false;
            video.controls = false;
            screamerMedias.appendChild(video);
          } else {
            var img = document.createElement('img');
            img.src = mediaUrl;
            img.alt = 'Surprise';
            screamerMedias.appendChild(img);
          }
        }
      }
    };
    xhr.onerror = function() {
      if (screamerMedias) {
        var mediaUrl = 'public/' + encodeURIComponent(screamerFileName);
        var img = document.createElement('img');
        img.src = mediaUrl;
        img.alt = 'Surprise';
        screamerMedias.appendChild(img);
      }
    };
    xhr.send();
  }

  // Afficher l'invite "Une surprise est arrivée" (sans rien jouer encore)
  function showSurpriseInvite() {
    if (isScreamerActive) return;
    isScreamerActive = true;

    // Arrêter le chrono
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Arrêter la musique chill
    stopChillMusic();

    // Récupérer la liste et préparer le bouton Ouvrir
    if (screamerOverlay) {
      screamerOverlay.classList.add('active');
    }
  }

  // Démarrer le chrono
  function startTimer() {
    if (timerInterval) return;
    remainingSeconds = timerSeconds;
    updateChronoDisplay();

    timerInterval = setInterval(function() {
      remainingSeconds--;
      updateChronoDisplay();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        showSurpriseInvite();
      }
    }, 1000);
  }

  // Quand l'utilisateur clique sur "Ouvrir" → joue tout le screamer pour de bon
  if (screamerBtn) {
    screamerBtn.addEventListener('click', function() {
      playScreamerFull();
    });
  }

  // Contrôle du volume chill avec le slider
  if (chillVolumeSlider) {
    chillVolumeSlider.addEventListener('input', function() {
      if (chillAudio) {
        chillAudio.volume = chillVolumeSlider.value / 100;
      }
    });
  }

  // Initialisation : charger la config, puis démarrer le chrono
  // La musique chill ne démarre qu'après un premier clic (contourne autoplay policy)
  var chillStarted = false;

  function startChillOnInteraction() {
    if (chillStarted) return;
    chillStarted = true;
    loadChillMusic();
    document.removeEventListener('click', startChillOnInteraction);
    document.removeEventListener('touchstart', startChillOnInteraction);
    document.removeEventListener('keydown', startChillOnInteraction);
  }

  loadConfig(function() {
    remainingSeconds = timerSeconds;
    updateChronoDisplay();
    startTimer();

    // La musique chill attend une interaction utilisateur
    document.addEventListener('click', startChillOnInteraction);
    document.addEventListener('touchstart', startChillOnInteraction);
    document.addEventListener('keydown', startChillOnInteraction);
  });
})();

// ===== Smooth anchor scroll offset with easing animation =====
(function() {
  var navHeight = 64; // 4rem

  // Ease function: cubic ease-out for a nice deceleration
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function smoothScrollTo(targetY, duration) {
    var startY = window.pageYOffset;
    var distance = targetY - startY;
    var startTime = null;

    function step(currentTime) {
      if (startTime === null) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(progress);
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        smoothScrollTo(top, 800); // 800ms for a nice, visible animation
      }
    });
  });
})();