"use strict";

var VISUALS = function() {

    var container = document.getElementById("threejs-container"),
        width = container.offsetWidth,
        height = container.offsetHeight,
        renderer = setupWebGLRenderer({antialias: true}, 'black'),
        scene = new THREE.Scene();

    //scene objects
    var star = createSatellite(200, 100, "", "../img/star_background.jpg", sphere2Rect(0,0,0), sphere2Rect(0,0,0)),
        planet = createSatellite(20, 100, "Phong", "../img/mercury_enhanced_color.jpg", star.position, sphere2Rect(300,0,0)),
        moon = createSatellite(1, 100, "Phong", "../img/ganymede.jpg", planet.position, sphere2Rect(80,0,0));

    var light = setupLight("Ambient", 'white'),
        camera = setupCamera(0.01, 1000, moon.position, sphere2Rect(12,0,0), sphere2Rect(0,0,0));

    render();

    function render() {
        //camera orbit
        renderer.render(scene, camera);
        requestAnimationFrame(render);
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
    function setupCamera(near, far, parPos, relPos, relLook) {
        var cam = new THREE.PerspectiveCamera(50, width/height, near, far);
        cam.position.copy(parPos.clone().add(relPos));
        cam.lookAt(parPos.clone().add(relLook));
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

    //convert coordinates from spherical (r>=0; in degrees: 0<=theta<=180, 0<=phi<360) to rectangular
    function sphere2Rect(r, theta, phi) {
        var c = Math.PI/180,
            x = r*Math.sin(theta*c)*Math.cos(phi*c),
            y = r*Math.sin(theta*c)*Math.sin(phi*c),
            z = r*Math.cos(theta*c);
        return new THREE.Vector3(x,y,z);
    }

    return {
        //public
    };
}
