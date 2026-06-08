
// ─────────────────────────────────────────────────────────────
//  픽셀 공통 유틸
// ─────────────────────────────────────────────────────────────
function drawSprite(grid, palette, ox, oy, ps) {
    noStroke();
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            let code = grid[r][c];
            if (code === 0) continue;
            let col = palette[code];
            if (!col) continue;
            fill(col[0], col[1], col[2], col[3] !== undefined ? col[3] : 255);
            rect(ox + c * ps, oy + r * ps, ps, ps);
        }
    }
}

// ─────────────────────────────────────────────────────────────
//  인트로 전역 상태 (기존 유지)
// ─────────────────────────────────────────────────────────────
let introScene  = 0;
let introTimer  = 0;
let introFade   = 255;
let introState  = 'fadein';
const INTRO_FADE_SPD = 5;
let introDone   = false;
let skipBtn     = null;
let introParticles = [];

let typingText  = '';
let typingFull  = '';
let typingIdx   = 0;
let typingTimer = 0;
const TYPING_SPD = 50;

const SCENE_LINES = [
    '수천 년의 침묵을 깨고...\n저 거대한 돌의 산이 눈앞에 펼쳐진다.\n빛의 고리가 꼭대기를 감싼다 — 신의 경고인가, 초대인가.',
    '낡은 지도를 펼친다.\n피라미드 깊숙한 곳, 네 번째 층에 표시가 있다.\n황금 보물 — 그리고 잠들지 않는 수호자들.',
    '횃불 하나를 쥐고 미로 앞에 선다.\n벽마다 새겨진 신들의 눈이 나를 내려본다.\n이제 시작이다. 살아서 나와야 한다.',
];

function _startTyping(scene) {
    typingFull  = SCENE_LINES[scene];
    typingText  = '';
    typingIdx   = 0;
    typingTimer = millis();
}
function _updateTyping() {
    if (typingIdx >= typingFull.length) return;
    if (millis() - typingTimer > TYPING_SPD) {
        typingIdx++;
        typingText = typingFull.substring(0, typingIdx);
        typingTimer = millis();
    }
}

function introNextScene() {
    if (typingIdx < typingFull.length) {
        typingIdx  = typingFull.length;
        typingText = typingFull;
        return;
    }
    if (introState === 'hold') { introState = 'fadeout'; }
}

function drawIntro() {
    background(0);
    _introSpawnParticles();
    _introUpdateParticles();
    switch (introScene) {
        case 0: _drawScene0(); break;
        case 1: _drawScene1(); break;
        case 2: _drawScene2(); break;
    }
    _drawIntroParticles();
    _drawDialogBox();
    _drawIntroFade();
    _drawSpacePrompt();
    _drawSkipAllBtn();
    _introAdvance();
    _updateTyping();
}

