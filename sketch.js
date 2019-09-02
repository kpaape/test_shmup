let mobs = [];
let objs = [];
let player;
let wasd = "";
let fire;
let level = 1;
let wave = 0;
let enemySpawn;
let score = 0;

let testImg;


// load any images that will be used
function preload() {
    // testImg = loadImage("images/test.png");
}

// This is where all of the code related to starting the sketch should go
function setup() {
    let gameCanvas = createCanvas(800, 400);
    gameCanvas.parent(document.getElementById("canvas_container"));
    player = new Player("Player", "white", [width/4, height/2], 5);
    mobs.push(player);
    // let power = new Weapon("laserphaser7blast");
    // power.loc = [width, height/2];
    // objs.push(power);
    updateScore()
    startLevel();
}

// This code will be continuously repeated. This is where all of the rendering should go.
function draw() {
    background(50);
    // imageMode(CENTER);
    // image(testImg, width/2, height/2);
    for(var i = objs.length-1; i >= 0; i--) {
        if(objs[i].toDelete) {
            if(objs[i].movement) {
                clearInterval(objs[i].movement);
            }
            objs.splice(i, 1);
        } else {
            objs[i].move();
            objs[i].show();
        }
    }
    for(var i = mobs.length-1; i >= 0; i--) {
        if(mobs[i].toDelete) {
            if(mobs[i] == player) {
                player = null;
            }
            if(mobs[i].movement) {
                clearInterval(mobs[i].movement);
            }
            mobs.splice(i, 1);
        } else {
            mobs[i].move();
            mobs[i].show();
        }
    }
}

function keyReleased() {
    if(!player) { return }
    if(keyCode == 32) {
        clearInterval(fire);
    } else {
        updateDir(keyCode);
    }
}

function keyPressed() {
    if(!player) { return }
    if(keyCode == 32) {
        if(player.weapon.includes("bullet")) {
            fire = setInterval(function() {
                if(!player) {
                    clearInterval(fire);
                    return
                }
                player.fire();
            }, 100);
        } else if(player.weapon.includes("laser")) {
            laserFire();
        }
    } else {
        updateDir(keyCode, true);
    }
}

function laserFire() {
    let laserInterval = 0;
    fire = setInterval(function() {
        if(!player) {
            clearInterval(fire);
            return
        }
        if(laserInterval < 50) {
            player.fire();
        } else if(laserInterval > 100) {
            laserInterval = 0;
            player.fire();
        }
        laserInterval++;
    }, 1);
}

function updateDir(keyCode, held = false) {
    switch (keyCode) {
        case 65:
            player.setDir("left", held);
            break;
        case 68:
            player.setDir("right", held);
            break;
        case 87:
            player.setDir("up", held);
            break;
        case 83:
            player.setDir("down", held);
            break;
        default:
            break;
    }
}

function startLevel() {
    if(!player) { return }
    console.log("Level: " + level);
    console.log(player.weapon);
    player.weapon.replace("phaser", "");
    console.log(player.weapon);
    wave = level*2;
    spawnWave();
}

function spawnWave() {
    if(!player) { return }
    console.log("Wave: " + wave);
    let enemiesSpawned = 0;
    enemySpawn = setInterval(function() {
        if(!player) { 
            clearInterval(enemySpawn);
            return;
        }
        let enemy = new Enemy("Enemy", "red", [width, height*Math.random()]);
        enemy.dir = [-1, 0];
        enemy.speed = 3;
        enemy.weapon = generatePower(true);
        enemy.movePattern();
        enemy.firing = setInterval(function() {
            enemy.fire();
        }, 500);
        enemy.canEscape = "leftright";
        mobs.push(enemy);
        enemiesSpawned++;
        if(enemiesSpawned == wave) {
            level += 1;
            spawnPowerup();
            setTimeout(startLevel, 3000);
            clearInterval(enemySpawn);
        }
    }, 1000);
}

function spawnPowerup() {
    let powerUp = generatePower();
    if(powerUp == "shield") {
        powerUp = new Shield(powerUp);
    } else {
        powerUp = new Weapon(powerUp);
    }
    powerUp.loc = [width, height*Math.random()];
    console.log(powerUp.name);
    objs.push(powerUp);
}

function generatePower(enemy = false) {
    let powerType;
    if(!enemy && !player.shield) {
        powerType = "shield";
    } 
    if(powerType != "shield") {
        powerType = Math.floor(Math.random()*3);
        if(powerType == 2) {
            powerType = "laser ";
        } else {
            powerType = "bullet ";
        }
        let extraPower = ["behind ", "blast ", "shot", "pierce ", "phaser "];
        if(enemy) {
            powerType = "bullet ";
            extraPower = ["blast ", "shot"];
        }
        for(var i = 0; i < extraPower.length; i++) {
            if(Math.floor(Math.random()*2)) {
                let addPower = extraPower[i];
                if(addPower == "blast ") {
                    addPower = Math.floor(Math.random()*3)+1 + "blast ";
                } else if(addPower == "shot") {
                    if(Math.floor(Math.random()*2)) {
                        addPower += "+ ";
                    } else {
                        addPower += " ";
                    }
                }
                powerType += addPower;
            }
        }
    }
    return powerType;
}

function updateScore() {
    let scoreBoard = document.getElementById("scoreboard");
    let highScore = getItem("highScore") ? getItem("highScore") : 0;
    if(score > highScore) {
        storeItem("highScore", score);
        highScore = score;
    }
    scoreBoard.innerHTML = score + " - High Score: " + highScore;
}