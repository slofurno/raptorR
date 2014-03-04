function Entity(input) {

    this.position = vec3.fromValues(0, 40, 0);
    this.orientation = mat4.create();
    mat4.identity(this.orientation);
    this.velocity = vec3.create();
    this.acceleration = vec3.create();
    this.transform = mat4.create();
    this.inversetransform = mat4.create();
    this.keyboard = input;
    this.speed = 1 / 60;
    this.boost = 0;
    this.roll = 0;
    this.velocitydirection = vec3.create();
    this.heading = vec3.create();
    this.cooldown = 0;


    this.up = vec3.fromValues(0, 1, 0);
    this.x = 0;
    this.y = 0;

}


Entity.prototype.update = function () {

    //var stepsize = 1;

    var localvelocity = vec3.clone(this.velocity);

    vec3.transformMat4(localvelocity, localvelocity, this.inversetransform);

    //console.log(localvelocity[0] + "  " + localvelocity[1] + "  " + localvelocity[2]);

    this.heading[0] = 0;
    this.heading[2] = 0;
    this.acceleration[0] = 0;
    this.acceleration[1] = 0;
    this.acceleration[2] = 0;


    if (this.keyboard.isKeyDown(65)) {

        // CameraPos.z += stepsize * Math.sin(3.14 - CameraRot.y);
        //CameraPos.x += stepsize * Math.cos(3.14 - CameraRot.y);
        /*
        
        */
        this.acceleration[0] = 1;
        //this.rotateY(-.02);
        //CameraRot.y += .02;
    }
    else if (this.keyboard.isKeyDown(68)) {

        //CameraPos.z -= stepsize * Math.sin(3.14 - CameraRot.y);
        //CameraPos.x -= stepsize * Math.cos(3.14 - CameraRot.y);



        this.acceleration[0] = -1;
        //this.rotateY(.02);
        //CameraRot.y -= .02;
    }
    else {

    }

    if (this.keyboard.isKeyDown(83)) {

        this.boost += -.1;
        this.acceleration[2] = 1;


    }
    else if (this.keyboard.isKeyDown(87)) {

        this.boost += .1;
        this.acceleration[2] = -1;

        



    }
    else {
        this.boost = 0;

    }

    
    if (this.keyboard.isKeyDown(73)) {

        this.y -= 3;
        //this.rotateX(localvelocity[2] * -.01);

        /*
        


        */
    }
   
    
    if (this.keyboard.isKeyDown(75)) {


        this.y += 3;

    }
    if (this.keyboard.isKeyDown(74)) {

        this.x -= 3;





    }
    else if (this.keyboard.isKeyDown(76)) {

        this.x += 3;



    }
 


    var guns = vec3.fromValues(this.x, 0, this.y);

    vec3.normalize(guns, guns);

    var gunright = vec3.create();

    vec3.cross(gunright, guns, this.up);

    var facing = vec3.clone(this.velocity);

    vec3.normalize(facing, facing);

    var right = vec3.create();
    
    vec3.cross(right, facing, this.up);

    this.orientation[0] = right[0];
    this.orientation[1] = right[1];
    this.orientation[2] = right[2];

    

    this.orientation[8] = -facing[0];
    this.orientation[9] = -facing[1];
    this.orientation[10] = -facing[2];



    if (this.keyboard.isKeyDown(32)) {


        if (this.cooldown > 0) {

            this.cooldown--;
        }
        else {

            bulletmanager.addBullet([this.position[0] + gunright[0] * 5, this.position[1] + gunright[1] * 5, this.position[2] + gunright[2] * 5], [guns[0], guns[1], guns[2]], -10);
            bulletmanager.addBullet([this.position[0] + gunright[0] * -5, this.position[1] + gunright[1] * -5, this.position[2] + gunright[2] * -5], [guns[0], guns[1], guns[2]], -10);

            this.cooldown = 8;
        }

    }


    /*


    this.rotateY(localvelocity[0] * .6); //weathervane effect

    this.rotateZ(this.roll);

    

    var velocitydirection = vec3.clone(this.velocity);
    //vec3.normalize(velocitydirection);
    */

    /*
    this.velocity[0] = this.speed * -this.orientation[8]; //+ drag * this.velocity[0] * this.velocity[0];
    this.velocity[1] = this.speed * -this.orientation[9]; //+ drag * this.velocity[1] * this.velocity[1];
    this.velocity[2] = this.speed * -this.orientation[10];// + drag * this.velocity[2] * this.velocity[2];
    */


    if (this.boost > 1) {
        this.boost = 1;
    }
    this.speed = 1.4 + this.boost;

   
  




    //console.log(localvelocity[0]);
    /*
    this.acceleration[0] = 0;
    this.acceleration[1] = 0; //lift
    this.acceleration[2] = -this.speed; //thrust
    */
    vec3.normalize(this.acceleration, this.acceleration);
   
    this.acceleration[0] *= 3;
    this.acceleration[1] *= 1; //gravity
    this.acceleration[2] *= -3;




    //vec3.transformMat4(this.acceleration, this.acceleration, this.orientation);
    
    

   



    this.velocity[0] *= .95;
    this.velocity[1] *= .95;
    this.velocity[2] *= .95;

    this.velocity[0] += .05 * this.acceleration[0];
    this.velocity[1] += .05 * this.acceleration[1];
    this.velocity[2] += .05 * this.acceleration[2];

   
    this.position[0] += this.velocity[0];
    this.position[1] += this.velocity[1];
    this.position[2] += this.velocity[2];

    this.velocitydirection = vec3.clone(this.velocity);
    vec3.normalize(this.velocitydirection, this.velocitydirection);


    /*
 vector v1_projected = v1 - Dot(v1, n) * n;

        lift 
        gravity
        thrust
        drag

        some moment which tries to turn plane on its Y axis to face movement
        angle of attack thrust efficency

        


    */


};

Entity.prototype.updateMatrix = function () {


    mat4.composeMatrix(this.transform, this.orientation, this.position);
    mat4.invert(this.inversetransform, this.orientation);


    return mat4.clone(this.transform);

};

/*
0  1  2  3
4  5  6  7
8  9  10 11
12 13 14 15 
*/

Entity.prototype.rotateY = function (rot) {



    // mat4.rotate(this.orientation, this.orientation, -rot, [this.orientation[4], this.orientation[5], this.orientation[6]]);

    var temp = mat4.create();

    mat4.identity(temp);

    mat4.rotate(temp, temp, -rot, [0, 1, 0]);

    mat4.multiply(this.orientation, this.orientation, temp);


};

Entity.prototype.rotateX = function (rot) {

    //mat4.rotate(this.orientation, this.orientation, -rot, [this.orientation[0], this.orientation[1], this.orientation[2]]);

    var temp = mat4.create();

    mat4.identity(temp);

    mat4.rotate(temp, temp, -rot, [1, 0, 0]);

    mat4.multiply(this.orientation, this.orientation, temp);



};

Entity.prototype.rotateZ = function (rot) {

    //mat4.rotate(this.orientation, this.orientation, -rot, [this.orientation[8], this.orientation[9], this.orientation[10]]);

    var temp = mat4.create();

    mat4.identity(temp);

    mat4.rotate(temp, temp, -rot, [0, 0, 1]);

    mat4.multiply(this.orientation, this.orientation, temp);

};

Entity.prototype.getUpVector = function () {

    return vec3.fromValues(this.orientation[1], this.orientation[4], this.orientation[8]);

};