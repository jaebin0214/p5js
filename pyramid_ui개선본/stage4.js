// ============================================================
//  stage4.js
//  스테이지4 전용 씬 파일
//  보물방(treasure) → 파라오분노(pharaoh_rage) → 타임어택(timemaze)
//  이미지: stage4.jpg, stage4_mad.png (preload에서 로드)
// ============================================================

let imgStage4;
let imgStage4Mad;

// ── preload용 (main.js preload 안에서 호출) ───────────────────
function stage4Preload() {
    imgStage4    = loadImage('stage4.jpg');
    imgStage4Mad = loadImage('stage4_mad.png');
}

// ── 전역 상태 변수 ────────────────────────────────────────────
// [핵심] s4 변수들을 initStage4보다 반드시 먼저 선언
let s4ChestOpen  = false;
let s4ChestTimer = 0;
let s4Coins      = [];

let stage4Phase       = 'treasure';
let stage4Initialized = false;
let stage4Timer       = 0;
let stage4TimeLimit   = 15000; // 타임어택 15초
let stage4Stones      = [];
let stage4RageTimer   = 0;
let stage4TimeMazeStart = 0;

// ── 초기화 ────────────────────────────────────────────────────
function initStage4() {
    stage4Phase   = 'treasure';
    stage4Timer   = millis();
    stage4Stones  = [];
    s4ChestOpen   = false;
    s4ChestTimer  = 0;
    s4Coins       = [];
    for (let i = 0; i < 40; i++) {
        stage4Stones.push({
            x: random(width), y: random(-height, 0),
            vx: random(-2, 2), vy: random(1, 5),
            size: random(8, 28), active: false,
            col: [random(80,130), random(60,100), random(30,60)]
        });
    }
}

// ── 메인 진입점 ───────────────────────────────────────────────
function drawStage4Scene() {
    // 첫 진입 시 1회만 초기화
    if (!stage4Initialized) {
        initStage4();
        stage4Initialized = true;
    }
    if      (stage4Phase === 'treasure')    _drawTreasureRoom();
    else if (stage4Phase === 'pharaoh_rage') _drawPharaohRage();
    else if (stage4Phase === 'timemaze')     _drawTimeMaze();
}

// ── 씬1: 보물방 ───────────────────────────────────────────────
function _drawTreasureRoom() {
    let now = millis();
    let elapsed = now - stage4Timer;

    if (imgStage4 && imgStage4.width > 0) {
        let sc = min(width / imgStage4.width, height / imgStage4.height);
        let dw = imgStage4.width * sc, dh = imgStage4.height * sc;
        background(20, 12, 4);
        image(imgStage4, (width - dw) / 2, (height - dh) / 2, dw, dh);
    } else {
        background(40, 25, 5);
    }
    noStroke(); fill(200, 140, 20, 18); rect(0, 0, width, height);
    _s4Vignette();

    // 코인 파티클
    if (!s4ChestOpen && elapsed > 1500) s4ChestOpen = true;
    if (s4ChestOpen && frameCount % 3 === 0) {
        s4Coins.push({ x: width/2 + random(-80,80), y: height*0.6 + random(-30,30),
            vx: random(-4,4), vy: random(-8,-2), life: 60, maxLife: 60 });
    }
    for (let i = s4Coins.length - 1; i >= 0; i--) {
        let c = s4Coins[i];
        c.x += c.vx; c.y += c.vy; c.vy += 0.2; c.life--;
        if (c.life <= 0) { s4Coins.splice(i, 1); continue; }
        fill(255, 200, 30, floor(c.life / c.maxLife * 220));
        noStroke(); circle(c.x, c.y, 8);
    }

    // 나레이션
    let msg = elapsed < 2000 ? '마침내... 보물이다.' :
              elapsed < 4500 ? '파라오의 황금이 눈앞에 펼쳐진다!' :
              elapsed < 7000 ? '주인공은 보물을 가방에 담기 시작한다...' :
                               '그 순간... 피라미드가 흔들리기 시작한다!';
    noStroke(); fill(6, 4, 2, 220);
    rect(width*0.1, height*0.78, width*0.8, height*0.12, 8);
    fill(255, 215, 50); textAlign(CENTER, CENTER);
    textSize(max(14, min(width, height) * 0.025)); textStyle(BOLD);
    text(msg, width/2, height*0.78 + height*0.06); textStyle(NORMAL);

    if (elapsed > 8500) {
        stage4Phase    = 'pharaoh_rage';
        stage4RageTimer = millis();
    }
}

