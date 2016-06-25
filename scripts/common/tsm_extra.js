///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
var TSMExtra = (function () {
    function TSMExtra() {
    }
    TSMExtra.scalMat3 = function (mat, x) {
        var values = mat.all();
        return new TSM.mat3([
            values[0] * x,
            values[1] * x,
            values[2] * x,
            values[3] * x,
            values[4] * x,
            values[5] * x,
            values[6] * x,
            values[7] * x,
            values[8] * x
        ]);
    };
    TSMExtra.addMat3 = function (m1, m2) {
        var values1 = m1.all();
        var values2 = m2.all();
        return new TSM.mat3([
            values1[0] + values2[0],
            values1[1] + values2[1],
            values1[2] + values2[2],
            values1[3] + values2[3],
            values1[4] + values2[4],
            values1[5] + values2[5],
            values1[6] + values2[6],
            values1[7] + values2[7],
            values1[8] + values2[8]
        ]);
    };
    TSMExtra.Mat4Of = function (x) {
        return new TSM.mat4([
            x, x, x, x,
            x, x, x, x,
            x, x, x, x,
            x, x, x, x,
        ]);
    };
    TSMExtra.Mat3Of = function (x) {
        return new TSM.mat3([
            x, x, x,
            x, x, x,
            x, x, x
        ]);
    };
    return TSMExtra;
}());
//# sourceMappingURL=tsm_extra.js.map