// --- NOTIFICACIONES Y MODALES ---
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    let toast = document.createElement('div');
    toast.style.background = '#121218';
    toast.style.color = '#fff';
    toast.style.borderLeft = `5px solid ${type === 'success' ? '#00cc66' : type === 'error' ? '#ff3333' : type === 'warning' ? '#ffcc00' : '#00e5ff'}`;
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '6px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.minWidth = '280px';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    toast.style.pointerEvents = 'auto';

    let icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '☁️';
    toast.innerHTML = `<span style="font-size:18px;">${icon}</span><span style="font-size:13px; font-weight:500;">${message}</span>`;
    
    container.appendChild(toast);
    toast.offsetHeight;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => { toast.remove(); }, 300);
    }, 3500);
}

function showCustomConfirm(title, message, onConfirm, onCancel = null) {
    let modal = document.getElementById('custom-modal');
    let modalBox = modal.querySelector('div');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    document.getElementById('modal-icon').innerText = '❓';
    document.getElementById('modal-btn-cancel').style.display = 'block';
    
    modal.style.display = 'flex';
    setTimeout(() => { modalBox.style.transform = 'scale(1)'; }, 10);
    
    document.getElementById('modal-btn-ok').onclick = () => { closeCustomModal(); if(onConfirm) onConfirm(); };
    document.getElementById('modal-btn-cancel').onclick = () => { closeCustomModal(); if(onCancel) onCancel(); };
}

function showCustomAlert(title, message, onConfirm = null) {
    let modal = document.getElementById('custom-modal');
    let modalBox = modal.querySelector('div');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    document.getElementById('modal-icon').innerText = '⚠️';
    document.getElementById('modal-btn-cancel').style.display = 'none';
    
    modal.style.display = 'flex';
    setTimeout(() => { modalBox.style.transform = 'scale(1)'; }, 10);
    
    document.getElementById('modal-btn-ok').onclick = () => { closeCustomModal(); if(onConfirm) onConfirm(); };
}

function closeCustomModal() {
    let modal = document.getElementById('custom-modal');
    let modalBox = modal.querySelector('div');
    modalBox.style.transform = 'scale(0.9)';
    setTimeout(() => { modal.style.display = 'none'; }, 150);
}

function showLogoFallback() {
    document.getElementById('hub-logo').style.display = 'none';
    document.getElementById('hub-logo-fallback').style.display = 'block';
}

function printLog(msg) { 
    if(!logEl) return;
    logEl.innerHTML += `<span style="color:#666">[>_]</span> ${msg}<br>`; 
    logEl.scrollTop = logEl.scrollHeight; 
}

// --- HUB SYSTEM Y PESTAÑAS ---
function showHubTab(tabName) {
    document.getElementById('btn-tab-local').classList.remove('active');
    document.getElementById('btn-tab-com').classList.remove('active');
    document.getElementById('hub-local').classList.remove('active');
    document.getElementById('hub-community').classList.remove('active');
    
    if(tabName === 'local') {
        document.getElementById('btn-tab-local').classList.add('active');
        document.getElementById('hub-local').classList.add('active');
        refreshHubProjects();
    } else {
        document.getElementById('btn-tab-com').classList.add('active');
        document.getElementById('hub-community').classList.add('active');
        fetchCommunityGames();
    }
}

