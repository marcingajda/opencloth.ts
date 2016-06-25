///<reference path="Particle.ts"/>
///<reference path="Spring.ts"/>
///<reference path="Cloth.ts"/>
var Simulation = (function () {
    function Simulation(KsStruct, KdStruct, KsShear, KdShear, KsBend, KdBend, damping, gravity, mass) {
        this.springs = [];
        this.KsStruct = 0.5;
        this.KdStruct = -0.25;
        this.KsShear = 0.5;
        this.KdShear = -0.25;
        this.KsBend = 0.85;
        this.KdBend = -0.25;
        this.mass = 0.3;
        this.damping = -0.02;
        this.gravity = new TSM.vec3([0, -0.00981, 0]);
        this.externalCollisionHandler = function (points) { };
        this.KsStruct = KsStruct;
        this.KdStruct = KdStruct;
        this.KsShear = KsShear;
        this.KdShear = KdShear;
        this.KsBend = KsBend;
        this.KdBend = KdBend;
        this.damping = damping;
        this.gravity = gravity;
        this.mass = mass;
    }
    Simulation.prototype.setCloth = function (cloth) {
        this.cloth = cloth;
        var v = this.cloth.numY + 1;
        var u = this.cloth.numX + 1;
        //setup springs
        // Horizontal
        for (var l1 = 0; l1 < v; l1++)
            for (var l2 = 0; l2 < (u - 1); l2++) {
                this.addSpring(this.cloth.points[(l1 * u) + l2], this.cloth.points[(l1 * u) + l2 + 1], this.KsStruct, this.KdStruct);
            }
        // Vertical
        for (l1 = 0; l1 < (u); l1++)
            for (l2 = 0; l2 < (v - 1); l2++) {
                this.addSpring(this.cloth.points[(l2 * u) + l1], this.cloth.points[((l2 + 1) * u) + l1], this.KsStruct, this.KdStruct);
            }
        // Shearing Springs
        for (l1 = 0; l1 < (v - 1); l1++)
            for (l2 = 0; l2 < (u - 1); l2++) {
                this.addSpring(this.cloth.points[(l1 * u) + l2], this.cloth.points[((l1 + 1) * u) + l2 + 1], this.KsShear, this.KdShear);
                this.addSpring(this.cloth.points[((l1 + 1) * u) + l2], this.cloth.points[(l1 * u) + l2 + 1], this.KsShear, this.KdShear);
            }
        // Bend Springs
        for (l1 = 0; l1 < (v); l1++) {
            for (l2 = 0; l2 < (u - 2); l2++) {
                this.addSpring(this.cloth.points[(l1 * u) + l2], this.cloth.points[(l1 * u) + l2 + 2], this.KsBend, this.KdBend);
            }
            this.addSpring(this.cloth.points[(l1 * u) + (u - 3)], this.cloth.points[(l1 * u) + (u - 1)], this.KsBend, this.KdBend);
        }
        for (l1 = 0; l1 < (u); l1++) {
            for (l2 = 0; l2 < (v - 2); l2++) {
                this.addSpring(this.cloth.points[(l2 * u) + l1], this.cloth.points[((l2 + 2) * u) + l1], this.KsBend, this.KdBend);
            }
            this.addSpring(this.cloth.points[((v - 3) * u) + l1], this.cloth.points[((v - 1) * u) + l1], this.KsBend, this.KdBend);
        }
    };
    Simulation.prototype.getCloth = function () {
        return this.cloth;
    };
    Simulation.prototype.addSpring = function (a, b, ks, kd) {
        var spring = new Spring(a, b, ks, kd);
        this.springs.push(spring);
    };
    Simulation.prototype.computeForces = function () {
        var i;
        for (i = 0; i < this.cloth.points.length; i++) {
            this.cloth.points[i].force = TSM.vec3.zero.copy();
            //add gravity force only for non-fixed points
            if (!this.cloth.points[i].blocked) {
                //F[i] += gravity;
                this.cloth.points[i].force.add(this.gravity);
            }
            this.cloth.points[i].force.add(this.cloth.points[i].velocity.copy().scale(this.damping));
        }
        //add spring forces
        for (i = 0; i < this.springs.length; i++) {
            this.springs[i].update();
        }
    };
    Simulation.prototype.integrateEuler = function (deltaTime) {
        var deltaTimeMass = deltaTime / this.mass;
        for (var i = 0; i < this.cloth.points.length; i++) {
            var oldV = this.cloth.points[i].velocity.copy();
            this.cloth.points[i].velocity.add(this.cloth.points[i].force.copy().scale(deltaTimeMass));
            this.cloth.points[i].coords.add(oldV.copy().scale(deltaTime));
        }
    };
    Simulation.prototype.integrateMidpointEuler = function (deltaTime) {
        var halfDeltaT = deltaTime / 2;
        var deltaTimeMass = halfDeltaT / this.mass;
        for (var i = 0; i < this.cloth.points.length; i++) {
            var oldV = this.cloth.points[i].velocity.copy();
            this.cloth.points[i].velocity.add(this.cloth.points[i].force.scale(deltaTimeMass));
            this.cloth.points[i].coords.add(oldV.copy().scale(deltaTime));
        }
        this.computeForces();
        deltaTimeMass = deltaTime / this.mass;
        for (var i = 0; i < this.cloth.points.length; i++) {
            var oldV = this.cloth.points[i].velocity.copy();
            this.cloth.points[i].velocity.add(this.cloth.points[i].force.scale(deltaTimeMass));
            this.cloth.points[i].coords.add(oldV.copy().scale(deltaTime));
        }
    };
    Simulation.prototype.integrateRK4 = function (deltaTime) {
        var halfDeltaT = deltaTime / 2;
        var thirdDeltaT = 1 / 3;
        var sixthDeltaT = 1 / 6;
        var halfDeltaTimeMass = halfDeltaT / this.mass;
        var deltaTimeMass = deltaTime / this.mass;
        for (var i = 0; i < this.cloth.points.length; i++) {
            this.cloth.points[i].sumF = this.cloth.points[i].force.copy()
                .scale(halfDeltaTimeMass).scale(sixthDeltaT);
            this.cloth.points[i].sumV = this.cloth.points[i].velocity.copy()
                .scale(halfDeltaT).scale(sixthDeltaT);
        }
        this.computeForces(); //1
        for (i = 0; i < this.cloth.points.length; i++) {
            this.cloth.points[i].sumF = this.cloth.points[i].force.copy()
                .scale(halfDeltaTimeMass).scale(thirdDeltaT);
            this.cloth.points[i].sumV = this.cloth.points[i].velocity.copy()
                .scale(halfDeltaT).scale(thirdDeltaT);
        }
        this.computeForces(); //2
        for (var i = 0; i < this.cloth.points.length; i++) {
            this.cloth.points[i].sumF = this.cloth.points[i].force.copy()
                .scale(deltaTimeMass).scale(thirdDeltaT);
            this.cloth.points[i].sumV = this.cloth.points[i].velocity.copy()
                .scale(deltaTime).scale(thirdDeltaT);
        }
        this.computeForces(); //3
        for (i = 0; i < this.cloth.points.length; i++) {
            this.cloth.points[i].sumF = this.cloth.points[i].force.copy()
                .scale(deltaTimeMass).scale(sixthDeltaT);
            this.cloth.points[i].sumV = this.cloth.points[i].velocity.copy()
                .scale(deltaTime).scale(sixthDeltaT);
        }
        for (i = 0; i < this.cloth.points.length; i++) {
            //V[i] += sumF[i];
            this.cloth.points[i].velocity.add(this.cloth.points[i].sumF);
            //X[i] += sumV[i];
            this.cloth.points[i].coords.add(this.cloth.points[i].sumV);
        }
    };
    Simulation.prototype.applyProvotDynamicInverse = function () {
        for (var i = 0; i < this.springs.length; i++) {
            //check the current lengths of all springs
            var p1 = this.springs[i].p1.coords.copy();
            var p2 = this.springs[i].p2.coords.copy();
            var deltaP = p1.copy().subtract(p2);
            var dist = deltaP.length();
            if (dist > this.springs[i].rest_length * 1.2) {
                dist -= this.springs[i].rest_length;
                dist /= 2;
                deltaP = deltaP.copy().normalize();
                deltaP.scale(dist);
                if (this.springs[i].p1.blocked) {
                    //V[springs[i].p2] += deltaP;
                    this.springs[i].p2.velocity.add(deltaP);
                }
                else if (this.springs[i].p2.blocked) {
                    //V[springs[i].p1] -= deltaP;
                    this.springs[i].p1.velocity.subtract(deltaP);
                }
                else {
                    this.springs[i].p1.velocity.subtract(deltaP);
                    this.springs[i].p2.velocity.add(deltaP);
                }
            }
        }
    };
    Simulation.prototype.checkExternalCollisions = function () {
        this.externalCollisionHandler(this.cloth.points);
    };
    Simulation.prototype.makeStep = function (dt) {
        this.computeForces();
        //for Explicit/Midpoint Euler
        this.integrateEuler(dt);
        //this.integrateMidpointEuler(dt);
        //this.integrateRK4(dt);
        this.checkExternalCollisions();
        this.applyProvotDynamicInverse();
    };
    return Simulation;
}());
//# sourceMappingURL=Simulation.js.map