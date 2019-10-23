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
    const cnt = 60;
    let pos_x;
    let pos_y;

    for(let k = 0; k < cnt; k++){
        pos_x = int(random(0, field.length - 1));
        pos_y = int(random(0, field[0].length - 1));
        for(let i=pos_x; i < pos_x + r; i++){
            for(let j=pos_y; j < pos_y+r; j++){
                if( i < field.length && j < field[0].length){
                    if(k % 6 ==0) {
                        field[i][j].u.r = random(0,1);
                        field[i][j].v.r = random(0,1);
                    } else if( k % 6 == 1) {
                        field[i][j].u.g = random(0,1);
                        field[i][j].v.g = random(0,1);
                    } else if (k % 6 == 2) {
                        field[i][j].u.b = random(0,1);
                        field[i][j].v.b = random(0,1);
                    } else if (k % 6 == 3) {
                        field[i][j].u.r = random(0,1);
                        field[i][j].v.r = random(0,1);
                        field[i][j].u.g = random(0,1);
                        field[i][j].v.g = random(0,1);
                    } else if (k % 6 == 4) {
                        field[i][j].u.g = random(0,1);
                        field[i][j].v.g = random(0,1);
                        field[i][j].u.b = random(0,1);
                        field[i][j].v.b = random(0,1);
                    } else if (k % 6 == 5) {
                        field[i][j].u.r = random(0,1);
                        field[i][j].v.r = random(0,1);
                        field[i][j].u.b = random(0,1);
                        field[i][j].v.b = random(0,1);
                    }
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
        saveCanvas(canvas, "canvas", "png");
        cnt = 0;
    }
    console.log(cnt);
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
            let pix = (i+j*width) * 4;
            pixels[pix + 0] = u.r * 255; // R
            pixels[pix + 1] = u.g * 255; // G
            pixels[pix + 2] = u.b * 255; // B
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
            field[i][j] = {u: {r: 1,g: 1, b: 1}, v: {r:0, g: 0, b: 0}};
        }
    }
    field_next = Array.from(field);
}

function calcNextFields() {
    for(let i=0; i < field.length; i++) {
        for(let j=0; j < field[0].length; j++) {
            let u = field[i][j].u;
            let v =  field[i][j].v;

            field_next[i][j].u.r = u.r + (Du * laplacian_u(i, j, "r") + f(u.r, v.r)) * dt;
            field_next[i][j].u.g = u.g + (Du * laplacian_u(i, j, "g") + f(u.g, v.g)) * dt;
            field_next[i][j].u.b = u.b + (Du * laplacian_u(i, j, "b") + f(u.b, v.b)) * dt;

            field_next[i][j].v.r = v.r + (Dv * laplacian_v(i, j, "r") + g(u.r, v.r)) * dt;
            field_next[i][j].v.g = v.g + (Dv * laplacian_v(i, j, "g") + g(u.g, v.g)) * dt;
            field_next[i][j].v.b = v.b + (Dv * laplacian_v(i, j, "b") + g(u.b, v.b)) * dt;

            field_next[i][j].u.r = constrain(field_next[i][j].u.r, 0, 1);
            field_next[i][j].u.g = constrain(field_next[i][j].u.g, 0, 1);
            field_next[i][j].u.b = constrain(field_next[i][j].u.b, 0, 1);

            field_next[i][j].v.r = constrain(field_next[i][j].v.r, 0, 1);
            field_next[i][j].v.g = constrain(field_next[i][j].v.g, 0, 1);
            field_next[i][j].v.b = constrain(field_next[i][j].v.b, 0, 1);
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

function laplacian_u (x, y, color) {
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

            sum += field[x_target][y_target]["u"][color] * l_array[i][j]
        }
    }
    return sum;
}

function laplacian_v (x, y, color) {
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

            sum += field[x_target][y_target]["v"][color] * l_array[i][j]
        }
    }
    return sum;
}

function swap() {
    var tmp = field;
    field = field_next;
    field_next = tmp;
}