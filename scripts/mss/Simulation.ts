///<reference path="Particle.ts"/>
///<reference path="Spring.ts"/>
///<reference path="Cloth.ts"/>

class Simulation{

    springs: Spring[] = [];

    cloth: Cloth;

    KsStruct: number =  0.5;
    KdStruct: number =  -0.25;
    KsShear: number =  0.5;
    KdShear: number =  -0.25;
    KsBend: number =  0.85;
    KdBend: number =  -0.25;
    mass: number = 0.3;
    damping: number = -0.02;
    gravity: TSM.vec3 = new TSM.vec3([0,-0.00981,0]);

    public constructor(
        KsStruct: number,
        KdStruct: number,
        KsShear: number,
        KdShear: number,
        KsBend: number,
        KdBend: number,
        damping: number,
        gravity: TSM.vec3,
        mass: number
    ){
        this.KsStruct           = KsStruct;
        this.KdStruct           = KdStruct;
        this.KsShear            = KsShear;
        this.KdShear            = KdShear;
        this.KsBend             = KsBend;
        this.KdBend             = KdBend;
        this.damping            = damping;
        this.gravity            = gravity;
        this.mass               = mass;
    }

    public setCloth(cloth: Cloth){

        this.cloth = cloth;

        var v = this.cloth.numY + 1;
        var u = this.cloth.numX + 1;

        //setup springs
        // Horizontal
        for (var l1 = 0; l1 < v; l1++)	// v
            for (var l2 = 0; l2 < (u - 1); l2++) {
                this.addSpring(
                    this.cloth.points[(l1 * u) + l2],
                    this.cloth.points[(l1 * u) + l2 + 1],
                    this.KsStruct, this.KdStruct
                );
            }

        // Vertical
        for (l1 = 0; l1 < (u); l1++)
            for (l2 = 0; l2 < (v - 1); l2++) {
                this.addSpring(
                    this.cloth.points[(l2 * u) + l1],
                    this.cloth.points[((l2 + 1) * u) + l1],
                    this.KsStruct, this.KdStruct
                );
            }

        // Shearing Springs
        for (l1 = 0; l1 < (v - 1); l1++)
            for (l2 = 0; l2 < (u - 1); l2++) {
                this.addSpring(
                    this.cloth.points[(l1 * u) + l2],
                    this.cloth.points[((l1 + 1) * u) + l2 + 1],
                    this.KsShear, this.KdShear
                );
                this.addSpring(
                    this.cloth.points[((l1 + 1) * u) + l2],
                    this.cloth.points[(l1 * u) + l2 + 1],
                    this.KsShear, this.KdShear
                );
            }

        // Bend Springs
        for (l1 = 0; l1 < (v); l1++) {
            for (l2 = 0; l2 < (u - 2); l2++) {
                this.addSpring(
                    this.cloth.points[(l1 * u) + l2],
                    this.cloth.points[(l1 * u) + l2 + 2],
                    this.KsBend, this.KdBend
                );
            }
            this.addSpring(
                this.cloth.points[(l1 * u) + (u - 3)],
                this.cloth.points[(l1 * u) + (u - 1)],
                this.KsBend, this.KdBend
            );
        }

        for (l1 = 0; l1 < (u); l1++) {
            for (l2 = 0; l2 < (v - 2); l2++) {
                this.addSpring(
                    this.cloth.points[(l2 * u) + l1],
                    this.cloth.points[((l2 + 2) * u) + l1],
                    this.KsBend, this.KdBend
                );
            }
            this.addSpring(
                this.cloth.points[((v - 3) * u) + l1],
                this.cloth.points[((v - 1) * u) + l1],
                this.KsBend, this.KdBend
            );
        }

    }

    public getCloth(){
        return this.cloth;
    }

    private addSpring(a: Particle, b: Particle, ks: number, kd: number) {
        var spring: Spring = new Spring(a, b, ks, kd);
        this.springs.push(spring);
    }

    private computeForces(){
        var i: number;
        for(i=0;i<this.cloth.points.length;i++){
            this.cloth.points[i].force = TSM.vec3.zero.copy();

            //add gravity force only for non-fixed points
            if(!this.cloth.points[i].blocked) {
                //F[i] += gravity;
                this.cloth.points[i].force.add(this.gravity);
            }

            this.cloth.points[i].force.add(
                this.cloth.points[i].velocity.copy().scale(this.damping)
            );

        }

        //add spring forces
        for(i=0;i<this.springs.length;i++) {
            this.springs[i].update();
        }
    }

    protected integrateEuler(deltaTime: number){

        var deltaTimeMass: number = deltaTime/this.mass;

        for(var i: number = 0; i<this.cloth.points.length; i++){

            var oldV: TSM.vec3 = this.cloth.points[i].velocity.copy();
            this.cloth.points[i].velocity.add(this.cloth.points[i].force.copy().scale(deltaTimeMass));
            this.cloth.points[i].coords.add(oldV.copy().scale(deltaTime));

        }

    }

