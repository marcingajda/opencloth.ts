///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>

class Particle{

    coords: TSM.vec3;
    velocity: TSM.vec3;
    force: TSM.vec3;
    blocked: boolean;

    sumF: TSM.vec3;
    sumV: TSM.vec3;

    public constructor(){
        this.velocity = TSM.vec3.zero.copy();
        this.force = TSM.vec3.zero.copy();
    }

}