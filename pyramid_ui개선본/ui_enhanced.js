// ============================================================
//  ui_enhanced.js  v5.0
//  [유지] 기존 인트로/미로/플레이어/미라/스테이지클리어 코드 전부 유지
//  [추가] 슈퍼미라 픽셀아트 렌더링
//  [추가] 아누비스 기믹 (스테이지3)
//  [추가] 스테이지4 전체 씬 (보물방 → 파라오분노 → 타임어택 미로)
// ============================================================

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

// ─────────────────────────────────────────────────────────────
//  미로 드로우 (기존 유지)
// ─────────────────────────────────────────────────────────────
function enhancedMazeDrawing() {
    noStroke();
    for (let i=0;i<height/cellSize;i++) for (let j=0;j<width/cellSize;j++) {
        let x=j*cellSize, y=i*cellSize;
        if (cells[i][j]===1) _drawWallCell(x,y,cellSize,i,j);
        else _drawFloorCell(x,y,cellSize,i,j);
    }
}
function _drawWallCell(x,y,s,row,col) {
    fill(90,65,35); rect(x,y,s,s); let bh=s/3;
    for (let bi=0; bi<3; bi++) {
        let by2=y+bi*bh;
        fill(110+(col%3)*8,78+(row%3)*6,40+(col%2)*5); rect(x+1.5,by2+1.5,s-3,bh-3,1.5);
        fill(140,105,60,120); rect(x+2,by2+2,s-4,2); fill(60,40,18,130); rect(x+2,by2+bh-4,s-4,2.5);
    }
    fill(255,220,150,18); rect(x,y,s,s*0.25);
}
function _drawFloorCell(x,y,s,row,col) {
    fill(195,165,110); rect(x,y,s,s);
    randomSeed(row*100+col); fill(175,148,95,60);
    for (let ti=0; ti<4; ti++) { let tx=x+random(s*0.1,s*0.9), ty2=y+random(s*0.1,s*0.9); ellipse(tx,ty2,random(2,5),random(1,3)); }
    randomSeed(); stroke(160,135,85,55); strokeWeight(0.6); line(x,y,x+s,y); line(x,y,x,y+s); noStroke();
}

// ─────────────────────────────────────────────────────────────
//  플레이어 픽셀아트 (기존 유지)
// ─────────────────────────────────────────────────────────────
const PLAYER_SPR = [
    [0,0,2,2,2,2,2,2,2,0,0],[0,2,2,2,2,2,2,2,2,2,0],[3,3,3,3,3,3,3,3,3,3,3],
    [0,0,2,2,2,2,2,2,2,0,0],[0,0,1,1,1,1,1,1,1,0,0],[0,5,1,4,1,1,1,4,1,6,0],
    [0,5,1,1,1,1,1,1,1,6,0],[0,5,1,7,7,7,7,7,1,6,0],[0,0,1,7,7,7,7,7,1,0,0],
    [0,0,1,1,1,1,1,1,1,0,0],[0,0,8,8,0,0,0,8,8,0,0],[0,0,8,8,0,0,0,8,8,0,0],[0,0,8,0,0,0,0,0,8,0,0],
];
const PLAYER_PAL = {1:[185,125,58],2:[48,30,8],3:[34,21,5],4:[20,12,3],5:[65,42,12],6:[58,38,10],7:[88,58,20],8:[55,36,10]};