    protected integrateMidpointEuler(deltaTime: number) {
        var halfDeltaT: number = deltaTime / 2;

        var deltaTimeMass = halfDeltaT / this.mass;

        for (var i = 0; i<this.cloth.points.length; i++) {
            var oldV: TSM.vec3 = this.cloth.points[i].velocity.copy();
            this.cloth.points[i].velocity.add(this.cloth.points[i].force.scale(deltaTimeMass));
            this.cloth.points[i].coords.add(oldV.copy().scale(deltaTime));
        }

        this.computeForces();

        deltaTimeMass = deltaTime / this.mass;

        for (var i = 0; i < this.cloth.points.length; i++) {
            var oldV: TSM.vec3 = this.cloth.points[i].velocity.copy();
            this.cloth.points[i].velocity.add(this.cloth.points[i].force.scale(deltaTimeMass));
            this.cloth.points[i].coords.add(oldV.copy().scale(deltaTime));
        }

    }

    protected integrateRK4(deltaTime: number) {
        var halfDeltaT: number = deltaTime / 2;
        var thirdDeltaT: number = 1 / 3;
        var sixthDeltaT: number = 1 / 6;
        var halfDeltaTimeMass: number = halfDeltaT / this.mass;
        var deltaTimeMass: number = deltaTime / this.mass;

        for (var i: number = 0; i<this.cloth.points.length; i++) {
            this.cloth.points[i].sumF = this.cloth.points[i].force.copy()
                .scale(halfDeltaTimeMass).scale(sixthDeltaT);
            this.cloth.points[i].sumV = this.cloth.points[i].velocity.copy()
                .scale(halfDeltaT).scale(sixthDeltaT);
        }

        this.computeForces(); //1

        for (i = 0; i<this.cloth.points.length; i++) {
            this.cloth.points[i].sumF = this.cloth.points[i].force.copy()
                .scale(halfDeltaTimeMass).scale(thirdDeltaT);
            this.cloth.points[i].sumV = this.cloth.points[i].velocity.copy()
                .scale(halfDeltaT).scale(thirdDeltaT);
        }

        this.computeForces(); //2

        for (var i = 0; i<this.cloth.points.length; i++) {
            this.cloth.points[i].sumF = this.cloth.points[i].force.copy()
                .scale(deltaTimeMass).scale(thirdDeltaT);
            this.cloth.points[i].sumV = this.cloth.points[i].velocity.copy()
                .scale(deltaTime).scale(thirdDeltaT);
        }

        this.computeForces(); //3

        for (i = 0; i<this.cloth.points.length; i++) {
            this.cloth.points[i].sumF = this.cloth.points[i].force.copy()
                .scale(deltaTimeMass).scale(sixthDeltaT);
            this.cloth.points[i].sumV = this.cloth.points[i].velocity.copy()
                .scale(deltaTime).scale(sixthDeltaT);
        }

        for (i = 0; i<this.cloth.points.length; i++) {
            //V[i] += sumF[i];
            this.cloth.points[i].velocity.add(this.cloth.points[i].sumF);
            //X[i] += sumV[i];
            this.cloth.points[i].coords.add(this.cloth.points[i].sumV);
        }

    }

    protected applyProvotDynamicInverse(){

        for (var i: number = 0; i<this.springs.length; i++) {
            //check the current lengths of all springs
            var p1: TSM.vec3 = this.springs[i].p1.coords.copy();
            var p2: TSM.vec3 = this.springs[i].p2.coords.copy();
            var deltaP: TSM.vec3 = p1.copy().subtract(p2);
            var dist: number = deltaP.length();
            if(dist>this.springs[i].rest_length * 1.2){
                dist -= this.springs[i].rest_length;
                dist /= 2;
                deltaP = deltaP.copy().normalize();
                deltaP.scale(dist);
                if(this.springs[i].p1.blocked){
                    //V[springs[i].p2] += deltaP;
                    this.springs[i].p2.velocity.add(deltaP);
                } else if(this.springs[i].p2.blocked){
                    //V[springs[i].p1] -= deltaP;
                    this.springs[i].p1.velocity.subtract(deltaP);
                } else {
                    this.springs[i].p1.velocity.subtract(deltaP);
                    this.springs[i].p2.velocity.add(deltaP);
                }

            }
        }

    }

    externalCollisionHandler = function(points: Particle[]){};

    public checkExternalCollisions(){
        this.externalCollisionHandler(this.cloth.points);
    }

    public makeStep(dt: number){

        this.computeForces();
        //for Explicit/Midpoint Euler
        this.integrateEuler(dt);
        //this.integrateMidpointEuler(dt);
        //this.integrateRK4(dt);

        this.checkExternalCollisions();
        this.applyProvotDynamicInverse();

    }


}