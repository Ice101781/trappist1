"use strict";

var VISUALS = function() {

    var container = document.getElementById("threejs-container"),
        width = container.offsetWidth,
        height = container.offsetHeight,
        renderer = setupWebGLRenderer({antialias: false}, 'black'),
        scene = new THREE.Scene();

    //star and planet objects inspired by TRAPPIST-1A and TRAPPIST-1C
    var star = createSatellite(100, 25, "", "../img/255_185_120_(M8V).jpg", new THREE.Vector3(), new THREE.Vector3()), //100 THREE.js units ~= 51,875 miles
        planet = createSatellite(12.5, 50, "Phong", "../img/mercury_enhanced_color.jpg", star.position, sphere2Rect(2700,0,0)),
        moon = createSatellite(0.25, 100, "Phong", "../img/ganymede.jpg", planet.position, sphere2Rect(50,0,0));

    var light = setupLight("Ambient", 'white'),
        camR = 25,
        camTheta = Math.PI/8,
        camPhi = 15*Math.PI/4,
        camera = setupCamera(0.01, 5000, moon.position, sphere2Rect(camR, camTheta, camPhi), new THREE.Vector3());

    //render the scene
    (function render() {
        updateSceneObjects();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    })();

    //convert coordinates from spherical to rectangular (azimuthal angle = theta, polar angle = phi; r>=0, 0<=theta<=PI, 0<=phi<2*PI)
    function sphere2Rect(r, theta, phi) {
        var x = r*Math.cos(theta)*Math.sin(phi),
            y = r*Math.sin(theta)*Math.sin(phi),
            z = r*Math.cos(phi);
        return new THREE.Vector3(x,y,z);
    }

    //add renderer
    function setupWebGLRenderer(attr, color) {
        var rdr = new THREE.WebGLRenderer(attr);
        rdr.setSize(width, height);
        rdr.setClearColor(color, 1);
        container.appendChild(rdr.domElement);
        return rdr;
    }

    //add light
    function setupLight(type, color) {
        var lgt = type == "Ambient" ? new THREE.AmbientLight(color) : null;
        scene.add(lgt);
        return lgt;
    }

    //add camera
    function setupCamera(near, far, parPos, relPos, relLook) {
        var cam = new THREE.PerspectiveCamera(50, width/height, near, far);
        cam.position.copy(parPos.clone().add(relPos));
        cam.lookAt(parPos.clone().add(relLook));
        scene.add(cam);
        return cam;
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

    //add satellite
    function createSatellite(radius, numSegments, matType, imgPath, parPos, relPos) {
        var satGeom = new THREE.SphereGeometry(radius, numSegments, numSegments),
            satMat = createTextureMaterial(matType, imgPath),
            sat = new THREE.Mesh(satGeom, satMat);
        sat.position.copy(parPos.clone().add(relPos));
        scene.add(sat);
        return sat;
    }

    //update
    function updateSceneObjects() {
        //camera orbit
        camPhi += 0.00005;
        camera.position.x = moon.position.x + camR*Math.cos(camTheta)*Math.sin(camPhi);
        camera.position.y = moon.position.y + camR*Math.sin(camTheta)*Math.sin(camPhi);
        camera.position.z = moon.position.z + camR*Math.cos(camPhi);
        camera.lookAt(moon.position);
    }

    //API
    return { };
}
