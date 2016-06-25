///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
///<reference path="../common/tsm_extra.ts"/>
///<reference path="Particle.ts"/>
///<reference path="BendingConstraint.ts"/>
///<reference path="DistanceConstraint.ts"/>
///<reference path="Ellipsoid.ts"/>
///<reference path="Cloth.ts"/>



class Simulation{

    // collections

    cloth: Cloth;
    d_constraints: DistanceConstraint[] = [];
    b_constraints: BendingConstraint[]  = [];

    // settings

    solver_iterations: number   = 2;
    kBend: number               = 0.5;
    kStretch: number            = 0.25;
    kDamp: number               = 0.00125;
    gravity:TSM.vec3            = new TSM.vec3([0, -0.01 ,0]);
    global_dampening: number    = 0.98;

    public constructor(kStretch: number, kBend: number, kDamp: number, gravity: TSM.vec3, globalDampening: number){
        this.kStretch           = kStretch;
        this.kBend              = kBend;
        this.kDamp              = kDamp;
        this.gravity            = gravity;
        this.global_dampening   = globalDampening;
    }

    public getCloth(){
        return this.cloth;
    }

    public setCloth(cloth: Cloth){

        this.cloth          = cloth;

        //shorthand references

        var numX            = this.cloth.numX;
        var numY            = this.cloth.numY;

        // helpers

        var v: number       = numY+1;
        var u: number       = numX+1;

        //setup constraints

        // Horizontal
        for (var l1 = 0; l1 < v; l1++)	// v
            for (var l2 = 0; l2 < (u - 1); l2++) {
                this.addDistanceConstraint((l1 * u) + l2,(l1 * u) + l2 + 1);
            }

        // Vertical
        for (var l1 = 0; l1 < (u); l1++)
            for (var l2 = 0; l2 < (v - 1); l2++) {
                this.addDistanceConstraint((l2 * u) + l1,((l2 + 1) * u) + l1);
            }

        // Shearing distance constraint
        for (var l1 = 0; l1 < (v - 1); l1++)
            for (var l2 = 0; l2 < (u - 1); l2++) {
                this.addDistanceConstraint((l1 * u) + l2,((l1 + 1) * u) + l2 + 1);
                this.addDistanceConstraint(((l1 + 1) * u) + l2,(l1 * u) + l2 + 1);
            }

        function getIndex(i:number, j:number):number {
            return j * (numX + 1) + i;
        }

        //add vertical constraints
        for(var i=0;i<=numX;i++) {
            for(var j=0;j<numY-1 ;j++) {
                this.addBendingConstraint(getIndex(i,j), getIndex(i,(j+1)), getIndex(i,j+2));
            }
        }

        //add horizontal constraints
        for(var i=0;i<numX-1;i++) {
            for(var j=0;j<=numY;j++) {
                this.addBendingConstraint(getIndex(i,j), getIndex(i+1,j), getIndex(i+2,j));
            }
        }

        console.info('distance: ', this.d_constraints.length);
        console.info('bending: ', this.b_constraints.length);

    }
    
    externalConstraintsHandler  = function(points: Particle[]){};
    
    // helper methods

    private addDistanceConstraint(a:number, b:number) {
        var c = new DistanceConstraint(
            this.cloth.points[a],
            this.cloth.points[b],
            this.kStretch,
            this.solver_iterations
        );
        this.d_constraints.push(c);
    }

    private addBendingConstraint(pa:number, pb:number, pc:number) {
        var c = new BendingConstraint(
            this.cloth.points[pa],
            this.cloth.points[pb],
            this.cloth.points[pc],
            this.kBend,
            this.solver_iterations
        );
        this.b_constraints.push(c);
    }

    // Core simulation methods

    private computeForces() {
        for (var i = 0; i < this.cloth.points.length; i++) {
            this.cloth.points[i].force = new TSM.vec3([0, 0, 0]);
            //add this.gravity force
            if (this.cloth.points[i].weight > 0) {
                this.cloth.points[i].force.add(this.gravity.copy());
            }
        }
    }

