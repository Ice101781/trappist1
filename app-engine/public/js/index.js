"use strict";

/*********************************************************************************\ 
** star and planet objects inspired by TRAPPIST-1A (T-1A) and TRAPPIST-1C (T-1C) **
**                                                                               **
**                    100 units = 52,307mi ~ radius of T-1A                      **
**                                                                               **
**                    8.26 units ~ 4,319mi ~ radius of T-1C                      **
**                                                                               **
**           2,787 units ~ 1,457,800mi ~ distance between T-1A and T-1C          **
**                                                                               **
**                 6.189 units ~ 3x scaled radius of Earth's moon                **
**                                                                               **
**                 457 units ~ scaled distance to Earth's moon                   **
\*********************************************************************************/

var starSystem;

function SpacePlace() {
    // private variables
    var galaxyRadius = 50000,
        starRadius = 100,
        planetRadius = 8.26,
        moonRadius = 6.189,
        // at 60fps, a speed of 0.01 units/frame is ~ 0.1744% of the speed of light
        orbitSpeed = 0.0003;

    // use ../public before file paths for local development
    var galaxyMap = "/images/starmap_paulbourke_dot_net",
        starMap = "/images/255_185_120_(M8V).jpg",
        planetMap = "/images/mercury_enhanced_color_nasa.jpg",
        moonMap = "/images/ganymede_nasa.jpg";

    var centerPosition = new THREE.Vector3(),
        planetPosition = centerPosition.clone().add(Math.SpherToVec3(2787,0,0)),
        moonPosition = planetPosition.clone().add(Math.SpherToVec3(457,0,2.69)),
        shipPosition = planetPosition.clone().add(Math.SpherToVec3(20,0.25,0.435)),
        orbitAxis = new THREE.Vector3(1,1,0).normalize();

    var container = document.getElementById("threejs-container"),
        renderer = new Renderer({antialias: false}, "rgb(0,0,0)", 1, container),
        cosmos = new THREE.Scene();

    var ambientLight = new AmbLight("rgb(44,62,80)", cosmos), // rgb(66,93,120)
        pointLight = new PtLight("rgb(255,185,120)", centerPosition, cosmos),
        galaxy = new Satellite(galaxyRadius, "", galaxyMap, centerPosition, cosmos),
        star = new Satellite(starRadius, "", starMap, centerPosition, cosmos),
        planet = new Satellite(planetRadius, "Phong", planetMap, planetPosition, cosmos),
        occlusionPlanet = new Satellite(planetRadius, "", "", planetPosition, cosmos),
        moon = new Satellite(moonRadius, "Phong", moonMap, moonPosition, cosmos),
        occlusionMoon = new Satellite(moonRadius, "", "", moonPosition, cosmos),
        ship = new Camera(45, container.offsetWidth/container.offsetHeight, 0.1, shipPosition, cosmos);

    var volLightPostProc = new PostProcessor(THREE.VolumetricLightShader, renderer, cosmos, ship),
        addBlendPostProc = new PostProcessor(THREE.AdditiveBlendingShader, renderer, cosmos, ship);

    var REQUEST_ID,
        PLAYING;

    // private functions
    function update() {
        ship.orbit(orbitAxis, orbitSpeed, planetPosition);
        volLightPostProc.setUniforms(centerPosition, ship);
        renderer.compositeRender(ship, [addBlendPostProc, volLightPostProc]);
    }

    function nextFrame() {
        update();
        REQUEST_ID = requestAnimationFrame(nextFrame);
    }

    (function assignRenderTexture() {
        addBlendPostProc.shdrPass.uniforms.tAdd.value = volLightPostProc.renderTarget.texture;
    })();

    // instance API
    this.isSpacePlace = true;

    if(typeof(this.toggleAnimation) !== "function") {
        // stop or start animation
        SpacePlace.prototype.toggleAnimation = function() {
            switch(true) {
                case !PLAYING:
                    nextFrame();
                    PLAYING = true;
                    return "Animation started.";
                case PLAYING:
                    cancelAnimationFrame(REQUEST_ID);
                    PLAYING = false;
                    return "Animation stopped.";
            }
        }
    }
}

window.onload = function() {
    starSystem = new SpacePlace();
    starSystem.toggleAnimation();

    (function delayDisplay() {
        setTimeout(function() { document.getElementById("load-screen").style.display = "none" }, 3000)
    })();
}
