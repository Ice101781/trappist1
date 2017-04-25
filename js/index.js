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

    var Calc = function() {
        // azimuthal angle = theta, polar angle = phi, r >= 0, 0 <= theta <= PI, 0 <= phi < 2*PI
        function fromSpherical(r, theta, phi) {
            var x = r*Math.cos(theta)*Math.sin(phi),
                y = r*Math.sin(theta)*Math.sin(phi),
                z = r*Math.cos(phi);

            return new THREE.Vector3(x,y,z);
        }
        return {
            fromSpherical: fromSpherical
        };
    }();

    var Renderer = function() {
        function setup(attr, col, opac, par) {
            var ren = new THREE.WebGLRenderer(attr);
            ren.setClearColor(col, opac);
            ren.setSize(par.offsetWidth, par.offsetHeight);
            par.appendChild(ren.domElement);
            return ren;
        }
        return {
            setup: setup
        };
    }();

    var Light = function() {
        function setup(typ, col, pos) {
            var lgt,
                pos = typeof(pos) !== 'undefined' ? pos : new THREE.Vector3();

            switch(typ) {
                case "Ambient":
                    lgt = new THREE.AmbientLight(col);
                    break;
                case "Point":
                    lgt = new THREE.PointLight(col, 1, 0, 2);
                    lgt.position.copy(pos);
                    break;
            }
            return lgt;
        }
        return {
            setup: setup
        };
    }();

    var Camera = function() {
        function setup(vfovDeg, aspect, near, pos) {
            var cam = new THREE.PerspectiveCamera(vfovDeg, aspect, near, near*Math.pow(10,5));
            cam.position.copy(pos);
            return cam;
        }
        function path(cam, speed, tgt) {
            cam.position.z += speed; // write orbit code here...
            cam.lookAt(tgt);
        }
        return {
            setup: setup,
            path: path
        };
    }();

    var Satellite = function() {
        // texture mapping
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
        function create(rad, numSegs, matTyp, imgLoc, parPos, relPos) {
            var sat = new THREE.Mesh(new THREE.SphereGeometry(rad, numSegs, numSegs), texToMat(matTyp, imgLoc)),
                parPos = typeof(parPos) !== 'undefined' ? parPos : new THREE.Vector3(),
                relPos = typeof(relPos) !== 'undefined' ? relPos : new THREE.Vector3();

            sat.position.copy(parPos.clone().add(relPos));
            return sat;
        }
        return {
            create: create
        };
    }();

    starSystem = function(MATH_MOD, RENDERER_MOD, LIGHT_MOD, CAMERA_MOD, SATELLITE_MOD) {
        var container = document.getElementById("threejs-container"),
            renderer = Renderer.setup({antialias: false}, 'black', 1, container),
            universe = new THREE.Scene(),
            ambLight = Light.setup("Ambient", "rgb(66,93,120)"),
            ptLight = Light.setup("Point", "rgb(255,185,120)"),
            shipCam = Camera.setup(45, container.offsetWidth/container.offsetHeight, 0.05, Calc.fromSpherical(2700,0,0).add(Calc.fromSpherical(45, 0.25, 0.8))),
            star = Satellite.create(100, 20, "", "../img/255_185_120_(M8V).jpg"),
            planet = Satellite.create(12.5, 100, "Phong", "../img/mercury_enhanced_color.jpg", star.position, Calc.fromSpherical(2700,0,0)),
            moon = Satellite.create(3, 100, "Phong", "../img/ganymede.jpg", planet.position, Calc.fromSpherical(200,0,4*Math.PI/5));

        universe.add(ambLight, ptLight, shipCam, star, planet, moon);

        var Animation = function() {
            var animate,
                PLAYING;

            // update scene objects
            function update() {
                Camera.path(shipCam, 0.01, Calc.fromSpherical(2400,0,0));
            }
            // render and animate the scene
            function render() {
                update();
                renderer.render(universe, shipCam);
                animate = requestAnimationFrame(render);
                PLAYING = true;
            }
            function start() {
                switch(true) {
                    case !PLAYING:
                        render();
                        return true;
                    default:
                        console.log("The animation has already been started.");
                        return false;
                }
            }
            function stop() {
                switch(true) {
                    case PLAYING:
                        cancelAnimationFrame(animate);
                        PLAYING = false;
                        return true;
                    default:
                        console.log("The animation has already been stopped.");
                        return false;
                }
            }
            // API
            return {
                start: start,
                stop: stop
            };
        }();
        return {
            Animation: Animation
        };
    }(Calc, Renderer, Light, Camera, Satellite);

    starSystem.Animation.start();
}
