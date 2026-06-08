// ============================================================
//  homescreen.js  v1.0
//  게임 홈화면 — 게임 시작 전에 표시되는 타이틀 스크린
//  픽셀아트 이집트 테마 / 파티클 / 애니메이션 버튼
//  '게임 시작' 클릭 → introDone=false, resetIntro() → 컷신 시작
// ============================================================

let homeScreenActive = true; // true이면 홈화면, false면 게임 진행
let homeParticles    = [];
let homeStars        = [];
let homeSandDrift    = [];
let homeTitleGlow    = 0;
let homeLogoY        = 0;
let homeBtnPulse     = 0;
let homeFadeAlpha    = 0;      // 페이드인용 (0=완전투명→255=완전불투명)
let homeFadeDir      = -1;     // -1=페이드인, 1=페이드아웃(시작전)
let homeStarting     = false;  // 버튼 눌린 후 페이드아웃 중
let homeStartTimer   = 0;
let homeTarget = 'game'; // 'game' 또는 'tutorial'

// 홈화면 초기화
function homeSetup() {
    homeParticles = [];
    homeStars     = [];
    homeSandDrift = [];
    homeFadeAlpha = 255; // 처음엔 검정으로 시작
    homeFadeDir   = -1;  // 페이드인
    homeStarting  = false;

    // 별 파티클 초기화
    for (let i = 0; i < 80; i++) {
        homeStars.push({
            x: random(width),
            y: random(height * 0.6),
            r: random(1, 3),
            twinkle: random(TWO_PI),
            speed: random(0.03, 0.09)
        });
    }

    // 모래 바람 파티클
    for (let i = 0; i < 55; i++) {
        homeSandDrift.push({
            x: random(-width * 0.2, width * 1.2),
            y: random(height * 0.55, height),
            vx: random(0.5, 2.2),
            vy: random(-0.4, 0.4),
            size: random(1.5, 5),
            alpha: random(40, 100),
            life: random(60, 200)
        });
    }
}

// ── 홈화면 메인 드로우 ────────────────────────────────────────
function drawHomeScreen() {
    // 페이드 인/아웃 처리
    if (homeFadeDir === -1) {
        homeFadeAlpha = max(0, homeFadeAlpha - 4);
    } else if (homeFadeDir === 1) {
        homeFadeAlpha = min(255, homeFadeAlpha + 6);
        if (homeFadeAlpha >= 255 && homeStarting) {
            // 페이드아웃 완료 → 게임 진입
            homeScreenActive = false;
            introDone        = false;
            resetIntro();
            return;
        }
    }

    // ── 배경: 사막 하늘 그라데이션 ────────────────────────────
    _homeDrawSky();

    // ── 별 ─────────────────────────────────────────────────────
    _homeDrawStars();

    // ── 픽셀 피라미드 실루엣 ──────────────────────────────────
    _homeDrawPyramidSilhouette();

    // ── 모래 파티클 ────────────────────────────────────────────
    _homeDrawSand();

    // ── 비네트 ─────────────────────────────────────────────────
    _homeVignette();

    // ── 타이틀 텍스트 ─────────────────────────────────────────
    _homeDrawTitle();

    // ── 장식 선 ───────────────────────────────────────────────
    _homeDrawDeco();

    // ── 게임 시작 버튼 ────────────────────────────────────────
    _homeDrawStartBtn();

    // ── 튜토리얼 버튼 ────────────────────────────────────────
    _homeDrawTutorialBtn()

    // ── 전체 페이드 오버레이 ───────────────────────────────────
    if (homeFadeAlpha > 0) {
        noStroke();
        fill(0, 0, 0, homeFadeAlpha);
        rect(0, 0, width, height);
    }

    homeTitleGlow += 0.04;
    homeBtnPulse  += 0.07;
    homeLogoY      = sin(frameCount * 0.018) * 7;
}

