// ============================================================
//  supermummy.js
//  ui_enhanced.js에 없는 슈퍼미라 로직만 담당
//  렌더링(enhancedSuperMummyDesign/Eyes)은 ui_enhanced.js 사용
// ============================================================

let superMummies = [];
const SUPER_MUMMY_COUNT_S2 = 2;
const SUPER_MUMMY_COUNT_S3 = 3;
const SUPER_MUMMY_DELAY    = 350;
const SUPER_MUMMY_SPEED    = 2.5;

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
