let mummyX, mummyY;      // 미라의 현재 실시간 좌표 (픽셀 단위)
let mummyDirX = 0;       // 미라의 X축 이동 방향 속도 벡터
let mummyDirY = 0;       // 미라의 Y축 이동 방향 속도 벡터
let mummySize;           // 미라의 크기 (렌더링용)
let mummyTimer = 0;      // BFS 경로 재계산 주기를 체크하기 위한 타이머
let mummies = []; // 미라 객체들을 담을 배열
const MUMMY_COUNT = 3; // 생성할 미라 개수
const MUMMY_DELAY = 300;
const MUMMY_SPEED = 5; // 개수가 늘어나므로 속도를 약간 조절하는 것도 방법입니다.

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


// 4. 미라 그리기 (디자인 함수 수정)
function mummyDesign() {
    mummies.forEach(m => {
        push();
        let x = m.x - mummySize / 2;
        let y = m.y - mummySize / 2;
        let s = mummySize;
        noStroke(); 
        fill(175, 155, 110);
        rect(x + s*0.1, y + s*0.1, s*0.8, s*0.8, s*0.15);
        stroke(140, 118, 65);
        strokeWeight(1.5);
        for (let i = 0; i < 4; i++) {
            let ly = y + s*0.2 + i * (s * 0.17);
            line(x + s*0.12, ly, x + s*0.88, ly);
        }
        pop();
    });
}

function mummyEyesDrawing(){
    mummies.forEach(m => {
        push();
        let s = mummySize;
        noStroke();
        fill(220, 220, 30); // 노란 외곽
        circle(m.x - s*0.18, m.y - s*0.1, s*0.18);
        circle(m.x + s*0.18, m.y - s*0.1, s*0.18);
        fill(255, 120, 120); // 빨간 눈동자
        circle(m.x - s*0.18, m.y - s*0.1, s*0.08);
        circle(m.x + s*0.18, m.y - s*0.1, s*0.08);
        pop();
    });
}