// ─────────────────────────────────────────────────────────────
//  씬 0 — 금환일식 + 픽셀 피라미드 (기존 유지)
// ─────────────────────────────────────────────────────────────
function _drawScene0() {
    let ps = max(3, floor(min(width, height) / 180));
    noStroke();
    for (let y = 0; y < height; y += ps) {
        let t = y / height;
        fill(floor(lerp(4,70,t)), floor(lerp(3,38,t)), floor(lerp(2,10,t)));
        rect(0, y, width, ps);
    }
    randomSeed(101);
    for (let i = 0; i < 18; i++) {
        let cx2 = random(width), cy2 = random(height*0.1, height*0.55);
        let cw  = random(width*0.06, width*0.18), ch = random(height*0.03, height*0.09);
        fill(floor(random(28,52)), floor(random(18,36)), floor(random(5,14)), floor(random(80,180)));
        for (let bx2 = -cw/2; bx2 < cw/2; bx2 += ps*2) {
            for (let by2 = -ch/2; by2 < ch/2; by2 += ps*2) {
                if (abs(bx2)/(cw/2)*abs(bx2)/(cw/2) + abs(by2)/(ch/2)*abs(by2)/(ch/2) < random(0.6,1.1))
                    rect(cx2+bx2, cy2+by2, ps*2, ps*2);
            }
        }
    }
    randomSeed();
    let pyBaseY = floor(height*0.98/ps)*ps;
    let pyW = floor(width*0.72/ps)*ps, pyH = floor(height*0.62/ps)*ps;
    _pixelPyramidBig(floor(width/2/ps)*ps, pyBaseY, pyW, pyH, ps);
    noStroke();
    for (let x = 0; x < width; x += ps) { fill(55,32,8,floor(random(60,120))); rect(x, pyBaseY, ps, height - pyBaseY); }
    let reflW = width*0.25;
    for (let r2 = floor(reflW/ps)*ps; r2 > 0; r2 -= ps*2) {
        fill(220,140,30,map(r2,0,reflW,80,0)); rect(width/2-r2/2, pyBaseY, r2, ps*3);
    }
    let eclX = floor(width/2/ps)*ps, eclY = floor(height*0.30/ps)*ps, eclR = floor(min(width,height)*0.13/ps)*ps;
    _drawPixelEclipse(eclX, eclY, eclR, ps);
}
function _drawPixelEclipse(cx,cy,r,ps) {
    noStroke();
    for (let ring=9; ring>=1; ring--) { let rr=r+ring*ps*3; fill(200,120,20,floor(map(ring,1,9,100,5))); _pixelRing(cx,cy,rr,ps*2,ps); }
    fill(255,190,30,235); _pixelRing(cx,cy,r,ps*4,ps);
    fill(255,230,100,190); _pixelRing(cx,cy,r-ps,ps*2,ps);
    fill(255,255,200,130); _pixelRing(cx,cy,r-ps*2,ps,ps);
    _pixelFilledCircle(cx,cy,r-ps*3,ps,[10,6,2]);
}
function _pixelRing(cx,cy,r,thick,ps) {
    for (let angle=0; angle<TWO_PI; angle+=ps/r) {
        let x=floor((cx+cos(angle)*r)/ps)*ps, y=floor((cy+sin(angle)*r)/ps)*ps;
        rect(x-thick/2,y-thick/2,thick+ps,thick+ps);
    }
}
function _pixelFilledCircle(cx,cy,r,ps,col) {
    fill(col[0],col[1],col[2]); noStroke();
    for (let dy=-r; dy<=r; dy+=ps) for (let dx=-r; dx<=r; dx+=ps)
        if (dx*dx+dy*dy<=r*r) rect(floor((cx+dx)/ps)*ps, floor((cy+dy)/ps)*ps, ps, ps);
}
function _pixelPyramidBig(cx,baseY,w,h,ps) {
    noStroke(); let levels=floor(h/ps);
    for (let lv=0; lv<levels; lv++) {
        let t=lv/levels, rowW=floor(w*t/ps)*ps, rowX=cx-rowW/2, rowY=baseY-h+lv*ps;
        let ri=floor(lerp(28,115,t)), gi=floor(lerp(16,68,t)), bi=floor(lerp(4,16,t));
        fill(floor(ri*1.15),floor(gi*1.1),floor(bi*1.1)); rect(rowX,rowY,rowW*0.55,ps);
        fill(floor(ri*0.70),floor(gi*0.70),floor(bi*0.70)); rect(rowX+rowW*0.55,rowY,rowW*0.45,ps);
        if (lv%4===0&&rowW>ps*4) { fill(floor(ri*0.5),floor(gi*0.5),floor(bi*0.5),110); rect(rowX,rowY,rowW,1); }
    }
    let pulse=sin(frameCount*0.06)*0.5+0.5;
    fill(255,220,80,floor(160*pulse)); noStroke(); rect(cx-ps,baseY-h,ps*2,ps*2);
}

// ─────────────────────────────────────────────────────────────
//  씬 1,2 — 이미지 (기존 유지)
// ─────────────────────────────────────────────────────────────
function _drawScene1() {
    background(30,22,10);
    if (imgMap && imgMap.width > 0) {
        let iw=imgMap.width, ih=imgMap.height, scale=min(width/iw,height/ih);
        let dw=iw*scale, dh=ih*scale, dx=(width-dw)/2, dy=(height-dh)/2;
        noStroke(); fill(180,145,80,30); rect(0,0,width,height);
        image(imgMap,dx,dy,dw,dh); _drawVignette();
    } else {
        fill(180,145,80); textAlign(CENTER,CENTER); textSize(18); text('map.webp 파일을 게임 폴더에 넣어주세요',width/2,height/2);
    }
}
function _drawScene2() {
    background(5,3,1);
    if (imgMazeIntro && imgMazeIntro.width > 0) {
        let iw=imgMazeIntro.width, ih=imgMazeIntro.height, scale=min(width/iw,height/ih);
        let dw=iw*scale, dh=ih*scale, dx=(width-dw)/2, dy=(height-dh)/2;
        image(imgMazeIntro,dx,dy,dw,dh);
        let flk=sin(frameCount*0.15)*0.04;
        fill(180,100,10,floor((0.06+flk)*255)); noStroke(); rect(0,0,width,height);
        _drawVignette();
    } else {
        fill(180,145,80); textAlign(CENTER,CENTER); textSize(18); text('maze_intro.png 파일을 게임 폴더에 넣어주세요',width/2,height/2);
    }
}
function _drawVignette() {
    noStroke(); let steps=14;
    for (let i=0; i<steps; i++) {
        let t=i/steps, a=floor(map(t,0,1,120,0)); fill(0,a);
        let margin=t*min(width,height)*0.38;
        rect(0,0,width,margin); rect(0,height-margin,width,margin);
        rect(0,0,margin,height); rect(width-margin,0,margin,height);
    }
}

