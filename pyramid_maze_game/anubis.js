// ============================================================
//  anubis.js
//  ui_enhanced.js에 없는 아누비스 유틸만 담당
//  drawAnubis() 렌더링은 ui_enhanced.js 사용
// ============================================================

function anubisReset() {
    // ui_enhanced.js의 전역 변수 초기화
    anubisLastStrike = 0;
    anubisStrikeAnim = 0;
}


// ─────────────────────────────────────────────────────────────
//  [추가] 아누비스 기믹 (스테이지3)
//  — 미로 오른쪽 바깥에 위치, 3초마다 지팡이 내리쳐 횃불 3초 봉인
// ─────────────────────────────────────────────────────────────
let anubisLastStrike = 0;
const ANUBIS_INTERVAL = 13000;
let anubisStrikeAnim = 0;
let imgAnubis; // [추가] anuzis-Photoroom.png

function drawAnubis() {
    let now = millis();
    if (now - anubisLastStrike > ANUBIS_INTERVAL) {
        anubisLastStrike = now;
        anubisStrikeAnim = now;
        torchBlock(5000);
    }


    let isStriking = (now - anubisStrikeAnim) < 600;
    let shakeX = isStriking ? sin((now - anubisStrikeAnim) * 0.05) * 8 : 0;
    let shakeY = isStriking ? abs(sin((now - anubisStrikeAnim) * 0.04)) * -14 : 0;

    // 아누비스 크기/위치: 화면 오른쪽 바깥 경계에 세로로 길게
    let sz = cellSize * 7;        // 크기 키움
    let ax = width - sz * 0.42;   // 오른쪽 위치 조정
    let ay = height / 2;          // 수직 중앙
    push();
    translate(shakeX, shakeY);

    // 이미지로 아누비스 그리기
    if (imgAnubis && imgAnubis.width > 0) {
        let iw = imgAnubis.width, ih = imgAnubis.height;
        let scale = sz / ih;
        let dw = iw * scale, dh = sz;
        let dx = ax - dw / 2;
        let dy = ay - dh / 2;
        // 타격 시 살짝 밝게
        if (isStriking) {
            tint(255, 220, 100, 230);
        } else {
            noTint();
        }
        image(imgAnubis, dx, dy, dw, dh);
        noTint();
    } else {
        // fallback: 기존 실루엣
        let s = sz * 0.45;
        fill(25, 15, 35); noStroke();
        rect(ax - s*0.18, ay + s*0.05, s*0.36, s*0.45, s*0.04);
        rect(ax - s*0.22, ay - s*0.35, s*0.44, s*0.42, s*0.05);
        fill(30, 20, 40);
        ellipse(ax, ay - s*0.52, s*0.38, s*0.34);
        let eyePulse = sin(frameCount * 0.1) * 0.5 + 0.5;
        fill(255, 180, 0, floor(230 * eyePulse));
        circle(ax - s*0.08, ay - s*0.54, s*0.06);
        circle(ax + s*0.08, ay - s*0.54, s*0.06);
    }

    pop();

    // 타격 시 화면 플래시 (금빛)
    if (isStriking && (now - anubisStrikeAnim) < 250) {
        fill(200, 140, 0, floor(map(now - anubisStrikeAnim, 0, 250, 50, 0)));
        noStroke(); rect(0, 0, width, height);
    }

    _drawAnubisCooldown(now);
}

function _drawAnubisCooldown(now) {
    let elapsed = now - anubisLastStrike;
    let ratio = min(1, elapsed / ANUBIS_INTERVAL);
    let bw = cellSize * 3, bh = 10;
    let bx = width - bw - cellSize * 1.5, by = height / 2 + cellSize * 4;
    noStroke(); fill(10, 0, 20, 220); rect(bx, by, bw, bh, 4);
    let gaugeCol = lerpColor(color(0, 255, 0), color(255, 0, 0), ratio);
    fill(gaugeCol); rect(bx, by, bw * ratio, bh, 4);
    fill(255, 210, 100); textAlign(CENTER, CENTER); textSize(10);
    text('아누비스', bx + bw/2, by - 8); textAlign(LEFT, BASELINE);
}
