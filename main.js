const dt = 1.0;
const Du = 0.2;
const Dv = 0.1;

const c1 = 0.046;
const c2 = 0.063;

var canvas;
var cnt = 0;

function setup() {
    initialize()
    const r = 10;
    const cnt = 20;
    let pos_x;
    let pos_y;

    for(let k = 0; k < cnt; k++){
        pos_x = int(random(0, field.length - 1));
        pos_y = int(random(0, field[0].length - 1));
        for(let i=pos_x; i < pos_x + r; i++){
            for(let j=pos_y; j < pos_y+r; j++){
                if( i < field.length && j < field[0].length){
                    field[i][j].u = random(0,1);
                    field[i][j].v = random(0,1);
                }
            }
        }
    }
    // capture();
}

function draw() {
    render();
    cnt++;
    if(cnt > 8000){
        noLoop();
        cnt = 0;
    }
}


function capture(){
    for(let loop = 0; loop < 8000; loop++ ){
        render();
    }
    saveCanvas(canvas, "canvas", "png");
}

function render(){
    calcNextFields();

    loadPixels();
    for(let i=0; i < width; i++) {
        for(let j=0; j< height; j++) {
            let u = field_next[i][j].u;
            let color = u * 255;
            let pix = (i+j*width) * 4;
            pixels[pix + 0] = color; // R
            pixels[pix + 1] = color; // G
            pixels[pix + 2] = color; // B
            pixels[pix + 3] = 255; // Alpha
        }
    }
    updatePixels();

    swap();
}

// RD Algorithm from Here

// prepare 2 files for swapping
var field = []
var field_next = []

function initialize() {
    canvas = createCanvas(200, 200);
    pixelDensity(1);
    initFields();
}


function initFields() {
    for(let i=0; i < width; i++) {
        field[i] = [];
        for(let j=0; j < height; j++){
            field[i][j] = {u: 1, v: 0};
        }
    }
    field_next = Array.from(field);
}

function calcNextFields() {
    for(let i=0; i < field.length; i++) {
        for(let j=0; j < field[0].length; j++) {
            let u = field[i][j].u;
            let v =  field[i][j].v;

            field_next[i][j].u = u + (Du * laplacian_u(i, j) + f(u, v)) * dt;
            field_next[i][j].v = v + (Dv * laplacian_v(i, j) + g(u, v)) * dt;

            field_next[i][j].u = constrain(field_next[i][j].u, 0, 1);
            field_next[i][j].v = constrain(field_next[i][j].v, 0, 1);
        }
    }
}

function f(u, v) {
    return -u * v * v + c1 * (1-u)
}

function g(u, v) {
    return u * v * v - (c1 + c2) * v
}

const l_array = [
    [0, 1.0, 0],
    [1.0, -4.0, 1.0],
    [0, 1.0, 0]
];

function laplacian_u (x, y) {
    // periodic boundary conditions
    var sum = 0;
    for(let i = 0; i < 3; i++) {
        let x_target = x + (i-1);
        for(let j = 0; j < 3; j++) {
            let y_target = y + (j-1);

            if(x_target == -1){
                x_target = field.length -1;
            } else if (x_target == field.length) {
                x_target = 0;
            }

            if(y_target == -1){
                y_target = field[0].length -1;
            } else if (y_target == field[0].length) {
                y_target = 0;
            }

            sum += field[x_target][y_target].u * l_array[i][j]
        }
    }
    return sum;
}

function laplacian_v (x, y) {
    var sum = 0;
    for(let i = 0; i < 3; i++) {
        let x_target = x + (i-1);
        for(let j = 0; j < 3; j++) {
            let y_target = y + (j-1);

            if(x_target == -1){
                x_target = field.length -1;
            } else if (x_target == field.length) {
                x_target = 0;
            }

            if(y_target == -1){
                y_target = field[0].length -1;
            } else if (y_target == field[0].length) {
                y_target = 0;
            }

            sum += field[x_target][y_target].v * l_array[i][j]
        }
    }
    return sum;
}

function swap() {
    var tmp = field;
    field = field_next;
    field_next = tmp;
}