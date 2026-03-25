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
    volume:      50,        // YouTube usa 0-100
    playerReady: false,
    ambientSound: 'none',
};

const playlist = [
    {
        id:     '5qap5aO4i9A',
        track:  'Lo-Fi Hip Hop Radio',
        artist: 'Lofi Girl'
    },
    {
        id:     'DWcJFNfaw9c',
        track:  'Chillhop Essentials',
        artist: 'Chillhop Music'
    },
    {
        id:     'lTRiuFIWV54',
        track:  'Beats to Study',
        artist: 'Lo-Fi Beats'
    },
    {
        id:     'rUxyKA_-grg',
        track:  'Jazzy Lo-Fi',
        artist: 'Lofi Girl'
    },
];

let currentIndex = 0;
let ytPlayer;

/*
  onYouTubeIframeAPIReady:
  Gancho global obrigatório — a API do YouTube
  chama essa função automaticamente quando
  termina de carregar. O window. garante que
  ela fica acessível globalmente.
*/
window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-player', {
        width:   '1',
        height:  '1',
        videoId: playlist[currentIndex].id,
        playerVars: {
            autoplay:        0,
            controls:        0,
            modestbranding:  1,
            origin:          window.location.origin, // ← resolve o postMessage
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
    if (ambientPanel.hidden) {
        ambientPanel.hidden = false;
        btnMore.innerHTML = '<i class="fas fa-xmark"></i>';
    } else {
        ambientPanel.hidden = true;
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