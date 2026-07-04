// Base de datos de Espíritus (Sprites) - Capítulo 7, Temporada 3: Runners
const SPIRITS_DATABASE = [
    {
        id: "striker",
        name: "Espíritu Delantero (Striker)",
        rarity: "Mythic",
        ability: "Activa un subidón de 'Overdrive' que aumenta enormemente tu velocidad de movimiento cuando trepas, saltas obstáculos o escalas paredes.",
        source: "Se encuentra en el campo de fútbol central (Soccer Pitch)."
    },
    {
        id: "zeropoint",
        name: "Espíritu del Punto Cero",
        rarity: "Mythic",
        ability: "Otorga un escudo de energía protector y efectos de curación acelerada mientras consumes objetos curativos.",
        source: "Cofres de anomalía míticos de la grieta."
    },
    {
        id: "foundation",
        name: "Espíritu de la Fundación",
        rarity: "Mythic",
        ability: "Aumenta tu resistencia al daño por explosivos y reduce el retroceso por impactos de armas pesadas.",
        source: "Aparición silvestre tras completar desafíos de la Fundación."
    },
    {
        id: "grim",
        name: "Espíritu de la Parca (Grim)",
        rarity: "Legendary",
        ability: "Rastrea de forma reactiva a los enemigos que te infligen daño, revelando su silueta a través de las paredes por unos segundos.",
        source: "Cofres raros de anomalías en zonas de tormenta."
    },
    {
        id: "dream",
        name: "Espíritu Dormilon (almohadita)",
        rarity: "Legendary",
        ability: "Te otorga un objeto aleatorio cada vez que sube de nivel durante la partida, con alta probabilidad de botín legendario.",
        source: "Encuentro raro en las zonas de bosque y naturaleza."
    },
    {
        id: "punk",
        name: "Espíritu Punk",
        rarity: "Legendary",
        ability: "Al alcanzar el nivel máximo (nivel 5), otorga una probabilidad del 25% de no consumir munición al disparar.",
        source: "Se obtiene al derrotar a los secuaces de la banda de música punk."
    },
    {
        id: "boss",
        name: "Espíritu Jefe (DeadPool)",
        rarity: "Legendary",
        ability: "Potencia el daño de las armas de asalto y otorga una recarga 15% más rápida al derrotar enemigos consecutivamente.",
        source: "Se obtiene exclusivamente al derrotar a los jefes principales del mapa."
    },
    {
        id: "aura",
        name: "Espíritu Mago",
        rarity: "Legendary",
        ability: "Crea una zona curativa a tu alrededor que sana gradualmente a ti y a tus compañeros de equipo cercanos.",
        source: "Cofres legendarios de la isla."
    },
    {
        id: "demon",
        name: "Espíritu Demonio",
        rarity: "Epic",
        ability: "Efecto Sifón: Recuperas 25 puntos de escudo o vida inmediatamente tras eliminar a un oponente.",
        source: "Zonas oscuras o en cofres de anomalía comunes."
    },
    {
        id: "ghost",
        name: "Espíritu Fantasma",
        rarity: "Epic",
        ability: "Te otorga camuflaje de invisibilidad parcial durante 3 segundos cada vez que recargas un arma vacía.",
        source: "Apariciones nocturnas en cementerios o ruinas."
    },
    {
        id: "duck",
        name: "Espíritu Pato",
        rarity: "Epic",
        ability: "Regenera tu escudo de forma continua mientras realizas gestos (emotes) o tocas música (jam).",
        source: "Cofres cerca de lagos y zonas de agua dulce."
    },
    {
        id: "king",
        name: "Espíritu Rey",
        rarity: "Epic",
        ability: "Aumenta el daño de tu pico contra estructuras en un 50% y contra oponentes en un 25%.",
        source: "Encuentros en las zonas del castillo o trono de la temporada."
    },
    {
        id: "water",
        name: "Espíritu de Agua",
        rarity: "Rare",
        ability: "Regenera tu escudo y salud de forma pasiva mientras nadas o estás parado en el agua corriente.",
        source: "Pesca y cofres costeros. (Starter Sprite disponible al inicio)"
    },
    {
        id: "earth",
        name: "Espíritu de Tierra",
        rarity: "Rare",
        ability: "Incrementa en un 20% la probabilidad de que los cofres que abras contengan botín de rareza superior.",
        source: "Cofres en cuevas y zonas montañosas. (Starter Sprite)"
    },
    {
        id: "fire",
        name: "Espíritu de Fuego",
        rarity: "Rare",
        ability: "Al infligir 150 puntos de daño continuo con cualquier arma, el siguiente disparo provoca una explosión ígnea.",
        source: "Zonas volcánicas y fogatas. (Starter Sprite)"
    },
    {
        id: "fishy",
        name: "Espíritu de Pez",
        rarity: "Rare",
        ability: "Aumenta la velocidad de nado un 40% y te otorga una aceleración rápida al recibir daño de oponentes.",
        source: "Pesca y encuentros en muelles de la isla."
    }
];

