// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://mvcsqqxmsmwkfgpkwamq.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12Y3NxcXhtc213a2ZncGt3YW1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY2MDU0MiwiZXhwIjoyMDk3MjM2NTQyfQ.ThzvOVKI9IWKOzDKMUX2xbYjkINn_nzDcplxM8aH1tk'; 

let supabaseClient = null;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false }
    });
} catch (e) {
    console.error("Error al inicializar Supabase:", e);
}

async function fetchCommunityGames() {
    if (!supabaseClient) {
        showToast("Faltan las claves de Supabase. Mostrando juegos offline.", "warning");
        COMMUNITY_DEMOS = [...COMMUNITY_DEMOS_FALLBACK];
        loadCommunityDemos();
        return;
    }

    try {
        showToast("Sincronizando con la base de datos...", "info");
        const { data, error } = await supabaseClient.from('gamet_projects').select('*').order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            COMMUNITY_DEMOS = [...data, ...COMMUNITY_DEMOS_FALLBACK];
        } else {
            COMMUNITY_DEMOS = [...COMMUNITY_DEMOS_FALLBACK];
        }
        loadCommunityDemos();
        showToast("¡Comunidad sincronizada!", "success");
    } catch (err) {
        console.error("Error al obtener de Supabase:", err);
        showToast("Error de red con Supabase. Usando modo Offline.", "error");
        COMMUNITY_DEMOS = [...COMMUNITY_DEMOS_FALLBACK];
        loadCommunityDemos();
    }
}

async function publishToSupabase() {
    if (!supabaseClient) {
        showToast("Falta conectar el API de Supabase en el código.", "error");
        document.getElementById('community-form-modal').style.display = 'none';
        return;
    }

    if (activeLevelName) { levels[activeLevelName] = JSON.parse(JSON.stringify(map)); }
    
    let author = document.getElementById('com-author').value || '@anonimo';
    let desc = document.getElementById('com-desc').value || 'Un juego genial hecho en Gamet Studio.';
    let isTemplate = document.getElementById('com-template').checked;
    
    let pjString = JSON.stringify(getProjectJSONRawObj());
    
    try {
        showToast("Subiendo a Supabase...", "info");
        
        const { data, error } = await supabaseClient
            .from('gamet_projects')
            .insert([{ 
                name: currentProjectName || 'Mi Juego', 
                author: author, 
                isTemplate: isTemplate, 
                desc: desc, 
                plays: 0, rating: 100, picks: false, featured: false, 
                data: pjString 
            }]);

        if (error) throw error;

        document.getElementById('community-form-modal').style.display = 'none';
        showToast("¡Juego publicado en la comunidad mundial!", "success");
        
    } catch (err) {
        console.error("Error subiendo a Supabase:", err);
        showToast("Hubo un error al subir el juego a la nube.", "error");
    }
}