function enhancedPlayerDesign() {
    let x=playerX, y=playerY, s=playerSize;
    let ps=max(2,floor(s/13)), sW=11*ps, sH=13*ps, ox=x-sW/2, oy=y-sH/2;
    noStroke();
    if (keyIsDown(32)) {
        let flk=sin(frameCount*0.25)*15;
        fill(255,150+flk,30,45); circle(x+ps*6,y-ps*3,s*1.4);
        fill(255,200,60,18); circle(x+ps*6,y-ps*3,s*2.2);
        let tp=Object.assign({},PLAYER_PAL);
        let torchSpr=[[0,0,2,2,2,2,2,2,2,0,0,0,9],[0,2,2,2,2,2,2,2,2,2,0,0,8],[3,3,3,3,3,3,3,3,3,3,3,0,8],[0,0,2,2,2,2,2,2,2,0,0,0,'A'],[0,0,1,1,1,1,1,1,1,0,0,0,'A'],[0,5,1,4,1,1,1,4,1,6,0,0,0],[0,5,1,1,1,1,1,1,1,6,0,0,0],[0,5,1,7,7,7,7,7,1,6,0,0,0],[0,0,1,7,7,7,7,7,1,0,0,0,0],[0,0,1,1,1,1,1,1,1,0,0,0,0],[0,0,8,8,0,0,0,8,8,0,0,0,0],[0,0,8,8,0,0,0,8,8,0,0,0,0],[0,0,8,0,0,0,0,0,8,0,0,0,0]];
        tp[8]=[255,floor(110+sin(frameCount*0.3)*40),15]; tp[9]=[255,floor(200+sin(frameCount*0.25)*35),50]; tp['A']=[255,245,160];
        drawSprite(torchSpr,tp,ox,oy,ps);
    } else {
        drawSprite(PLAYER_SPR,PLAYER_PAL,ox,oy,ps);
    }
}

// ─────────────────────────────────────────────────────────────
//  일반 미라 픽셀아트 (기존 유지)
// ─────────────────────────────────────────────────────────────
const MUMMY_SPR = [
    [0,0,1,1,1,1,1,1,1,1,1,0,0],[0,1,1,2,1,1,1,1,1,2,1,1,0],[0,1,2,1,1,1,1,1,1,1,2,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,2,2,1,1,1,2,2,1,0,0],[3,3,1,1,2,2,1,2,2,1,1,3,3],
    [3,3,1,2,1,1,1,1,1,2,1,3,3],[0,0,1,1,2,2,1,2,2,1,1,0,0],[0,0,1,2,1,1,1,1,1,2,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,0,0],[0,0,2,2,1,0,0,0,1,2,2,0,0],[0,0,2,1,1,0,0,0,1,1,2,0,0],
    [0,0,1,2,0,0,0,0,0,2,1,0,0],[0,0,1,1,0,0,0,0,0,1,1,0,0],
];
const MUMMY_PAL_BASE = {1:[205,185,138],2:[150,122,78],3:[182,158,108]};

function enhancedMummyDesign() {
    mummies.forEach(m => {
        let ps=max(2,floor(mummySize/14)), sW=13*ps, sH=14*ps;
        let ox=m.x-sW/2, oy=m.y-sH/2; noStroke();
        drawSprite(MUMMY_SPR,MUMMY_PAL_BASE,ox,oy,ps);
    });
}
function enhancedMummyEyesDrawing() {
    mummies.forEach(m => {
        let ps=max(2,floor(mummySize/14)), eyeOffY=-floor(mummySize*0.28);
        let blink=sin(frameCount*0.045+m.x*0.02)>0.88; noStroke();
        if (!blink) {
            fill(235,128,28,245); rect(m.x-ps*2.6,m.y+eyeOffY-ps*0.5,ps*2,ps*2); rect(m.x+ps*0.6,m.y+eyeOffY-ps*0.5,ps*2,ps*2);
            fill(30,12,2,255); rect(m.x-ps*2.1,m.y+eyeOffY,ps,ps); rect(m.x+ps,m.y+eyeOffY,ps,ps);
            fill(255,210,90,200); rect(m.x-ps*2.6,m.y+eyeOffY-ps*0.5,ps*0.7,ps*0.7); rect(m.x+ps*0.6,m.y+eyeOffY-ps*0.5,ps*0.7,ps*0.7);
        } else {
            fill(185,95,18,230); rect(m.x-ps*2.6,m.y+eyeOffY+ps*0.4,ps*2,ps*0.6); rect(m.x+ps*0.6,m.y+eyeOffY+ps*0.4,ps*2,ps*0.6);
        }
    });
}

