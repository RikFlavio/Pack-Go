/* =====================================================
   PACK & GO - APP.JS v2
   Logica semplificata con dati precaricati
   ===================================================== */

// =====================================================
// SERVICE WORKER
// =====================================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW registered'))
        .catch(err => console.log('SW registration failed', err));
}

// =====================================================
// DATABASE
// =====================================================

const db = new Dexie('PackAndGoDB');
db.version(2).stores({
    categories: '++id, name, order',
    items: '++id, categoryId, name, car, europe, world',
    activeTrip: 'id, name, type, packedItems, createdAt',
    savedTrips: '++id, name, type, items, createdAt'
});

// =====================================================
// DATI PRECARICATI
// =====================================================

const DEFAULT_DATA = {
    categories: [
        { name: 'Documenti', order: 0 },
        { name: 'Elettronica', order: 1 },
        { name: 'Igiene', order: 2 },
        { name: 'Abbigliamento', order: 3 },
        { name: 'Accessori', order: 4 },
        { name: 'Varie', order: 5 }
    ],
    items: [
        // Documenti
        { category: 'Documenti', name: 'Carta d\'identità', car: true, europe: true, world: true },
        { category: 'Documenti', name: 'Passaporto', car: false, europe: true, world: true },
        { category: 'Documenti', name: 'Patente', car: true, europe: true, world: true },
        { category: 'Documenti', name: 'Tessera sanitaria', car: true, europe: true, world: true },
        { category: 'Documenti', name: 'Assicurazione viaggio', car: false, europe: true, world: true },
        // Elettronica
        { category: 'Elettronica', name: 'Smartphone', car: true, europe: true, world: true },
        { category: 'Elettronica', name: 'Caricatore telefono', car: true, europe: true, world: true },
        { category: 'Elettronica', name: 'Power bank', car: true, europe: true, world: true },
        { category: 'Elettronica', name: 'Cuffie', car: true, europe: true, world: true },
        { category: 'Elettronica', name: 'Adattatore presa', car: false, europe: false, world: true },
        // Igiene
        { category: 'Igiene', name: 'Spazzolino', car: true, europe: true, world: true },
        { category: 'Igiene', name: 'Dentifricio', car: true, europe: true, world: true },
        { category: 'Igiene', name: 'Deodorante', car: true, europe: true, world: true },
        { category: 'Igiene', name: 'Shampoo', car: true, europe: true, world: true },
        { category: 'Igiene', name: 'Rasoio', car: true, europe: true, world: true },
        { category: 'Igiene', name: 'Medicinali personali', car: true, europe: true, world: true },
        // Abbigliamento
        { category: 'Abbigliamento', name: 'Mutande', car: true, europe: true, world: true },
        { category: 'Abbigliamento', name: 'Calzini', car: true, europe: true, world: true },
        { category: 'Abbigliamento', name: 'Magliette', car: true, europe: true, world: true },
        { category: 'Abbigliamento', name: 'Pantaloni', car: true, europe: true, world: true },
        { category: 'Abbigliamento', name: 'Felpa/Maglione', car: true, europe: true, world: true },
        { category: 'Abbigliamento', name: 'Pigiama', car: true, europe: true, world: true },
        { category: 'Abbigliamento', name: 'Costume', car: true, europe: true, world: true },
        // Accessori
        { category: 'Accessori', name: 'Occhiali da sole', car: true, europe: true, world: true },
        { category: 'Accessori', name: 'Cappello', car: true, europe: true, world: true },
        { category: 'Accessori', name: 'Cintura', car: true, europe: true, world: true },
        { category: 'Accessori', name: 'Orologio', car: true, europe: true, world: true },
        // Varie
        { category: 'Varie', name: 'Portafoglio', car: true, europe: true, world: true },
        { category: 'Varie', name: 'Chiavi casa', car: true, europe: true, world: true },
        { category: 'Varie', name: 'Ombrello', car: true, europe: true, world: true },
        { category: 'Varie', name: 'Borraccia', car: true, europe: true, world: true },
        { category: 'Varie', name: 'Snack', car: true, europe: true, world: true }
    ]
};

