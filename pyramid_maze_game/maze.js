let cells = []; 
let cellSize; 

function mazeStructure(){ 
    for (let i = 0; i < height/cellSize; i++){ 
        cells[i] = []; 
        for (let j = 0; j < width/cellSize; j++){ 
            cells[i][j] = maze1[i][j]; 
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