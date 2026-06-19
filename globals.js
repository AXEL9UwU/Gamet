// --- CONSTANTES Y ESTADO ---
const COLS = 20, ROWS = 12;
let map = Array.from({length: ROWS}, () => Array(COLS).fill(0));
let backupMap = []; 
let backupLevels = {};
let isPaintingGlobal = false;
let isDrawingSprite = false;
let editingSpriteIdx = -1;

let globalSprites = []; 
let uiCanvasList = {}; 
let activeSpriteIdx = -1; 
let activeUISpriteIdx = -1;

let levels = { "Nivel 1": Array.from({length: ROWS}, () => Array(COLS).fill(0)) };
let activeLevelName = "Nivel 1";

let engineConfig = { pSpeed: 0.1, pTurn: 0.005, fogDist: 15, skyColor: '#111111', floorColor: '#050505' };

let objects = {
    0: { id: 0, name: 'Borrador (Vacío)', char: ' ', color: '#000', physics: 'ghost', spriteIdx: -1, scripts: [] },
    1: { id: 1, name: 'Jugador / Arma (@)', char: '@', color: '#00e5ff', physics: 'ghost', spriteIdx: -1, scripts: [] },
    2: { id: 2, name: 'Muro Base', char: '■', color: '#444', physics: 'solid', spriteIdx: -1, scripts: [] }
};
let nextObjId = 3; let selectedPaletteId = 2;

let player = { x: 2, y: 2, vx: 0, vy: 0, angle: 0, speed: engineConfig.pSpeed, hp: 100, ammo: 0, score: 0, alive: true, isBusy: {}, customVars: {} };
let activeEntities = []; 
let keys = {}; let gameLoop = null; let isPlaying = false;
let activeUIName = null; 
let spritesRaw = [];

// Elementos DOM (se asignarán en main.js)
let canvas = null;
let ctx = null;
let logEl = null;
let actx = null;
let currentProjectName = null;

let activeCommunityCategory = "todos";
let COMMUNITY_DEMOS = [];