// =====================================================
// STATE
// =====================================================

const state = {
    categories: [],
    items: [],
    activeTrip: null,
    savedTrips: [],
    currentCategoryId: null, // per aggiungere oggetti
    selectedTemplateId: null,
    confirmCallback: null,
    expandedCategories: new Set() // categorie espanse nella checklist
};

// =====================================================
// DOM ELEMENTS
// =====================================================

const el = {
    bgLayer: document.getElementById('bg-layer'),
    // Screens
    welcomeScreen: document.getElementById('welcome-screen'),
    homeScreen: document.getElementById('home-screen'),
    tripScreen: document.getElementById('trip-screen'),
    settingsScreen: document.getElementById('settings-screen'),
    // Home
    btnStart: document.getElementById('btn-start'),
    btnNewTrip: document.getElementById('btn-new-trip'),
    btnSettings: document.getElementById('btn-settings'),
    btnContinueTrip: document.getElementById('btn-continue-trip'),
    activeTripSection: document.getElementById('active-trip-section'),
    continueTripIcon: document.getElementById('continue-trip-icon'),
    continueTripName: document.getElementById('continue-trip-name'),
    continueTripProgress: document.getElementById('continue-trip-progress'),
    savedTripsSection: document.getElementById('saved-trips-section'),
    savedTripsList: document.getElementById('saved-trips-list'),
    btnImport: document.getElementById('btn-import'),
    btnExport: document.getElementById('btn-export'),
    // Trip Screen
    btnBackHome: document.getElementById('btn-back-home'),
    tripIcon: document.getElementById('trip-icon'),
    tripTitle: document.getElementById('trip-title'),
    btnTripMenu: document.getElementById('btn-trip-menu'),
    tripMenu: document.getElementById('trip-menu'),
    progressText: document.getElementById('progress-text'),
    progressFill: document.getElementById('progress-fill'),
    tripChecklist: document.getElementById('trip-checklist'),
    btnSaveTemplate: document.getElementById('btn-save-template'),
    btnEndTrip: document.getElementById('btn-end-trip'),
    // Settings Screen
    btnBackSettings: document.getElementById('btn-back-settings'),
    btnAddCategory: document.getElementById('btn-add-category'),
    settingsContent: document.getElementById('settings-content'),
    // Modals
    modalNewTrip: document.getElementById('modal-new-trip'),
    modalUseTemplate: document.getElementById('modal-use-template'),
    modalSaveTemplate: document.getElementById('modal-save-template'),
    modalCategory: document.getElementById('modal-category'),
    modalItem: document.getElementById('modal-item'),
    modalConfirm: document.getElementById('modal-confirm'),
    // Inputs
    inputTripName: document.getElementById('input-trip-name'),
    inputTemplateName: document.getElementById('input-template-name'),
    inputCategory: document.getElementById('input-category'),
    inputItem: document.getElementById('input-item'),
    checkCar: document.getElementById('check-car'),
    checkEurope: document.getElementById('check-europe'),
    checkWorld: document.getElementById('check-world'),
    templateInfo: document.getElementById('template-info'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    // Buttons
    btnStartTrip: document.getElementById('btn-start-trip'),
    btnUseTemplate: document.getElementById('btn-use-template'),
    btnConfirmSaveTemplate: document.getElementById('btn-confirm-save-template'),
    btnSaveCategory: document.getElementById('btn-save-category'),
    btnSaveItem: document.getElementById('btn-save-item'),
    btnConfirm: document.getElementById('btn-confirm'),
    // Others
    toast: document.getElementById('toast'),
    fileInput: document.getElementById('file-input')
};

// =====================================================
// INIT
// =====================================================

async function init() {
    await loadData();
    setupEventListeners();
    
    // Prima apertura? Carica dati default
    if (state.categories.length === 0) {
        await loadDefaultData();
    }
    
    // Mostra sempre welcome screen all'avvio
    showScreen('welcome');
    setBackground(null);
}

async function loadData() {
    state.categories = await db.categories.orderBy('order').toArray();
    state.items = await db.items.toArray();
    state.savedTrips = await db.savedTrips.toArray();
    const trips = await db.activeTrip.toArray();
    state.activeTrip = trips.length > 0 ? trips[0] : null;
}

async function loadDefaultData() {
    // Inserisci categorie
    for (const cat of DEFAULT_DATA.categories) {
        await db.categories.add(cat);
    }
    
    // Ricarica categorie per avere gli ID
    state.categories = await db.categories.orderBy('order').toArray();
    
    // Mappa nome -> id
    const catMap = {};
    state.categories.forEach(c => catMap[c.name] = c.id);
    
    // Inserisci items
    for (const item of DEFAULT_DATA.items) {
        await db.items.add({
            categoryId: catMap[item.category],
            name: item.name,
            car: item.car,
            europe: item.europe,
            world: item.world
        });
    }
    
    state.items = await db.items.toArray();
}

// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {
    // Welcome
    el.btnStart.addEventListener('click', () => showScreen('home'));
    
    // Home
    el.btnNewTrip.addEventListener('click', () => openModal('new-trip'));
    el.btnSettings.addEventListener('click', () => showScreen('settings'));
    el.btnContinueTrip.addEventListener('click', () => showScreen('trip'));
    el.btnImport.addEventListener('click', () => el.fileInput.click());
    el.btnExport.addEventListener('click', exportData);
    el.fileInput.addEventListener('change', importData);
    
    // Trip Screen
    el.btnBackHome.addEventListener('click', () => showScreen('home'));
    el.btnTripMenu.addEventListener('click', toggleTripMenu);
    el.btnSaveTemplate.addEventListener('click', () => { closeTripMenu(); saveAsTemplate(); });
    el.btnEndTrip.addEventListener('click', () => { closeTripMenu(); confirmEndTrip(); });
    
    // Settings Screen
    el.btnBackSettings.addEventListener('click', () => showScreen('home'));
    el.btnAddCategory.addEventListener('click', () => openModal('category'));
    document.getElementById('btn-reset-all').addEventListener('click', resetAll);
    
    // Modal buttons
    el.btnStartTrip.addEventListener('click', startTrip);
    el.btnUseTemplate.addEventListener('click', useTemplate);
    el.btnConfirmSaveTemplate.addEventListener('click', saveAsTemplate);
    el.btnSaveCategory.addEventListener('click', saveCategory);
    el.btnSaveItem.addEventListener('click', saveItem);
    el.btnConfirm.addEventListener('click', () => {
        if (state.confirmCallback) { state.confirmCallback(); state.confirmCallback = null; }
        state.cancelCallback = null;
        closeModal('confirm');
    });
    
    // Gestisco anche il click su Annulla per il cancelCallback
    el.modalConfirm.querySelector('.btn-secondary').addEventListener('click', () => {
        if (state.cancelCallback) { state.cancelCallback(); state.cancelCallback = null; }
        state.confirmCallback = null;
        closeModal('confirm');
    });
    
    // Modal close
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => btn.closest('.modal').classList.add('hidden'));
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    });
    
    // Enter key
    el.inputTripName.addEventListener('keypress', (e) => { if (e.key === 'Enter') startTrip(); });
    el.inputTemplateName.addEventListener('keypress', (e) => { if (e.key === 'Enter') useTemplate(); });
    el.inputCategory.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveCategory(); });
    el.inputItem.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveItem(); });
    
    // ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(m => m.classList.add('hidden'));
            closeTripMenu();
        }
    });
    
    // Click outside trip menu
    document.addEventListener('click', (e) => {
        if (!el.tripMenu.classList.contains('hidden') && 
            !el.tripMenu.contains(e.target) && 
            !el.btnTripMenu.contains(e.target)) {
            closeTripMenu();
        }
    });
}

