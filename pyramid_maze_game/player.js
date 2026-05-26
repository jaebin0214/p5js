let playerSize; 
let playerX, playerY; 
let speed; 
let playerCols, playerRows;
let spaceHeld = false;

function playerDesign() {
    
    let s = playerSize;
    let x = playerX, y = playerY;

    // 몸통
    noStroke();
    fill(180, 120, 60);
    circle(x, y, s);

    // 페도라 챙
    fill(60, 35, 10);
    ellipse(x, y - s*0.18, s*1.2, s*0.3);

    // 페도라 윗부분
    fill(80, 48, 15);
    rect(x - s*0.25, y - s*0.52, s*0.5, s*0.36, 4);

    // 눈
    fill(30);
    circle(x - s*0.14, y - s*0.01, s*0.11);
    circle(x + s*0.14, y - s*0.01, s*0.11);
    
    if(keyIsDown(32)){
        // 횃불 손잡이 (막대)
        stroke(100, 60, 20);
        strokeWeight(s * 0.08);
        line(x + s*0.3, y + s*0.15, x + s*0.55, y - s*0.2);
        noStroke();

        // 횃불 머리 (천 부분)
       fill(140, 80, 30);
      ellipse(x + s*0.58, y - s*0.26, s*0.18, s*0.14);

      // 불꽃 (겹친 타원으로 표현)
      let flicker = sin(frameCount * 0.3) * s * 0.03; // 흔들림 효과

       fill(255, 60, 0, 180);
      ellipse(x + s*0.58, y - s*0.38 + flicker, s*0.16, s*0.22);

       fill(255, 140, 0, 200);
       ellipse(x + s*0.57, y - s*0.42 + flicker, s*0.11, s*0.17);

      fill(255, 230, 80, 220);
      ellipse(x + s*0.58, y - s*0.45 + flicker, s*0.07, s*0.11);

        // 불꽃 빛 효과 (반투명 원)
       fill(255, 150, 0, 40);
       circle(x + s*0.58, y - s*0.38, s*0.45);
    }
}

//스페이스바 누를 때 이동 불가
function playerMoving(){ 
    playerCols = floor(playerX / cellSize); 
    playerRows = floor(playerY / cellSize); 

    if(!keyIsDown(32)){
        if (keyIsDown(LEFT_ARROW)) { 
            let nextCol = floor((playerX - playerSize/2 - speed) / cellSize); 
            if (cells[playerRows][nextCol] != 1) { 
                playerX -= speed; 
            } 
        } else if (keyIsDown(RIGHT_ARROW)) { 
            let nextCol = floor((playerX + playerSize/2 + speed) / cellSize); 
            if (cells[playerRows][nextCol] != 1) { 
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