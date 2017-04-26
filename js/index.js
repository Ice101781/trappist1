"use strict";

/*********************************************************************************\ 
** star and planet objects inspired by TRAPPIST-1A (T-1A) and TRAPPIST-1C (T-1C) **
**                                                                               **
**                  100 units = 51,875 miles ~ radius of T-1A                    **
**                                                                               **
**                     12.5 units ~ scaled radius of T-1C                        **
**                                                                               **
**              2700 units ~ scaled distance between T-1A and T-1C               **
\*********************************************************************************/

var starSystem;

window.onload = function() {
    // add a method to convert from rectangular to spherical coordinates
    Math.sphericalToVec3 = function(r, theta, phi) {
        var x = r*Math.cos(theta)*Math.sin(phi),
            y = r*Math.sin(theta)*Math.sin(phi),
            z = r*Math.cos(phi);
        return new THREE.Vector3(x,y,z);
    }

    // renderer
    function Renderer(attr) {
        THREE.WebGLRenderer.call(this, attr);
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


    // camera
    function Camera(vfovDeg, asp, near) {
        THREE.PerspectiveCamera.call(this, vfovDeg, asp, near, near*Math.pow(10,5));
    }
    (function(superProto) {
        Camera.prototype = Object.create(superProto);
        Camera.prototype.constructor = Camera;

        Camera.prototype.orbit = function() {
            // TO DO
        }
        Camera.prototype.repel = function(tgt, spd) {
            this.position.z += spd;
            this.lookAt(tgt);
        }
    })(THREE.PerspectiveCamera.prototype);


    // star, planet, moon, etc.
    function Satellite(rad, numSegs, matTyp, imgLoc) {
        // map texture from image to material
        function texToMat(matTyp, imgLoc) {
            var img = new Image(),
                mat = matTyp === "Phong" ? new THREE.MeshPhongMaterial() : new THREE.MeshBasicMaterial();
            img.src = imgLoc;
            img.onload = function() {
                var tex = new THREE.Texture(this);
                tex.needsUpdate = true;
                mat.map = tex;
                mat.needsUpdate = true;
            }
            img.onerror = function(e) {
                console.log(e)
            }
            return mat;
        }

        THREE.Mesh.call(this, new THREE.SphereGeometry(rad, numSegs, numSegs), texToMat(matTyp, imgLoc));
    }
    (function(superProto) {
        Satellite.prototype = Object.create(superProto);
        Satellite.prototype.constructor = Satellite;
    })(THREE.Mesh.prototype);


    function spaceScene() {
        var container = document.getElementById("threejs-container"),
            renderer = new Renderer({antialias: false}),
            universe = new THREE.Scene(),
            ambLight = new THREE.AmbientLight("rgb(66,93,120)"),
            ptLight = new THREE.PointLight("rgb(255,185,120)"),
            shipCam = new Camera(45, container.offsetWidth/container.offsetHeight, 0.05),
            star = new Satellite(100, 20, "", "../img/255_185_120_(M8V).jpg"),
            planet = new Satellite(12.5, 100, "Phong", "../img/mercury_enhanced_color.jpg"),
            moon = new Satellite(3, 100, "Phong", "../img/ganymede.jpg"),
            animate,
            PLAYING;

        renderer.setup("rgb(0,0,0)", 1, container);
        star.position.copy(new THREE.Vector3());
        planet.position.copy(star.position.clone().add(Math.sphericalToVec3(2700,0,0)));
        moon.position.copy(planet.position.clone().add(Math.sphericalToVec3(200,0,4*Math.PI/5)));
        shipCam.position.copy(planet.position.clone().add(Math.sphericalToVec3(45, 0.25, 0.8)));
        universe.add(ambLight, ptLight, shipCam, star, planet, moon);

        function render() {
            // update scene objects
            shipCam.repel(Math.sphericalToVec3(2400,0,0), 0.1);

            renderer.render(universe, shipCam);
            animate = requestAnimationFrame(render);
        }

        // instance API
        if(typeof(this.toggleAnimation) !== "function") {
            spaceScene.prototype.toggleAnimation = function() {
                switch(true) {
                    case !PLAYING:
                        render();
                        PLAYING = true;
                        return console.log("Animation started.");
                    case PLAYING:
                        cancelAnimationFrame(animate);
                        PLAYING = false;
                        return console.log("Animation stopped.");
                }
            }
        }
    }

    starSystem = new spaceScene();
    starSystem.toggleAnimation();
}
