///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
///<reference path="../common/tsm_extra.ts"/>
///<reference path="Particle.ts"/>
///<reference path="BendingConstraint.ts"/>
///<reference path="DistanceConstraint.ts"/>
///<reference path="Ellipsoid.ts"/>
///<reference path="Cloth.ts"/>
var Simulation = (function () {
    function Simulation(kStretch, kBend, kDamp, gravity, globalDampening) {
        this.d_constraints = [];
        this.b_constraints = [];
        // settings
        this.solver_iterations = 2;
        this.kBend = 0.5;
        this.kStretch = 0.25;
        this.kDamp = 0.00125;
        this.gravity = new TSM.vec3([0, -0.01, 0]);
        this.global_dampening = 0.98;
        this.externalConstraintsHandler = function (points) { };
        this.kStretch = kStretch;
        this.kBend = kBend;
        this.kDamp = kDamp;
        this.gravity = gravity;
        this.global_dampening = globalDampening;
    }
    Simulation.prototype.getCloth = function () {
        return this.cloth;
    };
    Simulation.prototype.setCloth = function (cloth) {
        this.cloth = cloth;
        //shorthand references
        var numX = this.cloth.numX;
        var numY = this.cloth.numY;
        // helpers
        var v = numY + 1;
        var u = numX + 1;
        //setup constraints
        // Horizontal
        for (var l1 = 0; l1 < v; l1++)
            for (var l2 = 0; l2 < (u - 1); l2++) {
                this.addDistanceConstraint((l1 * u) + l2, (l1 * u) + l2 + 1);
            }
        // Vertical
        for (var l1 = 0; l1 < (u); l1++)
            for (var l2 = 0; l2 < (v - 1); l2++) {
                this.addDistanceConstraint((l2 * u) + l1, ((l2 + 1) * u) + l1);
            }
        // Shearing distance constraint
        for (var l1 = 0; l1 < (v - 1); l1++)
            for (var l2 = 0; l2 < (u - 1); l2++) {
                this.addDistanceConstraint((l1 * u) + l2, ((l1 + 1) * u) + l2 + 1);
                this.addDistanceConstraint(((l1 + 1) * u) + l2, (l1 * u) + l2 + 1);
            }
        function getIndex(i, j) {
            return j * (numX + 1) + i;
        }
        //add vertical constraints
        for (var i = 0; i <= numX; i++) {
            for (var j = 0; j < numY - 1; j++) {
                this.addBendingConstraint(getIndex(i, j), getIndex(i, (j + 1)), getIndex(i, j + 2));
            }
        }
        //add horizontal constraints
        for (var i = 0; i < numX - 1; i++) {
            for (var j = 0; j <= numY; j++) {
                this.addBendingConstraint(getIndex(i, j), getIndex(i + 1, j), getIndex(i + 2, j));
            }
        }
        console.info('distance: ', this.d_constraints.length);
        console.info('bending: ', this.b_constraints.length);
    };
    // helper methods
    Simulation.prototype.addDistanceConstraint = function (a, b) {
        var c = new DistanceConstraint(this.cloth.points[a], this.cloth.points[b], this.kStretch, this.solver_iterations);
        this.d_constraints.push(c);
    };
    Simulation.prototype.addBendingConstraint = function (pa, pb, pc) {
        var c = new BendingConstraint(this.cloth.points[pa], this.cloth.points[pb], this.cloth.points[pc], this.kBend, this.solver_iterations);
        this.b_constraints.push(c);
    };
    // Core simulation methods
    Simulation.prototype.computeForces = function () {
        for (var i = 0; i < this.cloth.points.length; i++) {
            this.cloth.points[i].force = new TSM.vec3([0, 0, 0]);
            //add this.gravity force
            if (this.cloth.points[i].weight > 0) {
                this.cloth.points[i].force.add(this.gravity.copy());
            }
        }
    };
    Simulation.prototype.integrateExplicitWithDamping = function (deltaTime) {
        var coordsMassCenter = new TSM.vec3([0, 0, 0]);
        var velocityMassCenter = new TSM.vec3([0, 0, 0]);
        var sumMass = 0;
        for (var i = 0; i < this.cloth.points.length; i++) {
            //V[i] *= global_dampening;
            this.cloth.points[i].velocity.scale(this.global_dampening); //global velocity dampening !!!
            //V[i] = V[i] + (F[i]*deltaTime)*W[i];
            this.cloth.points[i].velocity.add(this.cloth.points[i].force
                .copy()
                .scale(deltaTime)
                .scale(this.cloth.points[i].weight));
            //calculate the center of this.cloth.mass's position
            //and velocity for damping calc
            //Xcm += (X[i]*this.cloth.mass);
            coordsMassCenter.add(this.cloth.points[i].coords.copy().scale(this.cloth.mass));
            //Vcm += (V[i]*this.cloth.mass);
            velocityMassCenter.add(this.cloth.points[i].velocity.copy().scale(this.cloth.mass));
            //sumM += this.cloth.mass;
            sumMass += this.cloth.mass;
        }
        //Xcm /= sumM;
        coordsMassCenter.scale(1 / sumMass);
        //Vcm /= sumM;
        velocityMassCenter.scale(1 / sumMass);
        var I = TSM.mat3.identity.copy();
        var L = TSM.vec3.zero.copy();
        var omega = TSM.vec3.zero.copy(); //angular velocity
        for (i = 0; i < this.cloth.points.length; i++) {
            //Ri[i] = (X[i] - Xcm);
            this.cloth.points[i].rotationAxisDistance = this.cloth.points[i].coords.copy().subtract(coordsMassCenter);
            //L += glm::cross(Ri[i],this.cloth.mass*V[i]);
            L.add(TSM.vec3.cross(this.cloth.points[i].rotationAxisDistance, this.cloth.points[i].velocity.copy().scale(this.cloth.mass)));
            var rad = this.cloth.points[i].rotationAxisDistance;
            var inertiaMatrix = new TSM.mat3([
                0, -rad.z, rad.y,
                rad.z, 0, -rad.x,
                -rad.y, rad.x, 0
            ]);
            //I +=(tmp*glm::transpose(tmp))*this.cloth.mass;
            var res = inertiaMatrix.copy().multiply(inertiaMatrix.copy().transpose());
            res = TSMExtra.scalMat3(res, this.cloth.mass);
            I = TSMExtra.addMat3(I, res);
        }
        omega = I.copy().inverse().multiplyVec3(L);
        //apply center of this.cloth.mass damping
        for (i = 0; i < this.cloth.points.length; i++) {
            var velocityDelta = velocityMassCenter
                .copy()
                .add(TSM.vec3.cross(this.cloth.points[i].rotationAxisDistance.copy(), omega.copy()))
                .subtract(this.cloth.points[i].velocity);
            if (i == 300) {
                console.log(this.cloth.points[i].velocity.xyz, velocityDelta.xyz);
            }
            this.cloth.points[i].velocity.add(velocityDelta.copy().scale(this.kDamp));
        }
        //calculate predicted position
        for (i = 0; i < this.cloth.points.length; i++) {
            if (this.cloth.points[i].weight <= 0.0) {
                this.cloth.points[i].prediction = this.cloth.points[i].coords.copy(); //fixed this.cloth.points
            }
            else {
                this.cloth.points[i].prediction = this.cloth.points[i].coords.copy()
                    .add(this.cloth.points[i].velocity.copy().scale(deltaTime));
            }
        }
    };
    Simulation.prototype.updateParticles = function (deltaTime) {
        var inv_dt = 1.0 / deltaTime;
        for (var i = 0; i < this.cloth.points.length; i++) {
            this.cloth.points[i].velocity = this.cloth.points[i].prediction.copy()
                .subtract(this.cloth.points[i].coords).scale(inv_dt);
            this.cloth.points[i].coords = this.cloth.points[i].prediction.copy();
        }
    };
    Simulation.prototype.updateExternalConstraints = function () {
        this.externalConstraintsHandler(this.cloth.points);
    };
    Simulation.prototype.updateInternalConstraints = function (deltaTime) {
        for (var si = 0; si < this.solver_iterations; ++si) {
            for (var i = 0; i < this.d_constraints.length; i++) {
                this.d_constraints[i].update();
            }
            for (var i = 0; i < this.b_constraints.length; i++) {
                this.b_constraints[i].update();
            }
        }
    };
    Simulation.prototype.makeStep = function (dt) {
        this.computeForces();
        this.integrateExplicitWithDamping(dt);
        this.updateInternalConstraints(dt);
        this.updateExternalConstraints();
        this.updateParticles(dt);
    };
    return Simulation;
}());
//# sourceMappingURL=Simulation.js.map