class Obj {
    constructor(name, owner=null, color="green", loc=[0,0], speed=1, dense=false, radius=10, dir=[0, 0]) {
        this.name = name;
        this.owner = owner;
        this.color = color;
        this.dense = dense;
        this.loc = loc;
        this.speed = speed;
        this.radius = radius;
        this.dir = dir;
        this.toDelete = false;
        this.canEscape = "";
        this.canPickup = false;
        this.movement = null;
    }
    movePattern(pattern="") {
        let that = this;
        // let modify = 0;
        this.dir[1] = Math.floor(Math.random()*2) ? 1 : -1;
        this.movement = setInterval(function() {
            that.dir[1] *= -1;
        }, 1000);
    }
    show() {
        noStroke();
        fill(this.color);
        ellipseMode(RADIUS);
        ellipse(this.loc[0], this.loc[1], this.radius, this.radius);
    }
    move(callback) {
        if(!this.collide()) {
            this.loc[0] += this.dir[0] * this.speed;
            this.loc[1] += this.dir[1] * this.speed;

            if(!this.canEscape || !this.canEscape.includes("right")) {
                this.loc[0] = this.loc[0] > width ? width : this.loc[0];
            } 
            if(!this.canEscape || !this.canEscape.includes("left")) {
                this.loc[0] = this.loc[0] < 0 ? 0 : this.loc[0];
            }
            if(!this.canEscape || !this.canEscape.includes("up")) {
                this.loc[1] = this.loc[1] < 0 ? 0 : this.loc[1];
            }
            if(!this.canEscape || !this.canEscape.includes("down")) {
                this.loc[1] = this.loc[1] > height ? height : this.loc[1];
            }
            if(callback) {
                callback();
            }
        }
    }
    collide(callback) {
        for(var i = 0; i < mobs.length; i++) {
            if(this != mobs[i] && this.owner != mobs[i]) {
                if(this.dense && mobs[i].dense) {
                    if(dist((this.loc[0] + this.dir[0]*this.speed), (this.loc[1] + this.dir[1]*this.speed), mobs[i].loc[0], mobs[i].loc[1]) < this.radius + mobs[i].radius) {
                        if(callback) {
                            callback(mobs[i]);
                        }
                        return true;
                    }
                }
            }
        }
    }
}

class Bullet extends Obj {
    constructor(name, owner, color, damage, loc, speed, dense, radius, dir) {
        super(name, owner, color, loc, speed, dense, radius, dir);
        this.damage = damage;
        this.canEscape = "leftrightupdown";
        this.pierce = false;
    }
    collide() {
        let that = this;
        super.collide(function(hit) {
            if(!hit.shield) {
                hit.hp -= that.damage;
                hit.checkDeath(that.owner);
                if(!that.pierce) {
                    that.toDelete = true;
                }
            } else {
                that.toDelete = true;
                hit.shield.toDelete = true;
                hit.shield = null;
            }
        });
    }
    move() {
        let that = this;
        super.move(function() {
            if(that.loc[0] < -50 || that.loc[0] > width+50) {
                that.toDelete = true;
            }
            if(that.loc[1] < -50 || that.loc[1] > height+50) {
                that.toDelete = true;
            }
        });
    }
}

class Weapon extends Obj {
    constructor(name, loc) {
        super(name, null, "rgb(0 , 255, 0)", loc, 2, true, 15, [-1,0]);
        this.canPickup = true;
        this.canEscape = "leftright"
    }
    move() {
        let that = this;
        super.move(function() {
            if(that.loc[0] < -50 || that.loc[0] > width+50) {
                that.toDelete = true;
            }
            if(that.loc[1] < -50 || that.loc[1] > height+50) {
                that.toDelete = true;
            }
        });
    }
    collide() {
        let that = this;
        super.collide(function(collide) {
            if(collide == player) {
                player.weapon = that.name;
                that.toDelete = true;
            }
        });
    }
}

class Shield extends Obj {
    constructor() {
        super("shield", null, "rgb(0, 255, 255)", [width, height], 2, true, 20, [-1,0]);
        this.canEscape = "leftright";
    }
    move() {
        if(this.owner) {
            if(!this.collide()) {
                this.loc = [this.owner.loc[0]+this.owner.dir[0]*this.owner.speed, this.owner.loc[1]+this.owner.dir[1]*this.owner.speed];
            }
        } else {
            let that = this;
            super.move(function() {
                if(that.loc[0] < -50 || that.loc[0] > width+50) {
                    that.toDelete = true;
                }
                if(that.loc[1] < -50 || that.loc[1] > height+50) {
                    that.toDelete = true;
                }
            });
        }
    }
    collide() {
        let that = this;
        super.collide(function(collide) {
            if(!that.owner) {
                if(collide == player) {
                    that.owner = player;
                    that.owner.shield = that;
                }
            } else if(collide != that.owner) {
                collide.hp -= 50;
                collide.checkDeath();
                that.toDelete = true;
                that.owner.shield = null;
            }
        });
    }
    show() {
        noFill();
        strokeWeight(2);
        stroke(this.color);
        ellipseMode(RADIUS);
        ellipse(this.loc[0], this.loc[1], this.radius, this.radius);
    }
}