    private integrateExplicitWithDamping(deltaTime:number) {
        var coordsMassCenter:TSM.vec3 = new TSM.vec3([0, 0, 0]);
        var velocityMassCenter:TSM.vec3 = new TSM.vec3([0, 0, 0]);

        var sumMass:number = 0;

        for (var i = 0; i < this.cloth.points.length; i++) {

            //V[i] *= global_dampening;
            this.cloth.points[i].velocity.scale(this.global_dampening); //global velocity dampening !!!

            //V[i] = V[i] + (F[i]*deltaTime)*W[i];
            this.cloth.points[i].velocity.add(
                this.cloth.points[i].force
                    .copy()
                    .scale(deltaTime)
                    .scale(this.cloth.points[i].weight)
            );

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

        var I:TSM.mat3 = TSM.mat3.identity.copy();
        var L:TSM.vec3 = TSM.vec3.zero.copy();
        var omega:TSM.vec3 = TSM.vec3.zero.copy(); //angular velocity

        for (i = 0; i < this.cloth.points.length; i++) {
            //Ri[i] = (X[i] - Xcm);
            this.cloth.points[i].rotationAxisDistance = this.cloth.points[i].coords.copy().subtract(coordsMassCenter);

            //L += glm::cross(Ri[i],this.cloth.mass*V[i]);
            L.add(TSM.vec3.cross(
                this.cloth.points[i].rotationAxisDistance,
                this.cloth.points[i].velocity.copy().scale(this.cloth.mass)
            ));

            var rad = this.cloth.points[i].rotationAxisDistance;
            var inertiaMatrix: TSM.mat3 = new TSM.mat3([
                0,          -rad.z, rad.y,
                rad.z,      0,      - rad.x,
                - rad.y,    rad.x,  0
            ]);

            //I +=(tmp*glm::transpose(tmp))*this.cloth.mass;

            var res = inertiaMatrix.copy().multiply( inertiaMatrix.copy().transpose() );
            res = TSMExtra.scalMat3(res, this.cloth.mass);
            I = TSMExtra.addMat3(I, res);

        }

        omega = I.copy().inverse().multiplyVec3(L);

        //apply center of this.cloth.mass damping
        for(i=0;i<this.cloth.points.length;i++) {
            var velocityDelta:TSM.vec3 = velocityMassCenter
                .copy()
                .add(TSM.vec3.cross(
                    this.cloth.points[i].rotationAxisDistance.copy(),
                    omega.copy()
                ))
                .subtract(this.cloth.points[i].velocity);
            if(i==300){
                console.log(this.cloth.points[i].velocity.xyz, velocityDelta.xyz);
            }
            this.cloth.points[i].velocity.add(velocityDelta.copy().scale(this.kDamp));
        }

        //calculate predicted position
        for(i=0;i<this.cloth.points.length;i++) {
            if(this.cloth.points[i].weight <= 0.0) {
                this.cloth.points[i].prediction = this.cloth.points[i].coords.copy(); //fixed this.cloth.points
            } else {
                this.cloth.points[i].prediction = this.cloth.points[i].coords.copy()
                                                .add(this.cloth.points[i].velocity.copy().scale(deltaTime));
            }
        }
    }

    private updateParticles(deltaTime: number) {
        var inv_dt: number = 1.0/deltaTime;
        for(var i=0;i<this.cloth.points.length;i++) {
            this.cloth.points[i].velocity = this.cloth.points[i].prediction.copy()
                                                .subtract(this.cloth.points[i].coords).scale(inv_dt);
            this.cloth.points[i].coords = this.cloth.points[i].prediction.copy();
        }
    }

    private updateExternalConstraints() {
        this.externalConstraintsHandler(this.cloth.points);
    }

    private updateInternalConstraints(deltaTime: number) {
        for (var si=0; si<this.solver_iterations; ++si) {
            for(var i=0;i<this.d_constraints.length;i++) {
                this.d_constraints[i].update();
            }
            for(var i=0;i<this.b_constraints.length;i++) {
                this.b_constraints[i].update();
            }
        }
    }

    public makeStep(dt: number) {
        this.computeForces();
        this.integrateExplicitWithDamping(dt);
        this.updateInternalConstraints(dt);
        this.updateExternalConstraints();
        this.updateParticles(dt);
    }
}
