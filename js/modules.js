"use strict";

// add a method to convert from rectangular to spherical coordinates
Math.sphericalToVec3 = function(r, theta, phi) {
    var x = r*Math.cos(theta)*Math.sin(phi),
        y = r*Math.sin(theta)*Math.sin(phi),
        z = r*Math.cos(phi);
    return new THREE.Vector3(x,y,z);
}

// renderer
function Renderer(attr, col, opac, par) {
    THREE.WebGLRenderer.call(this, attr);
    this.setup(col, opac, par);
}
(function(superProto) {
    Renderer.prototype = Object.create(superProto);
    Renderer.prototype.constructor = Renderer;

    Renderer.prototype.setup = function(col, opac, par) {
        this.setClearColor(col, opac);
        this.setSize(par.offsetWidth, par.offsetHeight);
        par.appendChild(this.domElement);
    }
})(THREE.WebGLRenderer.prototype);


// ambient light
function AmbLight(col, scene) {
    THREE.AmbientLight.call(this, col);
    this.setup(scene);
}
(function(superProto) {
    AmbLight.prototype = Object.create(superProto);
    AmbLight.prototype.constructor = AmbLight;

    AmbLight.prototype.setup = function(scene) {
        scene.add(this);
    }
})(THREE.AmbientLight.prototype);


// point light
function PtLight(col, pos, scene) {
    THREE.PointLight.call(this, col);
    this.setup(pos, scene);
}
(function(superProto) {
    PtLight.prototype = Object.create(superProto);
    PtLight.prototype.constructor = PtLight;

    PtLight.prototype.setup = function(pos, scene) {
        this.position.copy(pos);
        scene.add(this);
    }
})(THREE.PointLight.prototype);


// camera
function Camera(vfov, asp, near, pos, scene) {
    THREE.PerspectiveCamera.call(this, vfov, asp, near, near*Math.pow(10,5));
    this.setup(pos, scene);
}
(function(superProto) {
    Camera.prototype = Object.create(superProto);
    Camera.prototype.constructor = Camera;

    Camera.prototype.setup = function(pos, scene) {
        this.position.copy(pos);
        scene.add(this);
    }
    // at 60fps, a speed of 0.01 units/frame is ~ 0.1744% of the speed of light
    Camera.prototype.orbit = function() {
        // TO DO
    }
    Camera.prototype.repel = function(tgt, spd) {
        this.lookAt(tgt);
        this.position.z += spd;
    }
})(THREE.PerspectiveCamera.prototype);


// star, planet, moon, etc.
function Satellite(rad, numSegs, matTyp, imgLoc, pos, scene) {
    THREE.Mesh.call(this, new THREE.SphereGeometry(rad, numSegs, numSegs), matTyp === "Phong" ? new THREE.MeshPhongMaterial() : new THREE.MeshBasicMaterial());
    this.setup(imgLoc, pos, scene);
}
(function(superProto) {
    Satellite.prototype = Object.create(superProto);
    Satellite.prototype.constructor = Satellite;

    Satellite.prototype.setup = function(imgLoc, pos, scene) {
        this.textureToMaterial(imgLoc);
        this.position.copy(pos);
        scene.add(this);
    }
    // map texture from image to material for satellite surface
    Satellite.prototype.textureToMaterial = function(imgLoc) {
        var self = this,
            img = new Image();
        img.src = imgLoc;
        img.onload = function() {
            var tex = new THREE.Texture(this);
            tex.needsUpdate = true;
            self.material.map = tex;
            self.material.needsUpdate = true;
        }
        img.onerror = function(e) { console.log(e) }
    }
})(THREE.Mesh.prototype);