// ── 하늘 그라데이션 ────────────────────────────────────────────
function _homeDrawSky() {
    let ps = max(2, floor(min(width, height) / 160));
    for (let y = 0; y <= height; y += ps) {
        let t = y / height;
        // 밤하늘 → 사막 지평선 (남색 → 짙은 황금빛 갈색)
        let r = floor(lerp(5,  70, t));
        let g = floor(lerp(4,  35, t));
        let b = floor(lerp(20, 10, t));
        fill(r, g, b);
        noStroke();
        rect(0, y, width, ps + 1);
    }
}

// ── 별 ─────────────────────────────────────────────────────────
function _homeDrawStars() {
    noStroke();
    for (let s of homeStars) {
        s.twinkle += s.speed;
        let alpha = floor((sin(s.twinkle) * 0.4 + 0.6) * 180);
        let r = s.r * (sin(s.twinkle) * 0.2 + 0.9);
        fill(255, 230, 160, alpha);
        rect(floor(s.x), floor(s.y), r, r);
    }
}

// ── 픽셀 피라미드 실루엣 ──────────────────────────────────────
function _homeDrawPyramidSilhouette() {
    let ps = max(2, floor(min(width, height) / 160));
    let cx   = width / 2;
    let baseY = floor(height * 0.85);
    let pyW   = floor(width  * 0.78);
    let pyH   = floor(height * 0.48);
    let levels = floor(pyH / ps);

    noStroke();
    for (let lv = 0; lv < levels; lv++) {
        let t    = lv / levels;
        let rowW = floor(pyW * t / ps) * ps;
        let rowX = cx - rowW / 2;
        let rowY = baseY - pyH + lv * ps;

        // 밝은 면 (왼쪽)
        let rLight = floor(lerp(18, 95, t));
        let gLight = floor(lerp(12, 58, t));
        let bLight = floor(lerp(4, 16, t));
        fill(rLight, gLight, bLight);
        rect(rowX, rowY, rowW * 0.58, ps);

        // 어두운 면 (오른쪽)
        fill(floor(rLight * 0.62), floor(gLight * 0.6), floor(bLight * 0.6));
        rect(rowX + rowW * 0.58, rowY, rowW * 0.42, ps);

        // 수평 라인 텍스처
        if (lv % 5 === 0 && rowW > ps * 3) {
            fill(0, 0, 0, 40);
            rect(rowX, rowY, rowW, 1);
        }
    }

    // 피라미드 꼭대기 황금빛 반짝임
    let pulse = sin(frameCount * 0.055) * 0.5 + 0.5;
    fill(255, 210, 50, floor(150 + 100 * pulse));
    rect(cx - ps, baseY - pyH, ps * 2, ps * 2);
    fill(255, 240, 120, floor(80 * pulse));
    rect(cx - ps * 2, baseY - pyH - ps, ps * 4, ps);

    // 달빛 반사 (지평선)
    let reflW = width * 0.3;
    for (let r2 = floor(reflW / ps) * ps; r2 > 0; r2 -= ps * 2) {
        let a = floor(map(r2, 0, reflW, 55, 0));
        fill(200, 140, 40, a);
        rect(cx - r2 / 2, baseY, r2, ps * 2);
    }

    // 지평선 바닥 모래색
    fill(45, 28, 8);
    rect(0, baseY, width, height - baseY);
    fill(60, 38, 12);
    rect(0, baseY, width, ps * 2);

    // 작은 피라미드 실루엣 (왼쪽)
    let sW = pyW * 0.22, sH = pyH * 0.28;
    let sx2 = cx - pyW * 0.44;
    for (let lv = 0; lv < floor(sH / ps); lv++) {
        let t = lv / floor(sH / ps);
        let rw = floor(sW * t / ps) * ps;
        fill(30, 18, 6);
        rect(sx2 - rw / 2, baseY - sH + lv * ps, rw, ps);
    }

    // 작은 피라미드 실루엣 (오른쪽)
    let sx3 = cx + pyW * 0.46;
    let sW3 = pyW * 0.16, sH3 = pyH * 0.20;
    for (let lv = 0; lv < floor(sH3 / ps); lv++) {
        let t = lv / floor(sH3 / ps);
        let rw = floor(sW3 * t / ps) * ps;
        fill(28, 17, 5);
        rect(sx3 - rw / 2, baseY - sH3 + lv * ps, rw, ps);
    }
}

