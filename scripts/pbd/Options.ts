///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>

class Options{

    row: number;
    column: number;
    width: number;
    height: number;

    stretch: number;
    bend: number;
    damp: number;
    globalDampening: number;

    gravityX: number;
    gravityY: number;
    gravityZ: number;

    public getGravityVector(){
        return new TSM.vec3([this.gravityX, this.gravityY, this.gravityZ]);
    }

}
