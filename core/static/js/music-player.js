/**
 * Marcos Cufré Portfolio - Integrated Bento Music Player
 * Inspired by radnaabazar.com
 * Local MP3 playback from /static/music/ with local cover support in /static/images/music/
 */

(function () {
    const PLAYLIST = [
        {
            title: "UUUUUS! (All of Us)",
            artist: "Hiroshi Kitadani",
            subtitle: "One Piece Opening 26 (Egghead)",
            genre: "Anime / Rock",
            duration: "3:18",
            cover: "/static/images/music/one_piece.webp",
            fallbackCover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
            src: "/static/music/one_piece_all_of_us.mp3"
        },
        {
            title: "When the Levee Breaks",
            artist: "Led Zeppelin",
            subtitle: "Led Zeppelin IV (1971)",
            genre: "Classic Rock / Blues",
            duration: "7:08",
            cover: "/static/images/music/led_zeppelin.webp",
            fallbackCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
            src: "/static/music/led_zeppelin_when_the_levee_breaks.mp3"
        },
        {
            title: "Instant Crush (feat. Julian Casablancas)",
            artist: "Daft Punk",
            subtitle: "Random Access Memories",
            genre: "Synthpop / Electro Rock",
            duration: "5:37",
            cover: "/static/images/music/daft_punk.webp",
            fallbackCover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
            src: "/static/music/daft_punk_instant_crush.mp3"
        },
        {
            title: "Lumière",
            artist: "Guillaume Ferran",
            subtitle: "Clair Obscur: Expedition 33 OST",
            genre: "Cinematic / Piano Fantasy",
            duration: "3:42",
            cover: "/static/images/music/expedition_33.webp",
            fallbackCover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
            src: "/static/music/expedition_33_lumiere.mp3"
        },
        {
            title: "Memories of Mother",
            artist: "Bear McCreary",
            subtitle: "God of War (2018) OST",
            genre: "Orchestral / Nordic Epic",
            duration: "3:39",
            cover: "/static/images/music/god_of_war.webp",
            fallbackCover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80",
            src: "/static/music/god_of_war_memories_of_mother.mp3"
        }
    ];

    class MusicPlayer {
        constructor() {
            this.tracks = PLAYLIST;
            this.currentIndex = 0;
            this.isPlaying = false;
            this.audio = new Audio();
            this.audio.preload = "metadata";
            this.volume = 0.8;
            this.audio.volume = this.volume;

            this.initElements();
            this.bindEvents();
            this.loadTrack(this.currentIndex, false);
        }

        rebindElements() {
            this.initElements();
            this.bindEvents();
            const track = this.tracks[this.currentIndex];
            if (this.titleEl) this.titleEl.textContent = track.title;
            if (this.artistEl) this.artistEl.textContent = `${track.artist} · ${track.subtitle || ''}`;
            if (this.genreEl) this.genreEl.textContent = track.genre;
            this.applyCoverImage(this.coverEl, track.cover, track.fallbackCover);
            this.playlistItems.forEach((el, idx) => {
                el.classList.toggle("active", idx === this.currentIndex);
            });
            this.updateUIPlaying(this.isPlaying);
            this.updateProgress();
        }

        initElements() {
            // Main Bento Player Elements
            this.titleEl = document.getElementById("player-title");
            this.artistEl = document.getElementById("player-artist");
            this.genreEl = document.getElementById("player-genre");
            this.coverEl = document.getElementById("player-cover");
            this.vinylEl = document.getElementById("player-vinyl");
            this.playBtn = document.getElementById("player-play-btn");
            this.playIcon = document.getElementById("player-play-icon");
            this.pauseIcon = document.getElementById("player-pause-icon");
            this.prevBtn = document.getElementById("player-prev-btn");
            this.nextBtn = document.getElementById("player-next-btn");
            this.progressBar = document.getElementById("player-progress-bar");
            this.progressContainer = document.getElementById("player-progress-container");
            this.currentTimeEl = document.getElementById("player-current-time");
            this.durationEl = document.getElementById("player-duration");
            this.volumeSlider = document.getElementById("player-volume");
            this.volumeBtn = document.getElementById("player-volume-btn");
            this.volumeIcon = document.getElementById("player-volume-icon");
            this.visualizerBars = document.querySelectorAll(".bento-player .viz-bar");
            this.playlistItems = document.querySelectorAll(".playlist-item");

            // Floating Mini-Dock Elements
            this.miniDock = document.getElementById("mini-music-dock");
            this.dockPlayBtn = document.getElementById("dock-play-btn");
            this.dockPlayIcon = document.getElementById("dock-play-icon");
            this.dockPauseIcon = document.getElementById("dock-pause-icon");
            this.dockTitle = document.getElementById("dock-title");
            this.dockArtist = document.getElementById("dock-artist");
            this.dockCover = document.getElementById("dock-cover");
            this.dockNextBtn = document.getElementById("dock-next-btn");
            this.navSoundToggle = document.getElementById("nav-music-toggle");
        }

        bindEvents() {
            if (this.playBtn) {
                this.playBtn.addEventListener("click", () => this.togglePlay());
            }
            if (this.dockPlayBtn) {
                this.dockPlayBtn.addEventListener("click", () => this.togglePlay());
            }
            if (this.navSoundToggle) {
                this.navSoundToggle.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.togglePlay();
                });
            }
            if (this.prevBtn) {
                this.prevBtn.addEventListener("click", () => this.prevTrack());
            }
            if (this.nextBtn) {
                this.nextBtn.addEventListener("click", () => this.nextTrack());
            }
            if (this.dockNextBtn) {
                this.dockNextBtn.addEventListener("click", () => this.nextTrack());
            }

            // Progress Bar Scrubbing
            if (this.progressContainer) {
                this.progressContainer.addEventListener("click", (e) => {
                    const rect = this.progressContainer.getBoundingClientRect();
                    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    if (this.audio.duration && !isNaN(this.audio.duration)) {
                        this.audio.currentTime = percent * this.audio.duration;
                    }
                });
            }

            // Volume Control
            if (this.volumeSlider) {
                this.volumeSlider.addEventListener("input", (e) => {
                    this.setVolume(parseFloat(e.target.value));
                });
            }
            if (this.volumeBtn) {
                this.volumeBtn.addEventListener("click", () => {
                    if (this.audio.volume > 0) {
                        this.lastVolume = this.audio.volume;
                        this.setVolume(0);
                    } else {
                        this.setVolume(this.lastVolume || 0.8);
                    }
                });
            }

            // Audio Events
            this.audio.addEventListener("timeupdate", () => this.updateProgress());
            this.audio.addEventListener("ended", () => this.nextTrack());
            this.audio.addEventListener("loadedmetadata", () => {
                if (this.durationEl && this.audio.duration && !isNaN(this.audio.duration)) {
                    this.durationEl.textContent = this.formatTime(this.audio.duration);
                }
            });

            // Playlist Item Clicks
            this.playlistItems.forEach((item, index) => {
                item.addEventListener("click", () => {
                    this.loadTrack(index, true);
                });
            });

            // Scroll trigger for floating dock
            window.addEventListener("scroll", () => {
                const bentoSection = document.querySelector(".bento-player");
                if (!bentoSection || !this.miniDock) return;
                const rect = bentoSection.getBoundingClientRect();
                const isOutOfView = rect.bottom < 50 || rect.top > window.innerHeight;
                if (isOutOfView && this.isPlaying) {
                    this.miniDock.classList.add("visible");
                } else if (!this.isPlaying) {
                    this.miniDock.classList.remove("visible");
                }
            });

            // Keyboard shortcut: Space (when not typing in form), 'M' to mute
            window.addEventListener("keydown", (e) => {
                const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
                if (activeTag === "input" || activeTag === "textarea") return;

                if (e.code === "Space") {
                    e.preventDefault();
                    this.togglePlay();
                } else if (e.key === "m" || e.key === "M") {
                    this.toggleMute();
                }
            });
        }

        loadTrack(index, autoPlay = true) {
            this.currentIndex = index;
            const track = this.tracks[this.currentIndex];

            if (this.titleEl) this.titleEl.textContent = track.title;
            if (this.artistEl) this.artistEl.textContent = `${track.artist} · ${track.subtitle || ''}`;
            if (this.genreEl) this.genreEl.textContent = track.genre;
            
            // Set cover with fallback
            this.applyCoverImage(this.coverEl, track.cover, track.fallbackCover);
            this.applyCoverImage(this.dockCover, track.cover, track.fallbackCover);

            if (this.dockTitle) this.dockTitle.textContent = track.title;
            if (this.dockArtist) this.dockArtist.textContent = track.artist;

            this.playlistItems.forEach((el, idx) => {
                if (idx === index) {
                    el.classList.add("active");
                } else {
                    el.classList.remove("active");
                }
            });

            this.audio.src = track.src;

            if (autoPlay) {
                this.play();
            } else {
                this.pause();
            }
        }

        applyCoverImage(imgEl, primarySrc, fallbackSrc) {
            if (!imgEl) return;
            imgEl.onerror = () => {
                imgEl.onerror = null;
                if (fallbackSrc) imgEl.src = fallbackSrc;
            };
            imgEl.src = primarySrc;
        }

        togglePlay() {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        }

        play() {
            this.isPlaying = true;
            this.audio.play().then(() => {
                this.updateUIPlaying(true);
            }).catch(err => {
                console.log("Audio playback error or autoplay block:", err);
                this.updateUIPlaying(false);
            });
        }

        pause() {
            this.isPlaying = false;
            this.audio.pause();
            this.updateUIPlaying(false);
        }

        nextTrack() {
            const nextIdx = (this.currentIndex + 1) % this.tracks.length;
            this.loadTrack(nextIdx, true);
        }

        prevTrack() {
            const prevIdx = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
            this.loadTrack(prevIdx, true);
        }

        updateUIPlaying(playing) {
            if (this.playIcon && this.pauseIcon) {
                this.playIcon.classList.toggle("d-none", playing);
                this.pauseIcon.classList.toggle("d-none", !playing);
            }
            if (this.dockPlayIcon && this.dockPauseIcon) {
                this.dockPlayIcon.classList.toggle("d-none", playing);
                this.dockPauseIcon.classList.toggle("d-none", !playing);
            }
            if (this.vinylEl) {
                this.vinylEl.classList.toggle("spinning", playing);
            }
            if (this.navSoundToggle) {
                this.navSoundToggle.classList.toggle("playing", playing);
            }

            this.visualizerBars.forEach(bar => {
                bar.classList.toggle("animating", playing);
            });

            if (playing && this.miniDock) {
                const bentoSection = document.querySelector(".bento-player");
                if (bentoSection) {
                    const rect = bentoSection.getBoundingClientRect();
                    if (rect.bottom < 50 || rect.top > window.innerHeight) {
                        this.miniDock.classList.add("visible");
                    }
                }
            } else if (!playing && this.miniDock) {
                this.miniDock.classList.remove("visible");
            }
        }

        updateProgress() {
            if (!this.audio.duration || isNaN(this.audio.duration)) return;
            const current = this.audio.currentTime;
            const duration = this.audio.duration;
            const percent = (current / duration) * 100;

            if (this.progressBar) {
                this.progressBar.style.width = `${percent}%`;
            }
            if (this.currentTimeEl) {
                this.currentTimeEl.textContent = this.formatTime(current);
            }
            if (this.durationEl) {
                this.durationEl.textContent = this.formatTime(duration);
            }
        }

        formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        setVolume(val) {
            this.volume = Math.max(0, Math.min(1, val));
            this.audio.volume = this.volume;
            if (this.volumeSlider) {
                this.volumeSlider.value = this.volume;
            }
            if (this.volumeIcon) {
                if (this.volume === 0) {
                    this.volumeIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
                } else if (this.volume < 0.5) {
                    this.volumeIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
                } else {
                    this.volumeIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
                }
            }
        }

        toggleMute() {
            if (this.audio.volume > 0) {
                this.lastVolume = this.audio.volume;
                this.setVolume(0);
            } else {
                this.setVolume(this.lastVolume || 0.8);
            }
        }
    }

    // Initialize player on DOM ready
    document.addEventListener("DOMContentLoaded", () => {
        window.portfolioMusicPlayer = new MusicPlayer();
    });
})();
