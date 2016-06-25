///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
var Particle = (function () {
    function Particle() {
        this.velocity = TSM.vec3.zero.copy();
        this.force = TSM.vec3.zero.copy();
    }
    return Particle;
}());
//# sourceMappingURL=Particle.js.map