// ── 씬2: 파라오 분노 ──────────────────────────────────────────
function _drawPharaohRage() {
    let now = millis();
    let elapsed = now - stage4RageTimer;

    let shakeAmt = min(22, elapsed * 0.015);
    let sx = sin(now * 0.04) * shakeAmt;
    let sy = cos(now * 0.035) * shakeAmt * 0.6;

    push();
    translate(sx, sy);
    let img = (imgStage4Mad && imgStage4Mad.width > 0) ? imgStage4Mad : imgStage4;
    if (img && img.width > 0) {
        let sc = min(width / img.width, height / img.height);
        let dw = img.width * sc, dh = img.height * sc;
        background(10, 4, 2);
        image(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
    } else {
        background(30, 10, 2);
    }
    let rp = sin(elapsed * 0.008) * 0.5 + 0.5;
    fill(180, 0, 0, floor(25 * rp + 8)); noStroke(); rect(0, 0, width, height);
    pop();

    _s4FallingStones(elapsed);
    if (elapsed > 1000) _s4Cracks(elapsed);

    let msg = elapsed < 2000 ? '파라오가 분노했다!' :
              elapsed < 4500 ? '저주받은 자! 피라미드에서 탈출하라!' :
                               '역순으로 피라미드를 빠져나가야 한다!';
    noStroke(); fill(6, 4, 2, 220);
    rect(width*0.1, height*0.78, width*0.8, height*0.12, 8);
    fill(255, 60, 60); textAlign(CENTER, CENTER);
    textSize(max(14, min(width, height) * 0.026)); textStyle(BOLD);
    text(msg, width/2, height*0.78 + height*0.06); textStyle(NORMAL);

    if (elapsed > 5500) {
        stage4Phase       = 'timemaze';
        stage4TimeMazeStart = millis();
        mazeStructure();
    }
}

// ── 씬3: 타임어택 미로 ────────────────────────────────────────
function _drawTimeMaze() {
    let now     = millis();
    let elapsed = now - stage4TimeMazeStart;
    let remaining = max(0, stage4TimeLimit - elapsed);

    _drawBrightMaze();
    enhancedPlayerDesign();
    playerMoving();
    goalDrawing();
    _drawTimerUI(remaining);

    if (remaining <= 0) gameState = 'gameover';

    let goalX = GOAL_COL * cellSize + cellSize / 2;
    let goalY = GOAL_ROW * cellSize - cellSize / 2;
    if (dist(playerX, playerY, goalX, goalY) <= cellSize) {
        gameState = 'stageclear';
    }

    if (remaining < 5000) {
        let blink = sin(now * 0.015) * 0.5 + 0.5;
        noStroke(); fill(255, 0, 0, floor(60 * blink));
        rect(0, 0, width, height);
    }

    // 돌 계속 낙하
    for (let stone of stage4Stones) {
        if (!stone.active) continue;
        stone.x += stone.vx * 0.3; stone.y += stone.vy * 0.5;
        if (stone.y > height) { stone.y = random(-100, 0); stone.x = random(width); }
        fill(stone.col[0], stone.col[1], stone.col[2], 120);
        noStroke(); rect(stone.x, stone.y, stone.size*0.6, stone.size*0.4, 1);
    }
}

function _drawBrightMaze() {
    noStroke();
    for (let i = 0; i < height / cellSize; i++) {
        for (let j = 0; j < width / cellSize; j++) {
            if (!cells[i] || cells[i][j] === undefined) continue;
            let x = j * cellSize, y = i * cellSize;
            if (cells[i][j] === 1) {
                fill(120, 85, 40); rect(x, y, cellSize, cellSize);
                fill(160, 115, 55); rect(x+2, y+2, cellSize-4, cellSize-4, 2);
            } else {
                fill(230, 195, 130); rect(x, y, cellSize, cellSize);
            }
        }
    }
}

function _drawTimerUI(remaining) {
    let ratio = remaining / stage4TimeLimit;
    let bw = width * 0.6, bh = 22, bx = width/2 - bw/2, by = 16;
    noStroke(); fill(20, 10, 5, 200); rect(bx, by, bw, bh, 6);
    let barCol = remaining > 8000 ? color(80,200,80) :
                 remaining > 4000 ? color(255,165,0) : color(220,40,40);
    fill(barCol); rect(bx, by, bw * ratio, bh, 6);
    fill(255, 255, 200);
    textAlign(CENTER, CENTER); textSize(max(13, min(width,height)*0.022)); textStyle(BOLD);
    text('탈출까지 ' + (remaining / 1000).toFixed(1) + '초', width/2, by + bh/2);
    textStyle(NORMAL);
}

// ── 내부 유틸 ─────────────────────────────────────────────────
function _s4FallingStones(elapsed) {
    let activeCount = floor(map(elapsed, 0, 5000, 0, stage4Stones.length));
    for (let i = 0; i < activeCount; i++) stage4Stones[i].active = true;
    for (let s of stage4Stones) {
        if (!s.active) continue;
        s.x += s.vx; s.y += s.vy;
        if (s.y > height) { s.y = random(-100, 0); s.x = random(width); }
        fill(s.col[0], s.col[1], s.col[2], 200);
        noStroke(); rect(s.x, s.y, s.size, s.size * 0.7, 2);
    }
}

function _s4Cracks(elapsed) {
    let alpha = min(200, elapsed * 0.04);
    stroke(60, 30, 10, alpha); strokeWeight(2); noFill();
    randomSeed(42);
    for (let i = 0; i < 8; i++) {
        let lx = random(width), ly = random(height), clen = random(40, 120);
        beginShape();
        for (let j = 0; j < 5; j++) {
            vertex(lx, ly);
            lx += random(-clen/4, clen/4);
            ly += random(5, clen/4);
        }
        endShape();
    }
    randomSeed(); noStroke();
}

function _s4Vignette() {
    noStroke();
    for (let i = 0; i < 14; i++) {
        let t = i / 14, a = floor(map(t, 0, 1, 120, 0));
        fill(0, a);
        let m = t * min(width, height) * 0.38;
        rect(0, 0, width, m); rect(0, height - m, width, m);
        rect(0, 0, m, height); rect(width - m, 0, m, height);
    }
}
