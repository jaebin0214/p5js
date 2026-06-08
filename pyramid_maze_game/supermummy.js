// ============================================================
//  supermummy.js
//  ui_enhanced.js에 없는 슈퍼미라 로직만 담당
//  렌더링(enhancedSuperMummyDesign/Eyes)은 ui_enhanced.js 사용
// ============================================================

let superMummies = [];
const SUPER_MUMMY_COUNT_S2 = 2;
const SUPER_MUMMY_COUNT_S3 = 3;
const SUPER_MUMMY_DELAY    = 350;
const SUPER_MUMMY_SPEED    = 0.7;

function spawnSuperMummy() {
    superMummies = [];
    let superCount = 0;
    if (currentStage === 2) superCount = SUPER_MUMMY_COUNT_S2;
    if (currentStage === 3) superCount = SUPER_MUMMY_COUNT_S3;
    if (superCount === 0) return;

    let openCells = [];
    for (let r = 0; r < mazeData[currentStage - 1].length; r++) {
        for (let c = 0; c < mazeData[currentStage - 1][r].length; c++) {
            if (mazeData[currentStage - 1][r][c] === 0) {
                let distR = abs(r - floor(playerY / cellSize));
                let distC = abs(c - floor(playerX / cellSize));
                if (distR + distC > 5) openCells.push({ r, c });
            }
        }
    }
    for (let i = 0; i < superCount; i++) {
        if (openCells.length === 0) break;
        let chosen = random(openCells);
        superMummies.push({
            x: chosen.c * cellSize + cellSize / 2,
            y: chosen.r * cellSize + cellSize / 2,
            dirX: 0, dirY: 0,
            timer: millis() + (i * 150)
        });
    }
}

function superMummyMoving() {
    if (superMummies.length === 0) return;
    let now = millis();
    superMummies.forEach(m => {
        if (now - m.timer > SUPER_MUMMY_DELAY) {
            m.timer = now;
            let path = bfs(
                { row: floor(m.y / cellSize), col: floor(m.x / cellSize) },
                { row: floor(playerY / cellSize), col: floor(playerX / cellSize) }
            );
            if (path.length > 1) {
                let dx = path[1].col * cellSize + cellSize / 2 - m.x;
                let dy = path[1].row * cellSize + cellSize / 2 - m.y;
                let d  = sqrt(dx * dx + dy * dy);
                if (d > 0) { m.dirX = dx / d; m.dirY = dy / d; }
            }
        }
        let nextX  = m.x + m.dirX * SUPER_MUMMY_SPEED;
        let nextY  = m.y + m.dirY * SUPER_MUMMY_SPEED;
        let curCol = floor(m.x / cellSize);
        let curRow = floor(m.y / cellSize);
        if (cells[curRow] && cells[curRow][floor(nextX / cellSize)] !== 1) m.x = nextX; else m.dirX = 0;
        if (cells[floor(nextY / cellSize)] && cells[floor(nextY / cellSize)][curCol] !== 1) m.y = nextY; else m.dirY = 0;
    });
}

function checkSuperMummyCaught() {
    superMummies.forEach(m => {
        let d = dist(playerX, playerY, m.x, m.y);
        if (d < (playerSize + mummySize) / 2 * 0.8) {
            gameState = 'gameover';
            superMummies.forEach(mu => { mu.dirX = 0; mu.dirY = 0; });
            mummies.forEach(mu => { mu.dirX = 0; mu.dirY = 0; });
        }
    });
}

// ─────────────────────────────────────────────────────────────
//  [추가] 슈퍼미라 픽셀아트 — 붉은 눈, 검은 붕대
// ─────────────────────────────────────────────────────────────
const SUPER_MUMMY_SPR = [
    [0,0,0,0,2,3,3,3,3,3,3,2,0,0,0,0],
    [0,0,0,2,4,5,5,5,5,5,5,6,2,0,0,0],
    [0,0,0,7,5,5,5,5,5,5,5,5,4,0,0,0],
    [0,0,0,7,8,9,9,9,9,9,9,8,4,0,0,0],
    [0,0,0,7,5,5,5,5,5,5,5,5,4,0,0,0],
    [0,0,0,7,9,10,11,9,11,10,11,8,4,0,0,0],
    [0,0,0,12,13,14,13,5,15,14,15,8,7,0,0,0],
    [0,0,0,0,16,17,17,9,9,17,9,7,0,0,0,0],
    [0,0,2,3,3,4,5,5,5,5,6,3,3,2,0,0],
    [0,0,7,5,5,5,5,5,5,5,5,5,5,4,0,0],
    [0,0,16,6,17,9,9,9,9,9,9,17,6,16,0,0],
    [0,0,0,0,7,5,5,5,5,5,5,4,0,0,0,0],
    [0,0,0,0,12,9,9,9,9,9,9,7,0,0,0,0],
    [0,0,0,0,7,5,5,5,5,5,5,4,0,0,0,0],
    [0,0,0,0,12,9,9,9,9,9,9,7,0,0,0,0],
    [0,0,0,0,7,5,5,8,8,5,5,4,0,0,0,0],
    [0,0,0,0,7,5,5,4,7,5,5,4,0,0,0,0],
    [0,0,0,0,12,9,9,7,12,9,9,7,0,0,0,0],
    [0,0,0,0,12,8,8,7,12,8,8,7,0,0,0,0],
];
const SUPER_MUMMY_PAL = {
    2:[8,6,6], 3:[16,12,10], 4:[58,48,40],
    5:[82,64,48], 6:[46,50,40], 7:[46,40,32],
    8:[78,66,52], 9:[60,52,40], 10:[204,42,8],
    11:[138,32,16], 12:[40,32,24], 13:[106,40,24],
    14:[221,26,8], 15:[138,48,24], 16:[28,24,16], 17:[58,48,40]
};

function superMummyDesign() {
    superMummies.forEach(m => {
        let ps=max(2,floor(mummySize/14)), sW=16*ps, sH=19*ps;
        let ox=m.x-sW/2, oy=m.y-sH/2; noStroke();
        drawSprite(SUPER_MUMMY_SPR, SUPER_MUMMY_PAL, ox, oy, ps);
    });
}

function superMummyEyesDrawing() {
    superMummies.forEach(m => {
        let ps=max(2,floor(mummySize/14));
        let sH=19*ps, oy=m.y-sH/2;
        let eyeY=oy+5*ps+ps*0.3;
        let sW=16*ps, ox=m.x-sW/2;
        let eyeLX=ox+ps*3.2, eyeRX=ox+ps*7.5;
        let pulse=sin(frameCount*0.12+m.x*0.01)*0.4+0.6; noStroke();
        fill(255,0,0,floor(240*pulse));
        rect(eyeLX, eyeY, ps*2, ps*1.8);
        rect(eyeRX, eyeY, ps*2, ps*1.8);
        fill(255,180,180,floor(180*pulse));
        rect(eyeLX+ps*0.4, eyeY+ps*0.3, ps*1.2, ps*1.2);
        rect(eyeRX+ps*0.4, eyeY+ps*0.3, ps*1.2, ps*1.2);
    });
}
