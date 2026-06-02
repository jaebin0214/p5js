let cells = []; 
let cellSize; 
let currentStage = 1;   // 현재 스테이지 단계 번호

function mazeStructure(){ 
    for (let i = 0; i < height/cellSize; i++){ 
        cells[i] = []; 
        for (let j = 0; j < width/cellSize; j++){ 
            cells[i][j] = mazeData[currentStage - 1][i][j]; 
        } 
    } 
}

function mazeDrawing(){ 
    noStroke(); 
    for (let i = 0; i < height/cellSize; i++){ 
        for (let j = 0; j < width/cellSize; j++){ 
            if(cells[i][j] === 1){ 
                fill(120, 85, 45); 
            } else {
                fill(210, 180, 120); 
            }
            square(j * cellSize, i * cellSize, cellSize); 
        } 
    } 
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