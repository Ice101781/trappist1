"use strict";

var VISUALS = function() {

    //cache DOM and dimensions
    var container = document.getElementById("threejs-container"),
        width = container.offsetWidth,
        height = container.offsetHeight;

    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene(),
        light = new THREE.AmbientLight(0xffffff);

    //create the planet
    var planet = new THREE.Mesh(new THREE.SphereGeometry(1, 100, 100), createTextureMaterial("Phong", "../img/mercury_enhanced_color.jpg"));
    planet.position.set(-50,250,400);
    //planet.rotation.set(0,0,0);

    //set up the camera
    var camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 1000),
        camParentPos = planet.position.clone();
    camera.position.copy(camParentPos.clone().add(new THREE.Vector3(1,1,1.5)));
    camera.lookAt(camParentPos.clone().add(new THREE.Vector3(1,0.5,0)));

    //add objects to the scene and render it
    scene.add(light, planet);
    render();

    //render function
    function render() {
        planet.rotation.y += 0.0003;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    //load and add texture to material
    function createTextureMaterial(matType, imgPath) {
        var img = new Image(),
            material = matType === "Phong" ? new THREE.MeshPhongMaterial() : new THREE.MeshBasicMaterial();

        img.src = imgPath;
        img.onload = function() {
            var texture = new THREE.Texture(this);
            texture.needsUpdate = true;

            material.map = texture;
            material.needsUpdate = true;
        }
        img.onerror = function(e) {
            console.log(e);
        }
        return material;
    }

    return {
        //public
    };
}