// ─────────────────────────────────────────────────────────────
//  [추가] 슈퍼미라 픽셀아트 — 붉은 눈, 검은 붕대
// ─────────────────────────────────────────────────────────────
const SUPER_MUMMY_SPR = [
    [0,0,1,1,1,1,1,1,1,1,1,0,0],[0,1,1,2,1,1,1,1,1,2,1,1,0],[0,1,2,1,1,1,1,1,1,1,2,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,2,2,1,1,1,2,2,1,0,0],[3,3,1,1,2,2,1,2,2,1,1,3,3],
    [3,3,1,2,1,1,1,1,1,2,1,3,3],[0,0,1,1,2,2,1,2,2,1,1,0,0],[0,0,1,2,1,1,1,1,1,2,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,0,0],[0,0,2,2,1,0,0,0,1,2,2,0,0],[0,0,2,1,1,0,0,0,1,1,2,0,0],
    [0,0,1,2,0,0,0,0,0,2,1,0,0],[0,0,1,1,0,0,0,0,0,1,1,0,0],
];
// 슈퍼미라: 어두운 붕대 색상
const SUPER_MUMMY_PAL = {1:[90,70,50],2:[55,38,20],3:[75,55,35]};

function enhancedSuperMummyDesign() {
    superMummies.forEach(m => {
        let ps=max(2,floor(mummySize/14)), sW=13*ps, sH=14*ps;
        let ox=m.x-sW/2, oy=m.y-sH/2; noStroke();
        // 어두운 아우라
        fill(180,0,0,30); circle(m.x, m.y, mummySize*1.6);
        drawSprite(SUPER_MUMMY_SPR, SUPER_MUMMY_PAL, ox, oy, ps);
    });
}

function enhancedSuperMummyEyesDrawing() {
    superMummies.forEach(m => {
        let ps=max(2,floor(mummySize/14)), eyeOffY=-floor(mummySize*0.28);
        let pulse=sin(frameCount*0.12+m.x*0.01)*0.4+0.6; noStroke();
        // 빨간 눈 (슈퍼미라)
        fill(255,0,0,floor(240*pulse));
        rect(m.x-ps*2.6, m.y+eyeOffY-ps*0.5, ps*2, ps*2);
        rect(m.x+ps*0.6, m.y+eyeOffY-ps*0.5, ps*2, ps*2);
        fill(255,180,180,floor(180*pulse));
        rect(m.x-ps*2.1, m.y+eyeOffY, ps, ps);
        rect(m.x+ps, m.y+eyeOffY, ps, ps);
    });
}

// ─────────────────────────────────────────────────────────────
//  [추가] 아누비스 기믹 (스테이지3)
//  — 미로 오른쪽 바깥에 위치, 3초마다 지팡이 내리쳐 횃불 3초 봉인
// ─────────────────────────────────────────────────────────────
let anubisLastStrike = 0;
const ANUBIS_INTERVAL = 7000;
let anubisStrikeAnim = 0;
let imgAnubis; // [추가] anuzis-Photoroom.png

