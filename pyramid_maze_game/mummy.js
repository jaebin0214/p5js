let mummyX, mummyY;      // 미라의 현재 실시간 좌표 (픽셀 단위)
let mummyDirX = 0;       // 미라의 X축 이동 방향 속도 벡터
let mummyDirY = 0;       // 미라의 Y축 이동 방향 속도 벡터
let mummySize;           // 미라의 크기 (렌더링용)
let mummyTimer = 0;      // BFS 경로 재계산 주기를 체크하기 위한 타이머
const MUMMY_DELAY = 300; // 몇 밀리초(ms)마다 경로를 갱신할 것인가 (0.3초)
const MUMMY_SPEED = 5;   // 미라의 프레임당 이동 속도

// 1. 플레이어와 최소 5칸 이상 떨어진 빈 공간에 미라를 랜덤 생성
function spawnMummy() {
    let openCells = [];
    for (let r = 0; r < maze1.length; r++) {
        for (let c = 0; c < maze1[r].length; c++) {
            if (maze1[r][c] === 0) {
                let distR = abs(r - floor(playerY / cellSize));
                let distC = abs(c - floor(playerX / cellSize));
                // 플레이어와의 맨해튼 거리가 5칸보다 먼 곳만 후보군 등록
                if (distR + distC > 5) {
                    openCells.push({ r, c });
                }
            }
        }
    }
    let chosen = random(openCells);
    mummyX = chosen.c * cellSize + cellSize / 2;
    mummyY = chosen.r * cellSize + cellSize / 2;
    mummyDirX = 0;
    mummyDirY = 0;
}

// 2. 미라의 실시간 이동 및 방향 벡터 계산 (스페이스바 유지 시 작동)
function mummyMoving() {
    let now = millis();

    // 0.3초마다 플레이어의 위치를 추적하여 최단 경로(BFS) 재계산
    if (now - mummyTimer > MUMMY_DELAY) {
        mummyTimer = now;

        let mCol = floor(mummyX / cellSize);
        let mRow = floor(mummyY / cellSize);
        let pCol = floor(playerX / cellSize);
        let pRow = floor(playerY / cellSize);

        let path = bfs({ row: mRow, col: mCol }, { row: pRow, col: pCol });

        if (path.length > 1) {
            let next    = path[1]; // 다음으로 가야 할 미로 칸
            let targetX = next.col * cellSize + cellSize / 2;
            let targetY = next.row * cellSize + cellSize / 2;
            let dx      = targetX - mummyX;
            let dy      = targetY - mummyY;
            let d       = sqrt(dx * dx + dy * dy);
            if (d > 0) {
                mummyDirX = dx / d; // 단위 벡터화
                mummyDirY = dy / d;
            }
        }
    }

    // 미라 실제 좌표 이동 및 벽 충돌 검사
    let nextX    = mummyX + mummyDirX * MUMMY_SPEED;
    let nextY    = mummyY + mummyDirY * MUMMY_SPEED;
    let mCol     = floor(mummyX / cellSize);
    let mRow     = floor(mummyY / cellSize);
    let nextColX = floor(nextX / cellSize);
    let nextRowY = floor(nextY / cellSize);

    if (cells[mRow] && cells[mRow][nextColX] !== 1) {
        mummyX = nextX;
    } else {
        mummyDirX = 0;
    }

    if (cells[nextRowY] && cells[nextRowY][mCol] !== 1) {
        mummyY = nextY;
    } else {
        mummyDirY = 0;
    }
}

// 3. 미라가 플레이어에게 가는 최단 경로를 찾는 너비 우선 탐색 알고리즘
function bfs(start, goal) {
    let queue   = [{ row: start.row, col: start.col }];
    let visited = {};
    let parent  = {};
    let rows    = maze1.length;
    let cols    = maze1[0].length;
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
                !visited[k] && maze1[nr][nc] !== 1) {
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

// 4. 미라 그래픽 디자인 양식
function mummyDesign() {
    pop();
    let x = mummyX - mummySize / 2;
    let y = mummyY - mummySize / 2;
    let s = mummySize;

    noStroke(); 
    fill(205, 185, 140); // 붕대 색깔
    rect(x + s*0.1, y + s*0.1, s*0.8, s*0.8, s*0.15);

    stroke(170, 148, 95); // 붕대 선 패턴
    strokeWeight(1.5);
    for (let i = 0; i < 4; i++) {
        let ly = y + s*0.2 + i * (s * 0.17);
        line(x + s*0.12, ly, x + s*0.88, ly);
    }
    noStroke();
    fill(220, 30, 30); // 빨간 눈
    circle(mummyX - s*0.18, mummyY - s*0.1, s*0.18);
    circle(mummyX + s*0.18, mummyY - s*0.1, s*0.18);
    fill(255, 120, 120);
    circle(mummyX - s*0.18, mummyY - s*0.1, s*0.08);
    circle(mummyX + s*0.18, mummyY - s*0.1, s*0.08);
    
}