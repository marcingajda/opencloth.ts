///<reference path="Particle.ts"/>
///<reference path="../../typings/tsd.d.ts"/>
var Cloth = (function () {
    function Cloth(points, indicies, numX, numY, mass) {
        this.points = points;
        this.indicies = indicies;
        this.numX = numX;
        this.numY = numY;
        this.mass = mass;
    }
    Cloth.createCloth = function (row, column, width, height) {
        // cloth settings
        var numX = row; //20;
        var numY = column; //20; //these ar the number of quads
        var size = width; //4;
        var hsize = height / 2; //size/2.0;
        // additional fields
        var total_points = (numX + 1) * (numY + 1);
        var count = 0;
        var v = numY + 1;
        var u = numX + 1;
        var mass = 1 / (total_points);
        var points = _.map(Array(total_points), function () { return new Particle(); });
        var indices = [];
        //fill in positions
        //making a material
        for (var j = 0; j <= numY; j++) {
            for (var i = 0; i <= numX; i++) {
                points[count++].coords = new TSM.vec3([
                    +(((i / (u - 1)) * 2 - 1) * hsize).toFixed(8),
                    +(size + 1).toFixed(8),
                    +(((j / (v - 1)) * size)).toFixed(8)
                ]);
            }
        }
        points.forEach(function (point) {
            point.weight = 1 / mass;
            point.prediction = point.coords;
            point.velocity = new TSM.vec3([0, 0, 0]);
        });
        /// 2 Fixed points
        points[0].weight = 0.0;
        points[numX].weight = 0.0;
        //fill in indices
        //GLushort* id=&indices[0];
        var id = 0;
        for (i = 0; i < numY; i++) {
            for (j = 0; j < numX; j++) {
                var i0 = i * (numX + 1) + j;
                var i1 = i0 + 1;
                var i2 = i0 + (numX + 1);
                var i3 = i2 + 1;
                if ((j + i) % 2) {
                    indices[id++] = i0;
                    indices[id++] = i2;
                    indices[id++] = i1;
                    indices[id++] = i1;
                    indices[id++] = i2;
                    indices[id++] = i3;
                }
                else {
                    indices[id++] = i0;
                    indices[id++] = i2;
                    indices[id++] = i3;
                    indices[id++] = i0;
                    indices[id++] = i3;
                    indices[id++] = i1;
                }
            }
        }
        return new Cloth(points, indices, numX, numY, mass);
    };
    return Cloth;
}());
//# sourceMappingURL=Cloth.js.map