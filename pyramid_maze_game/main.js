function setup(){ 
    createCanvas(windowWidth, windowHeight); 
    variableInitialization(); 
    mazeStructure();
    spawnMummy(); // 미라 랜덤 생성
    torchSetup();
} 

function draw(){ 
    background(200);
    if(gameState === 'play'){
        mazeDrawing(); 
        playerDesign(); 
        playerMoving();

        mummyDesign();
        checkCaught();
        checkGoal();
    
        if (spaceHeld) {
            mummyMoving();
        }
        torchUpdate();
        torchDraw();
        //mummyEyeDesign();
    }
    if (gameState === 'gameover') {
        mazeDrawing();
        playerDesign();
        mummyDesign();
        torchDraw();
        drawGameOver();
    }

    if (gameState === 'stageclear') { // ✅ 추가
        mazeDrawing();
        playerDesign();
        torchDraw();
        drawStageClear();
    } 

} 

function variableInitialization(){ 
    cellSize = min(windowWidth, windowHeight) / 19; 
    playerSize = cellSize - 10; 
    mummySize  = cellSize - 10;
    playerX = cellSize / 2; 
    playerY = cellSize * 3 / 2; 
    speed = 5; 

    maze1 = [ 
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
    [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1], 
    [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1], 
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1], 
    [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1], 
    [1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,1], 
    [1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1], 
    [1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1], 
    [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1], 
    [1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1], 
    [1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1], 
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,1], 
    [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1], 
    [1,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,1], 
    [1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1], 
    [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1], 
    [1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1], 
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0], 
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
    ]; 

} 



function keyPressed() {
  if (keyCode === 32) spaceHeld = true;
}
function keyReleased() {
  if (keyCode === 32) spaceHeld = false;
}