function drawAnubis() {
    let now = millis();
    if (now - anubisLastStrike > ANUBIS_INTERVAL) {
        anubisLastStrike = now;
        anubisStrikeAnim = now;
        torchBlock(3000);
    }

    let isStriking = (now - anubisStrikeAnim) < 600;
    let shakeX = isStriking ? sin((now - anubisStrikeAnim) * 0.05) * 8 : 0;
    let shakeY = isStriking ? abs(sin((now - anubisStrikeAnim) * 0.04)) * -14 : 0;

    // 아누비스 크기/위치: 화면 오른쪽 바깥 경계에 세로로 길게
    let sz = cellSize * 4.5;           // 이미지 높이 기준
    let ax = width - sz * 0.38;        // 오른쪽에서 살짝 걸치게
    let ay = height / 2 - sz * 0.05;  // 수직 중앙

    // 아우라 (타격 시 더 밝게)
    let auraPulse = sin(frameCount * 0.08) * 0.3 + 0.7;
    noStroke();
    fill(200, 140, 0, floor(isStriking ? 60 : 30 * auraPulse));
    ellipse(ax, ay, sz * 0.9, sz * 1.1);
    fill(255, 200, 30, floor(isStriking ? 35 : 15 * auraPulse));
    ellipse(ax, ay, sz * 0.6, sz * 0.75);

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
    let bx = width - bw - cellSize * 0.2, by = height / 2 + cellSize * 1.5;
    noStroke(); fill(30, 0, 50, 180); rect(bx, by, bw, bh, 4);
    fill(200, 140, 0, 220); rect(bx, by, bw * ratio, bh, 4);
    fill(255, 210, 100, 200); textAlign(CENTER, CENTER); textSize(10);
    text('아누비스', bx + bw/2, by - 8); textAlign(LEFT, BASELINE);
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
let stage4TimeLimit = 15000;
let stage4Stones = [];
let stage4ShakeX = 0, stage4ShakeY = 0;
let stage4RageTimer = 0;
let stage4TimeMazeStart = 0;

function initStage4() {
    stage4Phase = 'treasure';
    stage4Timer = millis();
    stage4Stones = [];
    stage4ShakeX = 0;
    stage4ShakeY = 0;
    s4ChestOpen = false;
    s4ChestTimer = 0;
    s4Coins = [];
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

    // 5.5초 후 타임어택 미로로 전환
    if (elapsed > 5500) {
        stage4Phase = 'timemaze';
        stage4TimeMazeStart = millis();
        mazeStructure();
    }
}

function _updateFallingStones(elapsed) {
    let activeCount = floor(map(elapsed, 0, 5000, 0, stage4Stones.length));
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
    let elapsed = now - stage4TimeMazeStart;
    let remaining = max(0, stage4TimeLimit - elapsed);

    // 밝은 미로 (횃불 없음)
    _drawBrightMaze();
    enhancedPlayerDesign();
    playerMoving();
    goalDrawing();

    // 타임어택 UI
    _drawTimerUI(remaining);

    // 시간 초과 → 게임오버
    if (remaining <= 0) {
        gameState = 'gameover';
    }

    // 목표 도달 체크
    let goalX = GOAL_COL * cellSize + cellSize / 2;
    let goalY = GOAL_ROW * cellSize - cellSize / 2;
    let d = dist(playerX, playerY, goalX, goalY);
    if (d <= cellSize) {
        if (gameState !== 'stageclear') initClearAnim();
        gameState = 'stageclear';
    }

    // 긴박감 — 남은시간 5초 이하일 때 빨간 테두리 깜빡임
    if (remaining < 5000) {
        let blink = sin(now * 0.015) * 0.5 + 0.5;
        noStroke(); fill(255, 0, 0, floor(60 * blink));
        rect(0,0,width,height);
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

function _drawTimerUI(remaining) {
    let sec = remaining / 1000;
    let ratio = remaining / stage4TimeLimit;

    // 상단 타이머 바
    let bw = width * 0.6, bh = 22;
    let bx = width/2 - bw/2, by = 16;
    noStroke(); fill(20,10,5,200); rect(bx,by,bw,bh,6);
    let barColor = remaining > 8000 ? color(80,200,80) : remaining > 4000 ? color(255,165,0) : color(220,40,40);
    fill(barColor); rect(bx,by,bw*ratio,bh,6);
    fill(255,255,200); textAlign(CENTER,CENTER); textSize(max(13,min(width,height)*0.022)); textStyle(BOLD);
    text('탈출까지 ' + sec.toFixed(1) + '초', width/2, by+bh/2); textStyle(NORMAL);

    // 돌 파티클 계속 낙하
    for (let stone of stage4Stones) {
        if (!stone.active) continue;
        stone.x += stone.vx*0.3; stone.y += stone.vy*0.5;
        if (stone.y > height) { stone.y = random(-100,0); stone.x = random(width); }
        fill(stone.col[0], stone.col[1], stone.col[2], 120);
        noStroke(); rect(stone.x, stone.y, stone.size*0.6, stone.size*0.4, 1);
    }
}

function stage4MousePressed() {
    // 스테이지4는 마우스 클릭 불필요 (자동 진행)
}

// ─────────────────────────────────────────────────────────────
//  스테이지 클리어 (기존 유지)
// ─────────────────────────────────────────────────────────────
let clearAnimTimer = 0;
let clearParticles = [];

function initClearAnim() {
    clearAnimTimer=millis(); clearParticles=[];
    for (let i=0; i<80; i++) {
        clearParticles.push({x:width/2,y:height/2,vx:random(-8,8),vy:random(-12,-2),size:random(4,14),col:[random(200,255),random(160,230),random(20,80)],life:random(80,160),maxLife:0});
        clearParticles[i].maxLife=clearParticles[i].life;
    }
}
function enhancedDrawStageClear() {
    let elapsed=millis()-clearAnimTimer;
    fill(0,0,0,170); noStroke(); rect(0,0,width,height);
    let pulse2=sin(elapsed*0.003)*0.3+0.7;
    for (let i=5;i>=0;i--) { fill(255,200,50,(6-i)*8*pulse2); noStroke(); circle(width/2,height*0.35,(i+1)*min(width,height)*0.12*pulse2); }
    _drawCrown(width/2,height*0.26,min(width,height)*0.08);
    let slideY=min(0,(elapsed-200)*0.25-60);
    push(); translate(0,slideY);
    fill(120,80,0); textAlign(CENTER,CENTER); textSize(min(width,height)*0.088); textStyle(BOLD);
    text('STAGE '+currentStage+' CLEAR!',width/2+3,height*0.42+3);
    fill(255,215,50); text('STAGE '+currentStage+' CLEAR!',width/2,height*0.42);
    fill(255,245,180,180); textSize(min(width,height)*0.087); text('STAGE '+currentStage+' CLEAR!',width/2,height*0.415);
    textStyle(NORMAL); pop();
    if (elapsed>600) { fill(220,200,150,min(255,(elapsed-600)*0.6)); textAlign(CENTER,CENTER); textSize(min(width,height)*0.026); text('피라미드의 미로를 탈출했다!',width/2,height*0.52); }
    _updateClearParticles();
    if (elapsed>400) { stroke(200,170,60,min(200,(elapsed-400)*0.5)); strokeWeight(1.5); let lw=min(400,(elapsed-400)*0.8); line(width/2-lw/2,height*0.55,width/2+lw/2,height*0.55); noStroke(); }
    if (elapsed>800) _drawNextStageBtn(min(255,(elapsed-800)*0.5));
}
function _drawCrown(x,y,s) {
    fill(255,200,30); noStroke();
    beginShape(); vertex(x-s,y+s*0.5); vertex(x-s,y-s*0.2); vertex(x-s*0.65,y-s*0.6); vertex(x-s*0.3,y);
    vertex(x,y-s*0.9); vertex(x+s*0.3,y); vertex(x+s*0.65,y-s*0.6); vertex(x+s,y-s*0.2); vertex(x+s,y+s*0.5); endShape(CLOSE);
    fill(220,50,50); circle(x,y-s*0.65,s*0.22); fill(50,160,220); circle(x-s*0.65,y-s*0.32,s*0.17); fill(50,200,100); circle(x+s*0.65,y-s*0.32,s*0.17);
}
function _updateClearParticles() {
    for (let i=clearParticles.length-1; i>=0; i--) {
        let p=clearParticles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.2; p.life--;
        if (p.life<=0){clearParticles.splice(i,1);continue;}
        fill(p.col[0],p.col[1],p.col[2],(p.life/p.maxLife)*220); noStroke(); circle(p.x,p.y,p.size*(p.life/p.maxLife));
    }
}
function _drawNextStageBtn(alpha) {
    let btnW=width*0.28,btnH=height*0.072,btnX=width/2-btnW/2,btnY=height*0.62;
    let isHover=mouseX>btnX&&mouseX<btnX+btnW&&mouseY>btnY&&mouseY<btnY+btnH;
    fill(isHover?color(255,195,40,alpha):color(200,150,20,alpha)); stroke(255,220,80,alpha); strokeWeight(2);
    rect(btnX,btnY,btnW,btnH,0); noStroke(); fill(255,255,200,60*(alpha/255)); rect(btnX+4,btnY+4,btnW-8,btnH*0.4,0);
    fill(isHover?color(30,15,0,alpha):color(255,240,200,alpha)); textAlign(CENTER,CENTER); textSize(min(width,height)*0.032); textStyle(BOLD);
    text(currentStage >= 4 ? '🏆 게임 클리어!' : '다음 스테이지 >',width/2,btnY+btnH/2); textStyle(NORMAL);
}
function clearMousePressed() {
    let elapsed=millis()-clearAnimTimer; if(elapsed<800) return false;
    let btnW=width*0.28,btnH=height*0.072,btnX=width/2-btnW/2,btnY=height*0.62;
    return mouseX>btnX&&mouseX<btnX+btnW&&mouseY>btnY&&mouseY<btnY+btnH;
}

// ─────────────────────────────────────────────────────────────
//  스테이지 전환 (기존 유지)
// ─────────────────────────────────────────────────────────────
let transitionState='none',transitionAlpha=0,transitionTimer2=0,transitionTargetStage=1;
const TRANS_SPEED=5,TRANS_HOLD=1800;

function startStageTransition(nextStage) {
    transitionState='fadeout'; transitionAlpha=0; transitionTargetStage=nextStage; transitionTimer2=0;
}
function drawStageTransition() {
    if(transitionState==='none') return false;
    if(transitionState==='fadeout') {
        transitionAlpha=min(255,transitionAlpha+TRANS_SPEED*2);
        if(transitionAlpha>=255){transitionState='show';transitionTimer2=millis();}
    } else if(transitionState==='show') {
        background(10,6,2); _drawTransitionContent();
        fill(0,transitionAlpha*0.5); noStroke(); rect(0,0,width,height);
        if(millis()-transitionTimer2>TRANS_HOLD) transitionState='fadein';
        return true;
    } else if(transitionState==='fadein') {
        _drawTransitionContent();
        transitionAlpha=max(0,transitionAlpha-TRANS_SPEED);
        if(transitionAlpha<=0) transitionState='none';
    }
    fill(0,transitionAlpha); noStroke(); rect(0,0,width,height);
    return transitionState!=='none';
}
function _drawTransitionContent() {
    background(10,6,2); push(); translate(width/2,height/2);
    for(let i=0;i<8;i++){let angle=(TWO_PI/8)*i+frameCount*0.005,len=min(width,height)*0.42;stroke(200,160,40,30);strokeWeight(min(width,height)*0.04);line(0,0,cos(angle)*len,sin(angle)*len);}
    noStroke();
    for(let i=5;i>=0;i--){let t=i/5,sz=min(width,height)*0.35*t;fill(lerp(60,200,1-t),lerp(42,155,1-t),lerp(15,55,1-t));rect(-sz/2,-sz/2,sz,sz,sz*0.05);}
    let gp=sin(millis()*0.004)*0.4+0.6;fill(255,220,60,200*gp);circle(0,0,min(width,height)*0.055);fill(255,245,200,150*gp);circle(0,0,min(width,height)*0.028);
    pop();
    fill(255,215,50);textAlign(CENTER,CENTER);textSize(min(width,height)*0.055);textStyle(BOLD);text('STAGE '+transitionTargetStage,width/2,height*0.82);
    textStyle(NORMAL);fill(190,165,110);textSize(min(width,height)*0.022);
    let subMsg = transitionTargetStage === 4 ? '보물이 기다린다... 조심해라.' : '더 깊은 미로로 들어간다...';
    text(subMsg,width/2,height*0.89);
}
