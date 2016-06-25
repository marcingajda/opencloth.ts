///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
///<reference path="Particle.ts"/>
var Ellipsoid = (function () {
    function Ellipsoid(iStacks, iSlices, fRadius) {
        this.iStacks = iStacks;
        this.iSlices = iSlices;
        this.fRadius = fRadius;
        var ellipsoidMatrix = (TSM.mat4.identity.copy()).translate(new TSM.vec3([0, 2, 0]));
        ellipsoidMatrix.rotate(45, new TSM.vec3([1, 0, 0]));
        ellipsoidMatrix.scale(new TSM.vec3([this.fRadius, this.fRadius, this.fRadius / 2]));
        var inverseEllipsoidMatrix = ellipsoidMatrix.copy().inverse();
        this.matrix = ellipsoidMatrix;
        this.matrixInverse = inverseEllipsoidMatrix;
    }
    Ellipsoid.prototype.collision = function (points) {
        //if(fr < 165) return;
        for (var i = 0; i < points.length; i++) {
            //glm::vec4 X_0 = (inverse_ellipsoid*glm::vec4(tmp_X[i],1));
            var predictionVec4 = new TSM.vec4([points[i].coords.x, points[i].coords.y, points[i].coords.z, 1]);
            var x0 = this.matrixInverse.copy().multiplyVec4(predictionVec4);
            // glm::vec3 delta0 = glm::vec3(X_0.x, X_0.y, X_0.z) - center;
            var delta0 = (new TSM.vec3([x0.x, x0.y, x0.z])).subtract(new TSM.vec3([0, 0, 0]));
            var distance = delta0.length();
            var delta = TSM.vec3.zero.copy();
            var transformInv;
            if (distance < 1) {
                delta0 = delta0.copy().scale(this.fRadius - distance).scale(1 / distance);
                // Transform the delta back to original space
                //transformInv = glm::vec3(ellipsoid[0].x, ellipsoid[1].x, ellipsoid[2].x);
                //transformInv /= glm::dot(transformInv, transformInv);
                //delta.x = glm::dot(delta0, transformInv);
                transformInv = new TSM.vec3([this.matrix.at(0), this.matrix.at(4), this.matrix.at(8)]);
                transformInv.scale(1 / TSM.vec3.dot(transformInv, transformInv));
                delta.x = TSM.vec3.dot(delta0, transformInv);
                //transformInv = glm::vec3(ellipsoid[0].y, ellipsoid[1].y, ellipsoid[2].y);
                //transformInv /= glm::dot(transformInv, transformInv);
                //delta.y = glm::dot(delta0, transformInv);
                transformInv = new TSM.vec3([this.matrix.at(1), this.matrix.at(5), this.matrix.at(9)]);
                transformInv.scale(1 / TSM.vec3.dot(transformInv, transformInv));
                delta.y = TSM.vec3.dot(delta0, transformInv);
                //transformInv = glm::vec3(ellipsoid[0].z, ellipsoid[1].z, ellipsoid[2].z);
                //transformInv /= glm::dot(transformInv, transformInv);
                //delta.z = glm::dot(delta0, transformInv);
                transformInv = new TSM.vec3([this.matrix.at(2), this.matrix.at(6), this.matrix.at(10)]);
                transformInv.scale(1 / TSM.vec3.dot(transformInv, transformInv));
                delta.z = TSM.vec3.dot(delta0, transformInv);
                //tmp_X[i] +=  delta ;
                //V[i] = glm::vec3(0);
                points[i].coords.add(delta);
                points[i].velocity = TSM.vec3.zero.copy();
            }
        }
    };
    return Ellipsoid;
})();
//# sourceMappingURL=Ellipsoid.js.map