// ─────────────────────────────────────────────────────────────
//  대화 박스 (기존 유지)
// ─────────────────────────────────────────────────────────────
function _drawDialogBox() {
    let bh=height*0.20, bw=width*0.86, bx=(width-bw)/2, by=height-bh-height*0.035, brd=3;
    noStroke(); fill(170,138,50); rect(bx-brd,by-brd,bw+brd*2,bh+brd*2);
    fill(6,4,2,238); rect(bx,by,bw,bh);
    fill(170,138,50,130); rect(bx+8,by+5,bw-16,2); rect(bx+8,by+bh-7,bw-16,2);
    let cs=9; fill(215,178,65);
    rect(bx,by,cs,cs); rect(bx+bw-cs,by,cs,cs); rect(bx,by+bh-cs,cs,cs); rect(bx+bw-cs,by+bh-cs,cs,cs);
    let lines=typingText.split('\n'), tSize=max(13,min(width,height)*0.021), lineH=max(20,min(width,height)*0.032);
    for (let i=0; i<lines.length; i++) {
        if (i===0) { fill(215,178,65); textSize(tSize*1.08); textStyle(BOLD); }
        else { fill(205,190,155); textSize(tSize); textStyle(NORMAL); }
        textAlign(LEFT,TOP); text(lines[i], bx+18, by+13+i*lineH);
    }
    if (typingIdx>=typingFull.length && frameCount%50<25) {
        fill(215,178,65); noStroke();
        let lastLine=lines[lines.length-1]||''; textSize(tSize);
        let tw=textWidth(lastLine); rect(bx+18+tw+4, by+13+(lines.length-1)*lineH+3, 7, tSize*0.85);
    }
    textStyle(NORMAL); textAlign(LEFT,BASELINE);
}
function _drawSpacePrompt() {
    if (typingIdx<typingFull.length) return; if (introState!=='hold') return;
    let pulse=sin(frameCount*0.08)*0.4+0.6;
    fill(215,178,65,floor(220*pulse)); noStroke(); textAlign(RIGHT,BOTTOM);
    textSize(max(12,min(width,height)*0.018)); textStyle(BOLD);
    text('SPACE — 다음  ▶',width-28,height-22); textStyle(NORMAL); textAlign(LEFT,BASELINE);
}
function _drawSkipAllBtn() {
    let bw=118,bh=33,bx=width-bw-16,by=16; skipBtn={x:bx,y:by,w:bw,h:bh};
    let isHover=mouseX>bx&&mouseX<bx+bw&&mouseY>by&&mouseY<by+bh;
    fill(0,0,0,isHover?210:140); stroke(185,148,52,isHover?255:180); strokeWeight(2); rect(bx,by,bw,bh,0);
    noStroke(); fill(185,148,52,isHover?255:215); textAlign(CENTER,CENTER); textSize(13); textStyle(BOLD);
    text('전체 스킵  ▶▶',bx+bw/2,by+bh/2); textStyle(NORMAL);
}
function introMousePressed() {
    if (!skipBtn) return;
    if (mouseX>skipBtn.x&&mouseX<skipBtn.x+skipBtn.w&&mouseY>skipBtn.y&&mouseY<skipBtn.y+skipBtn.h) introDone=true;
}
function _introAdvance() {
    if (introState==='fadein') {
        introFade=max(0,introFade-INTRO_FADE_SPD);
        if (introFade<=0) { introState='hold'; introTimer=millis(); _startTyping(introScene); }
    } else if (introState==='fadeout') {
        introFade=min(255,introFade+INTRO_FADE_SPD*2);
        if (introFade>=255) {
            introScene++;
            if (introScene>=3) introDone=true;
            else introState='fadein';
        }
    }
}
function _drawIntroFade() { fill(0,introFade); noStroke(); rect(0,0,width,height); }
function resetIntro() {
    introScene=0; introTimer=0; introFade=255; introState='fadein'; introDone=false;
    introParticles=[]; typingText=''; typingFull=''; typingIdx=0;
}
function _introSpawnParticles() {
    if (frameCount%3===0&&introScene===0) {
        let ps=3;
        introParticles.push({x:floor(random(width/ps))*ps, y:floor(random(height*0.55,height*0.72)/ps)*ps,
            vx:random(1.5,4), vy:random(-0.3,0.3), size:ps, alpha:random(50,120), life:random(60,130)});
    }
}
function _introUpdateParticles() { for (let i=introParticles.length-1;i>=0;i--) { let p=introParticles[i]; p.x+=p.vx; p.y+=p.vy; p.life--; if(p.life<=0||p.x>width) introParticles.splice(i,1); } }
function _drawIntroParticles() { noStroke(); for (let p of introParticles) { fill(180,150,90,p.alpha*(p.life/130)); rect(p.x,p.y,p.size,p.size); } }


