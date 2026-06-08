let torchActive = false;       // 횃불이 켜져있는가
let torchBlocked = false;      // 아누비스가 횃불을 막았는가
let torchBlockTimer = 0;       // 아누비스 차단 남은 시간(ms)
let torchRadius = 30;         // 현재 횃불 빛 범위
let torchDir;      // 플레이어 마지막 이동 방향
let darknessLayer;             // 어둠 레이어

// 횃불 설정값
let torchBaseRadius = 30;      // 기본 시야 범위 (횃불 off 상태)
let torchMaxRadius = 280;      // 횃불 최대 범위
let torchGrowSpeed = 8;        // 스페이스바 누를 때 확장 속도
let torchShrinkSpeed = 20;      // 뗄 때 축소 속도


// ── 횃불 초기화 ──────────────────────────────────────────────
// main.js의 setup() 안에 torchSetup(); 추가할 것
function torchSetup() {
    darknessLayer = createGraphics(width, height);
    torchRadius = torchBaseRadius;
    torchActive = false;
    torchBlocked = false;
    torchBlockTimer = 0;
    torchDir = 'right';
}


// ── 횃불 업데이트 ─────────────────────────────────────────────
// main.js의 draw() 안에 torchUpdate(); 추가할 것
function torchUpdate() {
    
    // 이동 중인지 감지 (방향키 하나라도 눌려있으면 이동 중)
    let isMoving = keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW)
                || keyIsDown(UP_ARROW)   || keyIsDown(DOWN_ARROW);

    // 아누비스 차단 타이머 감소
    if (torchBlocked) {
        torchBlockTimer -= deltaTime;
        if (torchBlockTimer <= 0) {
            torchBlocked = false;
            torchBlockTimer = 0;
        }
    }

    // 횃불 사용 가능 조건: 이동 중 아님 + 아누비스 차단 아님
    let canUseTorch = !isMoving && !torchBlocked;

    // 스페이스바 누르고 있을 때 (spaceHeld는 main.js에 있음)
    if (canUseTorch && spaceHeld) {
        torchActive = true;
        if (torchRadius < torchMaxRadius) {
            torchRadius += torchGrowSpeed;
        }
    }
    // 이동 중이거나 스페이스바 안 누를 때
    else {
        torchActive = false;
        if (torchRadius > torchBaseRadius) {
            torchRadius -= torchShrinkSpeed; // 일단 줄인 후
            
            // 만약 기본 크기(25)보다 작아졌다면, 정확히 기본 크기로 고정
            if (torchRadius < torchBaseRadius) {
                torchRadius = torchBaseRadius;
            }
        }
    }
}


// ── 어둠 레이어 그리기 ────────────────────────────────────────
// main.js의 draw() 맨 마지막에 torchDraw(); 추가할 것
// (mazeDrawing, playerDesign, mummyDesign 다 그린 후에 호출)
function torchDraw() {
    darknessLayer.clear();
    darknessLayer.background(0, 0, 0, 255);

    // 이동 방향 앞쪽으로 빛 중심 살짝 이동
    let lightX = playerX;
    let lightY = playerY;

    // 어둠에 원형 구멍 뚫기 (빛 표현)
    darknessLayer.erase();
    torchGradientCircle(lightX, lightY, torchRadius);
    darknessLayer.noErase();

    // 어둠 레이어 화면에 덮기
    image(darknessLayer, 0, 0);

    // 아누비스 차단 중 경고 UI
    if (torchBlocked) {
        torchBlockedUI();
    }
}


// ── 아누비스 기믹 ─────────────────────────────────────────────
// mummy.js에서 아누비스 발동 시 torchBlock(3000); 호출
// 숫자는 차단할 시간(ms). 3000 = 3초
function torchBlock(ms) {
    torchBlocked = true;
    torchBlockTimer = ms;
    torchActive = false;
    torchRadius = torchBaseRadius;
}


// ── 횃불 상태 반환 ────────────────────────────────────────────
// mummy.js에서 미라 AI 짤 때 isTorchOn() 으로 읽으면 됨
// true = 횃불 켜짐 (미라가 빛 향해 달려옴)
// false = 횃불 꺼짐
function isTorchOn() {
    return torchActive;
}


// ── 내부 함수: 그라데이션 원 ──────────────────────────────────
function torchGradientCircle(cx, cy, radius) {
    darknessLayer.noStroke();
    for (let i = 0; i < 20; i++) {
        let r = radius * (i / 20);
        let alpha = lerp(255, 0, i / 20);
        darknessLayer.fill(255, 255, 255, alpha);
        darknessLayer.ellipse(cx, cy, r * 2, r * 2);
    }
}


// ── 내부 함수: 불꽃 파티클 ────────────────────────────────────
function torchFlame() {
    push();
    noStroke();
    for (let i = 0; i < 10; i++) {
        let angle = random(TWO_PI);
        let d = random(8, 28);
        let fx = playerX + cos(angle) * d;
        let fy = playerY + sin(angle) * d;
        let sz = random(4, 12);
        fill(255, random(80, 200), 0, random(140, 220));
        ellipse(fx, fy, sz, sz * 1.3);
    }
    pop();
}


// ── 내부 함수: 아누비스 차단 경고 UI ─────────────────────────
function torchBlockedUI() {
    let secLeft = ceil(torchBlockTimer / 1000);
    let now = millis();

    // ── 전체 화면 붉은 비네트 (봉인 중 내내 유지) ──
    let pulseA = sin(now * 0.008) * 0.4 + 0.6;
    noStroke();
    for (let i = 0; i < 8; i++) {
        let t = i / 8;
        let a = floor(map(t, 0, 1, 80 * pulseA, 0));
        fill(180, 0, 0, a);
        let m = t * min(width, height) * 0.5;
        rect(0, 0, width, m);
        rect(0, height - m, width, m);
        rect(0, 0, m, height);
        rect(width - m, 0, m, height);
    }

    // ── 화면 중앙 상단 큰 경고 배너 ──
    let bw = width * 0.55, bh = height * 0.1;
    let bx = width / 2 - bw / 2, by = height * 0.06;

    // 배너 배경 (깜빡임)
    let blink = frameCount % 20 < 10;
    noStroke();
    fill(blink ? color(180, 0, 0, 230) : color(100, 0, 0, 200));
    rect(bx, by, bw, bh, 6);

    // 배너 테두리 (깜빡임)
    stroke(blink ? color(255, 80, 80, 255) : color(200, 0, 0, 180));
    strokeWeight(3);
    noFill();
    rect(bx, by, bw, bh, 6);
    noStroke();

    // 경고 아이콘 + 텍스트
    fill(blink ? color(255, 255, 80) : color(255, 200, 50));
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(min(width, height) * 0.032);
    text('🔥 횃불 봉인! ' + secLeft + '초 남음 🔥', width / 2, by + bh * 0.42);

    // 부제 텍스트
    fill(255, 180, 180, blink ? 255 : 180);
    textSize(min(width, height) * 0.018);
    text('아누비스의 저주가 내려졌다', width / 2, by + bh * 0.75);
    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);

}