function switchCommunityCategory(category) {
    document.querySelectorAll('.com-subtab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    activeCommunityCategory = category;
    loadCommunityDemos();
}

function factoryReset() {
    showCustomConfirm("Restaurar de Fábrica", "¿Quieres borrar TODOS los proyectos locales de Gamet y restaurar el motor a su estado de fábrica?", () => {
        localStorage.removeItem('unboring_projects'); 
        location.reload(); 
    });
}

function loadCommunityDemos() {
    let container = document.getElementById('hub-community-list');
    container.innerHTML = '';
    
    let listToRender = [...COMMUNITY_DEMOS];
    let searchInput = document.getElementById('com-search');
    if (searchInput && searchInput.value) {
        let searchTerm = searchInput.value.toLowerCase();
        listToRender = listToRender.filter(demo => 
            demo.name.toLowerCase().includes(searchTerm) || 
            demo.author.toLowerCase().includes(searchTerm) ||
            (demo.desc && demo.desc.toLowerCase().includes(searchTerm))
        );
    }

    if (activeCommunityCategory === "destacados") {
        listToRender = listToRender.filter(demo => demo.rating >= 90 && demo.plays >= 50);
        listToRender.sort((a, b) => b.plays - a.plays);
    } else if (activeCommunityCategory === "prometedores") {
        listToRender = listToRender.filter(demo => demo.rating >= 95 && demo.plays < 5000);
        listToRender.sort((a, b) => b.rating - a.rating);
    } else if (activeCommunityCategory === "picks") {
        listToRender = listToRender.filter(demo => demo.picks || demo.author === "@gamet_team" || demo.author === "@AXEL-TONTITO");
    }
    
    if(listToRender.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px; font-size: 14px;">No se ha encontrado nada.</div>`;
        return;
    }

    listToRender.forEach((demo) => {
        let index = COMMUNITY_DEMOS.findIndex(d => d.name === demo.name && d.author === demo.author);
        let card = document.createElement('div'); card.className = 'hub-card';
        let isTpl = demo.isTemplate || demo.istemplate;
        let badgeClass = isTpl ? 'template' : 'game';
        let badgeText = isTpl ? ' Plantilla Editable' : ' Juego Terminado';
        let colorBorder = isTpl ? '#00e5ff' : '#00cc66';
        
        card.innerHTML = `
            <div class="thumb" style="border-bottom-color: ${colorBorder};">🎮</div>
            <div class="info">
                <h4>${demo.name}</h4>
                <p class="author">Autor: ${demo.author}</p>
                <div class="stats-line"><span>👍 ${demo.rating || 100}%</span><span>👁️ ${(demo.plays || 0).toLocaleString()}</span></div>
                <span class="badge ${badgeClass}">${badgeText}</span>
                ${isTpl ? 
                    `<button onclick="downloadCommunityDemo(${index})" style="background:#00a2ff; color:#000;">👥 Remezclar Plantilla</button>` : 
                    `<button onclick="playCommunityDemo(${index})" style="background:#00cc66; color:#000;">▶️ JUGAR AHORA</button>`
                }
            </div>
        `;
        container.appendChild(card);
    });
}

function downloadCommunityDemo(index) {
    let demo = COMMUNITY_DEMOS[index];
    let projects = getProjectsFromStorage();
    let finalName = "Remezcla de " + demo.name;
    let counter = 1;
    while (projects[finalName]) { finalName = "Remezcla de " + demo.name + " (" + counter + ")"; counter++; }
    
    try {
        projects[finalName] = JSON.parse(demo.data);
        saveProjectsToStorage(projects);
        showToast(`¡Juego '${finalName}' descargado! Ready para editar.`, "success");
        showHubTab('local'); 
    } catch(e) { showToast("Error al instalar la plantilla. El código está corrupto.", "error"); }
}

function playCommunityDemo(index) {
    let demo = COMMUNITY_DEMOS[index];
    let htmlStr = getPlayableHTMLString(demo.data, demo.name);
    let blob = new Blob([htmlStr], {type: "text/html"});
    let url = URL.createObjectURL(blob);
    
    document.getElementById('play-modal-title').innerText = "Jugando: " + demo.name + " (por " + demo.author + ")";
    document.getElementById('play-iframe').src = url;
    document.getElementById('play-modal').style.display = 'flex';
}

function closePlayModal() {
    document.getElementById('play-modal').style.display = 'none';
    document.getElementById('play-iframe').src = 'about:blank';
}

// --- LOCAL PROJECTS ---
function refreshHubProjects() {
    let projects = getProjectsFromStorage();
    let container = document.getElementById('hub-project-list');
    container.innerHTML = '';
    
    let keysList = Object.keys(projects);
    if (keysList.length === 0) {
        container.innerHTML = '<p style="color:#666; text-align:center; font-size:13px; margin:20px 0;">No tienes proyectos guardados todavía.</p>';
        return;
    }

    keysList.forEach(name => {
        let card = document.createElement('div'); card.className = 'project-card';
        card.innerHTML = `
            <div class="project-info"><h4>${name}</h4><p>Guardado localmente</p></div>
            <div class="project-actions">
                <button onclick="hubLoadProject('${name}')" style="background:#00cc66; color:#000;">📝 Editar</button>
                <button onclick="hubDuplicateProject('${name}')" style="background:#00a2ff; color:#000;">👥 Duplicar</button>
                <button onclick="hubDeleteProject('${name}')" style="background:#ff3366; color:#fff;">🗑️ Eliminar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function getProjectsFromStorage() {
    try { let saved = localStorage.getItem('unboring_projects'); return saved ? JSON.parse(saved) : {}; }
    catch(e) { return {}; }
}
function saveProjectsToStorage(projects) {
    try { localStorage.setItem('unboring_projects', JSON.stringify(projects)); } catch(e) {}
}

function hubCreateProject() {
    let nameInput = document.getElementById('new-project-name');
    let name = nameInput.value.trim();
    if (!name) { showCustomAlert("Nombre Requerido", "¡Por favor introduce un nombre de juego!"); return; }
    let projects = getProjectsFromStorage();
    if (projects[name]) { showCustomAlert("Nombre Duplicado", "Ya existe un juego local con ese nombre."); return; }

    projects[name] = {
        levels: { "Nivel 1": Array.from({length: ROWS}, () => Array(COLS).fill(0)) },
        activeLevelName: "Nivel 1",
        objects: {
            0: { id: 0, name: 'Borrador (Vacío)', char: ' ', color: '#000', physics: 'ghost', spriteIdx: -1, scripts: [] },
            1: { id: 1, name: 'Jugador / Arma (@)', char: '@', color: '#00e5ff', physics: 'ghost', spriteIdx: -1, scripts: [] },
            2: { id: 2, name: 'Muro Base', char: '■', color: '#444', physics: 'solid', spriteIdx: -1, scripts: [] }
        },
        uiCanvasList: {}, spritesRaw: [], engineConfig: { pSpeed: 0.1, pTurn: 0.005, fogDist: 15, skyColor: '#111111', floorColor: '#050505' }
    };
    for(let i=0; i<COLS; i++) { projects[name].levels["Nivel 1"][0][i]=2; projects[name].levels["Nivel 1"][ROWS-1][i]=2; }
    for(let i=0; i<ROWS; i++) { projects[name].levels["Nivel 1"][i][0]=2; projects[name].levels["Nivel 1"][i][COLS-1]=2; }
    projects[name].levels["Nivel 1"][2][2] = 1;

    saveProjectsToStorage(projects);
    nameInput.value = ''; refreshHubProjects(); printLog(`Juego '${name}' creado.`);
}

function hubLoadProject(name) {
    let projects = getProjectsFromStorage(); let proj = projects[name]; if (!proj) return;
    currentProjectName = name;
    
    if (document.getElementById('grid').children.length === 0) initGrid();
    if (document.getElementById('sprite-editor').children.length === 0) initSpriteEditor();
    
    document.getElementById('hub-view').style.display = 'none';
    document.getElementById('workspace-view').style.display = 'flex';

    loadProjectJSON(JSON.stringify(proj)).then(() => { switchTab('tab-world'); printLog(`Editando juego: '${name}'`); })
    .catch(err => { showCustomAlert("Error de Carga", "Error crítico leyendo el JSON."); });
}

async function loadProjectJSON(jsonString) {
    let parsed = JSON.parse(jsonString);
    levels = parsed.levels; activeLevelName = parsed.activeLevelName || Object.keys(levels)[0];
    map = JSON.parse(JSON.stringify(levels[activeLevelName]));
    objects = parsed.objects;
    let maxId = 2; Object.keys(objects).forEach(id => { let numId = parseInt(id); if (numId > maxId) maxId = numId; }); nextObjId = maxId + 1;
    uiCanvasList = parsed.uiCanvasList || {};
    if (parsed.engineConfig) { engineConfig = parsed.engineConfig; loadEngineConfigToUI(); }
    globalSprites = parsed.spritesRaw || [];
    
    updateLevelSelectUI(); updatePalette(); updateObjSelect(); updateUISelect(); refreshSpriteGalleries(); refreshGridVisuals();
}

function hubDuplicateProject(name) {
    let projects = getProjectsFromStorage(); let src = projects[name]; if (!src) return;
    let newName = name + " - Copia"; let counter = 1;
    while (projects[newName]) { newName = name + " - Copia " + counter; counter++; }
    projects[newName] = JSON.parse(JSON.stringify(src)); saveProjectsToStorage(projects); refreshHubProjects();
}

function hubDeleteProject(name) {
    showCustomConfirm("Eliminar Juego", `¿Estás seguro de que quieres eliminar el juego '${name}'?`, () => {
        let projects = getProjectsFromStorage(); delete projects[name]; saveProjectsToStorage(projects); refreshHubProjects();
    });
}

function saveProjectToHub() {
    if (!currentProjectName) { showToast("No hay un proyecto abierto para guardar.", "error"); return; }
    try {
        if (activeLevelName) { levels[activeLevelName] = JSON.parse(JSON.stringify(map)); }
        let projects = getProjectsFromStorage(); let pj = getProjectJSONRawObj();
        if (pj) { projects[currentProjectName] = pj; saveProjectsToStorage(projects); printLog(`Cambios guardados.`); showToast("¡Proyecto guardado con éxito!", "success"); }
    } catch(e) { showToast("Error al guardar.", "error"); }
}

function hubGoBack() { saveProjectToHub(); currentProjectName = null; document.getElementById('workspace-view').style.display = 'none'; document.getElementById('hub-view').style.display = 'flex'; refreshHubProjects(); }

function hubImportProject(event) {
    let file = event.target.files[0]; if(!file) return; let reader = new FileReader();
    reader.onload = async (e) => {
        try {
            let raw = e.target.result; let parsed = JSON.parse(raw); let name = file.name.replace('.json', '');
            let projects = getProjectsFromStorage(); let finalName = name; let counter = 1;
            while (projects[finalName]) { finalName = name + "_" + counter; counter++; }
            projects[finalName] = parsed; saveProjectsToStorage(projects); refreshHubProjects(); showToast(`¡Importado '${finalName}'!`, "success");
        } catch(err) { showCustomAlert("Error de Importación", "Archivo JSON corrupto."); }
    }; reader.readAsText(file);
}

// --- WORKSPACE & TABS ---
function switchTab(tabId) {
    if(isPlaying) togglePlay(); 
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    if (event && event.target.classList) event.target.classList.add('active'); 
    document.getElementById(tabId).classList.add('active');
    if(tabId === 'tab-world') updatePalette();
    if(tabId === 'tab-chars') updateObjSelect();
    if(tabId === 'tab-ui') refreshSpriteGalleries();
}

// --- LEVEL EDITOR ---
function selectLevel(lvlName) {
    if (!levels[lvlName]) return;
    levels[activeLevelName] = JSON.parse(JSON.stringify(map));
    activeLevelName = lvlName; map = JSON.parse(JSON.stringify(levels[activeLevelName]));
    updateLevelSelectUI(); refreshGridVisuals(); saveProjectToHub();
}
function createNewLevel() {
    let nameInput = document.getElementById('new-level-name'); let name = nameInput.value.trim(); if (!name) return;
    if (levels[name]) { showCustomAlert("Nivel Duplicado", "Ya existe."); return; }
    levels[name] = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    for(let i=0; i<COLS; i++) { levels[name][0][i]=2; levels[name][ROWS-1][i]=2; }
    for(let i=0; i<ROWS; i++) { levels[name][i][0]=2; levels[name][i][COLS-1]=2; }
    levels[name][2][2] = 1; 
    nameInput.value = ''; updateLevelSelectUI(); selectLevel(name);
}
function deleteActiveLevel() {
    if (Object.keys(levels).length <= 1) { showCustomAlert("Límite de Niveles", "Debes tener al menos uno."); return; }
    showCustomConfirm("Borrar Nivel", "¿Estás seguro?", () => { delete levels[activeLevelName]; selectLevel(Object.keys(levels)[0]); });
}
function updateLevelSelectUI() {
    let sel = document.getElementById('level-select'); if (!sel) return; sel.innerHTML = '';
    Object.keys(levels).forEach(k => { let opt = document.createElement('option'); opt.value = k; opt.textContent = k; if (k === activeLevelName) opt.selected = true; sel.appendChild(opt); });
}

function updateEngineConfig() {
    engineConfig.pSpeed = parseFloat(document.getElementById('cfg-pspeed').value) || 0.1;
    engineConfig.pTurn = parseFloat(document.getElementById('cfg-pturn').value) || 0.005;
    engineConfig.fogDist = parseFloat(document.getElementById('cfg-fog').value) || 15;
    engineConfig.skyColor = document.getElementById('cfg-sky').value || '#111111';
    engineConfig.floorColor = document.getElementById('cfg-floor').value || '#050505';
    saveProjectToHub();
}
function loadEngineConfigToUI() {
    document.getElementById('cfg-pspeed').value = engineConfig.pSpeed; document.getElementById('cfg-pturn').value = engineConfig.pTurn;
    document.getElementById('cfg-fog').value = engineConfig.fogDist; document.getElementById('cfg-sky').value = engineConfig.skyColor;
    document.getElementById('cfg-floor').value = engineConfig.floorColor;
}

function initGrid() {
    let gridEl = document.getElementById('grid'); gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`; gridEl.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
    for(let y=0; y<ROWS; y++) {
        for(let x=0; x<COLS; x++) {
            let cell = document.createElement('div'); cell.className = 'cell';
            cell.addEventListener('pointerdown', (e) => { 
                if(e.button !== 0 && e.pointerType === 'mouse') return;
                e.preventDefault(); isPaintingGlobal = true; 
                if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId); paintMap(x, y, cell); 
            });
            cell.addEventListener('pointerenter', (e) => { if(isPaintingGlobal) paintMap(x, y, cell); });
            gridEl.appendChild(cell);
        }
    }
    updateLevelSelectUI(); refreshGridVisuals(); updatePalette();
}

function applyVisuals(cell, objId) {
    if (!cell) return; let obj = objects[objId] || objects[0]; 
    if(obj.spriteIdx >= 0 && globalSprites[obj.spriteIdx]) {
        let scx = document.createElement('canvas'); scx.width=16; scx.height=16; let sdx = scx.getContext('2d');
        let sArr = globalSprites[obj.spriteIdx];
        if (sArr && sArr.length === 256) {
            for(let k=0; k<256; k++) { if(sArr[k] !== 0 && sArr[k] !== 'transparent') { sdx.fillStyle = sArr[k]; sdx.fillRect(k%16, Math.floor(k/16), 1, 1); } }
        }
        cell.style.backgroundImage = "url(" + scx.toDataURL() + ")"; cell.textContent = ''; cell.style.backgroundColor = 'transparent';
    } else { cell.style.backgroundImage = 'none'; cell.textContent = obj.char; cell.style.color = obj.color; cell.style.backgroundColor = obj.id === 0 ? '#000' : '#111'; }
}
function paintMap(x, y, cell) { if(y>=0 && y<ROWS && x>=0 && x<COLS) { map[y][x] = selectedPaletteId; applyVisuals(cell, selectedPaletteId); saveProjectToHub(); } }
function refreshGridVisuals() { let cells = document.getElementById('grid').children; if (cells.length === 0) return; for(let y=0; y<ROWS; y++) { for(let x=0; x<COLS; x++) { applyVisuals(cells[y*COLS + x], map[y][x]); } } }
function clearMap() { map = Array.from({length: ROWS}, () => Array(COLS).fill(0)); map[2][2] = 1; refreshGridVisuals(); saveProjectToHub(); }

function updatePalette() {
    let pContainer = document.getElementById('palette-container'); pContainer.innerHTML = '';
    Object.values(objects).forEach(obj => {
        let div = document.createElement('div'); div.className = `palette-item ${selectedPaletteId === obj.id ? 'selected' : ''}`;
        let iconHTML = '';
        if (obj.spriteIdx >= 0 && globalSprites[obj.spriteIdx]) {
            let scx = document.createElement('canvas'); scx.width=16; scx.height=16; let sdx = scx.getContext('2d'); let sArr = globalSprites[obj.spriteIdx];
            if (sArr && sArr.length === 256) { for(let k=0; k<256; k++) { if(sArr[k] !== 0 && sArr[k] !== 'transparent') { sdx.fillStyle = sArr[k]; sdx.fillRect(k%16, Math.floor(k/16), 1, 1); } } }
            iconHTML = `<div class="palette-icon" style="background-image:url(${scx.toDataURL()})"></div>`;
        } else { iconHTML = `<div class="palette-icon" style="display:flex; justify-content:center; align-items:center; color:${obj.color}; font-weight:bold;">${obj.char}</div>`; }
        div.innerHTML = `${iconHTML} ID: ${obj.id} - ${obj.name}`; div.onclick = () => { selectedPaletteId = obj.id; updatePalette(); }; pContainer.appendChild(div);
    });
}

// --- SPRITE EDITOR ---
let currentPixels = Array(256).fill('transparent');
function initSpriteEditor() {
    let se = document.getElementById('sprite-editor'); se.innerHTML = '';
    for(let i=0; i<256; i++) {
        let p = document.createElement('div'); p.className = 'pixel';
        p.addEventListener('pointerdown', (e) => { 
            if(e.button !== 0 && e.pointerType === 'mouse') return;
            e.preventDefault(); isDrawingSprite = true; 
            if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId); paintPixel(i, p); 
        });
        p.addEventListener('pointerenter', (e) => { if(isDrawingSprite) paintPixel(i, p); }); se.appendChild(p);
    }
    drawOnionSkin();
}
function paintPixel(centerIdx, el) {
    let size = parseInt(document.getElementById('brush-size').value) || 1; let col = centerIdx % 16; let row = Math.floor(centerIdx / 16);
    let color = document.getElementById('paint-color').value; let se = document.getElementById('sprite-editor'); let pixelsToPaint = [];
    if (size === 1) { pixelsToPaint.push({r: row, c: col}); } 
    else if (size === 2) { pixelsToPaint.push({r: row, c: col}); if (col+1<16) pixelsToPaint.push({r: row, c: col+1}); if (row+1<16) pixelsToPaint.push({r: row+1, c: col}); if (row+1<16 && col+1<16) pixelsToPaint.push({r: row+1, c: col+1}); } 
    else if (size === 3) { for (let r=row-1; r<=row+1; r++) { for (let c=col-1; c<=col+1; c++) { if (r>=0 && r<16 && c>=0 && c<16) pixelsToPaint.push({r: r, c: c}); } } }
    pixelsToPaint.forEach(p => { let idx = p.r*16 + p.c; currentPixels[idx] = color; let cell = se.children[idx]; if (cell) cell.style.backgroundColor = color; }); drawOnionSkin();
}
function drawOnionSkin() {
    let onionChecked = document.getElementById('onion-skin-chk').checked; let se = document.getElementById('sprite-editor'); if(!se) return;
    for(let i=0; i<256; i++) { let cell = se.children[i]; if(cell && currentPixels[i] === 'transparent') cell.style.backgroundColor = 'transparent'; }
    if(onionChecked && globalSprites.length > 0) {
        try { let lastArr = globalSprites[globalSprites.length - 1]; if (lastArr && lastArr.length === 256) { for(let i=0; i<256; i++) { let cell = se.children[i]; if(cell && currentPixels[i] === 'transparent') { let color = lastArr[i]; if(color !== 0 && color !== 'transparent') cell.style.backgroundColor = color + "40"; } } } } catch(e) {}
    }
}
function clearSpriteEditor() { currentPixels.fill('transparent'); Array.from(document.getElementById('sprite-editor').children).forEach(p => p.style.backgroundColor = 'transparent'); editingSpriteIdx = -1; drawOnionSkin(); }
function loadSpriteToEditor(idx) {
    editingSpriteIdx = idx; let sArr = globalSprites[idx]; if (!sArr || sArr.length !== 256) return; currentPixels = []; let se = document.getElementById('sprite-editor');
    for (let i = 0; i < 256; i++) { let col = sArr[i]; if (col === 0 || col === 'transparent') { currentPixels.push('transparent'); if (se.children[i]) se.children[i].style.backgroundColor = 'transparent'; } else { currentPixels.push(col); if (se.children[i]) se.children[i].style.backgroundColor = col; } } drawOnionSkin();
}
function saveSprite() {
    let sArr = []; let hasPixels = false;
    for(let i=0; i<256; i++) { if(currentPixels[i] !== 'transparent') { sArr.push(currentPixels[i]); hasPixels = true; } else { sArr.push(0); } }
    if(hasPixels) { if (editingSpriteIdx >= 0 && editingSpriteIdx < globalSprites.length) { globalSprites[editingSpriteIdx] = sArr; editingSpriteIdx = -1; } else { globalSprites.push(sArr); } clearSpriteEditor(); refreshSpriteGalleries(); saveProjectToHub(); } 
    else { showToast("Dibuja algo primero en el lienzo.", "warning"); }
}
function deleteSelectedSprite() { if(globalSprites.length === 0) return; globalSprites.pop(); refreshSpriteGalleries(); saveProjectToHub(); }
function refreshSpriteGalleries() {
    ['global-sprites', 'logic-sprite-select', 'ui-sprite-select'].forEach(id => {
        let el = document.getElementById(id); if(!el) return; el.innerHTML = '';
        if(globalSprites.length === 0 && id !== 'global-sprites') { el.innerHTML = '<span style="color:#666; font-size:11px;">(Vacio)</span>'; return; }
        globalSprites.forEach((sp, idx) => {
            let scx = document.createElement('canvas'); scx.width=16; scx.height=16; let sdx = scx.getContext('2d');
            if(sp && sp.length === 256) { for(let k=0; k<256; k++) { if(sp[k] !== 0 && sp[k] !== 'transparent') { sdx.fillStyle = sp[k]; sdx.fillRect(k%16, Math.floor(k/16), 1, 1); } } }
            let img = document.createElement('img'); img.src = scx.toDataURL(); img.className = 'sprite-thumb';
            if (id === 'global-sprites') { img.onclick = () => { loadSpriteToEditor(idx); }; } 
            else if(id === 'logic-sprite-select') { if(activeSpriteIdx === idx) img.classList.add('selected'); img.onclick = () => { activeSpriteIdx = idx; refreshSpriteGalleries(); }; } 
            else if(id === 'ui-sprite-select') { if(activeUISpriteIdx === idx) img.classList.add('selected'); img.onclick = () => { activeUISpriteIdx = idx; refreshSpriteGalleries(); }; }
            el.appendChild(img);
        });
    });
}

// --- UI MAKER ---
function createUI() { let name = document.getElementById('ui-create-name').value; if(!name) return; uiCanvasList[name] = []; document.getElementById('ui-create-name').value = ''; updateUISelect(); saveProjectToHub(); }
function updateUISelect() { let sel = document.getElementById('ui-select'); sel.innerHTML = '<option value="">-- Selecciona --</option>'; Object.keys(uiCanvasList).forEach(k => sel.innerHTML += `<option value="${k}">${k}</option>`); }
function loadUIEditor() { let name = document.getElementById('ui-select').value; document.getElementById('ui-tools').style.display = name ? 'block' : 'none'; renderUIPreview(); }
function toggleUIElemInput() { let type = document.getElementById('ui-elem-type').value; document.getElementById('ui-elem-text-container').style.display = type === 'text' ? 'block' : 'none'; document.getElementById('ui-elem-sprite-container').style.display = type === 'sprite' ? 'block' : 'none'; }
function addUIElement() {
    let name = document.getElementById('ui-select').value; if(!name) return; let type = document.getElementById('ui-elem-type').value;
    let px = document.getElementById('ui-pos-x').value; let py = document.getElementById('ui-pos-y').value; let scale = document.getElementById('ui-scale').value;
    let elData = { type: type, x: px, y: py, s: scale, val: null };
    if(type === 'text') elData.val = document.getElementById('ui-elem-text').value || "Texto"; if(type === 'sprite') elData.val = activeUISpriteIdx >= 0 ? activeUISpriteIdx : 0;
    uiCanvasList[name].push(elData); renderUIPreview(); saveProjectToHub();
}
function renderUIPreview() {
    let name = document.getElementById('ui-select').value; let prev = document.getElementById('ui-preview-container'); let list = document.getElementById('ui-element-list');
    prev.innerHTML = ''; list.innerHTML = ''; if(!name) return;
    uiCanvasList[name].forEach((el, idx) => {
        list.innerHTML += `<div style="background:#111; padding:5px; margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;"><span>Elemento ${idx} (${el.type})</span><button style="width:auto; background:red; margin:0; padding: 4px 8px;" onclick="uiCanvasList['${name}'].splice(${idx},1); renderUIPreview(); saveProjectToHub();">X</button></div>`;
        let d;
        if(el.type === 'text') { d = document.createElement('div'); d.className = 'preview-text'; d.textContent = el.val; d.style.fontSize = `${el.s * 16}px`; } 
        else if (globalSprites[el.val]) { 
            d = document.createElement('canvas'); d.width = 16; d.height = 16; let sdx = d.getContext('2d'); let sArr = globalSprites[el.val];
            if(sArr && sArr.length === 256) { for(let k=0; k<256; k++) { if(sArr[k] !== 0 && sArr[k] !== 'transparent') { sdx.fillStyle = sArr[k]; sdx.fillRect(k%16, Math.floor(k/16), 1, 1); } } }
            d.className = 'preview-sprite'; d.style.width = `${el.s * 32}px`; d.style.height = `${el.s * 32}px`; 
        }
        if(d) { d.style.position = 'absolute'; d.style.left = `${el.x}%`; d.style.top = `${el.y}%`; prev.appendChild(d); }
    });
}

// --- LÓGICA Y BLOQUES ---
let dragD = null;
function dragS(ev, type) { let inp = ev.target.querySelector('input'); dragD = { type: type, val: inp ? inp.value : null }; }
function allowD(ev) { ev.preventDefault(); ev.currentTarget.classList.add('drag-over'); }
function leaveD(ev) { ev.currentTarget.classList.remove('drag-over'); }
function dropB(ev, scrId) { ev.preventDefault(); ev.currentTarget.classList.remove('drag-over'); let oId = document.getElementById('edit-obj-select').value; if(!oId || !dragD) return; let scr = objects[oId].scripts.find(s => s.id === scrId); if(scr) { scr.blocks.push({ type: dragD.type, val: dragD.val }); } dragD = null; loadLogic(); saveProjectToHub(); }

function toggleEventParamInput() {
    let type = document.getElementById('new-event-type').value; let cont = document.getElementById('event-param-container'); let inp = document.getElementById('new-event-param');
    if(type === 'keypress') { cont.style.display = 'block'; inp.placeholder = 'Tecla (ej: space, w, e)'; } else if(type === 'broadcast') { cont.style.display = 'block'; inp.placeholder = 'Nombre de Mensaje (ej: LuzOn)'; } else { cont.style.display = 'none'; }
}
function addEventTrigger() {
    let oId = document.getElementById('edit-obj-select').value; if(!oId) { showToast("Elige un objeto primero.", "warning"); return; }
    let type = document.getElementById('new-event-type').value; let param = document.getElementById('new-event-param').value.trim();
    if(type === 'keypress') param = param.toLowerCase(); if (!objects[oId].scripts) objects[oId].scripts = [];
    let newId = 'evt_' + Math.random().toString(36).substr(2, 9); objects[oId].scripts.push({ id: newId, type: type, param: param, blocks: [] });
    document.getElementById('new-event-param').value = ''; loadLogic(); saveProjectToHub();
}
function deleteEventTrigger(oId, index) { showCustomConfirm("Eliminar Evento", "¿Estás seguro?", () => { objects[oId].scripts.splice(index, 1); loadLogic(); saveProjectToHub(); }); }
function convertOldScripts(obj) { if (!Array.isArray(obj.scripts)) { let old = obj.scripts || {}; obj.scripts = []; Object.keys(old).forEach(type => { if (old[type] && old[type].length > 0) { obj.scripts.push({ id: 'evt_' + Math.random().toString(36).substr(2, 9), type: type, param: '', blocks: old[type] }); } }); } }
function createEntity() {
    let name = document.getElementById('obj-name').value || 'Entidad'; let physics = document.getElementById('obj-physics').value;
    objects[nextObjId] = { id: nextObjId, name: name, char: 'X', color: '#ff00aa', physics: physics, spriteIdx: activeSpriteIdx, scripts: [] };
    nextObjId++; updateObjSelect(); updatePalette(); document.getElementById('obj-name').value = ''; activeSpriteIdx = -1; refreshSpriteGalleries(); saveProjectToHub();
}
function updateObjSelect() {
    let select = document.getElementById('edit-obj-select'); let currentVal = select.value; select.innerHTML = '<option value="">-- Elige Objeto o Jugador (@) --</option>';
    Object.values(objects).forEach(o => { if(o.id > 0) select.innerHTML += `<option value="${o.id}">${o.name}</option>`; }); if(currentVal && objects[currentVal]) select.value = currentVal; loadLogic();
}
function moveBlock(oId, scrIdx, idx, dir) { let arr = objects[oId].scripts[scrIdx].blocks; if (idx + dir < 0 || idx + dir >= arr.length) return; let temp = arr[idx]; arr[idx] = arr[idx + dir]; arr[idx + dir] = temp; loadLogic(); saveProjectToHub(); }

function loadLogic() {
    let oId = document.getElementById('edit-obj-select').value; if(!oId) { document.getElementById('workspace').style.display = 'none'; return; }
    document.getElementById('workspace').style.display = 'block'; let ws = document.getElementById('workspace'); ws.innerHTML = ''; 
    let obj = objects[oId]; if (!obj.scripts) obj.scripts = []; convertOldScripts(obj);
    if (obj.scripts.length === 0) { ws.innerHTML = '<p style="color:#666; font-size:12px; text-align:center; padding:20px;">Sin bloques.</p>'; return; }

    obj.scripts.forEach((scr, scrIdx) => {
        let container = document.createElement('div'); container.className = 'event-container';
        let hatColor = 'var(--c-start)'; let label = '';
        if(scr.type === 'start') { hatColor = 'var(--c-start)'; label = '🏁 Al iniciar el Nivel (Start)'; }
        else if(scr.type === 'click') { hatColor = 'var(--c-click)'; label = '🖱️ Al Hacer Clic'; }
        else if(scr.type === 'hit') { hatColor = 'var(--c-hit)'; label = '🎯 Al Recibir Hitscan'; }
        else if(scr.type === 'collide') { hatColor = 'var(--c-collide)'; label = '🟡 Al tocar al Jugador (Colisión)'; }
        else if(scr.type === 'update') { hatColor = 'var(--c-update)'; label = '🟢 Por siempre (Bucle 60fps Async)'; }
        else if(scr.type === 'keypress') { hatColor = '#9933ff'; label = '⌨️ Al pulsar tecla: [' + scr.param.toUpperCase() + ']'; }
        else if(scr.type === 'broadcast') { hatColor = 'var(--c-msg)'; label = '📢 Al recibir Mensaje: [' + scr.param + ']'; }

        container.innerHTML = `
            <div class="event-hat" style="background:${hatColor}; display:flex; justify-content:space-between; align-items:center;">
                <span>${label}</span> <button class="btn-block-action del" onclick="deleteEventTrigger(${oId}, ${scrIdx})" style="background:transparent; border:none; color:white; font-size:14px; cursor:pointer; font-weight:bold;">X</button>
            </div>
            <div class="dropzone" id="dz-${scr.id}" ondragover="allowD(event)" ondragleave="leaveD(event)" ondrop="dropB(event, '${scr.id}')"></div>`;
        ws.appendChild(container);
        let dz = container.querySelector('.dropzone');
        scr.blocks.forEach((b, idx) => {
            let conf = B_CONF[b.type]; if(!conf) return; 
            let div = document.createElement('div'); div.className = `visual-block workspace-block ${conf.cl}`;
            let inputStyle = (b.type === 'if_var_msg' || b.type === 'if_var' || b.type === 'set_block') ? 'width: 110px;' : '';
            if (b.type === 'set_sky' || b.type === 'set_floor') {
                let h = "<span>" + conf.txt + "</span> <input type='color' value='" + (b.val || '#000000') + "' style='width:60px; height:22px; padding:0;' onchange='objects[" + oId + "].scripts[" + scrIdx + "].blocks[" + idx + "].val = this.value; saveProjectToHub();'>";
                h += "<div style='display:flex; gap:2px; margin-left:auto;'><button class='btn-block-action' onclick='moveBlock(" + oId + ", " + scrIdx + ", " + idx + ", -1)'>↑</button><button class='btn-block-action' onclick='moveBlock(" + oId + ", " + scrIdx + ", " + idx + ", 1)'>↓</button><button class='btn-block-action del' onclick='objects[" + oId + "].scripts[" + scrIdx + "].blocks.splice(" + idx + ", 1); loadLogic(); saveProjectToHub();'>X</button></div>";
                div.innerHTML = h;
            } else {
                let h = "<span>" + conf.txt + "</span> "; if(conf.inp) h += "<input type='text' value='" + b.val + "' style='" + inputStyle + "' onchange='objects[" + oId + "].scripts[" + scrIdx + "].blocks[" + idx + "].val = this.value; saveProjectToHub();'>";
                h += "<div style='display:flex; gap:2px; margin-left:auto;'><button class='btn-block-action' onclick='moveBlock(" + oId + ", " + scrIdx + ", " + idx + ", -1)'>↑</button><button class='btn-block-action' onclick='moveBlock(" + oId + ", " + scrIdx + ", " + idx + ", 1)'>↓</button><button class='btn-block-action del' onclick='objects[" + oId + "].scripts[" + scrIdx + "].blocks.splice(" + idx + ", 1); loadLogic(); saveProjectToHub();'>X</button></div>";
                div.innerHTML = h;
            }
            dz.appendChild(div);
        });
    });
}
