/**
 * Marcos Cufré Portfolio - Core Interactive Features
 * Inspired by radnaabazar.com
 * Live clock, terminal playground, spotlight glow, toast feedback.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Live Argentina Local Time (ART, UTC-3)
    const localTimeEl = document.getElementById("live-local-time");
    function updateArgentinaTime() {
        if (!localTimeEl) return;
        try {
            const now = new Date();
            const options = {
                timeZone: "America/Argentina/Buenos_Aires",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            };
            const timeStr = new Intl.DateTimeFormat("es-AR", options).format(now);
            localTimeEl.textContent = `${timeStr} ART`;
        } catch (e) {
            localTimeEl.textContent = "UTC-3";
        }
    }
    updateArgentinaTime();
    setInterval(updateArgentinaTime, 1000);

    // 2. Mouse Spotlight Glow on Bento Cards
    const bentoCards = document.querySelectorAll(".bento-card, .project-bento-card");
    bentoCards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    });

    // 3. Interactive Terminal Playground
    const terminalInput = document.getElementById("terminal-cmd-input");
    const terminalOutput = document.getElementById("terminal-cmd-output");
    const terminalForm = document.getElementById("terminal-cmd-form");

    const TERMINAL_COMMANDS = {
        "help": "Comandos disponibles: <span class='cmd-tag'>skills</span>, <span class='cmd-tag'>projects</span>, <span class='cmd-tag'>status</span>, <span class='cmd-tag'>music</span>, <span class='cmd-tag'>hobbies</span>, <span class='cmd-tag'>contact</span>, <span class='cmd-tag'>clear</span>",
        "skills": "Python, Django, Django REST Framework, FastAPI, PostgreSQL, Supabase, Vue 3, Docker, Git, Clean Architecture",
        "projects": "1. LogiTrack (Rutas & HOS) | 2. AgroTrack (Gestión agrícola) | 3. Cine Management | 4. Herrera Automotores (DMS/CRM)",
        "status": "🟢 Activo & buscando nuevos desafíos | +1 año de experiencia práctica construyendo sistemas y APIs en producción",
        "hobbies": "🎮 Fan de Counter-Strike & gaming | 📚 Lectura: policial, misterio, fantasía épica, historia y mitología | 🏛️ Filosofía y reflexión | 🎧 Rock clásico, Daft Punk, anime y OSTs",
        "music": "🎵 Mi selección: 1. One Piece - UUUUUS! (All of Us) | 2. Led Zeppelin - When the Levee Breaks | 3. Daft Punk - Instant Crush | 4. Expedition 33 - Lumière | 5. God of War - Memories of Mother",
        "contact": "Email: <a href='mailto:marcoscufre04@gmail.com' class='text-cyan'>marcoscufre04@gmail.com</a> | LinkedIn: <a href='https://www.linkedin.com/in/marcos-cufre-267562309/' target='_blank' class='text-cyan'>Marcos Cufré</a>",
        "whoami": "Visitante curioso conociendo el portafolio de Marcos Cufré",
        "clear": "CLEAR"
    };

    if (terminalForm && terminalInput && terminalOutput) {
        terminalForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const rawVal = terminalInput.value.trim().toLowerCase();
            if (!rawVal) return;

            if (rawVal === "clear") {
                terminalOutput.innerHTML = "";
                terminalInput.value = "";
                return;
            }

            const commandLine = document.createElement("div");
            commandLine.className = "terminal-line terminal-user";
            commandLine.innerHTML = `<span class="prompt text-cyan">visitor@portfolio:~$</span> ${escapeHTML(rawVal)}`;
            terminalOutput.appendChild(commandLine);

            const responseLine = document.createElement("div");
            responseLine.className = "terminal-line terminal-response";

            if (TERMINAL_COMMANDS[rawVal]) {
                responseLine.innerHTML = TERMINAL_COMMANDS[rawVal];
            } else {
                responseLine.innerHTML = `Comando no reconocido: "${escapeHTML(rawVal)}". Escribe <span class="cmd-tag">help</span> para ver la lista de comandos.`;
            }

            terminalOutput.appendChild(responseLine);
            terminalInput.value = "";
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        });

        // Clickable quick command chips
        document.querySelectorAll(".quick-cmd-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                const cmd = chip.getAttribute("data-cmd");
                if (cmd && terminalInput) {
                    terminalInput.value = cmd;
                    terminalForm.dispatchEvent(new Event("submit"));
                }
            });
        });
    }

    // 4. Quick Email Copy Button with Toast
    const copyEmailBtn = document.getElementById("copy-email-btn");
    const toastEl = document.getElementById("copy-toast");

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener("click", () => {
            const email = "marcoscufre04@gmail.com";
            navigator.clipboard.writeText(email).then(() => {
                showToast("¡Email copiado al portapapeles!");
            }).catch(() => {
                showToast("marcoscufre04@gmail.com");
            });
        });
    }

    function showToast(msg) {
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add("show");
        setTimeout(() => {
            toastEl.classList.remove("show");
        }, 3000);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