// Estado global de la colección del usuario
let userCollection = {};

// Configuración de audio
let audioContext = null;
const audioToggle = document.getElementById("audio-toggle");

// Inicialización de la colección
function initCollection() {
    const saved = localStorage.getItem("fortnite_sprites_collection");
    if (saved) {
        try {
            userCollection = JSON.parse(saved);
        } catch (e) {
            console.error("Error al cargar la colección guardada. Creando una nueva.", e);
            resetCollectionState();
        }
    } else {
        resetCollectionState();
    }
    
    // Asegurar que todos los espíritus de la DB tengan entradas válidas
    SPIRITS_DATABASE.forEach(spirit => {
        if (!userCollection[spirit.id]) {
            userCollection[spirit.id] = {
                base: false,
                gold: false,
                gummy: false,
                galaxy: false
            };
        }
    });
}

function resetCollectionState() {
    userCollection = {};
    SPIRITS_DATABASE.forEach(spirit => {
        userCollection[spirit.id] = {
            base: false,
            gold: false,
            gummy: false,
            galaxy: false
        };
    });
}

function saveCollection() {
    localStorage.setItem("fortnite_sprites_collection", JSON.stringify(userCollection));
}

// --- SISTEMA DE SONIDOS SINTETIZADOS (WEB AUDIO API) ---
function playTone(freq, type, duration, delay = 0) {
    if (!audioToggle.checked) return;
    
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Evitar fallos de autoplay bloqueado
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
        
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + delay);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + duration);
    } catch (e) {
        console.warn("La API Web Audio no está disponible o fue bloqueada por el navegador.", e);
    }
}

function playSound(action) {
    if (action === "check") {
        playTone(440, "sine", 0.1);
        playTone(880, "sine", 0.15, 0.08);
    } else if (action === "uncheck") {
        playTone(660, "sine", 0.1);
        playTone(330, "sine", 0.15, 0.08);
    } else if (action === "success") {
        // Melodía triunfal corta
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
            playTone(freq, "triangle", 0.15, index * 0.1);
        });
    } else if (action === "reset") {
        playTone(220, "sawtooth", 0.3);
    }
}

// --- RENDERIZADO DE LA INTERFAZ ---
const rarityOrder = { "Mythic": 4, "Legendary": 3, "Epic": 2, "Rare": 1 };

