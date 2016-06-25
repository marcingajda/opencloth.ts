///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
///<reference path="Particle.ts"/>

class DistanceConstraint {
    
    p1: Particle;           //index aotmu w X
    p2: Particle;           // index atomu w Y
    rest_length: number;    //odleg³oœæ w spoczynku
    kStretch: number;       //sztywnoœæ
    k_prime: number;        //magiczy wzór na liniow¹ sztywnoœæ

    constructor(p1: Particle, p2: Particle, kStretch: number, solver_iterations: number){
        this.p1 = p1;
        this.p2 = p2;
        this.kStretch = kStretch;

        // c.k_prime = 1.0f-pow((1.0f-c.k), 1.0f/solver_iterations);
        this.k_prime = Math.pow(1 - this.kStretch, 1 / solver_iterations);

        if (1 - this.k_prime > 1.0) {
            this.k_prime = 1.0;
        }

        var deltaP: TSM.vec3 = this.p1.coords.copy().subtract(this.p2.coords);
        this.rest_length = deltaP.length();

    }

    update(){
        //var c:DistanceConstraint = d_constraints[i];
        var dir: TSM.vec3 = this.p1.prediction.copy().subtract(this.p2.prediction);

        var len: number = dir.length();
        if(len <= EPSILON){
            return;
        }

        var weight1: number = this.p1.weight;
        var weight2: number = this.p2.weight;
        var invMass: number = weight1 + weight2;
        if(invMass <= EPSILON){
            return;
        }

        //glm::vec3 dP = (1.0f/invMass) * (len-c.rest_length ) * (dir/len)* c.k_prime;
        var dP: TSM.vec3 =  dir.copy().scale(1/len*(1/invMass)*(len-this.rest_length)*(1 - this.k_prime));
        if(weight1 > 0.0) {
            //tmp_X[c.p1] -= dP*w1;
            this.p1.prediction.subtract(dP.copy().scale(weight1));
        }

        if(weight2 > 0.0) {
            //tmp_X[c.p2] += dP*w2;
            this.p2.prediction.add(dP.copy().scale(weight2));
        }
    }
    
}