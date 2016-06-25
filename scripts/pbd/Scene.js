///<reference path="../../bower_components/TSM/TSM/source/tsm.ts"/>
///<reference path="Particle.ts"/>
///<reference path="Simulation.ts"/>
///<reference path="../../typings/underscore/underscore.d.ts"/>
///<reference path="../../typings/tsd.d.ts"/>
///<reference path="Cloth.ts"/>
var Scene = (function () {
    function Scene() {
        this.indices = [];
        this.iStacks = 30;
        this.iSlices = 30;
        this.fRadius = 1;
    }
    Scene.prototype.setCloth = function (cloth) {
        var indices = cloth.indicies;
        var points = cloth.points;
        // particles cloud
        this.pc.geometry.vertices.length = 0;
        points.forEach(function (point) {
            this.pc.geometry.vertices.push(new THREE.Vector3(point.coords.x, point.coords.y, point.coords.z));
        }, this);
        this.pc.geometry.verticesNeedUpdate = true;
        // material wireframe
        this.mesh.geometry.vertices.length = 0;
        this.mesh.geometry.faces.length = 0;
        for (var i = 0; i < indices.length; i += 3) {
            var p1 = points[indices[i]].coords;
            var p2 = points[indices[i + 1]].coords;
            var p3 = points[indices[i + 2]].coords;
            this.mesh.geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));
            this.mesh.geometry.vertices.push(new THREE.Vector3(p2.x, p2.y, p2.z));
            this.mesh.geometry.vertices.push(new THREE.Vector3(p3.x, p3.y, p3.z));
            this.mesh.geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
        }
        this.mesh.geometry.computeFaceNormals();
        this.mesh.geometry.computeBoundingBox();
        this.mesh.geometry.verticesNeedUpdate = true;
        this.mesh.geometry.elementsNeedUpdate = true;
    };
    Scene.prototype.updateView = function () {
        //this.scene.rotateY(0.02);
        this.renderer.render(this.scene, this.camera);
    };
    // ########################################################################
    Scene.prototype.buildScene = function () {
        // get viewport
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.01, 100000);
        var c = document.getElementById("glCanvas");
        this.renderer = new THREE.WebGLRenderer({ canvas: c });
        this.renderer.setSize(600, 600);
        //***************************************************
        // draw particles
        var geometryCloth = new THREE.Geometry();
        var materialCloth = new THREE.PointCloudMaterial({
            color: 0xffffff,
            size: 0.05
        });
        materialCloth.side = THREE.DoubleSide;
        this.pc = new THREE.PointCloud(geometryCloth, materialCloth);
        this.scene.add(this.pc);
        //***************************************************
        // draw material wireframe
        var geometryLines = new THREE.Geometry();
        var materialLines = new THREE.MeshBasicMaterial({
            wireframe: true
        });
        this.mesh = new THREE.Mesh(geometryLines, materialLines);
        this.mesh.frustumCulled = false;
        this.scene.add(this.mesh);
        //***************************************************
        // draw ellipsoid
        var geometrySphere = new THREE.SphereGeometry(this.fRadius, this.iSlices, this.iStacks);
        this.ellipsoid = new Ellipsoid(this.iStacks, this.iSlices, this.fRadius);
        var matrixTemp = (new THREE.Matrix4()).set(this.ellipsoid.matrix.at(0), this.ellipsoid.matrix.at(4), this.ellipsoid.matrix.at(8), this.ellipsoid.matrix.at(12), this.ellipsoid.matrix.at(1), this.ellipsoid.matrix.at(5), this.ellipsoid.matrix.at(9), this.ellipsoid.matrix.at(13), this.ellipsoid.matrix.at(2), this.ellipsoid.matrix.at(6), this.ellipsoid.matrix.at(10), this.ellipsoid.matrix.at(14), this.ellipsoid.matrix.at(3), this.ellipsoid.matrix.at(7), this.ellipsoid.matrix.at(11), this.ellipsoid.matrix.at(15));
        geometrySphere.applyMatrix(matrixTemp);
        geometrySphere.verticesNeedUpdate = true;
        var materialSphere = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
        });
        this.sphere = new THREE.Mesh(geometrySphere, materialSphere);
        this.scene.add(this.sphere);
        //***************************************************
        this.camera.position.z = 8;
        this.scene.rotateY(2.5);
    };
    return Scene;
}());
//# sourceMappingURL=Scene.js.map