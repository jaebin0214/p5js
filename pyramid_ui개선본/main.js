// ============================================================
//  main.js
//  원본 대비 수정사항:
//  [추가] preload() — 이미지 로드
//  [추가] setup() — resetIntro, spawnSuperMummy 호출
//  [추가] draw() — 인트로/전환/슈퍼미라/아누비스/스테이지4 분기
//  [추가] variableInitialization() — stage4Initialized 리셋
// ============================================================

let imgMap;
let imgMazeIntro;
let imgStage4;

function preload() {
    imgMap       = loadImage('map.webp');
    imgMazeIntro = loadImage('maze_intro.png');
    imgStage4    = loadImage('stage4.jpg');
    imgStage4Mad = loadImage('stage4_mad.png');
    imgAnubis    = loadImage('anuzis-Photoroom.png');
}

function setup(){ 
    createCanvas(windowWidth, windowHeight); 
    variableInitialization(); 
    mazeStructure();
    spawnMummy();
    spawnSuperMummy(); // [추가] supermummy.js
    torchSetup();
    resetIntro();      // [추가] ui_enhanced.js
} 

function draw(){ 
    background(20, 12, 4);

    // [추가] 인트로 (ui_enhanced.js)
    if (!introDone) {
        drawIntro();
        return;
    }

    // [추가] 스테이지 전환 연출 (ui_enhanced.js)
    if (drawStageTransition()) return;

    // [추가] 스테이지4 전용 씬 (ui_enhanced.js)
    if (currentStage === 4) {
        if (stage4Phase === 'timemaze' && gameState === 'gameover') {
            _drawBrightMaze();
            enhancedPlayerDesign();
            torchDraw();
            drawGameOver();
            return;
        }
        if (stage4Phase === 'timemaze' && gameState === 'stageclear') {
            _drawBrightMaze();
            enhancedPlayerDesign();
            torchDraw();
            enhancedDrawStageClear();
            return;
        }
        drawStage4Scene();
        return;
    }

    if (gameState === 'play') {
        enhancedMazeDrawing();           // [추가] ui_enhanced.js
        enhancedPlayerDesign();          // [추가] ui_enhanced.js
        playerMoving();
        enhancedMummyDesign();           // [추가] ui_enhanced.js
        enhancedSuperMummyDesign();      // [추가] ui_enhanced.js
        checkCaught();
        checkSuperMummyCaught();         // [추가] supermummy.js
        checkGoal();
        if (spaceHeld) mummyMoving();
        superMummyMoving();              // [추가] supermummy.js
        torchUpdate();  
        torchDraw();
        enhancedMummyEyesDrawing();      // [추가] ui_enhanced.js
        enhancedSuperMummyEyesDrawing(); // [추가] ui_enhanced.js
        goalDrawing();
        if (currentStage === 3) drawAnubis(); // [추가] ui_enhanced.js
    }

    if (gameState === 'gameover') {
        enhancedMazeDrawing();
        enhancedPlayerDesign();
        enhancedMummyDesign();
        enhancedSuperMummyDesign();
        torchDraw();
        enhancedMummyEyesDrawing();
        enhancedSuperMummyEyesDrawing();
        drawGameOver();
    }

    if (gameState === 'stageclear') {
        enhancedMazeDrawing();
        enhancedPlayerDesign();
        torchDraw();
        enhancedDrawStageClear(); // [추가] ui_enhanced.js
    } 
} 

function variableInitialization(){ 
    cellSize   = min(windowWidth, windowHeight) / 19; 
    playerSize = cellSize - 10; 
    mummySize  = cellSize - 10;
    playerX    = cellSize / 2; 
    playerY    = cellSize * 3 / 2; 
    speed      = 6; 
    mazeData   = [maze1, maze2, maze3, maze4, maze5];
    // [추가] 스테이지4 재진입 시 초기화 플래그 리셋
    if (currentStage === 4) stage4Initialized = false;
} 

function keyPressed() {
    if (!introDone && keyCode === 32) { introNextScene(); return; } // [추가]
    if (keyCode === 32) spaceHeld = true;
}
function keyReleased() {
    if (keyCode === 32) spaceHeld = false;
}