// ================================================================
// 스테이지3 아누비스 등장 씬
// ================================================================
let anubisSceneActive = false; // main.js draw()에서 체크
let imgAnubisScene;
let anubisSceneTimer = 0;
let anubisSceneDone  = false;

// startStageTransition 후 스테이지3로 전환될 때 호출
function startAnubisScene() {
    anubisSceneTimer = millis();
    anubisSceneDone  = false;
}

function drawAnubisScene() {
    let now     = millis();
    let elapsed = now - anubisSceneTimer;

    background(0);

    // 아누비스 이미지 등장 (왼쪽에서 슬라이드인)
    let slideX = elapsed < 1000 ? map(elapsed, 0, 1000, -width * 0.5, 0) : 0;
    let imgA   = imgAnubis; // main.js preload에서 이미 로드됨

    if (imgA && imgA.width > 0) {
        let sc  = (height * 0.85) / imgA.height;
        let dw  = imgA.width * sc, dh = imgA.height * sc;
        let dx  = slideX + width * 0.05;
        let dy  = height * 0.1;
        image(imgA, dx, dy, dw, dh);
        // 금빛 아우라
        let auraPulse = sin(elapsed * 0.004) * 0.3 + 0.7;
        noStroke(); fill(200, 140, 0, floor(30 * auraPulse));
        ellipse(dx + dw/2, dy + dh/2, dw * 1.3, dh * 1.1);
    }

    // 대사 박스 (오른쪽)
    let dialogAlpha = elapsed < 1200 ? floor(map(elapsed, 800, 1200, 0, 255)) : 255;
    let lines = elapsed < 2000  ? ['...침입자여.'] :
                elapsed < 4000  ? ['이 신성한 미로를', '감히 통과하려 하는가.'] :
                elapsed < 6500  ? ['아누비스의 이름으로', '너를 시험하겠노라.'] :
                                  ['살아서 나갈 수 있다면...', '그것도 운명이리라.'];

    noStroke(); fill(6, 4, 2, floor(200 * dialogAlpha/255));
    rect(width * 0.48, height * 0.25, width * 0.46, height * 0.35, 8);
    stroke(180, 140, 40, dialogAlpha); strokeWeight(2);
    rect(width * 0.48, height * 0.25, width * 0.46, height * 0.35, 8);
    noStroke();

    fill(255, 200, 50, dialogAlpha); textAlign(LEFT, TOP);
    textSize(max(12, min(width, height) * 0.022)); textStyle(BOLD);
    text('아누비스', width * 0.50, height * 0.27);
    textStyle(NORMAL);

    fill(220, 200, 160, dialogAlpha);
    textSize(max(13, min(width, height) * 0.026));
    for (let i = 0; i < lines.length; i++) {
        text(lines[i], width * 0.50, height * 0.32 + i * min(width, height) * 0.038);
    }

    // SPACE 프롬프트
    if (elapsed > 2000) {
        let pulse = sin(elapsed * 0.006) * 0.4 + 0.6;
        fill(200, 170, 80, floor(200 * pulse));
        textAlign(CENTER, CENTER); textSize(max(11, min(width, height) * 0.018)); textStyle(BOLD);
        text('SPACE — 계속', width * 0.71, height * 0.65);
        textStyle(NORMAL);
    }

    textAlign(LEFT, BASELINE);

    // 8초 후 또는 스페이스바 → 씬 종료
    if (elapsed > 8000 || (elapsed > 1500 && keyIsDown(32))) {
        anubisSceneDone = true;
    }

    return !anubisSceneDone;
}

// ─────────────────────────────────────────────────────────────
//  [추가] 스테이지4 전체 씬
//  Phase: 'treasure' → 'pharaoh_rage' → 'timemaze'
// ─────────────────────────────────────────────────────────────

// [핵심] s4 변수들을 initStage4보다 반드시 먼저 선언
let s4ChestOpen = false;
let s4ChestTimer = 0;
let s4Coins = [];
let imgStage4Mad; // stage4_mad.png

let stage4Phase = 'treasure';
let stage4Initialized = false;
let stage4Timer = 0;
let stage4TimeLimit = 30000; // 30초 통합 타이머
let stage4Stones = [];
let stage4ShakeX = 0, stage4ShakeY = 0;
let stage4RageTimer = 0;
let stage4TimeMazeStart = 0;
// 역순 미로: maze3(idx2) → maze2(idx1) → maze1(idx0)
let s4MazeOrder = [2, 1, 0];
let s4MazeStep = 0;

function initStage4() {
    stage4Phase = 'treasure';
    stage4Timer = millis();
    stage4Stones = [];
    stage4ShakeX = 0;
    stage4ShakeY = 0;
    s4ChestOpen = false;
    s4ChestTimer = 0;
    s4Coins = [];
    s4MazeStep = 0;
    for (let i = 0; i < 40; i++) {
        stage4Stones.push({
            x: random(width), y: random(-height, 0),
            vx: random(-2, 2), vy: random(1, 5),
            size: random(8, 28), active: false,
            col: [random(80,130), random(60,100), random(30,60)]
        });
    }
}

