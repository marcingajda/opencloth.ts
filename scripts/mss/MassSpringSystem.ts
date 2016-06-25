///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
///<reference path="../common/tsm_extra.ts"/>
///<reference path="../common/webgl.d.ts"/>
///<reference path="../../typings/tsd.d.ts"/>
///<reference path="Simulation.ts"/>
///<reference path="Scene.ts"/>
///<reference path="Cloth.ts"/>
///<reference path="Options.ts"/>

class MassSpringSystem{

    mssSimulation: Simulation;
    scene: Scene;
    request: any;

    public simulate(options: Options){

        var clothModel = Cloth.createCloth(options.row, options.column, options.width, options.height, options.mass);

        this.mssSimulation = new Simulation(
            options.KsStruct,
            options.KdStruct,
            options.KsShear,
            options.KdShear,
            options.KsBend,
            options.KdBend,
            options.damping,
            options.getGravityVector(),
            options.mass
        );
        
        this.mssSimulation.setCloth(clothModel);

        this.scene = new Scene();
        this.scene.buildScene();
        this.scene.setCloth(clothModel);

        this.mssSimulation.externalCollisionHandler = (function(points: Particle[]){
            this.scene.ellipsoid.collision(points);
            points.forEach(function(point){
                if(point.coords.y<0){
                    point.coords.y = 0;
                }
            });
        }).bind(this);


        this.render();

    }

    xyz: number = 0;

    public render(){
        this.xyz++;
        for(var i: number = 0; i<6; i++){
            this.mssSimulation.makeStep(1/30);
        }
        
        this.scene.setCloth(this.mssSimulation.getCloth());
        this.scene.updateView();
        //setTimeout(this.render.bind(this), 1000/60);
        this.request = requestAnimationFrame( this.render.bind(this) );
    }

    public destroy(){
        this.scene = null;
        this.mssSimulation = null;
        cancelAnimationFrame(this.request);
    }

}