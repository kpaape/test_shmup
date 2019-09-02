class Mob extends Obj {
    constructor(name, color="red", loc = [0, 0], speed = 2, radius = 10) {
        super(name, null, color, loc, speed, true, radius, [0, 0]);
        this.hp = 10;
        this.weapon = "bullet";
        this.firing;
        this.shield = false;
    }
    checkDeath(killer) {
        if(this.hp <= 0) {
            console.log(this.name + " was killed by " + killer.name);
            if(killer == player) {
                score += 1+level;
                updateScore();
            }
            clearInterval(this.firing);
            this.toDelete = true;
        }
    }
    collide() {
        let that = this;
        super.collide(function(collide) {
            if(that == player || collide == player) {
                player.toDelete = true;
            }
        });
    }
    fire() {
        let projectiles = [];
        let projectile = null;
        let color = "yellow";
        let radius = 5;
        let dir = [1,0];
        let pierce = false;
        let loc = [this.loc[0]+1, this.loc[1]];
        let damage = 10;
        if(this != player) {
            dir[0] = -1;
            loc[0] = this.loc[0]-1;
        }
        if(this.weapon.includes("bullet")) {
            projectile = new Bullet("bullet", this);
            projectile.dir = dir;
            projectile.loc = loc;
            projectiles.push(projectile);
        }
        if(this.weapon.includes("laser")) {
            projectile = new Bullet("laser", this);
            color = "rgb(50, 100, 255)";
            damage /= 2;
            radius = 8;
            projectile.dir = dir;
            projectile.loc = loc;
            projectiles.push(projectile);
        }
        if(this.weapon.includes("shot")) {
            let shot1 = Object.assign(new Bullet, projectile);
            shot1.dir = [0.8*dir[0],0.3];
            shot1.loc = [loc[0], loc[1]+1];
            projectiles.push(shot1);
            let shot2 = Object.assign(new Bullet, projectile);
            shot2.dir = [0.8*dir[0],-0.3];
            shot2.loc = [loc[0], loc[1]-1];
            projectiles.push(shot2);
        }
        if(this.weapon.includes("shot+")) {
            let shot1 = Object.assign(new Bullet, projectile);
            shot1.dir = [0.5*dir[0],0.6];
            shot1.loc = [loc[0], loc[1]+1];
            projectiles.push(shot1);
            let shot2 = Object.assign(new Bullet, projectile);
            shot2.dir = [0.5*dir[0],-0.6];
            shot2.loc = [loc[0], loc[1]-1];
            projectiles.push(shot2);
        }
        if(this.weapon.includes("blast")) {
            let blastIndex = this.weapon.indexOf("blast")-1;
            let blastCount = Number(this.weapon[blastIndex]) > 0 ? Number(this.weapon[blastIndex]) : 1;
            for(var i = 1; i <= blastCount; i++) {
                let shot1 = Object.assign(new Bullet, projectile);
                shot1.dir = dir;
                shot1.loc = [loc[0]+(radius*i)*3*dir[0], loc[1]+(radius*i)*3];
                projectiles.push(shot1);
                shot1 = Object.assign(new Bullet, projectile);
                shot1.dir = dir;
                shot1.loc = [loc[0]+(radius*i)*3*dir[0], loc[1]+(radius*-i)*3];
                projectiles.push(shot1);
            }
        }
        if(this.weapon.includes("behind")) {
            let pLen = projectiles.length;
            for(var i = 0; i < pLen; i++) {
                let bullet = Object.assign(new Bullet, projectiles[i]);
                bullet.dir = [bullet.dir[0]*-1, bullet.dir[1]];
                bullet.loc = [this.loc[0]-(bullet.loc[0]-this.loc[0]), bullet.loc[1]];
                projectiles.push(bullet);
            }
        }
        if(this.weapon.includes("pierce")) {
            pierce = true;
            damage /= 2;
        }
        if(this.weapon.includes("phaser")) {
            radius = 30;
            color = "orange";
            damage /= 2;
        }
        for(var i = 0; i < projectiles.length; i++) {
            projectiles[i].color = color;
            projectiles[i].radius = radius;
            projectiles[i].damage = damage;
            projectiles[i].pierce = pierce;
            projectiles[i].speed = 10;
            projectiles[i].dense = true;
            objs.push(projectiles[i]);
        }
    }
}

class Enemy extends Mob {
    move() {
        let that = this;
        super.move(function() {
            if(that.loc[0] < -50 || that.loc[0] > width+50) {
                clearInterval(that.firing);
                that.toDelete = true;
            }
            if(that.loc[1] < -50 || that.loc[1] > height+50) {
                clearInterval(that.firing);
                that.toDelete = true;
            }
        });
    }
}

class Player extends Mob {
    setDir(dir, held) {
        this.dir = [0, 0];
        if(held) {
            wasd += dir;
        } else {
            wasd = wasd.replace(dir, "");
        }
        if(wasd.includes("up")) {
            this.dir[1] -= 1;
        }
        if(wasd.includes("down")) {
            this.dir[1] += 1;
        }
        if(wasd.includes("left")) {
            this.dir[0] -= 1;
        }
        if(wasd.includes("right")) {
            this.dir[0] += 1;
        }
    }
}