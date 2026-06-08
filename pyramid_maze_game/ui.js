let gameState = 'play';

const START_ROW = 1, START_COL = 0;
const GOAL_ROW  = 18, GOAL_COL = 27;

function checkCaught() {
    mummies.forEach(m => {
        let d = dist(playerX, playerY, m.x, m.y);
        if (d < (playerSize + mummySize) / 2 * 0.8) {
            gameState = 'gameover';
            mummies.forEach(mu => { mu.dirX = 0; mu.dirY = 0; });
        }
    });
}

function checkGoal() {
    // 스테이지4는 _drawTimeMaze() 안에서 직접 처리
    if (currentStage === 4) return;
    let goalX = GOAL_COL * cellSize + cellSize / 2;
    let goalY = GOAL_ROW * cellSize - cellSize / 2;
    if (dist(playerX, playerY, goalX, goalY) <= cellSize) {
        if (gameState !== 'stageclear') initClearAnim();
        gameState = 'stageclear';
    }
}

function drawGameOver() {
    fill(255, 0, 0, 50); noStroke(); rect(0, 0, width, height);
    textAlign(CENTER, CENTER);
    fill(255, 60, 60); textSize(min(width, height) * 0.1); textStyle(BOLD);
    text('GAME OVER', width / 2, height / 2 - height * 0.1); textStyle(NORMAL);
    let btnW = width * 0.22, btnH = height * 0.06;
    let btnX = width / 2 - btnW / 2, btnY = height / 2 + height * 0.02;
    let isHover = mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH;
    fill(isHover ? color(180, 80, 80) : color(140, 50, 50));
    rect(btnX, btnY, btnW, btnH, 10);
    fill(255); textSize(min(width, height) * 0.028); textStyle(BOLD);
    text('다시 시도', width / 2, btnY + btnH / 2); textStyle(NORMAL);
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
function drawStageClear() {
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

function resetGame() {
    variableInitialization();
    mazeStructure();
    spawnMummy();
    spawnSuperMummy();
    anubisReset();
    torchSetup();
}

function drawGameClear() {
    background(0);
    textAlign(CENTER, CENTER);
    fill(255, 220, 50); textSize(min(width, height) * 0.12); textStyle(BOLD);
    text('🏆 GAME CLEAR!', width/2, height/2 - height*0.15);
    fill(255, 255, 200); textSize(min(width, height) * 0.04); textStyle(NORMAL);
    text('모든 피라미드를 탈출했다!', width/2, height/2);
}

function _drawTimerUI(remaining) {
    let sec = remaining / 1000;
    let ratio = remaining / stage4TimeLimit;

    // 상단 타이머 바
    let bw = width * 0.6, bh = 22;
    let bx = width/2 - bw/2, by = 30;
    noStroke(); fill(20,10,5,200); rect(bx,by,bw,bh,6);
    let barColor = remaining > 8000 ? color(80,200,80) : remaining > 4000 ? color(255,165,0) : color(220,40,40);
    fill(barColor); rect(bx,by,bw*ratio,bh,6);
    fill(255,255,200); textAlign(CENTER,CENTER); textSize(max(13,min(width,height)*0.022)); textStyle(BOLD);
    let mazeLabel = ['3층', '2층', '1층'];
    let labelStr = (typeof s4MazeStep !== 'undefined' && mazeLabel[s4MazeStep]) ? ' (' + mazeLabel[s4MazeStep] + ')' : '';
    text('탈출까지 ' + sec.toFixed(1) + '초' + labelStr, width/2, by+bh/2); textStyle(NORMAL);

    // 돌 파티클 계속 낙하
    for (let stone of stage4Stones) {
        if (!stone.active) continue;
        stone.x += stone.vx*0.3; stone.y += stone.vy*0.5;
        if (stone.y > height) { stone.y = random(-100,0); stone.x = random(width); }
        fill(stone.col[0], stone.col[1], stone.col[2], 120);
        noStroke(); rect(stone.x, stone.y, stone.size*0.6, stone.size*0.4, 1);
    }
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
    fill(255,215,50);textAlign(CENTER,CENTER);textSize(min(width,height)*0.055);textStyle(BOLD);
    let stageMsg = transitionTargetStage === 4 ? '파라오의 방' : 'STAGE' + transitionTargetStage;
    text(stageMsg,width/2,height*0.82);
    textStyle(NORMAL);fill(190,165,110);textSize(min(width,height)*0.022);
    let subMsg = transitionTargetStage === 4 ? '보물이 기다린다... 조심해라.' : transitionTargetStage === 3 ? '' : '더 깊은 미로로 들어간다...';
    text(subMsg,width/2,height*0.89);
}

function drawStageHUD() {
    let padding = 70;
    let boxW = cellSize * 3.2;
    let boxH = cellSize * 1.8;
    let bx = width - boxW - padding;
    let by = padding;

    noStroke();
    fill(10, 6, 2, 210);
    rect(bx, by, boxW, boxH, 8);

    stroke(200, 160, 40, 220);
    strokeWeight(2);
    noFill();
    rect(bx, by, boxW, boxH, 8);

    stroke(200, 160, 40, 120);
    strokeWeight(1);
    line(bx + 8, by + boxH * 0.48, bx + boxW - 8, by + boxH * 0.48);

    noStroke();
    fill(190, 155, 60, 200);
    textAlign(CENTER, CENTER);
    textSize(max(10, min(width, height) * 0.016));
    textStyle(NORMAL);
    text('S T A G E', bx + boxW / 2, by + boxH * 0.27);

    let pulse = sin(frameCount * 0.06) * 0.15 + 0.85;
    fill(255, 215, 50, floor(255 * pulse));
    textSize(max(18, min(width, height) * 0.042));
    textStyle(BOLD);
    text(currentStage + ' / 3', bx + boxW / 2, by + boxH * 0.72);

    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
}