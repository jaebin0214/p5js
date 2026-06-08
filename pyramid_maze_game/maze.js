let cells = []; 
let cellSize; 
let currentStage = 3;   // 현재 스테이지 단계 번호

function mazeStructure(){ 
    for (let i = 0; i < height/cellSize; i++){ 
        cells[i] = []; 
        for (let j = 0; j < width/cellSize; j++){ 
            cells[i][j] = mazeData[currentStage - 1][i][j]; 
        } 
    } 
}

// ─────────────────────────────────────────────────────────────
//  미로 드로우 (기존 유지)
// ─────────────────────────────────────────────────────────────
function mazeDrawing() {
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


function goalDrawing(){
    push();
    let goalX = GOAL_COL * cellSize - cellSize / 2;
    let goalY = GOAL_ROW * cellSize - cellSize / 2;
    let twinkle = sin(frameCount*0.05) * 5;

    fill(0,255,0, 200);
    circle(goalX,goalY,cellSize- 35);
    fill(0,255,0,100);
    circle(goalX,goalY,cellSize- 20 + twinkle);
    pop();
}