function drawStage4Scene() {
    if (!stage4Initialized) {
        initStage4();
        stage4Initialized = true;
    }
    if (stage4Phase === 'treasure') {
        _drawTreasureRoom();
    } else if (stage4Phase === 'pharaoh_rage') {
        _drawPharaohRage();
    } else if (stage4Phase === 'timemaze') {
        _drawTimeMaze();
    }
}


function _drawTreasureRoom() {
    let now = millis();
    // stage4.jpg 이미지 배경
    if (imgStage4 && imgStage4.width > 0) {
        let iw=imgStage4.width, ih=imgStage4.height, scale=min(width/iw,height/ih);
        let dw=iw*scale, dh=ih*scale, dx=(width-dw)/2, dy=(height-dh)/2;
        background(20,12,4);
        image(imgStage4, dx, dy, dw, dh);
    } else {
        background(40,25,5);
    }

    // 황금빛 오버레이 (따뜻한 느낌)
    noStroke(); fill(200,140,20,18); rect(0,0,width,height);
    _drawVignette();

    // 주인공이 보물 가져가는 텍스트 연출
    let elapsed = now - stage4Timer;

    // 코인 파티클
    if (!s4ChestOpen && elapsed > 1500) { s4ChestOpen = true; s4ChestTimer = now; }
    if (s4ChestOpen) {
        if (frameCount % 3 === 0) {
            s4Coins.push({x:width/2+random(-80,80), y:height*0.6+random(-30,30),
                vx:random(-4,4), vy:random(-8,-2), life:60, maxLife:60});
        }
    }
    for (let i=s4Coins.length-1; i>=0; i--) {
        let c=s4Coins[i]; c.x+=c.vx; c.y+=c.vy; c.vy+=0.2; c.life--;
        if (c.life<=0){s4Coins.splice(i,1);continue;}
        fill(255,200,30,floor(c.life/c.maxLife*220));
        noStroke(); circle(c.x, c.y, 8);
    }

    // 나레이션 박스
    let lines2 = [
        elapsed < 2000 ? '마침내... 보물이다.' : '',
        elapsed >= 2000 && elapsed < 4500 ? '파라오의 황금이 눈앞에 펼쳐진다!' : '',
        elapsed >= 4500 && elapsed < 7000 ? '주인공은 보물을 가방에 담기 시작한다...' : '',
        elapsed >= 7000 ? '그 순간... 피라미드가 흔들리기 시작한다!' : '',
    ].filter(l => l !== '');
    let narrative = lines2[lines2.length - 1] || '';
    if (narrative) {
        noStroke(); fill(6,4,2,220); rect(width*0.1, height*0.78, width*0.8, height*0.12, 8);
        fill(255,215,50); textAlign(CENTER,CENTER); textSize(max(14,min(width,height)*0.025)); textStyle(BOLD);
        text(narrative, width/2, height*0.78 + height*0.06); textStyle(NORMAL);
    }

    // 7초 후 파라오 분노로 전환
    if (elapsed > 8500) {
        stage4Phase = 'pharaoh_rage';
        stage4RageTimer = millis();
    }
}

// --- 파라오 분노 씬 ---
let s4RageFlash = 0;

function _drawPharaohRage() {
    let now = millis();
    let elapsed = now - stage4RageTimer;

    // 배경 흔들림 (시간이 지날수록 심해짐)
    let shakeAmt = min(22, elapsed * 0.015);
    let sx = sin(now * 0.04) * shakeAmt;
    let sy = cos(now * 0.035) * shakeAmt * 0.6;

    push();
    translate(sx, sy);

    // [수정] stage4_mad.png 이미지 사용
    if (imgStage4Mad && imgStage4Mad.width > 0) {
        let iw=imgStage4Mad.width, ih=imgStage4Mad.height, scale=min(width/iw,height/ih);
        let dw=iw*scale, dh=ih*scale, dx=(width-dw)/2, dy=(height-dh)/2;
        background(10,4,2);
        image(imgStage4Mad, dx, dy, dw, dh);
    } else if (imgStage4 && imgStage4.width > 0) {
        let iw=imgStage4.width, ih=imgStage4.height, scale=min(width/iw,height/ih);
        let dw=iw*scale, dh=ih*scale, dx=(width-dw)/2, dy=(height-dh)/2;
        background(20,8,2);
        image(imgStage4, dx, dy, dw, dh);
    } else {
        background(30,10,2);
    }

    // 붉은 분위기 오버레이
    let redPulse = sin(elapsed * 0.008) * 0.5 + 0.5;
    fill(180, 0, 0, floor(25 * redPulse + 8)); noStroke(); rect(0,0,width,height);

    pop();

    // 5.5초 후 타임어택 미로로 전환 — 에러 가능 코드보다 먼저 체크
    if (elapsed > 5500) {
        stage4Phase = 'timemaze';
        stage4TimeMazeStart = millis();
        s4MazeStep = 0;
        let mIdx = s4MazeOrder[0];
        for (let i = 0; i < height/cellSize; i++) {
            cells[i] = cells[i] || [];
            for (let j = 0; j < width/cellSize; j++) {
                if (mazeData[mIdx] && mazeData[mIdx][i]) {
                    cells[i][j] = mazeData[mIdx][i][j];
                }
            }
        }
        playerX = cellSize / 2;
        playerY = cellSize * 3 / 2;
        return;
    }

    // 돌 떨어지기
    _updateFallingStones(elapsed);

    // 균열 라인
    if (elapsed > 1000) _drawCracks(elapsed);

    // 나레이션
    let msg = elapsed < 2000 ? '파라오가 분노했다!' :
              elapsed < 4500 ? '저주받은 자! 피라미드에서 탈출하라!' :
              '역순으로 피라미드를 빠져나가야 한다!';
    noStroke(); fill(6,4,2,220); rect(width*0.1, height*0.78, width*0.8, height*0.12, 8);
    fill(255,60,60); textAlign(CENTER,CENTER); textSize(max(14,min(width,height)*0.026)); textStyle(BOLD);
    text(msg, width/2, height*0.78 + height*0.06); textStyle(NORMAL);
}

