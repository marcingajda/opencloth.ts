///<reference path="Particle.ts"/>

class Spring{
        p1: Particle;
        p2: Particle;
        rest_length: number;
        Ks: number;
        Kd: number;

    public constructor(a: Particle, b: Particle, ks: number, kd: number){
        this.p1 = a;
        this.p2 = b;
        this.Ks = ks;
        this.Kd = kd;
        var deltaP: TSM.vec3 = a.coords.copy().subtract(b.coords);
        this.rest_length = Math.sqrt(TSM.vec3.dot(deltaP, deltaP));
    }
    
    public update(){
        var p1: TSM.vec3 = this.p1.coords;
        var p2: TSM.vec3 = this.p2.coords;

        var v1: TSM.vec3 = this.p1.velocity;
        var v2: TSM.vec3 = this.p2.velocity;

        var deltaP: TSM.vec3 = p1.copy().subtract(p2);
        var deltaV: TSM.vec3 = v1.copy().subtract(v2);

        //float dist = glm::length(deltaP);
        var dist: number = deltaP.length();

        //float leftTerm = -springs[i].Ks * (dist - springs[i].rest_length);
        var leftTerm: number = -this.Ks * (dist-this.rest_length);
        //float rightTerm = springs[i].Kd * (glm::dot(deltaV, deltaP) / dist);
        var rightTerm: number = this.Kd * (TSM.vec3.dot(deltaV, deltaP) / dist);

        //glm::vec3 springForce = (leftTerm + rightTerm)*glm::normalize(deltaP);
        var springForce: TSM.vec3 = deltaP.copy().normalize().scale(leftTerm + rightTerm);

        //if (springs[i].p1 != 0 && springs[i].p1 != numX)
        //    F[springs[i].p1] += springForce;
        if(!this.p1.blocked){
            this.p1.force.add(springForce);
        }
        if(!this.p2.blocked){
            this.p2.force.subtract(springForce);
        }
    }
}