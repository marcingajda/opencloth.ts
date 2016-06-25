///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
///<reference path="../common/tsm_extra.ts"/>
///<reference path="Simulation.ts"/>
///<reference path="../common/webgl.d.ts"/>
///<reference path="../../typings/tsd.d.ts"/>
///<reference path="Particle.ts"/>
///<reference path="Scene.ts"/>
///<reference path="Ellipsoid.ts"/>
///<reference path="Options.ts"/>
var PI = 3.1415926536;
var EPSILON = 0.0000001;
var PositionBasedDynamics = (function () {
    function PositionBasedDynamics() {
        this.time = 0;
        this.lastNo = 0;
    }
    PositionBasedDynamics.prototype.simulate = function (options) {
        var clothModel = Cloth.createCloth(options.row, options.column, options.width, options.height);
        this.pbdSimulation = new Simulation(options.stretch, options.bend, options.damp, options.getGravityVector(), options.globalDampening);
        this.pbdSimulation.setCloth(clothModel);
        this.sceneModel = new Scene();
        this.sceneModel.buildScene();
        this.sceneModel.setCloth(clothModel);
        this.pbdSimulation.externalConstraintsHandler = (function (points) {
            this.sceneModel.ellipsoid.collision(points);
            //ground collision
            for (var i = 0; i < points.length; i++) {
                if (points[i].prediction.y < 0) {
                    points[i].prediction.y = 0;
                }
            }
        }).bind(this);
        this.render();
    };
    PositionBasedDynamics.prototype.render = function () {
        this.time = +new Date;
        this.pbdSimulation.makeStep(1 / 60);
        this.sceneModel.setCloth(this.pbdSimulation.getCloth());
        this.sceneModel.updateView();
        this.request = requestAnimationFrame(this.render.bind(this));
    };
    PositionBasedDynamics.prototype.destroy = function () {
        cancelAnimationFrame(this.request);
        //clearTimeout(this.request);
        this.sceneModel = null;
        this.pbdSimulation = null;
    };
    return PositionBasedDynamics;
}());
//# sourceMappingURL=pbd.js.map