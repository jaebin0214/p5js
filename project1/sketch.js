function setup() {
  createCanvas(400, 400);
  background(220);
}
  
function draw() {
  nostroke()
  fill(255)
  ellipse(mouseX, mouseY, 50, 50);
}