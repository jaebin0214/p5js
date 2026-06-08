let mummyX, mummyY;      // 미라의 현재 실시간 좌표 (픽셀 단위)
let mummyDirX = 0;       // 미라의 X축 이동 방향 속도 벡터
let mummyDirY = 0;       // 미라의 Y축 이동 방향 속도 벡터
let mummySize;           // 미라의 크기 (렌더링용)
let mummyTimer = 0;      // BFS 경로 재계산 주기를 체크하기 위한 타이머
let mummies = []; // 미라 객체들을 담을 배열
const MUMMY_COUNT = 3; // 생성할 미라 개수
const MUMMY_DELAY = 300;
const MUMMY_SPEED = 7; // 개수가 늘어나므로 속도를 약간 조절하는 것도 방법입니다.

// 1. 미라들을 배열에 생성
function spawnMummy() {
    mummies = []; // 배열 초기화
    let openCells = [];
    
    // 빈 공간 찾기 (기존 로직 동일)
    for (let r = 0; r < mazeData[currentStage - 1].length; r++) {
        for (let c = 0; c < mazeData[currentStage - 1][r].length; c++) {
            if (mazeData[currentStage - 1][r][c] === 0) {
                let distR = abs(r - floor(playerY / cellSize));
                let distC = abs(c - floor(playerX / cellSize));
                if (distR + distC > 5) {
                    openCells.push({ r, c });
                }
            }
        }
    }

    // MUMMY_COUNT만큼 미라 객체 생성
    for (let i = 0; i < MUMMY_COUNT; i++) {
        let chosen = random(openCells);
        mummies.push({
            x: chosen.c * cellSize + cellSize / 2,
            y: chosen.r * cellSize + cellSize / 2,
            dirX: 0,
            dirY: 0,
            timer: millis() + (i * 100) // 미라마다 계산 타이밍을 살짝 엇갈리게 하여 부하 방지
        });
    }
}

// 2. 모든 미라 이동 로직 (forEach 루프 사용)
function mummyMoving() {
    let now = millis();

    mummies.forEach(m => {
        // 아누비스 타격으로 횃불이 봉인된 상태에서도 isTorchOn()은 false가 되므로 쫓아오지 않음
        if (!isTorchOn()) {
            m.dirX = 0;
            m.dirY = 0;
            return; // 아래의 길찾기 및 이동 로직을 생략
        }
        
        if (now - m.timer > MUMMY_DELAY) {
            m.timer = now;
            let mCol = floor(m.x / cellSize);
            let mRow = floor(m.y / cellSize);
            let pCol = floor(playerX / cellSize);
            let pRow = floor(playerY / cellSize);

            let path = bfs({ row: mRow, col: mCol }, { row: pRow, col: pCol });

            if (path.length > 1) {
                let next = path[1];
                let targetX = next.col * cellSize + cellSize / 2;
                let targetY = next.row * cellSize + cellSize / 2;
                let dx = targetX - m.x;
                let dy = targetY - m.y;
                let d = sqrt(dx * dx + dy * dy);
                if (d > 0) {
                    m.dirX = dx / d;
                    m.dirY = dy / d;
                }
            }
        }

        // 벽 충돌 및 이동
        let nextX = m.x + m.dirX * MUMMY_SPEED;
        let nextY = m.y + m.dirY * MUMMY_SPEED;
        let curCol = floor(m.x / cellSize);
        let curRow = floor(m.y / cellSize);
        let nextColX = floor(nextX / cellSize);
        let nextRowY = floor(nextY / cellSize);

        if (cells[curRow] && cells[curRow][nextColX] !== 1) m.x = nextX;
        else m.dirX = 0;

        if (cells[nextRowY] && cells[nextRowY][curCol] !== 1) m.y = nextY;
        else m.dirY = 0;
    });
}

// 3. 미라가 플레이어에게 가는 최단 경로를 찾는 너비 우선 탐색 알고리즘
function bfs(start, goal) {
    let queue   = [{ row: start.row, col: start.col }];
    let visited = {};
    let parent  = {};
    let rows    = mazeData[currentStage-1].length;
    let cols    = mazeData[currentStage-1][0].length;
    visited[`${start.row},${start.col}`] = true;

    while (queue.length > 0) {
        let curr = queue.shift();
        if (curr.row === goal.row && curr.col === goal.col) break;

        let dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (let [dr, dc] of dirs) {
            let nr = curr.row + dr;
            let nc = curr.col + dc;
            let k  = `${nr},${nc}`;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                !visited[k] && mazeData[currentStage-1][nr][nc] !== 1) {
                visited[k] = true;
                parent[k]  = curr;
                queue.push({ row: nr, col: nc });
            }
        }
    }

    let path = [];
    let curr = { row: goal.row, col: goal.col };
    while (curr) {
        path.unshift(curr);
        curr = parent[`${curr.row},${curr.col}`];
        if (path.length > rows * cols) break;
    }
    return path;
}

// ─────────────────────────────────────────────────────────────
//  일반 미라 픽셀아트 (기존 유지)
// ─────────────────────────────────────────────────────────────
// 미라 스프라이트 (16열 × 19행) — 이미지 기반, 수평 붕대선, 큰 머리, 통통한 몸
const MUMMY_SPR = [
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
const MUMMY_PAL_BASE = {
    2:[16,15,14], 3:[34,31,29], 4:[123,112,97],
    5:[224,205,172], 6:[137,126,107], 7:[104,95,81],
    8:[205,186,149], 9:[183,162,120], 10:[190,107,44],
    11:[165,121,79], 12:[88,81,70], 13:[177,132,94],
    14:[228,120,36], 15:[190,145,103], 16:[76,67,58], 17:[163,141,114]
};

function mummyDesign() {
    mummies.forEach(m => {
        let ps=max(2,floor(mummySize/14)), sW=16*ps, sH=19*ps;
        let ox=m.x-sW/2, oy=m.y-sH/2; noStroke();
        drawSprite(MUMMY_SPR,MUMMY_PAL_BASE,ox,oy,ps);
    });
}
function mummyEyesDrawing() {
    mummies.forEach(m => {
        let ps=max(2,floor(mummySize/14));
        let sH=19*ps, oy=m.y-sH/2;
        let eyeY=oy+5*ps+ps*0.3;
        let sW=16*ps, ox=m.x-sW/2;
        let eyeLX=ox+ps*3.2, eyeRX=ox+ps*7.5;
        let blink=sin(frameCount*0.045+m.x*0.02)>0.88; noStroke();
        if (!blink) {
            fill(235,128,28,245);
            rect(eyeLX, eyeY, ps*2, ps*1.8);
            rect(eyeRX, eyeY, ps*2, ps*1.8);
            fill(30,12,2,255);
            rect(eyeLX+ps*0.4, eyeY+ps*0.3, ps*1.2, ps*1.2);
            rect(eyeRX+ps*0.4, eyeY+ps*0.3, ps*1.2, ps*1.2);
            fill(255,210,90,200);
            rect(eyeLX+ps*0.2, eyeY+ps*0.2, ps*0.6, ps*0.6);
            rect(eyeRX+ps*0.2, eyeY+ps*0.2, ps*0.6, ps*0.6);
        } else {
            fill(185,95,18,230);
            rect(eyeLX, eyeY+ps*0.8, ps*2, ps*0.5);
            rect(eyeRX, eyeY+ps*0.8, ps*2, ps*0.5);
        }
    });
}
