// Esperar a que todo el HTML esté listo antes de arrancar
window.addEventListener('DOMContentLoaded', () => {
    
    // 1. Asignar los elementos DOM a las variables globales
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; 
    logEl = document.getElementById('log');

    // 2. Inicializar la previsualización del juego y el Hub
    refreshHubProjects();
});
