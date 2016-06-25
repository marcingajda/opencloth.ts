///<reference path="Particle.ts"/>
///<reference path="../../typings/tsd.d.ts"/>

class Cloth {

    points: Particle[];
    indicies: number[];
    numX: number;
    numY: number;
    mass: number;

    public constructor(points: Particle[], indicies: number[], numX: number, numY: number, mass: number){
        this.points     = points;
        this.indicies   = indicies;
        this.numX       = numX;
        this.numY       = numY;
        this.mass       = mass;
    }

    public static createCloth(row: number, column: number, width: number, height: number){

        // cloth settings

        var numX: number            = row; //20;
        var numY: number            = column; //20; //these ar the number of quads
        var size: number            = width; //4;
        var hsize: number           = height/2; //size/2.0;

        // additional fields

        var total_points: number    = (numX+1)*(numY+1);
        var count:number            = 0;
        var v: number               = numY+1;
        var u: number               = numX+1;

        var mass: number            = 1/( total_points );

        var points: Particle[]      = _.map(Array(total_points), function(){ return new Particle(); });
        var indices: number[]       = [];

        //fill in positions
        //making a material
        for(var j = 0; j<=numY; j++) {
            for(var i = 0; i<=numX; i++) {
                points[count++].coords = new TSM.vec3([
                    + ((( i/(u-1) ) * 2 - 1)* hsize).toFixed(8),
                    + (size+1).toFixed(8),
                    + ((( j/(v-1) ) * size)).toFixed(8)
                ]);
            }
        }

        points.forEach(function(point){
            point.weight        = 1/mass;
            point.prediction    = point.coords;
            point.velocity      = new TSM.vec3([0,0,0]);
        });

        /// 2 Fixed points
        points[0].weight     = 0.0;
        points[numX].weight  = 0.0;

        //fill in indices
        //GLushort* id=&indices[0];
        var id: number = 0;
        for (i = 0; i < numY; i++) {
            for (j = 0; j < numX; j++) {
                var i0 = i * (numX+1) + j;
                var i1 = i0 + 1;
                var i2 = i0 + (numX+1);
                var i3 = i2 + 1;
                if ((j+i)%2) {
                    indices[id++] = i0; indices[id++] = i2; indices[id++] = i1;
                    indices[id++] = i1; indices[id++] = i2; indices[id++] = i3;
                } else {
                    indices[id++] = i0; indices[id++] = i2; indices[id++] = i3;
                    indices[id++] = i0; indices[id++] = i3; indices[id++] = i1;
                }
            }
        }

        return new Cloth(points, indices, numX, numY, mass);

    }
}