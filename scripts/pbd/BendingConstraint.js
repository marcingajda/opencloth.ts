///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
///<reference path="Particle.ts"/>
var BendingConstraint = (function () {
    function BendingConstraint(pa, pb, pc, kBend, solver_iterations) {
        this.p1 = pa;
        this.p2 = pb;
        this.p3 = pc;
        this.kBend = kBend;
        this.w = pa.weight + pb.weight + 2 * pc.weight;
        var center = pa.coords.copy().add(pb.coords).add(pc.coords).scale(0.3333);
        this.rest_length = pc.coords.copy().subtract(center).length();
        this.k_prime = Math.pow((1.0 - this.kBend), (1.0 / solver_iterations));
        if (1 - this.k_prime > 1.0) {
            this.k_prime = 1.0;
        }
    }
    BendingConstraint.prototype.update = function () {
        //var c:BendingConstraint = b_constraints[index];
        //glm::vec3 center = 0.3333f * (tmp_X[c.p1] + tmp_X[c.p2] + tmp_X[c.p3]);
        var center = this.p1.prediction
            .copy()
            .add(this.p2.prediction)
            .add(this.p3.prediction)
            .scale(0.3333);
        //glm::vec3 dir_center = tmp_X[c.p3]-center;
        var dir_center = this.p3.prediction.copy().subtract(center);
        var dist_center = dir_center.length();
        var diff = 1.0 - (this.rest_length / dist_center);
        var dir_force = dir_center.scale(diff);
        var fa = dir_force.copy().scale((1 - this.k_prime) * ((2 * this.p1.weight) / this.w));
        var fb = dir_force.copy().scale((1 - this.k_prime) * ((2 * this.p2.weight) / this.w));
        var fc = dir_force.copy().scale(-(1 - this.k_prime) * ((4 * this.p3.weight) / this.w));
        if (this.p1.weight > 0.0) {
            this.p1.prediction.add(fa);
        }
        if (this.p2.weight > 0.0) {
            this.p2.prediction.add(fb);
        }
        if (this.p3.weight > 0.0) {
            this.p3.prediction.add(fc);
        }
    };
    return BendingConstraint;
}());
//# sourceMappingURL=BendingConstraint.js.map