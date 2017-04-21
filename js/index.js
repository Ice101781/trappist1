"use strict";

var VISUALS = function() {

    var container = document.getElementById("threejs-container"),
        width = container.offsetWidth,
        height = container.offsetHeight,
        renderer = setupWebGLRenderer({antialias: true}, 'black'),
        scene = new THREE.Scene();

    var starPos = new THREE.Vector3(0,0,0),
        home = new THREE.Vector3(-50,250,400),
        planet = createSatellite(10, 100, "Phong", "../img/mercury_enhanced_color.jpg", starPos, home),
        moon = createSatellite(1, 50, "Phong", "../img/europa.jpg", planet.position, new THREE.Vector3(-25, 2, 15));

    var light = setupLight("Ambient", 'white'),
        camera = setupCamera(0.01, 1000, home, new THREE.Vector3(0,0,40), new THREE.Vector3(-10,0,0));

    render();

    function render() {
        //camera orbit
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    //add satellite
    function createSatellite(radius, numSegments, matType, imgPath, parPos, relPos) {
        var sat = new THREE.Mesh(new THREE.SphereGeometry(radius, numSegments, numSegments), createTextureMaterial(matType, imgPath));
        sat.position.copy(parPos.clone().add(relPos));
        scene.add(sat);
        return sat;
    }

    //load and add texture to material
    function createTextureMaterial(matType, imgPath) {
        var img = new Image(),
            mat = matType === "Phong" ? new THREE.MeshPhongMaterial() : new THREE.MeshBasicMaterial();
        img.src = imgPath;
        img.onload = function() {
            var texture = new THREE.Texture(this);
            texture.needsUpdate = true;

            mat.map = texture;
            mat.needsUpdate = true;
        }
        img.onerror = function(e) {
            console.log(e);
        }
        return mat;
    }

    //add camera
    function setupCamera(near, far, parPos, camRelPos, camRelLook) {
        var cam = new THREE.PerspectiveCamera(50, width/height, near, far);
        cam.position.copy(parPos.clone().add(camRelPos));
        cam.lookAt(parPos.clone().add(camRelLook));
        scene.add(cam);
        return cam;
    }

    //add light
    function setupLight(type, color) {
        var lgt = type == "Ambient" ? new THREE.AmbientLight(color) : null;
        scene.add(lgt);
        return lgt;
    }

    //add renderer
    function setupWebGLRenderer(attr, color) {
        var rdr = new THREE.WebGLRenderer(attr);
        rdr.setSize(width, height);
        rdr.setClearColor(color, 1);
        container.appendChild(rdr.domElement);
        return rdr;
    }

    return {
        //public
    };
}