// =====================================================
// SCREENS
// =====================================================

function showScreen(screen) {
    el.welcomeScreen.classList.add('hidden');
    el.homeScreen.classList.add('hidden');
    el.tripScreen.classList.add('hidden');
    el.settingsScreen.classList.add('hidden');
    
    switch(screen) {
        case 'welcome':
            el.welcomeScreen.classList.remove('hidden');
            break;
        case 'home':
            el.homeScreen.classList.remove('hidden');
            renderHome();
            setBackground(null);
            break;
        case 'trip':
            el.tripScreen.classList.remove('hidden');
            renderTrip();
            if (state.activeTrip) setBackground(state.activeTrip.type);
            break;
        case 'settings':
            el.settingsScreen.classList.remove('hidden');
            renderSettings();
            break;
    }
}

// =====================================================
// HOME
// =====================================================

function renderHome() {
    // Viaggio in corso
    if (state.activeTrip) {
        el.activeTripSection.classList.remove('hidden');
        const icons = { car: '🚗', europe: '🇪🇺', world: '🌍' };
        el.continueTripIcon.textContent = icons[state.activeTrip.type];
        el.continueTripName.textContent = state.activeTrip.name;
        
        const total = getTripItems(state.activeTrip.type).length;
        const packed = (state.activeTrip.packedItems || []).length;
        el.continueTripProgress.textContent = `${packed}/${total} oggetti`;
    } else {
        el.activeTripSection.classList.add('hidden');
    }
    
    // Viaggi salvati
    if (state.savedTrips.length > 0) {
        el.savedTripsSection.classList.remove('hidden');
        const icons = { car: '🚗', europe: '🇪🇺', world: '🌍' };
        
        el.savedTripsList.innerHTML = state.savedTrips.map(trip => `
            <div class="saved-trip-card" data-id="${trip.id}">
                <div class="saved-trip-info" onclick="openUseTemplate(${trip.id})">
                    <span class="trip-badge">${icons[trip.type]}</span>
                    <div>
                        <span class="trip-name">${trip.name}</span>
                        <span class="trip-items-count">${trip.items.length} oggetti</span>
                    </div>
                </div>
                <button class="btn-delete-template" onclick="deleteTemplate(${trip.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        `).join('');
    } else {
        el.savedTripsSection.classList.add('hidden');
    }
}