function renderSpiritsGrid() {
    const grid = document.getElementById("spirits-grid");
    grid.innerHTML = "";
    
    // Obtener filtros actuales
    const searchVal = document.getElementById("search-input").value.toLowerCase();
    const rarityVal = document.querySelector("#rarity-filters .active").dataset.rarity;
    const statusVal = document.querySelector("#status-filters .active").dataset.status;
    const sortVal = document.getElementById("sort-select").value;
    
    // Filtrar base de datos
    let filtered = SPIRITS_DATABASE.filter(spirit => {
        // Filtro por búsqueda
        const matchSearch = spirit.name.toLowerCase().includes(searchVal) || 
                            spirit.ability.toLowerCase().includes(searchVal);
        
        // Filtro por rareza
        const matchRarity = rarityVal === "all" || spirit.rarity === rarityVal;
        
        // Filtro por estado
        const collection = userCollection[spirit.id];
        const isCollected = collection.base || collection.gold || collection.gummy || collection.galaxy;
        const isCompleted = collection.base && collection.gold && collection.gummy && collection.galaxy;
        
        let matchStatus = true;
        if (statusVal === "collected") {
            matchStatus = isCollected; // Mostrar si tiene al menos uno
        } else if (statusVal === "missing") {
            matchStatus = !isCompleted; // Mostrar si le falta al menos una variante
        }
        
        return matchSearch && matchRarity && matchStatus;
    });
    
    // Ordenar
    if (sortVal === "alpha") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === "progress-desc") {
        filtered.sort((a, b) => {
            const countA = Object.values(userCollection[a.id]).filter(Boolean).length;
            const countB = Object.values(userCollection[b.id]).filter(Boolean).length;
            return countB - countA || rarityOrder[b.rarity] - rarityOrder[a.rarity];
        });
    } else if (sortVal === "progress-asc") {
        filtered.sort((a, b) => {
            const countA = Object.values(userCollection[a.id]).filter(Boolean).length;
            const countB = Object.values(userCollection[b.id]).filter(Boolean).length;
            return countA - countB || rarityOrder[b.rarity] - rarityOrder[a.rarity];
        });
    } else {
        // default: Por rareza (Mítico primero)
        filtered.sort((a, b) => {
            return rarityOrder[b.rarity] - rarityOrder[a.rarity] || a.name.localeCompare(b.name);
        });
    }
    
    // Actualizar conteo visible
    document.getElementById("visible-count").innerText = filtered.length;
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-folder-open"></i>
                <p>No se encontraron espíritus con los filtros aplicados.</p>
            </div>
        `;
        return;
    }
    
    // Renderizar tarjetas
    filtered.forEach(spirit => {
        const collection = userCollection[spirit.id];
        const card = document.createElement("div");
        card.className = "sprite-card";
        card.dataset.rarity = spirit.rarity;
        card.id = `card-${spirit.id}`;
        
        // Traducir rareza para visualización
        const rarityText = {
            "Rare": "Raro",
            "Epic": "Épico",
            "Legendary": "Legendario",
            "Mythic": "Mítico"
        }[spirit.rarity];
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-header-row">
                    <h3 class="sprite-title">${spirit.name}</h3>
                    <span class="rarity-pill" data-rarity="${spirit.rarity}">${rarityText}</span>
                    <img src="https://culturageek.com.ar/wp-content/uploads/2026/06/espiritu-jefe-boss-sprite-fortnite.webp" width="75" height="75">
                </div>
                
                <p class="sprite-ability">${spirit.ability}</p>
                
                <div class="sprite-source">
                    <i class="fa-solid fa-map-pin"></i> ${spirit.source}
                </div>
                
                <div class="variant-matrix">
                    <button class="variant-pill ${collection.base ? 'active' : ''}" data-variant="base" data-spirit-id="${spirit.id}" title="Variante Común/Base">
                        <span class="pill-icon"><i class="fa-solid fa-ghost"></i></span>
                        <span class="pill-title">Base</span>
                    </button>
                    <button class="variant-pill ${collection.gold ? 'active' : ''}" data-variant="gold" data-spirit-id="${spirit.id}" title="Variante Dorada (+300% XP)">
                        <span class="pill-icon"><i class="fa-solid fa-crown"></i></span>
                        <span class="pill-title">Dorado</span>
                    </button>
                    <button class="variant-pill ${collection.gummy ? 'active' : ''}" data-variant="gummy" data-spirit-id="${spirit.id}" title="Variante Gomita (Polvo rápido)">
                        <span class="pill-icon"><i class="fa-solid fa-droplet"></i></span>
                        <span class="pill-title">Gomita</span>
                    </button>
                    <button class="variant-pill ${collection.galaxy ? 'active' : ''}" data-variant="galaxy" data-spirit-id="${spirit.id}" title="Variante Galaxia (Recarga estelar)">
                        <span class="pill-icon"><i class="fa-solid fa-user-astronaut"></i></span>
                        <span class="pill-title">Galaxia</span>
                    </button>
                </div>
            </div>
        `;
        
        // Agregar eventos de clic a las píldoras de variante
        card.querySelectorAll(".variant-pill").forEach(pill => {
            pill.addEventListener("click", () => {
                const variant = pill.dataset.variant;
                const spiritId = pill.dataset.spiritId;
                
                toggleVariant(spiritId, variant, pill);
            });
        });
        
        grid.appendChild(card);
    });
}