const COMMUNITY_DEMOS_FALLBACK = [
    {
        name: "Patas al Rescate: Comunidad",
        author: "@AXEL-TONTITO",
        isTemplate: false,
        desc: "¡Evita a los humanos abrazadores y llega a tu plato de croquetas!",
        plays: 1200, rating: 98, picks: true, featured: false,
        data: '{"levels":{"Nivel 1":[[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,2],[2,0,1,0,2,0,0,0,0,2,0,0,0,0,0,0,0,2,4,2],[2,0,0,0,2,3,0,0,0,2,0,0,0,0,0,0,0,2,0,2],[2,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,2,0,2],[2,2,2,2,2,0,0,0,0,2,0,0,0,0,0,0,0,0,0,2],[2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,2],[2,0,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,2],[2,0,0,0,0,2,0,0,3,0,0,0,0,0,0,0,0,0,0,2],[2,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2],[2,0,0,0,0,2,0,0,0,0,3,0,0,0,0,0,0,0,0,2],[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]],"Nivel 2":[[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[2,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,2],[2,0,1,0,0,2,0,0,0,0,0,0,3,0,0,0,2,0,0,2],[2,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,2],[2,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,2],[2,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,2,0,0,2],[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2],[2,0,0,2,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,2],[2,0,0,2,0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,2],[2,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,3,0,0,2],[2,0,0,2,0,0,0,3,0,2,0,0,0,0,0,0,0,0,0,2],[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]]},"activeLevelName":"Nivel 1","objects":{"0":{"id":0,"name":"Patio Libre (Vacío)","char":" ","color":"#000","physics":"ghost","spriteIdx":-1,"scripts":[]},"1":{"id":1,"name":"Michi/Firulais Aventurero","char":"@","color":"#ff9f43","physics":"ghost","spriteIdx":-1,"scripts":[]},"2":{"id":2,"name":"Cerca de la Comunidad","char":"■","color":"#8b5a2b","physics":"solid","spriteIdx":-1,"scripts":[]},"3":{"id":3,"name":"Humano Abrazador","char":"H","color":"#ff4d4d","physics":"trigger","spriteIdx":0,"scripts":[{"id":"comunidad_chase","type":"update","param":"","blocks":[{"type":"chase","val":null}]},{"id":"comunidad_bounce","type":"update","param":"","blocks":[{"type":"bounce","val":null}]}]},"4":{"id":4,"name":"Plato Croquetas","char":"C","color":"#00dbff","physics":"trigger","spriteIdx":1,"scripts":[{"id":"comunidad_portal","type":"collide","param":"","blocks":[{"type":"load_level","val":"Nivel 2"}]}]}},"uiCanvasList":{},"spritesRaw":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"#ffffff","#ffffff",0,0,0,0,0,"#ffffff",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"#ffffff",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"#ffffff",0,0,0,0,0,0,0,0,"#ffffff",0,0,0,0,0,0,"#ffffff","#ffffff",0,0,0,0,0,0,"#ffffff","#ffffff",0,0,0,0,0,0,0,"#ffffff",0,0,0,0,0,0,"#ffffff",0,0,0,0,0,0,0,0,0,"#ffffff","#ffffff",0,0,"#ffffff","#ffffff",0,0,0,0,0,0,0,0,0,0,0,0,"#ffffff","#ffffff","#ffffff",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"#f5f5f5","#f5f5f5","#f5f5f5","#f5f5f5",0,0,0,0,0,0,0,0,0,0,0,"#f5f5f5","#00c8fa","#00c8fa","#00c8fa","#00c8fa","#f5f5f5",0,0,0,0,0,0,0,0,0,"#f5f5f5","#00c8fa","#00c8fa","#00c8fa","#00c8fa","#00c8fa","#00c8fa","#f5f5f5",0,0,0,0,0,0,0,"#f5f5f5","#00c8fa","#00c8fa","#00c8fa","#00495c","#00495c","#00495c","#00c8fa","#00c8fa","#f5f5f5",0,0,0,0,0,0,"#f5f5f5","#00c8fa","#00c8fa","#00495c","#00495c","#00c8fa","#00c8fa","#00c8fa","#00c8fa","#f5f5f5",0,0,0,0,0,0,"#f5f5f5","#00c8fa","#00c8fa","#00495c","#00c8fa","#00c8fa","#00c8fa","#00c8fa","#00c8fa","#f5f5f5",0,0,0,0,0,0,"#f5f5f5","#00c8fa","#00495c","#00495c","#00c8fa","#00495c","#00495c","#00495c","#00c8fa","#f5f5f5",0,0,0,0,0,0,"#f5f5f5","#00c8fa","#00495c","#00495c","#00c8fa","#00c8fa","#00c8fa","#00495c","#00c8fa","#f5f5f5",0,0,0,0,0,0,"#f5f5f5","#00c8fa","#00c8fa","#00495c","#00495c","#00495c","#00495c","#00c8fa","#00c8fa","#f5f5f5",0,0,0,0,0,0,0,"#f5f5f5","#00c8fa","#00c8fa","#00495c","#00495c","#00c8fa","#00c8fa","#f5f5f5",0,0,0,0,0,0,0,0,0,"#f5f5f5","#00c8fa","#00c8fa","#00c8fa","#00c8fa","#f5f5f5",0,0,0,0,0,0,0,0,0,0,0,"#f5f5f5","#f5f5f5","#f5f5f5","#f5f5f5",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],"engineConfig":{"pSpeed":0.12,"pTurn":0.006,"fogDist":13,"skyColor":"#0f172a","floorColor":"#14532d"}}'
    },
    {
        name: "Papas",
        author: "@gamet_team",
        isTemplate: false,
        desc: "LOCUUUUUUUUUUURA",
        plays: 8329105, rating: 2, picks: false, featured: false,
        data: '{"levels":{"Nivel 1":[[2,0,2,2,2,2,2,2,2,0,0,0,0,0,2,2,2,2,2,2],[2,2,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,2],[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],[2,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,2],[2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],[2,0,0,1,0,0,0,0,0,0,0,0,0,0,0,3,0,0,2,2],[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2],[2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]]},"activeLevelName":"Nivel 1","objects":{"0":{"id":0,"name":"Borrador (Vacío)","char":" ","color":"#000","physics":"ghost","spriteIdx":-1,"scripts":[]},"1":{"id":1,"name":"Jugador / Arma (@)","char":"@","color":"#00e5ff","physics":"ghost","spriteIdx":-1,"scripts":[]},"2":{"id":2,"name":"Muro Base","char":"■","color":"#444","physics":"solid","spriteIdx":-1,"scripts":[]},"3":{"id":3,"name":"Papa","char":"X","color":"#ff00aa","physics":"trigger","spriteIdx":0,"scripts":[{"id":"evt_5nyhpf7zi","type":"update","param":"","blocks":[{"type":"chase","val":null}]},{"id":"evt_spidm6fiu","type":"collide","param":"","blocks":[{"type":"damage","val":"10"},{"type":"teleport","val":"9,5"}]}]}},"uiCanvasList":{},"spritesRaw":[[0,0,0,0,0,0,0,0,0,"#ffffff","#ffffff",0,0,0,0,0,0,0,0,0,0,0,0,"#ffffff","#ffffff",0,"#ffffff",0,0,0,0,0,0,0,0,"#ffffff",0,0,"#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff",0,0,0,0,0,0,0,0,0,"#ffffff","#ffffff",0,0,"#ffffff","#ffffff",0,0,0,0,0,0,0,0,"#ffffff",0,"#ffffff",0,"#ffffff","#ffffff",0,"#ffffff","#ffffff",0,0,0,0,0,0,0,0,0,"#ffffff",0,"#ffffff","#ffffff",0,"#ffffff","#ffffff",0,0,0,0,0,0,0,"#ffffff",0,"#ffffff","#ffffff","#ffffff","#ffffff","#ffffff",0,"#ffffff",0,0,0,0,0,0,0,"#ffffff",0,"#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff",0,0,0,0,0,0,0,0,"#ffffff",0,0,"#ffffff","#ffffff",0,0,0,0,0,0,0,0,0,0,0,"#ffffff","#ffffff",0,0,"#ffffff",0,"#ffffff",0,0,0,0,0,0,0,0,0,0,"#ffffff","#ffffff",0,"#ffffff","#ffffff",0,0,0,0,0,0,0,0,0,0,0,0,0,"#ffffff","#ffffff",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"#ffffff",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"#ffffff",0,0,0,0,0,0,0,0,0,0,0,0,"#ffffff","#ffffff",0,"#ffffff","#ffffff",0,0,0,0,0,0,0,0,0,0,0,"#ffffff",0,"#ffffff","#ffffff",0,"#ffffff",0,0,0,0,0,0]],"engineConfig":{"pSpeed":0.1,"pTurn":0.005,"fogDist":15,"skyColor":"#111111","floorColor":"#050505"}}'
    }
];