function getTripItems(type) {
    return state.items.filter(item => item[type]);
}

// =====================================================
// TRIP
// =====================================================

async function startTrip() {
    const name = el.inputTripName.value.trim();
    const typeInput = document.querySelector('input[name="trip-type"]:checked');
    
    if (!name) { showToast('Inserisci un nome', 'error'); return; }
    if (!typeInput) { showToast('Seleziona un tipo', 'error'); return; }
    
    const type = typeInput.value;
    const items = getTripItems(type);
    
    if (items.length === 0) { 
        showToast('Nessun oggetto per questo tipo di viaggio', 'error'); 
        return; 
    }
    
    // Crea viaggio
    const trip = {
        id: 1,
        name,
        type,
        packedItems: [],
        createdAt: new Date().toISOString()
    };
    
    await db.activeTrip.clear();
    await db.activeTrip.add(trip);
    state.activeTrip = trip;
    
    closeModal('new-trip');
    el.inputTripName.value = '';
    document.querySelectorAll('input[name="trip-type"]').forEach(r => r.checked = false);
    
    showScreen('trip');
    showToast('Buon viaggio! 🧳', 'success');
}

function renderTrip() {
    if (!state.activeTrip) return;
    
    const icons = { car: '🚗', europe: '🇪🇺', world: '🌍' };
    el.tripIcon.textContent = icons[state.activeTrip.type];
    el.tripTitle.textContent = state.activeTrip.name;
    
    const tripItems = getTripItems(state.activeTrip.type);
    const packedItems = state.activeTrip.packedItems || [];
    
    // Progress
    const total = tripItems.length;
    const packed = packedItems.length;
    const pct = total > 0 ? (packed / total) * 100 : 0;
    el.progressText.textContent = `${packed}/${total}`;
    el.progressFill.style.width = `${pct}%`;
    
    // Raggruppa per categoria
    const grouped = {};
    tripItems.forEach(item => {
        const cat = state.categories.find(c => c.id === item.categoryId);
        if (cat) {
            if (!grouped[cat.id]) grouped[cat.id] = { name: cat.name, items: [] };
            grouped[cat.id].items.push(item);
        }
    });
    
    const hasExpanded = state.expandedCategories.size > 0;
    
    // Render categorie collassabili
    el.tripChecklist.innerHTML = Object.entries(grouped).map(([catId, cat]) => {
        const catPacked = cat.items.filter(i => packedItems.includes(i.id)).length;
        const isExpanded = state.expandedCategories.has(parseInt(catId));
        const isHidden = hasExpanded && !isExpanded;
        const allPacked = catPacked === cat.items.length;
        
        return `
            <div class="checklist-category ${allPacked ? 'completed' : ''} ${isExpanded ? 'expanded' : ''} ${isHidden ? 'hidden-by-expand' : ''}">
                <div class="checklist-header" onclick="toggleCategory(${catId})">
                    <div class="checklist-header-left">
                        <svg class="chevron ${isExpanded ? 'expanded' : ''}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                        <h4>${cat.name}</h4>
                    </div>
                    <span class="checklist-count ${allPacked ? 'done' : ''}">${catPacked}/${cat.items.length}</span>
                </div>
                <div class="checklist-items ${isExpanded ? '' : 'collapsed'}">
                    ${cat.items.map(item => {
                        const isPacked = packedItems.includes(item.id);
                        return `
                            <label class="checklist-item ${isPacked ? 'packed' : ''}">
                                <input type="checkbox" ${isPacked ? 'checked' : ''} onchange="togglePacked(${item.id}, this.checked)">
                                <span class="checkmark"></span>
                                <span class="item-name">${item.name}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Aggiorna classe container
    if (hasExpanded) {
        el.tripChecklist.classList.add('has-expanded');
    } else {
        el.tripChecklist.classList.remove('has-expanded');
    }
    
    // Messaggio se tutto completato
    if (packed === total && total > 0) {
        showToast('🎉 Tutto pronto! Buon viaggio!', 'success');
    }
}

window.toggleCategory = function(catId) {
    catId = parseInt(catId);
    const wasExpanded = state.expandedCategories.has(catId);
    
    // Chiudi tutte le categorie espanse
    state.expandedCategories.clear();
    
    // Se non era espansa, aprila
    if (!wasExpanded) {
        state.expandedCategories.add(catId);
    }
    
    renderTrip();
};

window.togglePacked = async function(itemId, packed) {
    if (!state.activeTrip) return;
    
    let arr = state.activeTrip.packedItems || [];
    if (packed) {
        if (!arr.includes(itemId)) arr.push(itemId);
    } else {
        arr = arr.filter(id => id !== itemId);
    }
    
    state.activeTrip.packedItems = arr;
    await db.activeTrip.update(1, { packedItems: arr });
    renderTrip();
};

function toggleTripMenu() {
    el.tripMenu.classList.toggle('hidden');
}

function closeTripMenu() {
    el.tripMenu.classList.add('hidden');
}

async function saveAsTemplate() {
    if (!state.activeTrip) return;
    
    const tripItems = getTripItems(state.activeTrip.type);
    const itemIds = tripItems.map(i => i.id);
    
    await db.savedTrips.add({
        name: state.activeTrip.name,
        type: state.activeTrip.type,
        items: itemIds,
        createdAt: new Date().toISOString()
    });
    
    state.savedTrips = await db.savedTrips.toArray();
    closeTripMenu();
    showToast('Template salvato!', 'success');
}

function confirmEndTrip() {
    showConfirm('Termina viaggio', 'Vuoi terminare questo viaggio?', async () => {
        await db.activeTrip.clear();
        state.activeTrip = null;
        state.expandedCategories.clear();
        showScreen('home');
        showToast('Viaggio terminato', 'success');
    });
}

// =====================================================
// TEMPLATES
// =====================================================

window.openUseTemplate = function(templateId) {
    const template = state.savedTrips.find(t => t.id === templateId);
    if (!template) return;
    
    state.selectedTemplateId = templateId;
    const icons = { car: '🚗', europe: '🇪🇺', world: '🌍' };
    el.templateInfo.textContent = `${icons[template.type]} ${template.name} (${template.items.length} oggetti)`;
    el.inputTemplateName.value = template.name;
    
    openModal('use-template');
};

async function useTemplate() {
    const template = state.savedTrips.find(t => t.id === state.selectedTemplateId);
    if (!template) return;
    
    const name = el.inputTemplateName.value.trim() || template.name;
    
    const trip = {
        id: 1,
        name,
        type: template.type,
        packedItems: [],
        createdAt: new Date().toISOString()
    };
    
    await db.activeTrip.clear();
    await db.activeTrip.add(trip);
    state.activeTrip = trip;
    
    closeModal('use-template');
    el.inputTemplateName.value = '';
    state.selectedTemplateId = null;
    
    showScreen('trip');
    showToast('Buon viaggio! 🧳', 'success');
}

window.deleteTemplate = function(templateId) {
    showConfirm('Elimina template', 'Eliminare questo template?', async () => {
        await db.savedTrips.delete(templateId);
        state.savedTrips = state.savedTrips.filter(t => t.id !== templateId);
        renderHome();
        showToast('Template eliminato', 'success');
    });
};

// =====================================================
// SETTINGS
// =====================================================

function renderSettings() {
    const grouped = {};
    state.categories.forEach(cat => {
        grouped[cat.id] = { ...cat, items: [] };
    });
    state.items.forEach(item => {
        if (grouped[item.categoryId]) {
            grouped[item.categoryId].items.push(item);
        }
    });
    
    const hasExpanded = state.expandedCategories.size > 0;
    
    el.settingsContent.innerHTML = Object.values(grouped).map(cat => {
        const isExpanded = state.expandedCategories.has(cat.id);
        const isHidden = hasExpanded && !isExpanded;
        
        return `
        <div class="settings-category ${isExpanded ? 'expanded' : ''} ${isHidden ? 'hidden-by-expand' : ''}">
            <div class="settings-category-header" onclick="toggleSettingsCategory(${cat.id})">
                <div class="settings-category-left">
                    <svg class="chevron ${isExpanded ? 'expanded' : ''}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                    <h4>${cat.name}</h4>
                    <span class="item-count">(${cat.items.length})</span>
                </div>
                <div class="settings-category-actions">
                    <button class="btn-icon-sm" onclick="event.stopPropagation(); openAddItem(${cat.id})" title="Aggiungi oggetto">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                    </button>
                    <button class="btn-icon-sm danger" onclick="event.stopPropagation(); deleteCategory(${cat.id})" title="Elimina categoria">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="settings-items ${isExpanded ? '' : 'collapsed'}">
                ${cat.items.map(item => `
                    <div class="settings-item">
                        <span class="item-name">${item.name}</span>
                        <div class="item-types">
                            <span class="type-badge ${item.car ? 'active' : ''}" onclick="toggleItemType(${item.id}, 'car')" title="Auto">🚗</span>
                            <span class="type-badge ${item.europe ? 'active' : ''}" onclick="toggleItemType(${item.id}, 'europe')" title="Europa">🇪🇺</span>
                            <span class="type-badge ${item.world ? 'active' : ''}" onclick="toggleItemType(${item.id}, 'world')" title="Mondo">🌍</span>
                        </div>
                        <button class="btn-delete-item" onclick="deleteItem(${item.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                `).join('')}
                ${cat.items.length === 0 ? '<p class="empty-text">Nessun oggetto</p>' : ''}
            </div>
        </div>
    `;
    }).join('');
    
    // Aggiorna classe container
    if (hasExpanded) {
        el.settingsContent.classList.add('has-expanded');
    } else {
        el.settingsContent.classList.remove('has-expanded');
    }
}

window.toggleSettingsCategory = function(catId) {
    catId = parseInt(catId);
    const wasExpanded = state.expandedCategories.has(catId);
    
    // Chiudi tutte le categorie espanse
    state.expandedCategories.clear();
    
    // Se non era espansa, aprila
    if (!wasExpanded) {
        state.expandedCategories.add(catId);
    }
    
    renderSettings();
    
    // Aggiorna classe sul container
    const container = document.getElementById('settings-content');
    if (state.expandedCategories.size > 0) {
        container.classList.add('has-expanded');
    } else {
        container.classList.remove('has-expanded');
    }
};

window.openAddItem = function(catId) {
    state.currentCategoryId = catId;
    el.checkCar.checked = true;
    el.checkEurope.checked = true;
    el.checkWorld.checked = true;
    openModal('item');
};

async function saveCategory() {
    const name = el.inputCategory.value.trim();
    if (!name) { showToast('Inserisci un nome', 'error'); return; }
    
    if (state.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        showToast('Categoria già esistente', 'error');
        return;
    }
    
    const id = await db.categories.add({ name, order: state.categories.length });
    state.categories.push({ id, name, order: state.categories.length });
    
    closeModal('category');
    el.inputCategory.value = '';
    renderSettings();
    showToast('Categoria aggiunta', 'success');
}

async function saveItem() {
    const name = el.inputItem.value.trim();
    if (!name) { showToast('Inserisci un nome', 'error'); return; }
    if (!state.currentCategoryId) { showToast('Errore: categoria non selezionata', 'error'); return; }
    
    const item = {
        categoryId: state.currentCategoryId,
        name,
        car: el.checkCar.checked,
        europe: el.checkEurope.checked,
        world: el.checkWorld.checked
    };
    
    const id = await db.items.add(item);
    state.items.push({ id, ...item });
    
    closeModal('item');
    el.inputItem.value = '';
    state.currentCategoryId = null;
    renderSettings();
    showToast('Oggetto aggiunto', 'success');
}

window.toggleItemType = async function(itemId, type) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    item[type] = !item[type];
    await db.items.update(itemId, { [type]: item[type] });
    renderSettings();
};

window.deleteItem = function(itemId) {
    showConfirm('Elimina oggetto', 'Eliminare questo oggetto?', async () => {
        await db.items.delete(itemId);
        state.items = state.items.filter(i => i.id !== itemId);
        renderSettings();
        showToast('Oggetto eliminato', 'success');
    });
};

window.deleteCategory = function(catId) {
    const cat = state.categories.find(c => c.id === catId);
    if (!cat) return;
    
    const itemCount = state.items.filter(i => i.categoryId === catId).length;
    const msg = itemCount > 0 
        ? `"${cat.name}" contiene ${itemCount} oggetti. Eliminare tutto?`
        : `Eliminare "${cat.name}"?`;
    
    showConfirm('Elimina categoria', msg, async () => {
        await db.items.where('categoryId').equals(catId).delete();
        state.items = state.items.filter(i => i.categoryId !== catId);
        await db.categories.delete(catId);
        state.categories = state.categories.filter(c => c.id !== catId);
        renderSettings();
        showToast('Categoria eliminata', 'success');
    });
};

function resetAll() {
    showConfirm(
        'Reset Completo', 
        '⚠️ Verranno eliminati TUTTI i dati: oggetti, categorie, viaggi salvati e viaggio in corso. Vuoi continuare?',
        async () => {
            await db.categories.clear();
            await db.items.clear();
            await db.savedTrips.clear();
            await db.activeTrip.clear();
            
            // Ricarica dati di default
            await loadDefaultData();
            
            state.activeTrip = null;
            state.savedTrips = [];
            state.expandedCategories.clear();
            
            renderSettings();
            showToast('Reset completato! Dati di default ripristinati.', 'success');
        },
        null,
        'Reset Tutto',
        'Annulla'
    );
}

// =====================================================
// BACKGROUND
// =====================================================

function setBackground(type) {
    el.bgLayer.classList.remove('bg-car', 'bg-europe', 'bg-world');
    el.bgLayer.classList.add(type ? `bg-${type}` : 'bg-world');
}

// =====================================================
// MODALS
// =====================================================

function openModal(type) {
    const map = {
        'new-trip': el.modalNewTrip,
        'use-template': el.modalUseTemplate,
        'save-template': el.modalSaveTemplate,
        'category': el.modalCategory,
        'item': el.modalItem,
        'confirm': el.modalConfirm
    };
    if (map[type]) {
        map[type].classList.remove('hidden');
        setTimeout(() => {
            const input = map[type].querySelector('input[type="text"]');
            if (input) input.focus();
        }, 100);
    }
}

function closeModal(type) {
    const map = {
        'new-trip': el.modalNewTrip,
        'use-template': el.modalUseTemplate,
        'save-template': el.modalSaveTemplate,
        'category': el.modalCategory,
        'item': el.modalItem,
        'confirm': el.modalConfirm
    };
    if (map[type]) map[type].classList.add('hidden');
}

function showConfirm(title, message, callback, cancelCallback = null, confirmText = 'Conferma', cancelText = 'Annulla') {
    el.confirmTitle.textContent = title;
    el.confirmMessage.textContent = message;
    el.btnConfirm.textContent = confirmText;
    
    // Trova il bottone annulla nel modal
    const cancelBtn = el.modalConfirm.querySelector('.btn-secondary');
    cancelBtn.textContent = cancelText;
    
    state.confirmCallback = callback;
    state.cancelCallback = cancelCallback;
    openModal('confirm');
}

// =====================================================
// IMPORT / EXPORT
// =====================================================

async function exportData() {
    const data = {
        version: 2,
        exportDate: new Date().toISOString(),
        categories: state.categories,
        items: state.items,
        savedTrips: state.savedTrips
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pack-and-go-${new Date().toISOString().split('T')[0]}.packgo`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Dati esportati', 'success');
}

async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        const data = JSON.parse(await file.text());
        if (!data.categories || !data.items) throw new Error('Formato non valido');
        
        showConfirm('Importa dati', 'I dati attuali verranno sostituiti. Continuare?', async () => {
            await db.categories.clear();
            await db.items.clear();
            await db.savedTrips.clear();
            await db.activeTrip.clear();
            
            // Categorie
            for (const cat of data.categories) {
                await db.categories.add({ name: cat.name, order: cat.order || 0 });
            }
            const newCats = await db.categories.toArray();
            const catMap = {};
            data.categories.forEach((c, i) => catMap[c.id] = newCats[i].id);
            
            // Items
            for (const item of data.items) {
                await db.items.add({
                    categoryId: catMap[item.categoryId],
                    name: item.name,
                    car: item.car || false,
                    europe: item.europe || false,
                    world: item.world || false
                });
            }
            
            // Saved trips
            if (data.savedTrips) {
                for (const trip of data.savedTrips) {
                    await db.savedTrips.add({
                        name: trip.name,
                        type: trip.type,
                        items: trip.items || [],
                        createdAt: trip.createdAt
                    });
                }
            }
            
            await loadData();
            showScreen('home');
            showToast('Dati importati', 'success');
        });
    } catch (err) {
        showToast('Errore importazione', 'error');
        console.error(err);
    }
    e.target.value = '';
}

// =====================================================
// TOAST
// =====================================================

function showToast(message, type = 'success') {
    el.toast.textContent = message;
    el.toast.className = `toast ${type} show`;
    setTimeout(() => el.toast.classList.remove('show'), 3000);
}

// =====================================================
// START
// =====================================================

document.addEventListener('DOMContentLoaded', init);
