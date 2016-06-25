///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>

class Particle {
    coords: TSM.vec3; //position
    prediction: TSM.vec3; //prediction
    velocity:  TSM.vec3; //velocity
    force: TSM.vec3; //force
    weight: number; //inverted mass
    rotationAxisDistance: TSM.vec3; // r_i
}