let gameState = 'play'; // 현재 게임 상태 ('play' | 'gameover' | 'stageclear')
let currentStage = 1;   // 현재 스테이지 단계 번호

// 고정된 골인 지점/출발 지점 미로 인덱스 좌표
const START_ROW = 1, START_COL = 0;
const GOAL_ROW  = 18, GOAL_COL = 19;

// 1. 미라와 플레이어의 충돌 검사 (피격 판정 시 gameover 상태 전환)
function checkCaught() {
    let d = dist(playerX, playerY, mummyX, mummyY);
    if (d < (playerSize + mummySize) / 2 * 0.8) {
        gameState = 'gameover';
        mummyDirX = 0;
        mummyDirY = 0;
    }
}

// 2. 플레이어와 탈출 점(GOAL)의 충돌 검사 (도달 시 stageclear 상태 전환)
function checkGoal() {
    let goalX = GOAL_COL * cellSize + cellSize / 2;
    let goalY = GOAL_ROW * cellSize + cellSize / 2;
    let d = dist(playerX, playerY, goalX, goalY);
    if (d <= cellSize) {
        gameState = 'stageclear';
    }
}

// 3. 게임 오버 시 화면을 어둡게 막고 '처음부터 다시' 마우스 버튼 인터페이스 제공
function drawGameOver() {
    fill(255, 0, 0, 50);
    noStroke();
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    fill(255, 60, 60);
    textSize(min(width, height) * 0.1);
    textStyle(BOLD);
    text('GAME OVER', width / 2, height / 2 - height * 0.1);
    textStyle(NORMAL);

    let btnW = width * 0.22;
    let btnH = height * 0.06;
    let btnX = width / 2 - btnW / 2;
    let btnY = height / 2 + height * 0.02;

    let isHover = mouseX > btnX && mouseX < btnX + btnW &&
                  mouseY > btnY && mouseY < btnY + btnH;

    fill(isHover ? color(180, 80, 80) : color(140, 50, 50));
    rect(btnX, btnY, btnW, btnH, 10);

    fill(255);
    textSize(min(width, height) * 0.028);
    textStyle(BOLD);
    text('처음부터 다시', width / 2, btnY + btnH / 2);
    textStyle(NORMAL);
}

// 4. 스테이지 클리어 시 화면을 차단하고 '다음 스테이지' 진행 마우스 버튼 제공
function drawStageClear() {
    fill(0, 255, 0, 50);
    noStroke();
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    fill(255, 220, 50);
    textSize(min(width, height) * 0.09);
    textStyle(BOLD);
    text('STAGE ' + currentStage + ' CLEAR!', width / 2, height / 2 - height * 0.1);
    textStyle(NORMAL);

    let btnW = width * 0.28;
    let btnH = height * 0.08;
    let btnX = width / 2 - btnW / 2;
    let btnY = height / 2 + height * 0.02;

    let isHover = mouseX > btnX && mouseX < btnX + btnW &&
                  mouseY > btnY && mouseY < btnY + btnH;

    fill(isHover ? color(80, 200, 120) : color(50, 160, 90));
    rect(btnX, btnY, btnW, btnH, 10);

    fill(255);
    textSize(min(width, height) * 0.035);
    textStyle(BOLD);
    text('다음 스테이지 →', width / 2, btnY + btnH / 2);
    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
}

// 5. 게임오버 혹은 클리어 마우스 UI 버튼 클릭 감지 기능
function mousePressed() {
    if (gameState === 'stageclear') {
        let btnW = width * 0.28;
        let btnH = height * 0.08;
        let btnX = width / 2 - btnW / 2;
        let btnY = height / 2 + height * 0.02;

        if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
            currentStage++;
            resetGame();
        }
    }

    if (gameState === 'gameover') {
        let btnW = width * 0.22;
        let btnH = height * 0.06;
        let btnX = width / 2 - btnW / 2;
        let btnY = height / 2 + height * 0.02;

        if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
            currentStage = 1;
            resetGame();
        }
    }
} 

function resetGame() {
    variableInitialization();
    mazeStructure();
    spawnMummy();
    torchSetup();
    gameState = 'play';
}