function _updateFallingStones(elapsed) {
    // stage4Stones가 비어있으면 즉시 채우기
    if (stage4Stones.length === 0) {
        for (let i = 0; i < 40; i++) {
            stage4Stones.push({
                x: random(width), y: random(-height, 0),
                vx: random(-2, 2), vy: random(1, 5),
                size: random(8, 28), active: false,
                col: [random(80,130), random(60,100), random(30,60)]
            });
        }
    }
    let activeCount = min(stage4Stones.length, floor(map(elapsed, 0, 5000, 0, stage4Stones.length)));
    for (let i=0; i<activeCount; i++) stage4Stones[i].active = true;
    for (let stone of stage4Stones) {
        if (!stone.active) continue;
        stone.x += stone.vx; stone.y += stone.vy;
        if (stone.y > height) { stone.y = random(-100, 0); stone.x = random(width); }
        fill(stone.col[0], stone.col[1], stone.col[2], 200);
        noStroke(); rect(stone.x, stone.y, stone.size, stone.size*0.7, 2);
    }
}

function _drawCracks(elapsed) {
    let alpha = min(200, elapsed * 0.04);
    stroke(60, 30, 10, alpha); strokeWeight(2);
    // 랜덤 균열 (seed 고정)
    randomSeed(42);
    for (let i=0; i<8; i++) {
        let cx=random(width), cy=random(height);
        let clen=random(40,120);
        beginShape();
        noFill();
        let lx=cx, ly=cy;
        for (let j=0; j<5; j++) {
            let nx=lx+random(-clen/4,clen/4), ny=ly+random(5,clen/4);
            vertex(lx,ly); lx=nx; ly=ny;
        }
        endShape();
    }
    randomSeed(); noStroke();
}

// --- 타임어택 미로 씬 ---
function _drawTimeMaze() {
    let now = millis();
    let remaining = max(0, stage4TimeLimit - (now - stage4TimeMazeStart));

    // 화면 흔들림 (긴박감)
    let shakeAmt = map(remaining, stage4TimeLimit, 0, 0, 6);
    let sx = sin(now * 0.07) * shakeAmt;
    let sy = cos(now * 0.05) * shakeAmt * 0.6;

    push();
    translate(sx, sy);
    _drawBrightMaze();
    playerDesign();
    pop();

    playerMoving();
    goalDrawing();

    // 돌 낙하 효과
    _s4MazeFallingStones();

    // 타이머 UI + 현재 몇 번째 미로인지 표시
    _drawTimerUI(remaining);

    // 시간 초과 → 게임오버
    if (remaining <= 0) { gameState = 'gameover'; return; }

    // 긴박감 — 5초 이하 빨간 깜빡임
    if (remaining < 5000) {
        let blink = sin(now * 0.015) * 0.5 + 0.5;
        noStroke(); fill(255, 0, 0, floor(55 * blink));
        rect(0, 0, width, height);
    }

    // 출구 도달 체크
    let goalX = GOAL_COL * cellSize + cellSize / 2;
    let goalY = GOAL_ROW * cellSize - cellSize / 2;
    if (dist(playerX, playerY, goalX, goalY) <= cellSize) {
        s4MazeStep++;
        if (s4MazeStep >= s4MazeOrder.length) {
            // 3개 미로 모두 클리어 → 피라미드 붕괴 엔딩
            gameState = 'ending';
            endingTimer = millis();
        } else {
            // 다음 미로로 전환 (타이머 유지, 플레이어 초기 위치로)
            mazeData = [maze1, maze2, maze3];
            // cells를 s4MazeOrder[s4MazeStep] 번째 미로로 교체
            let mIdx = s4MazeOrder[s4MazeStep];
            for (let i = 0; i < height/cellSize; i++) {
                cells[i] = cells[i] || [];
                for (let j = 0; j < width/cellSize; j++) {
                    if (mazeData[mIdx] && mazeData[mIdx][i]) {
                        cells[i][j] = mazeData[mIdx][i][j];
                    }
                }
            }
            playerX = cellSize / 2;
            playerY = cellSize * 3 / 2;
        }
    }
}