const B_CONF = {
    'shoot_ray': { txt: '🔫 Disparar Rayo Hitscan', cl: 'b-player', inp: false },
    'give_ammo': { txt: 'Dar Munición', cl: 'b-player', inp: true },
    'heal_hp': { txt: 'Curar Vida', cl: 'b-player', inp: true },
    'set_speed': { txt: 'Fijar Vel. Entidad (Base 1)', cl: 'b-var', inp: true },
    'add_score': { txt: 'Sumar Puntuación', cl: 'b-var', inp: true },
    'set_var': { txt: 'Fijar Var (Nom,Val)', cl: 'b-var', inp: true },
    'add_var': { txt: 'Sumar Var (Nom,Val)', cl: 'b-var', inp: true },
    'multiply_var': { txt: 'Multiplicar Var (Nom,Val)', cl: 'b-var', inp: true },
    'toggle_var': { txt: 'Alternar Var (0/1)', cl: 'b-var', inp: true },
    'teleport': { txt: 'Teleportar a (X,Y)', cl: 'b-move', inp: true },
    'bounce': { txt: 'Rebotar (Invertir)', cl: 'b-move', inp: false },
    'chase': { txt: 'IA: Perseguir al Jugador', cl: 'b-move', inp: false },
    'chase_shoot': { txt: 'IA: Enemigo Dispara Rayo', cl: 'b-move', inp: false },
    'move_rand': { txt: 'IA: Mover Aleatorio', cl: 'b-move', inp: false },
    'move_fw': { txt: 'Mover Hacia Adelante', cl: 'b-move', inp: true },
    'move_x': { txt: 'Mover X (Vel)', cl: 'b-move', inp: true },
    'move_y': { txt: 'Mover Y (Vel)', cl: 'b-move', inp: true },
    'show_ui': { txt: 'Mostrar UI (Nombre)', cl: 'b-look', inp: true },
    'hide_ui': { txt: 'Ocultar Todas las UIs', cl: 'b-look', inp: false },
    'set_sprite': { txt: 'Cambiar a Sprite (ID)', cl: 'b-look', inp: true },
    'sound': { txt: 'Sonido (pew/hurt/coin/jump)', cl: 'b-look', inp: true },
    'shake': { txt: 'Temblor de Pantalla', cl: 'b-look', inp: false },
    'set_sky': { txt: 'Color Cielo (Hex)', cl: 'b-look', inp: true },
    'set_floor': { txt: 'Color Suelo (Hex)', cl: 'b-look', inp: true },
    'set_block': { txt: '🧱 Cambiar Muro (X,Y,ID):', cl: 'b-system', inp: true },
    'send_msg': { txt: '📢 Enviar Mensaje:', cl: 'b-system', inp: true },
    'if_var_msg': { txt: '❓ Si Var [Nom,op,Val] -> Msg:', cl: 'b-system', inp: true },
    'load_level': { txt: '🚪 Cargar Nivel', cl: 'b-system', inp: true },
    'set_fog': { txt: 'Fijar Niebla (Dist)', cl: 'b-system', inp: true },
    'wait': { txt: '⏳ Esperar (seg)', cl: 'b-system', inp: true },
    'stop_script': { txt: '🛑 Detener Código Aquí', cl: 'b-system', inp: false },
    'chance_stop': { txt: '🎲 50% de Detener Código', cl: 'b-system', inp: false },
    'damage': { txt: 'Dañar Jugador', cl: 'b-system', inp: true },
    'spawn': { txt: 'Invocar Entidad (ID Num)', cl: 'b-system', inp: true },
    'destroy': { txt: 'Morir / Destruir Objeto', cl: 'b-combat', inp: false },
    'win': { txt: 'Ganar el Nivel', cl: 'b-combat', inp: false },
    'print': { txt: 'Imprimir Log', cl: 'b-system', inp: true }
};
