let ballColor;
let padColor;
let xPos,xDir;
let yPos,yDir;
let diam
let speed;
let padX;
let padWidth;
let itemX,itemY;
let bricks = [1]

function setup() {
  createCanvas(600,600);
  variableInitiation()
}

function draw() {
  background(200); 

  multiplyItem();
  blocksDrawing();
  ballMoving();
  padMoving();
  ballBouncing();
  blocksHit()
}

function variableInitiation(){
  ballColor = '#ffff00';
  padColor = '#00ff00';
  speed = -5;
  xPos = width/2;
  xDir = speed;
  yPos = 500;
  yDir = speed/2;
  diam = 50;
  padWidth = 200;
  for(let i = 1 ; bricks.length < width/50 ; i++){
   bricks[i] = 1; 
    }
  itemX = int(random(100,500))
  itemY = int(random(100,500))
}


function ballMoving(){
  noStroke()
  fill(ballColor);
  ellipse(xPos,yPos,diam,diam);
  xPos = xPos + xDir;
  yPos = yPos + yDir;
}

function padMoving(){
  padX = mouseX-padWidth/2;
  fill(padColor);
  rect(padX,height-30,padWidth,30);
}

function ballBouncing(){
  if(xPos - diam/2 < 0) xDir *= -1; 
  if(xPos + diam/2 > width) xDir *= -1;
  if(yPos - diam/2 < 0) yDir *= -1;
  if(yPos + diam/2 > height){
    ballColor = '#ff0000';
    xDir = 0;
    yDir = 0;
  }
  //bouncing with pad
  if(xPos>padX&&xPos<padX+padWidth&&yPos>height-30-diam/2){
    yDir *= -1;
  }
}

function blocksDrawing(){
  for(let i = 0 ; i < bricks.length ; i++){
    if(bricks[i] === 1){
      fill(255,150,0)
      stroke(0);
    }
    else{
      noStroke()
      fill(128);
    }
    rect(i*50,0,50,30)
  }
}
function blocksHit(){
  if(yPos < 50 && bricks[int(xPos/50)] === 1){
    yDir *= -1;
    bricks[int(xPos/50)] = 0;
  }
}


function multiplyItem(){
  noStroke()
  fill(0,0,255);
  square(itemX,itemY,10)
  if(xPos-20<itemX,xPos+20 && yPos-20<itemY,yPos+20){

  }
}