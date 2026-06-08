let imgMap;
let imgMazeIntro;
let imgStage4;
let bgm;

function preload() {
    imgMap           = loadImage('map.webp');
    imgMazeIntro     = loadImage('maze_intro.png');
    imgStage4        = loadImage('stage4.jpg');
    imgStage4Mad     = loadImage('stage4_mad.png');
    imgAnubis        = loadImage('anuzis-Photoroom.png');
    imgPyramidBroken = loadImage('pyramid_broken.png'); // [추가] 엔딩씬
    bgm = loadSound('bgm.mp3'); // 파일명을 실제 이름으로 바꾸기
}

function setup(){ 
    createCanvas(windowWidth, windowHeight); 
    variableInitialization();
    homeSetup();
    mazeStructure();
    spawnMummy();
    spawnSuperMummy();
    torchSetup();
    resetIntro();
    bgm.setVolume(0.3); // 볼륨 0~1
} 

function draw(){ 
    background(20, 12, 4);
    // 1. 홈화면 체크
    if (homeScreenActive) {
        drawHomeScreen();
        return;
    }

    // 2. [추가] 튜토리얼 체크
    if (tutorialActive) {
        drawTutorial();
        return;
    }

    // 3. 기존 인트로 체크
    if (!introDone) { drawIntro(); return; }

    // [추가] 게임 엔딩
    if (gameState === 'ending') { drawEnding(); return; }

    // [추가] 스테이지3 아누비스 등장씬
    if (anubisSceneActive) {
        if (drawAnubisScene()) return;
        anubisSceneActive = false;
    }

    if (drawStageTransition()) return;

    // 스테이지4: 보물방→파라오분노→역순미로(maze3→2→1) 타임어택
    if (currentStage === 4) {
        if (gameState === 'gameover') {
            // 타임어택 중 게임오버
            if (stage4Phase === 'timemaze') {
                _drawBrightMaze();
                playerDesign();
            }
            drawGameOver();
            return;
        }
        if (gameState === 'stageclear') {
            _drawBrightMaze();
            playerDesign();
            drawStageClear();
            return;
        }
        drawStage4Scene();
        return;
    }

    if (gameState === 'play') {
        mazeDrawing();
        playerDesign();
        playerMoving();
        mummyDesign();
        superMummyDesign();
        checkCaught();
        checkSuperMummyCaught();
        checkGoal();
        if (spaceHeld) mummyMoving();
        superMummyMoving();
        torchUpdate();
        torchDraw();
        mummyEyesDrawing();
        superMummyEyesDrawing();
        goalDrawing();
        if (currentStage === 3) drawAnubis();
    }

    if (gameState === 'gameover') {
        mazeDrawing();
        playerDesign();
        mummyDesign();
        superMummyDesign();
        torchDraw();
        mummyEyesDrawing();
        superMummyEyesDrawing();
        drawGameOver();
    }

    if (gameState === 'stageclear') {
        mazeDrawing();
        playerDesign();
        torchDraw();
        drawStageClear();
    } 
    drawStageHUD();
} 

function variableInitialization(){ 
    cellSize   = min(windowWidth, windowHeight) / 19; 
    playerSize = cellSize - 10; 
    mummySize  = cellSize - 10;
    playerX    = cellSize / 2; 
    playerY    = cellSize * 3 / 2; 
    speed      = 6; 
    mazeData   = [maze1, maze2, maze3];
    if (currentStage === 4) stage4Initialized = false;
    // 👇 4스테이지 진행 상태와 타이머를 초기 상태로 되돌립니다.
    gameState = 'play';
    stage4Phase = 'treasure'; // 보물방부터 다시 시작 (또는 타임어택부터 하려면 'time_attack' 등 설정에 맞게)
    stage4TimeMazeStart = millis(); // 타이머 리셋  
} 

function keyPressed() {
    if (!introDone && keyCode === 32) { introNextScene(); return; }
    if (keyCode === 32) spaceHeld = true;
}
function keyReleased() {
    if (keyCode === 32) spaceHeld = false;
}

function mousePressed() {
    if (homeScreenActive) {
        homescreenMousePressed();
        return;
    }
    if (tutorialActive) {
        tutorialMousePressed();
        return;
    }
    if (!introDone) {
        introMousePressed();
        return;
    }

    if (gameState === 'ending') {
        endingMousePressed();
        return;
    }
    if (gameState === 'stageclear') {
        if (clearMousePressed()) {
            currentStage++;
            if (currentStage > 5) currentStage = 1;

            gameState = 'play';

            startStageTransition(currentStage);
            resetGame();
            if (currentStage === 3) {
                anubisSceneActive = true;
                startAnubisScene();
            }
        }
        return;
    }
    if (gameState === 'gameover') {
        let btnW = width * 0.22, btnH = height * 0.06;
        let btnX = width / 2 - btnW / 2, btnY = height / 2 + height * 0.02;
        if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
            resetGame();
        }
    }
}