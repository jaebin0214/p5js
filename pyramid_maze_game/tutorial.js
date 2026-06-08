// ============================================================
//  tutorial.js
//  게임 조작법 및 규칙 설명 화면
// ============================================================

let tutorialActive = false;
let tutorialStep = 0;
const TOTAL_TUTORIAL_STEPS = 3;

function drawTutorial() {
    background(15, 10, 5); // 짙은 이집트풍 배경
    
    // 장식용 비네트 및 배경 그리기
    _homeVignette(); 
    
    let cx = width / 2;
    let cy = height / 2;
    let ts = min(width, height);

    // 타이틀
    textAlign(CENTER, CENTER);
    fill(255, 215, 50);
    textSize(ts * 0.05);
    textStyle(BOLD);
    text('탐험 가이드', cx, height * 0.15);
    
    // 내용 박스
    fill(40, 30, 20, 200);
    stroke(200, 160, 40);
    strokeWeight(2);
    rect(width * 0.15, height * 0.25, width * 0.7, height * 0.5, 10);
    noStroke();

    // 단계별 내용
    fill(255);
    textStyle(NORMAL);
    textSize(ts * 0.03);

    switch(tutorialStep) {
        case 0:
            text('1. 미로 이동', cx, height * 0.35);
            textSize(ts * 0.022);
            fill(200, 180, 150);
            text('방향키 [ ↑ ↓ ← → ]를 사용하여\n복잡한 피라미드 내부를 이동하세요.', cx, cy);
            // 아이콘 대신 텍스트로 시각화
            fill(255, 215, 50);
            text('▲\n◀  ▼  ▶', cx, height * 0.65);
            break;
            
        case 1:
            text('2. 횃불과 시야', cx, height * 0.35);
            textSize(ts * 0.022);
            fill(200, 180, 150);
            text('[ SPACE ] 키를 꾹 누르면 횃불이 밝아지며\n주변 시야가 확장됩니다.\n단, 횃불을 켜는 동안에는 움직일 수 없습니다.', cx, cy);
            fill(255, 150, 50);
            text('( ! ) 횃불 빛은 미라를 자극할 수 있습니다.', cx, height * 0.65);
            break;
            
        case 2:
            text('3. 미라와 탈출', cx, height * 0.35);
            textSize(ts * 0.022);
            fill(200, 180, 150);
            text('피라미드 수호자들을 피해 녹색 빛이 나는\n출구까지 무사히 도달하세요.\n미라에게 잡히면 모든 보물을 잃게 됩니다.', cx, cy);
            fill(100, 255, 100);
            text('목표: 피라미드 탈출', cx, height * 0.65);
            break;
    }

    // 하단 버튼 안내
    fill(255, 215, 50);
    textSize(ts * 0.02);
    if (tutorialStep < TOTAL_TUTORIAL_STEPS - 1) {
        text('클릭하여 다음 단계로 ( ' + (tutorialStep + 1) + ' / ' + TOTAL_TUTORIAL_STEPS + ' )', cx, height * 0.85);
    } else {
        fill(100, 255, 100);
        text('클릭하여 홈으로 돌아가기', cx, height * 0.85);
    }
}

function tutorialMousePressed() {
    if (!tutorialActive) return;

    if (tutorialStep < TOTAL_TUTORIAL_STEPS - 1) {
        tutorialStep++;
    } else {
        // 모든 튜토리얼 종료 후 홈으로
        tutorialActive = false;
        homeScreenActive = true;
        tutorialStep = 0;
        homeSetup(); // 홈화면 초기 상태로 리셋
    }
}