// 타임어택 중 돌 낙하 효과
function _s4MazeFallingStones() {
    if (stage4Stones.length === 0) return;
    for (let stone of stage4Stones) {
        stone.active = true;
        stone.x += stone.vx * 0.4;
        stone.y += stone.vy * 0.6;
        if (stone.y > height) { stone.y = random(-80, 0); stone.x = random(width); }
        fill(stone.col[0], stone.col[1], stone.col[2], 150);
        noStroke(); rect(stone.x, stone.y, stone.size * 0.7, stone.size * 0.5, 1);
    }
}

function _drawBrightMaze() {
    noStroke();
    for (let i=0;i<height/cellSize;i++) {
        for (let j=0;j<width/cellSize;j++) {
            if (cells[i] && cells[i][j] !== undefined) {
                let x=j*cellSize, y=i*cellSize;
                if (cells[i][j]===1) {
                    // 밝은 벽 (파라오 분노 — 금빛 갈라짐)
                    fill(120,85,40); rect(x,y,cellSize,cellSize);
                    fill(160,115,55); rect(x+2,y+2,cellSize-4,cellSize-4,2);
                    // 균열 효과
                    stroke(80,50,20,100); strokeWeight(1);
                    line(x+random(cellSize*0.1,cellSize*0.4), y, x+random(cellSize*0.1,cellSize*0.4), y+cellSize);
                    noStroke();
                } else {
                    fill(230,195,130); rect(x,y,cellSize,cellSize);
                    randomSeed(i*100+j);
                    fill(210,178,110,60);
                    for (let ti=0; ti<3; ti++) ellipse(x+random(cellSize*0.1,cellSize*0.9), y+random(cellSize*0.1,cellSize*0.9), random(2,4), random(1,3));
                    randomSeed();
                }
            }
        }
    }
}


// ================================================================
// 피라미드 붕괴 엔딩 씬
// ================================================================
let imgPyramidBroken;   // pyramid_broken.png — preload에서 로드
let endingTimer = 0;
let endingPhase = 0;    // 0: 이미지+흔들림  1: 페이드아웃  2: 텍스트

function endingPreload() {
    imgPyramidBroken = loadImage('pyramid_broken.png');
}

