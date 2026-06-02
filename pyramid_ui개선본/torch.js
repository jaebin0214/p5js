let torchActive = false;       // 횃불이 켜져있는가
let torchBlocked = false;      // 아누비스가 횃불을 막았는가
let torchBlockTimer = 0;       // 아누비스 차단 남은 시간(ms)
let torchRadius = 50;         // 현재 횃불 빛 범위
let torchDir;      // 플레이어 마지막 이동 방향
let darknessLayer;             // 어둠 레이어

// 횃불 설정값
let torchBaseRadius = 50;      // 기본 시야 범위 (횃불 off 상태)
let torchMaxRadius = 280;      // 횃불 최대 범위
let torchGrowSpeed = 4;        // 스페이스바 누를 때 확장 속도
let torchShrinkSpeed = 15;      // 뗄 때 축소 속도


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
            torchRadius -= torchShrinkSpeed;
        }
    }
}


// ── 어둠 레이어 그리기 ────────────────────────────────────────
// main.js의 draw() 맨 마지막에 torchDraw(); 추가할 것
// (mazeDrawing, playerDesign, mummyDesign 다 그린 후에 호출)
function torchDraw() {
    darknessLayer.clear();
    darknessLayer.background(0, 0, 0, 245);

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
    push();
    let bw = 260, bh = 32;
    let bx = width / 2 - bw / 2;
    let by = 50;
    let blink = frameCount % 30 < 15;
    if (blink) fill(220, 60, 40, 210);
    else       fill(160, 40, 20, 180);
    noStroke();
    rect(bx, by, bw, bh, 8);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    textStyle(BOLD);
    text('아누비스의 저주! 횃불 봉인 ' + secLeft + '초', width / 2, by + bh / 2);
    pop();
}