// ── 모래 파티클 ──────────────────────────────────────────────
function _homeDrawSand() {
    noStroke();
    for (let i = homeSandDrift.length - 1; i >= 0; i--) {
        let p = homeSandDrift[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.life--;
        if (p.life <= 0 || p.x > width * 1.3) {
            homeSandDrift[i] = {
                x: random(-width * 0.15, -10),
                y: random(height * 0.6, height),
                vx: random(0.5, 2.2),
                vy: random(-0.4, 0.4),
                size: random(1.5, 4.5),
                alpha: random(40, 90),
                life: random(80, 220)
            };
        }
        let a = floor(p.alpha * (p.life / 200));
        fill(190, 148, 80, max(0, a));
        rect(floor(p.x), floor(p.y), floor(p.size), max(1, floor(p.size * 0.4)));
    }
}

// ── 비네트 ───────────────────────────────────────────────────
function _homeVignette() {
    noStroke();
    let steps = 16;
    for (let i = 0; i < steps; i++) {
        let t = i / steps;
        let a = floor(map(t, 0, 1, 140, 0));
        fill(0, 0, 0, a);
        let margin = t * min(width, height) * 0.42;
        rect(0, 0, width, margin);
        rect(0, height - margin, width, margin);
        rect(0, 0, margin, height);
        rect(width - margin, 0, margin, height);
    }
}

// ── 타이틀 텍스트 ─────────────────────────────────────────────
function _homeDrawTitle() {
    let cx    = width / 2;
    let baseY = height * 0.24 + homeLogoY;
    let ts    = min(width, height);

    // 상단 이집트 장식 심볼
    let glowA = floor((sin(homeTitleGlow) * 0.35 + 0.65) * 200);
    noStroke();
    fill(200, 155, 30, glowA);
    textAlign(CENTER, CENTER);
    textSize(ts * 0.032);
    text('𓂀  ·  𓆣  ·  𓂀', cx, baseY - ts * 0.065);

    // 주 타이틀 — 그림자 레이어
    textSize(ts * 0.092);
    textStyle(BOLD);

    // 그림자
    fill(0, 0, 0, 160);
    text('피라미드', cx + 4, baseY + 4);
    text('미로 탈출', cx + 4, baseY + ts * 0.1 + 4);

    // 글로우 (황금)
    let gA = floor((sin(homeTitleGlow * 0.8) * 0.25 + 0.75) * 80);
    fill(255, 200, 40, gA);
    for (let dx = -3; dx <= 3; dx += 2) {
        text('피라미드', cx + dx, baseY + dx);
        text('미로 탈출', cx + dx, baseY + ts * 0.1 + dx);
    }

    // 메인 텍스트
    fill(255, 215, 50);
    text('피라미드', cx, baseY);
    fill(240, 195, 30);
    text('미로 탈출', cx, baseY + ts * 0.1);

    textStyle(NORMAL);

    // 영문 부제
    textSize(ts * 0.022);
    fill(190, 165, 100, 200);
    text('PYRAMID MAZE ESCAPE', cx, baseY + ts * 0.195);

    textAlign(LEFT, BASELINE);
}

// ── 장식 수평선 ──────────────────────────────────────────────
function _homeDrawDeco() {
    let cx    = width / 2;
    let lineY = height * 0.46;
    let ts    = min(width, height);
    let lw    = min(460, width * 0.55);

    noFill();
    let gA = floor((sin(homeTitleGlow * 1.1) * 0.2 + 0.8) * 180);
    stroke(200, 160, 40, gA);
    strokeWeight(1.5);
    line(cx - lw / 2, lineY, cx + lw / 2, lineY);

    // 중앙 스카라베 장식
    noStroke();
    fill(180, 140, 30, gA);
    textAlign(CENTER, CENTER);
    textSize(ts * 0.028);
    text('𓆣', cx, lineY);

    // 양쪽 점
    fill(200, 160, 40, gA);
    circle(cx - lw * 0.38, lineY, 4);
    circle(cx + lw * 0.38, lineY, 4);
    circle(cx - lw * 0.22, lineY, 3);
    circle(cx + lw * 0.22, lineY, 3);

    textAlign(LEFT, BASELINE);
    noStroke();
}

// ── 시작 버튼 (위치 살짝 위로 조정) ────────────────────────────
function _homeDrawStartBtn() {
    let cx  = width  / 2;
    let by  = height * 0.52; // 기존 0.535에서 소폭 상승
    let ts  = min(width, height);
    let bw  = min(280, width * 0.38);
    let bh  = max(40, ts * 0.06);
    let bx  = cx - bw / 2;

    let isHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;
    
    noStroke();
    if (isHover) fill(200, 150, 20);
    else fill(150, 108, 15);
    rect(bx, by, bw, bh, 3);
    
    stroke(255, 210, 50, isHover ? 255 : 180);
    strokeWeight(1.8);
    noFill();
    rect(bx, by, bw, bh, 3);
    noStroke();

    fill(isHover ? 255 : 230);
    textAlign(CENTER, CENTER);
    textSize(max(15, ts * 0.025));
    textStyle(BOLD);
    text('⚡  게임 시작', cx, by + bh / 2);
    textStyle(NORMAL);
}

// ── [추가] 튜토리얼 버튼 ──────────────────────────────────────
function _homeDrawTutorialBtn() {
    let cx  = width  / 2;
    let by  = height * 0.60; // 시작 버튼 아래 배치
    let ts  = min(width, height);
    let bw  = min(280, width * 0.38);
    let bh  = max(40, ts * 0.06);
    let bx  = cx - bw / 2;

    let isHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;
    
    noStroke();
    if (isHover) fill(60, 100, 150);
    else fill(40, 70, 110);
    rect(bx, by, bw, bh, 3);
    
    stroke(100, 200, 255, isHover ? 255 : 180);
    strokeWeight(1.8);
    noFill();
    rect(bx, by, bw, bh, 3);
    noStroke();

    fill(isHover ? 255 : 220);
    textAlign(CENTER, CENTER);
    textSize(max(15, ts * 0.025));
    textStyle(BOLD);
    text('📖  튜토리얼', cx, by + bh / 2);
    textStyle(NORMAL);
}

// ── 홈화면 마우스 클릭 처리 ──────────────────────────────────
function homescreenMousePressed() {
    // homescreenMousePressed() 함수 맨 위에 추가
    if (bgm && !bgm.isPlaying()) {
        bgm.setVolume(0.3);
        bgm.loop();
    }

    if (!homeScreenActive || homeStarting) return false;

    let cx = width / 2;
    let ts = min(width, height);
    let bw = min(280, width * 0.38);
    let bh = max(40, ts * 0.06);
    let bx = cx - bw / 2;

    // 게임 시작 버튼 클릭
    let startBy = height * 0.52;
    if (mouseX > bx && mouseX < bx + bw && mouseY > startBy && mouseY < startBy + bh) {
        homeTarget = 'game';
        homeStarting = true;
        homeFadeDir = 1;
        return true;
    }

    // 튜토리얼 버튼 클릭
    let tutorBy = height * 0.60;
    if (mouseX > bx && mouseX < bx + bw && mouseY > tutorBy && mouseY < tutorBy + bh) {
        homeTarget = 'tutorial';
        homeStarting = true;
        homeFadeDir = 1;
        tutorialActive = true;
        return true;
    }
     if (bgm && !bgm.isPlaying()) {
        bgm.setVolume(0.3);
        bgm.loop();
    }

    if (!homeScreenActive || homeStarting) return false;

    return false;
}