function drawEnding() {
    let now     = millis();
    let elapsed = now - endingTimer;

    if (elapsed < 6000) {
        // --- 피라미드 붕괴 이미지 + 흔들림 ---
        let shakeAmt = min(20, elapsed * 0.004);
        let sx = sin(now * 0.07) * shakeAmt;
        let sy = cos(now * 0.05) * shakeAmt * 0.7;
        push();
        translate(sx, sy);
        if (imgPyramidBroken && imgPyramidBroken.width > 0) {
            let sc = min(width / imgPyramidBroken.width, height / imgPyramidBroken.height);
            let dw = imgPyramidBroken.width * sc, dh = imgPyramidBroken.height * sc;
            background(10, 5, 0);
            image(imgPyramidBroken, (width - dw) / 2, (height - dh) / 2, dw, dh);
        } else {
            background(20, 8, 0);
            fill(200, 80, 0, 180); noStroke(); rect(0, 0, width, height);
        }
        // 붉은 오버레이 (점점 강해짐)
        fill(180, 40, 0, floor(map(elapsed, 0, 6000, 10, 80)));
        noStroke(); rect(0, 0, width, height);
        pop();

        // 돌 파티클 낙하
        _endingFallingDebris(elapsed);

        // 나레이션
        let msg = elapsed < 1500 ? '피라미드가 흔들린다...' :
                  elapsed < 3000 ? '저주가 풀렸다!' :
                  elapsed < 5000 ? '탈출에 성공했다!' : '';
        if (msg) {
            noStroke(); fill(6, 4, 2, 220);
            rect(width*0.1, height*0.78, width*0.8, height*0.12, 8);
            fill(255, 200, 80); textAlign(CENTER, CENTER);
            textSize(max(14, min(width, height) * 0.03)); textStyle(BOLD);
            text(msg, width/2, height*0.78 + height*0.06); textStyle(NORMAL);
        }

    } else if (elapsed < 8000) {
        // --- 페이드아웃 ---
        if (imgPyramidBroken && imgPyramidBroken.width > 0) {
            let sc = min(width / imgPyramidBroken.width, height / imgPyramidBroken.height);
            let dw = imgPyramidBroken.width * sc, dh = imgPyramidBroken.height * sc;
            background(10, 5, 0);
            image(imgPyramidBroken, (width - dw) / 2, (height - dh) / 2, dw, dh);
        }
        let fadeAlpha = floor(map(elapsed, 6000, 8000, 0, 255));
        fill(0, fadeAlpha); noStroke(); rect(0, 0, width, height);

    } else {
        // --- 최종 엔딩 텍스트 ---
        background(0);
        let textElapsed = elapsed - 8000;

        // 배경 별빛
        randomSeed(99);
        for (let i = 0; i < 80; i++) {
            let sx2 = random(width), sy2 = random(height);
            let twinkle = sin(now * 0.003 + i) * 0.4 + 0.6;
            fill(255, 220, 150, floor(120 * twinkle));
            noStroke(); circle(sx2, sy2, random(1, 3));
        }
        randomSeed();

        let a1 = min(255, floor(map(textElapsed, 0,   1000, 0, 255)));
        let a2 = min(255, floor(map(textElapsed, 1200, 2200, 0, 255)));
        let a3 = min(255, floor(map(textElapsed, 2400, 3400, 0, 255)));
        let a4 = min(255, floor(map(textElapsed, 3800, 4800, 0, 255)));

        textAlign(CENTER, CENTER);

        fill(255, 220, 80, a1); textSize(min(width, height) * 0.13); textStyle(BOLD);
        text('🏆', width/2, height * 0.22);

        fill(255, 220, 80, a2); textSize(min(width, height) * 0.075); textStyle(BOLD);
        text('GAME CLEAR!', width/2, height * 0.38);

        fill(255, 240, 180, a3); textSize(min(width, height) * 0.028); textStyle(NORMAL);
        text('피라미드를 탈출하고 저주에서 벗어났다.', width/2, height * 0.52);
        text('황금의 모험은 영원히 전설로 남을 것이다.', width/2, height * 0.58);

        // 다시 시작 버튼
        if (a4 > 0) {
            let btnW = width * 0.28, btnH = height * 0.08;
            let btnX = width/2 - btnW/2, btnY = height * 0.72;
            let isHover = mouseX > btnX && mouseX < btnX+btnW && mouseY > btnY && mouseY < btnY+btnH;
            fill(isHover ? color(80,200,120,a4) : color(50,160,90,a4)); noStroke();
            rect(btnX, btnY, btnW, btnH, 10);
            fill(255, a4); textSize(min(width,height)*0.032); textStyle(BOLD);
            text('홈화면으로 돌아가기', width/2, btnY + btnH/2); textStyle(NORMAL);
        }

        textAlign(LEFT, BASELINE);
    }
}

// 엔딩 클릭 처리 — ui.js mousePressed에서 호출
function endingMousePressed() {
    let elapsed = millis() - endingTimer;
    if (elapsed < 9000) return;
    let btnW = width * 0.28, btnH = height * 0.08;
    let btnX = width/2 - btnW/2, btnY = height * 0.72;
    if (mouseX > btnX && mouseX < btnX+btnW && mouseY > btnY && mouseY < btnY+btnH) {
        currentStage = 1;
        homeSetup();  // 홈화면의 애니메이션 및 시작 상태(homeStarting)를 완전히 초기화
        resetIntro(); // (선택) 다음 시작 시 컷신을 다시 볼 수 있게 인트로도 초기화
        resetGame();  // 게임 내부 데이터 초기화
        homeScreenActive = true;
    }
}

// 엔딩 돌 파티클
let _endingDebris = [];
let _endingDebrisInit = false;
function _endingFallingDebris(elapsed) {
    if (!_endingDebrisInit) {
        _endingDebris = [];
        for (let i = 0; i < 60; i++) {
            _endingDebris.push({
                x: random(width), y: random(-height, 0),
                vx: random(-3, 3), vy: random(2, 7),
                size: random(10, 40), rot: random(TWO_PI),
                rotV: random(-0.05, 0.05),
                col: [random(120,180), random(60,100), random(20,50)]
            });
        }
        _endingDebrisInit = true;
    }
    let activeCount = min(_endingDebris.length, floor(map(elapsed, 0, 3000, 0, _endingDebris.length)));
    for (let i = 0; i < activeCount; i++) {
        let d = _endingDebris[i];
        d.x += d.vx; d.y += d.vy; d.rot += d.rotV;
        if (d.y > height) { d.y = random(-100, 0); d.x = random(width); }
        push();
        translate(d.x, d.y); rotate(d.rot);
        fill(d.col[0], d.col[1], d.col[2], 220); noStroke();
        rect(-d.size/2, -d.size/2, d.size, d.size * 0.7, 3);
        pop();
    }
}
