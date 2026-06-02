let playerSize; 
let playerX, playerY; 
let speed; 
let playerCols, playerRows;
let spaceHeld = false;

function playerDesign() {
    
    // 몸통
    noStroke();
    fill(180, 120, 60);
    circle(playerX, playerY, playerSize);

    // 페도라 챙
    fill(60, 35, 10);
    ellipse(playerX, playerY - playerSize*0.18, playerSize*1.2, playerSize*0.3);

    // 페도라 윗부분
    fill(80, 48, 15);
    rect(playerX - playerSize*0.25, playerY - playerSize*0.52, playerSize*0.5, playerSize*0.36, 4);

    // 눈
    fill(30);
    circle(playerX - playerSize*0.14, playerY - playerSize*0.01, playerSize*0.11);
    circle(playerX + playerSize*0.14, playerY - playerSize*0.01, playerSize*0.11);
    
    if(keyIsDown(32)){
        // 횃불 손잡이 (막대)
        stroke(100, 60, 20);
        strokeWeight(playerSize * 0.08);
        line(playerX + playerSize*0.3, playerY + playerSize*0.15, playerX + playerSize*0.55, playerY - playerSize*0.2);
        noStroke();

        // 횃불 머리 (천 부분)
        fill(140, 80, 30);
        ellipse(playerX + playerSize*0.58, playerY - playerSize*0.26, playerSize*0.18, playerSize*0.14);

        // 불꽃 (겹친 타원으로 표현)
        let flicker = sin(frameCount * 0.3) * playerSize * 0.03; // 흔들림 효과

        fill(255, 60, 0, 180);
        ellipse(playerX + playerSize*0.58, playerY - playerSize*0.38 + flicker, playerSize*0.16, playerSize*0.22);

        fill(255, 140, 0, 200);
        ellipse(playerX + playerSize*0.57, playerY - playerSize*0.42 + flicker, playerSize*0.11, playerSize*0.17);

        fill(255, 230, 80, 220);
        ellipse(playerX + playerSize*0.58, playerY - playerSize*0.45 + flicker, playerSize*0.07, playerSize*0.11);

        // 불꽃 빛 효과 (반투명 원)
        fill(255, 150, 0, 40);
        circle(playerX + playerSize*0.58, playerY - playerSize*0.38, playerSize*0.45);
    }
}

//스페이스바 누를 때 이동 불가
function playerMoving(){ 
    playerCols = floor(playerX / cellSize); 
    playerRows = floor(playerY / cellSize); 

    if(!keyIsDown(32)){
        if (keyIsDown(LEFT_ARROW)) { 
            let nextCol = floor((playerX - playerSize/2 - speed) / cellSize); 
            
            // (추가 조건) nextCol이 0보다 크거나 같아야 하며, 벽이 아니어야 함
            if (nextCol >= 0 && cells[playerRows][nextCol] != 1) { 
                playerX -= speed; 
            } else if (nextCol < 0) {
                // 화면 왼쪽 끝에 닿았을 때 좌표를 고정
                playerX = playerSize / 2;
            }
        } else if (keyIsDown(RIGHT_ARROW)) {
            let nextCol = floor((playerX + playerSize/2 + speed) / cellSize); 
            // 미로 데이터의 최대 열 개수(mazeData[0].length)를 넘지 않도록 체크
            if (nextCol < cells[0].length && cells[playerRows][nextCol] != 1) { 
                playerX += speed; 
            } 
        } else if (keyIsDown(UP_ARROW)) { 
            let nextRow = floor((playerY - playerSize/2 - speed) / cellSize); 
            if (cells[nextRow][playerCols] != 1) { 
                playerY -= speed; 
            } 
        } else if (keyIsDown(DOWN_ARROW)) { 
            let nextRow = floor((playerY + playerSize/2 + speed) / cellSize); 
            if (cells[nextRow][playerCols] != 1) { 
                playerY += speed; 
            } 
        } 
    }
}