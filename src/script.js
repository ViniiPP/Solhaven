const btnPlay      = document.getElementById('btn-play');
const btnPrev      = document.getElementById('btn-prev');
const btnNext      = document.getElementById('btn-next');
const btnMore      = document.getElementById('btn-more');
const volumeSlider = document.getElementById('volume-slider');
const ambientPanel = document.getElementById('ambient-panel');
const trackName    = document.querySelector('.player__track');
const artistName   = document.querySelector('.player__artist');

const state = {
    isPlaying:   false,
    volume:      50,        
    playerReady: false,
    ambientSound: 'none',
};

// as tracks que vão tocar
const playlist = [
    {
        id:     'eTP5PZ8NoeU', 
        track:  'Sweet Dreams Lofi',
        artist: 'Lofi Girl'
    },
    {
        id:     'Qz3nLOiyCv8', 
        track:  'Slow Jazz',
        artist: 'Relaxation and Meditation'
    },
    {
        id:     'sF80I-TQiW0', 
        track:  '90s Chill Lofi',
        artist: 'The Japanese Town'
    },
    {
        id:     'SllpB3W5f6s', 
        track:  'Dark academia',
        artist: 'Toxic Drunker'
    },
    {
        id:     'Q74YUAxqs00', 
        track:  'Chill Beats for Study & Relax',
        artist: 'LoFi Tokyo'
    }
];

let currentIndex = 0;
let ytPlayer;

/*
  onYouTubeIframeAPIReady:
  Gancho global: a API do YouTube
  chama essa função automaticamente quando
  termina de carregar. O window garante que
  ela fica acessível globalmente
*/
window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-player', {
        width:   '250', 
        height:  '250',
        videoId: playlist[currentIndex].id,
        playerVars: {
            autoplay:        0,
            controls:        0,
            modestbranding:  1,
            enablejsapi:     1,
            origin:          window.location.origin,
        },
        events: {
            onReady:       onPlayerReady,
            onStateChange: onPlayerStateChange,
        }
    });
};

// CALLBACK: player pronto
function onPlayerReady() {
    state.playerReady = true;
    ytPlayer.setVolume(state.volume);
    updateTrackInfo();
    console.log('YouTube Player pronto!');
}

// CALLBACK: mudança de estado
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        nextTrack();
    }
}

// atualiza nome e artista na UI
function updateTrackInfo() {
    const track = playlist[currentIndex];
    trackName.textContent  = track.track;
    artistName.textContent = track.artist;
}

// alterna play / pause
function togglePlay() {
    if (!state.playerReady) return;

    if (state.isPlaying) {
        ytPlayer.pauseVideo();
        state.isPlaying = false;
        btnPlay.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        ytPlayer.unMute(); 
        ytPlayer.setVolume(state.volume);
        ytPlayer.playVideo();
        state.isPlaying = true;
        btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

// avança para a próxima música
function nextTrack() {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadTrack();
}

// volta para a música anterior
function prevTrack() {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack();
}

// carrega e toca a faixa do índice atual
function loadTrack() {
    ytPlayer.loadVideoById(playlist[currentIndex].id);
    ytPlayer.unMute();
    state.isPlaying = true;
    btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
    updateTrackInfo();
}

// controle de volume (YouTube usa 0-100)
function setVolume(value) {
    state.volume = value;
    if (ytPlayer && state.playerReady) {
        ytPlayer.setVolume(value);
    }
}

// painel de sons ambiente
function toggleAmbientPanel() {
    ambientPanel.classList.toggle('show');
    
    if (ambientPanel.classList.contains('show')) {
        btnMore.innerHTML = '<i class="fas fa-xmark"></i>';
    } else {
        btnMore.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
    }
}

/* Event Listeners */
btnPlay.addEventListener('click', togglePlay);
btnNext.addEventListener('click', nextTrack);
btnPrev.addEventListener('click', prevTrack);
btnMore.addEventListener('click', toggleAmbientPanel);

volumeSlider.addEventListener('input', function() {
    setVolume(+this.value);
});


/* sistema de sons ambiente */
const ambientAudios = {
    rain: new Audio('../src/assetts/chuva.mp3'),
    fire: new Audio('../src/assetts/fogueira.mp3')
};

// áudios tocam em loop
Object.values(ambientAudios).forEach(audio => {
    audio.loop = true;
    audio.volume = 0.15; // Volume dos efeitos
    
    audio.addEventListener('error', (e) => {
        console.error("Erro ao carregar o áudio. Verifique o caminho da pasta:", e);
    });
});

// Selecionar os botões do painel
const ambientBtns = document.querySelectorAll('.player__ambient button');
const btnNone = document.querySelector('[data-sound="none"]');

// Evento de clique nos botões
ambientBtns.forEach(button => {
    button.addEventListener('click', () => {
        const soundType = button.getAttribute('data-sound');

        // click botão "Silêncio"
        if (soundType === 'none') {
            Object.values(ambientAudios).forEach(audio => audio.pause());
            
            // Remove destaque de todos e ativa só o silencio
            ambientBtns.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            return;
        }

        // Se clicou na Chuva ou Fogo
        const audio = ambientAudios[soundType];
        const isActive = button.classList.contains('active');

        if (isActive) {
            // Se já estava tocando, pausa e tira o brilho do botão
            audio.pause();
            button.classList.remove('active');
            
            // Se nenhum outro som estiver ativo, ativa o botão silencio automático
            const anyActive = Array.from(ambientBtns).some(btn => btn.classList.contains('active') && btn.getAttribute('data-sound') !== 'none');
            if (!anyActive) {
                btnNone.classList.add('active');
            }
        } else {
            // Se estava desligado dá play e ativa o botão
            audio.play();
            button.classList.add('active');
            btnNone.classList.remove('active'); 
        }
    });
});

// Começa com o botão silencio attivado
btnNone.classList.add('active');