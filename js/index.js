"use strict";

// visuals module
var Visuals = function() {

    var container, width, height, renderer, scene, light, camera, star, planet, moon;

    // math library module
    var Calc = function() {
        // convert coordinates from spherical to rectangular *** azimuthal angle = theta, polar angle = phi, r >= 0, 0 <= theta <= PI, 0 <= phi < 2*PI
        function Vec3FromSpherical(r, theta, phi) {
            var x = r*Math.cos(theta)*Math.sin(phi),
                y = r*Math.sin(theta)*Math.sin(phi),
                z = r*Math.cos(phi);
            return new THREE.Vector3(x,y,z);
        }
        return {
            Vec3FromSpherical: Vec3FromSpherical
        };
    }();

    // WebGL renderer module
    var Renderer = function() {
        function init(attributes, color, opacity) {
            var ren = new THREE.WebGLRenderer(attributes);
            ren.setSize(width, height);
            ren.setClearColor(color, opacity);
            container.appendChild(ren.domElement);
            return ren;
        }
        return {
            init: init
        };
    }();

    // light module
    var Light = function() {
        function setup(type, color, position) {
            var position = typeof(position) === 'undefined' ? new THREE.Vector3() : position;
            switch(type) {
                case "Ambient":
                    var lgt = new THREE.AmbientLight(color);
                    break;
            }
            scene.add(lgt);
            return lgt;
        }
        return {
            setup: setup
        };
    }();

    // camera module
    var Camera = function() {
        function setup(vfovDeg, near, far) {
            var cam = new THREE.PerspectiveCamera(vfovDeg, width/height, near, far);
            scene.add(cam);
            return cam;
        }
        // orbit module
        var Orbit = function() {
            var camR = 75,
                camTheta = Math.PI/4,
                camPhi = Math.PI/6;
            function update(posTgt, lookTgt, speed) {
                camPhi += speed;
                camera.position.x = posTgt.position.x + camR*Math.cos(camTheta)*Math.sin(camPhi);
                camera.position.y = posTgt.position.y + camR*Math.sin(camTheta)*Math.sin(camPhi);
                camera.position.z = posTgt.position.z + camR*Math.cos(camPhi);
                camera.lookAt(lookTgt.position);
            }
            return {
                update: update
            };
        }();
        return {
            setup: setup,
            Orbit: Orbit
        };
    }();

    // satellite module
    var Satellite = function() {
        function create(radius, numSegments, matType, imgPath, parPos, relPos) {
            // texture mapping
            function textureMaterial() {
                var img = new Image(),
                    mat = matType === "Phong" ? new THREE.MeshPhongMaterial() : new THREE.MeshBasicMaterial();
                img.src = imgPath;
                img.onload = function() {
                    var texture = new THREE.Texture(this);
                    texture.needsUpdate = true;

                    mat.map = texture;
                    mat.needsUpdate = true;
                }
                img.onerror = function(e) { console.log(e) }
                return mat;
            }
            var sat = new THREE.Mesh(new THREE.SphereGeometry(radius, numSegments, numSegments), textureMaterial());
            sat.position.copy(parPos.clone().add(relPos));
            scene.add(sat);
            return sat;
        }
        return {
            create: create
        };
    }();

    // render the scene
    function render() {
        Camera.Orbit.update(planet, planet, 0.005);
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    // initialize the scene
    function init() {
        container = document.getElementById("threejs-container");
        width = container.offsetWidth;
        height = container.offsetHeight;
        renderer = Renderer.init({antialias: false}, 'black', 1);
        scene = new THREE.Scene();
        light = Light.setup("Ambient", 'white');
        camera = Camera.setup(50, 0.01, 5000);
        /*
        ** star and planet objects inspired by TRAPPIST-1A (T-1A) and TRAPPIST-1C (T-1C)
        **
        ** 100 units = 51,875 miles, approx. radius of T-1A
        **
        ** 12.5 units, approx. scaled radius of T-1C
        **
        ** 2700 units, approx. scaled distance between T-1A and T-1C
        */
        star = Satellite.create(100, 25, "", "../img/255_185_120_(M8V).jpg", new THREE.Vector3(), new THREE.Vector3());
        planet = Satellite.create(12.5, 50, "Phong", "../img/mercury_enhanced_color.jpg", star.position, Calc.Vec3FromSpherical(2700,0,0));
        moon = Satellite.create(0.25, 100, "Phong", "../img/ganymede.jpg", planet.position, Calc.Vec3FromSpherical(30,0,0));
    
        render();
    }

    return {
        init: init
    };
}();
