let gameState = 'play';

const START_ROW = 1, START_COL = 0;
const GOAL_ROW  = 18, GOAL_COL = 27;

function checkCaught() {
    mummies.forEach(m => {
        let d = dist(playerX, playerY, m.x, m.y);
        if (d < (playerSize + mummySize) / 2 * 0.8) {
            gameState = 'gameover';
            mummies.forEach(mu => { mu.dirX = 0; mu.dirY = 0; });
        }
    });
}

function checkGoal() {
    if (currentStage === 4) return; // [추가] 스테이지4는 stage4.js에서 처리
    let goalX = GOAL_COL * cellSize + cellSize / 2;
    let goalY = GOAL_ROW * cellSize - cellSize / 2;
    if (dist(playerX, playerY, goalX, goalY) <= cellSize) {
        if (gameState !== 'stageclear') initClearAnim(); // [추가] ui_enhanced.js
        gameState = 'stageclear';
    }
}

function drawGameOver() {
    fill(255, 0, 0, 50); noStroke(); rect(0, 0, width, height);
    textAlign(CENTER, CENTER);
    fill(255, 60, 60); textSize(min(width, height) * 0.1); textStyle(BOLD);
    text('GAME OVER', width / 2, height / 2 - height * 0.1); textStyle(NORMAL);
    let btnW = width * 0.22, btnH = height * 0.06;
    let btnX = width / 2 - btnW / 2, btnY = height / 2 + height * 0.02;
    let isHover = mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH;
    fill(isHover ? color(180, 80, 80) : color(140, 50, 50));
    rect(btnX, btnY, btnW, btnH, 10);
    fill(255); textSize(min(width, height) * 0.028); textStyle(BOLD);
    text('다시 시도', width / 2, btnY + btnH / 2); textStyle(NORMAL);
}

function drawStageClear() {
    // ui_enhanced.js의 enhancedDrawStageClear()로 대체 — 미사용
}

function mousePressed() {
    // [추가] 인트로 중 클릭
    if (!introDone) { introMousePressed(); return; }

    // [추가] 스테이지4 씬 진행 중 클릭 차단
    if (currentStage === 4 && stage4Phase !== 'timemaze') return;

    if (gameState === 'stageclear') {
        if (clearMousePressed()) { // [추가] ui_enhanced.js
            currentStage++;
            if (currentStage > 5) currentStage = 1;
            startStageTransition(currentStage); // [추가] ui_enhanced.js
            resetGame();
        }
        return;
    }
    if (gameState === 'gameover') {
        let btnW = width * 0.22, btnH = height * 0.06;
        let btnX = width / 2 - btnW / 2, btnY = height / 2 + height * 0.02;
        if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
            resetGame(); // currentStage 유지 → 현재 스테이지 재시도
        }
    }
}

function resetGame() {
    variableInitialization();
    mazeStructure();
    spawnMummy();
    spawnSuperMummy(); // [추가] supermummy.js
    anubisReset();     // [추가] anubis.js
    torchSetup();
    gameState = 'play';
}

function drawGameClear() {
    background(0);
    for (let i = 0; i < 5; i++) {
        fill(255, 200, 50, 20 - i * 3); noStroke();
        ellipse(width/2, height/2, width*(0.4+i*0.15), height*(0.4+i*0.15));
    }
    textAlign(CENTER, CENTER);
    fill(255, 220, 50); textSize(min(width, height) * 0.12); textStyle(BOLD);
    text('🏆 GAME CLEAR!', width/2, height/2 - height*0.15);
    fill(255, 255, 200); textSize(min(width, height) * 0.04); textStyle(NORMAL);
    text('모든 피라미드를 탈출했다!', width/2, height/2);
    let btnW = width*0.28, btnH = height*0.08;
    let btnX = width/2 - btnW/2, btnY = height/2 + height*0.12;
    let isHover = mouseX>btnX && mouseX<btnX+btnW && mouseY>btnY && mouseY<btnY+btnH;
    fill(isHover ? color(80,200,120) : color(50,160,90)); noStroke();
    rect(btnX, btnY, btnW, btnH, 10);
    fill(255); textSize(min(width,height)*0.035); textStyle(BOLD);
    text('처음부터 다시', width/2, btnY+btnH/2); textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
}