// Modificar estado de variante
function toggleVariant(spiritId, variant, pillElement) {
    const wasActive = userCollection[spiritId][variant];
    userCollection[spiritId][variant] = !wasActive;
    
    // Guardar en almacenamiento local
    saveCollection();
    
    // Actualizar clase visual en el botón
    if (userCollection[spiritId][variant]) {
        pillElement.classList.add("active");
        playSound("check");
    } else {
        pillElement.classList.remove("active");
        playSound("uncheck");
    }
    
    // Actualizar barras estadísticas globales
    updateStats();
    
    // Si estamos filtrando por Conseguidos/Faltantes, debemos re-renderizar la cuadrícula para actualizar los elementos visibles
    const statusVal = document.querySelector("#status-filters .active").dataset.status;
    if (statusVal !== "all") {
        setTimeout(renderSpiritsGrid, 250); // Un pequeño retraso para permitir ver la animación del clic
    }
}

// --- ACTUALIZACIÓN DE ESTADÍSTICAS ---
function updateStats() {
    let totalChecked = 0;
    const maxPossibilities = SPIRITS_DATABASE.length * 4; // 16 espíritus * 4 variantes = 64
    
    const variantCounts = {
        base: 0,
        gold: 0,
        gummy: 0,
        galaxy: 0
    };
    
    // Contar las variantes desbloqueadas
    Object.keys(userCollection).forEach(spiritId => {
        const item = userCollection[spiritId];
        if (item.base) { variantCounts.base++; totalChecked++; }
        if (item.gold) { variantCounts.gold++; totalChecked++; }
        if (item.gummy) { variantCounts.gummy++; totalChecked++; }
        if (item.galaxy) { variantCounts.galaxy++; totalChecked++; }
    });
    
    // Calcular porcentaje global
    const percentage = maxPossibilities > 0 ? Math.round((totalChecked / maxPossibilities) * 100) : 0;
    
    // Actualizar interfaz
    document.getElementById("global-percentage").innerText = `${percentage}%`;
    document.getElementById("global-count").innerText = `${totalChecked}/${maxPossibilities}`;
    
    document.getElementById("stat-base").innerText = `${variantCounts.base}/16`;
    document.getElementById("stat-gold").innerText = `${variantCounts.gold}/16`;
    document.getElementById("stat-gummy").innerText = `${variantCounts.gummy}/16`;
    document.getElementById("stat-galaxy").innerText = `${variantCounts.galaxy}/16`;
    
    // Animar círculo de progreso SVG
    const circle = document.getElementById("global-progress-circle");
    if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
    
    // Comprobar si se completó el 100% para lanzar sonido especial
    if (totalChecked === maxPossibilities && maxPossibilities > 0) {
        const hasCelebrated = localStorage.getItem("celebrated_100");
        if (!hasCelebrated) {
            playSound("success");
            localStorage.setItem("celebrated_100", "true");
            alert("¡Felicidades! Has completado tu colección al 100% en el Sprite Locker. ¡Eres un auténtico Runner!");
        }
    } else {
        localStorage.removeItem("celebrated_100");
    }
}

// --- GESTIÓN DE EVENTOS DE FILTROS ---
function setupFilters() {
    // Filtros de rareza
    document.querySelectorAll("#rarity-filters .filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#rarity-filters .filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            playSound("check");
            renderSpiritsGrid();
        });
    });
    
    // Filtros de estado
    document.querySelectorAll("#status-filters .filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#status-filters .filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            playSound("check");
            renderSpiritsGrid();
        });
    });
    
    // Selector de orden
    document.getElementById("sort-select").addEventListener("change", () => {
        playSound("check");
        renderSpiritsGrid();
    });
    
    // Búsqueda por entrada (debounced)
    let searchTimeout;
    document.getElementById("search-input").addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderSpiritsGrid();
        }, 150);
    });
}

