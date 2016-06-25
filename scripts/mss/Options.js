///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
var Options = (function () {
    function Options() {
    }
    Options.prototype.getGravityVector = function () {
        return new TSM.vec3([this.gravityX, this.gravityY, this.gravityZ]);
    };
    return Options;
})();
//# sourceMappingURL=Options.js.map