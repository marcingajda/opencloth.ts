///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
///<reference path="Particle.ts"/>
var DistanceConstraint = (function () {
    function DistanceConstraint(p1, p2, kStretch, solver_iterations) {
        this.p1 = p1;
        this.p2 = p2;
        this.kStretch = kStretch;
        // c.k_prime = 1.0f-pow((1.0f-c.k), 1.0f/solver_iterations);
        this.k_prime = Math.pow(1 - this.kStretch, 1 / solver_iterations);
        if (1 - this.k_prime > 1.0) {
            this.k_prime = 1.0;
        }
        var deltaP = this.p1.coords.copy().subtract(this.p2.coords);
        this.rest_length = deltaP.length();
    }
    DistanceConstraint.prototype.update = function () {
        //var c:DistanceConstraint = d_constraints[i];
        var dir = this.p1.prediction.copy().subtract(this.p2.prediction);
        var len = dir.length();
        if (len <= EPSILON) {
            return;
        }
        var weight1 = this.p1.weight;
        var weight2 = this.p2.weight;
        var invMass = weight1 + weight2;
        if (invMass <= EPSILON) {
            return;
        }
        //glm::vec3 dP = (1.0f/invMass) * (len-c.rest_length ) * (dir/len)* c.k_prime;
        var dP = dir.copy().scale(1 / len * (1 / invMass) * (len - this.rest_length) * (1 - this.k_prime));
        if (weight1 > 0.0) {
            //tmp_X[c.p1] -= dP*w1;
            this.p1.prediction.subtract(dP.copy().scale(weight1));
        }
        if (weight2 > 0.0) {
            //tmp_X[c.p2] += dP*w2;
            this.p2.prediction.add(dP.copy().scale(weight2));
        }
    };
    return DistanceConstraint;
}());
//# sourceMappingURL=DistanceConstraint.js.map