// --- MODALES (RESPALDOS Y RESTABLECIMIENTO) ---
function setupModals() {
    const backupModal = document.getElementById("backup-modal");
    const resetModal = document.getElementById("reset-modal");
    
    const btnExport = document.getElementById("btn-export");
    const btnImport = document.getElementById("btn-import");
    const btnReset = document.getElementById("btn-reset");
    
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnCloseResetModal = document.getElementById("btn-close-reset-modal");
    
    const exportContainer = document.getElementById("export-container");
    const importContainer = document.getElementById("import-container");
    
    const backupCodeArea = document.getElementById("backup-code-area");
    const importCodeArea = document.getElementById("import-code-area");
    const importError = document.getElementById("import-error");
    
    const btnCopyCode = document.getElementById("btn-copy-code");
    const btnConfirmImport = document.getElementById("btn-confirm-import");
    
    const btnCancelReset = document.getElementById("btn-cancel-reset");
    const btnConfirmReset = document.getElementById("btn-confirm-reset");
    
    // Exportar
    btnExport.addEventListener("click", () => {
        // Convertir estado a string base64
        const dataStr = JSON.stringify(userCollection);
        const encoded = btoa(unescape(encodeURIComponent(dataStr)));
        
        document.getElementById("modal-title").innerText = "Exportar Colección";
        exportContainer.style.display = "block";
        importContainer.style.display = "none";
        backupCodeArea.value = encoded;
        
        backupModal.style.display = "flex";
        backupModal.setAttribute("aria-hidden", "false");
        playSound("check");
    });
    
    // Copiar código exportado
    btnCopyCode.addEventListener("click", () => {
        backupCodeArea.select();
        document.execCommand("copy");
        btnCopyCode.innerHTML = `<i class="fa-solid fa-check"></i> ¡Copiado!`;
        playSound("success");
        setTimeout(() => {
            btnCopyCode.innerHTML = `<i class="fa-solid fa-copy"></i> Copiar Código`;
        }, 2000);
    });
    
    // Importar
    btnImport.addEventListener("click", () => {
        document.getElementById("modal-title").innerText = "Importar Colección";
        exportContainer.style.display = "none";
        importContainer.style.display = "block";
        importCodeArea.value = "";
        importError.style.display = "none";
        
        backupModal.style.display = "flex";
        backupModal.setAttribute("aria-hidden", "false");
        playSound("check");
    });
    
    // Confirmar Importación
    btnConfirmImport.addEventListener("click", () => {
        const code = importCodeArea.value.trim();
        try {
            const decoded = decodeURIComponent(escape(atob(code)));
            const parsed = JSON.parse(decoded);
            
            // Validar estructura básica
            let isValid = true;
            SPIRITS_DATABASE.forEach(spirit => {
                if (!parsed[spirit.id]) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                userCollection = parsed;
                saveCollection();
                updateStats();
                renderSpiritsGrid();
                backupModal.style.display = "none";
                backupModal.setAttribute("aria-hidden", "true");
                playSound("success");
                alert("¡Colección importada con éxito!");
            } else {
                throw new Error("Datos corruptos o incompletos");
            }
        } catch (e) {
            importError.style.display = "block";
            playSound("uncheck");
        }
    });
    
    // Resetear
    btnReset.addEventListener("click", () => {
        resetModal.style.display = "flex";
        resetModal.setAttribute("aria-hidden", "false");
        playSound("uncheck");
    });
    
    btnConfirmReset.addEventListener("click", () => {
        resetCollectionState();
        saveCollection();
        updateStats();
        renderSpiritsGrid();
        resetModal.style.display = "none";
        resetModal.setAttribute("aria-hidden", "true");
        playSound("reset");
    });
    
    // Cerrar modals
    btnCloseModal.addEventListener("click", () => {
        backupModal.style.display = "none";
        backupModal.setAttribute("aria-hidden", "true");
        playSound("uncheck");
    });
    
    btnCloseResetModal.addEventListener("click", () => {
        resetModal.style.display = "none";
        resetModal.setAttribute("aria-hidden", "true");
        playSound("uncheck");
    });
    
    btnCancelReset.addEventListener("click", () => {
        resetModal.style.display = "none";
        resetModal.setAttribute("aria-hidden", "true");
        playSound("uncheck");
    });
    
    // Cerrar modal al hacer clic en el fondo
    window.addEventListener("click", (e) => {
        if (e.target === backupModal) {
            backupModal.style.display = "none";
            backupModal.setAttribute("aria-hidden", "true");
        }
        if (e.target === resetModal) {
            resetModal.style.display = "none";
            resetModal.setAttribute("aria-hidden", "true");
        }
    });
}

// --- EVENTO AL CARGAR LA PÁGINA ---
document.addEventListener("DOMContentLoaded", () => {
    initCollection();
    updateStats();
    setupFilters();
    setupModals();
    renderSpiritsGrid();
});
