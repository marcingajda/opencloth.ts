///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>

class Options{

    row: number;
    column: number;
    width: number;
    height: number;

    mass: number;

    KsStruct: number;
    KdStruct: number;
    KsShear: number;
    KdShear: number ;
    KsBend: number;
    KdBend: number;

    damping: number;

    gravityX: number;
    gravityY: number;
    gravityZ: number;

    public getGravityVector(){
        return new TSM.vec3([this.gravityX, this.gravityY, this.gravityZ]);
    }

}
