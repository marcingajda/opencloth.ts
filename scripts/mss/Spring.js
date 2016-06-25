///<reference path="Particle.ts"/>
var Spring = (function () {
    function Spring(a, b, ks, kd) {
        this.p1 = a;
        this.p2 = b;
        this.Ks = ks;
        this.Kd = kd;
        var deltaP = a.coords.copy().subtract(b.coords);
        this.rest_length = Math.sqrt(TSM.vec3.dot(deltaP, deltaP));
    }
    Spring.prototype.update = function () {
        var p1 = this.p1.coords;
        var p2 = this.p2.coords;
        var v1 = this.p1.velocity;
        var v2 = this.p2.velocity;
        var deltaP = p1.copy().subtract(p2);
        var deltaV = v1.copy().subtract(v2);
        //float dist = glm::length(deltaP);
        var dist = deltaP.length();
        //float leftTerm = -springs[i].Ks * (dist - springs[i].rest_length);
        var leftTerm = -this.Ks * (dist - this.rest_length);
        //float rightTerm = springs[i].Kd * (glm::dot(deltaV, deltaP) / dist);
        var rightTerm = this.Kd * (TSM.vec3.dot(deltaV, deltaP) / dist);
        //glm::vec3 springForce = (leftTerm + rightTerm)*glm::normalize(deltaP);
        var springForce = deltaP.copy().normalize().scale(leftTerm + rightTerm);
        //if (springs[i].p1 != 0 && springs[i].p1 != numX)
        //    F[springs[i].p1] += springForce;
        if (!this.p1.blocked) {
            this.p1.force.add(springForce);
        }
        if (!this.p2.blocked) {
            this.p2.force.subtract(springForce);
        }
    };
    return Spring;
}());
//# sourceMappingURL=Spring.js.map