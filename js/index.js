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
**                 2.063 units ~ scaled radius of Earth's moon                   **
**                                                                               **
**                 457 units ~ scaled distance to Earth's moon                   **
\*********************************************************************************/

var starSystem;

window.onload = function() {
    function spacePlace() {
        // private variables
        var starRad = 100,
            planetRad = 8.26,
            moonRad = 2.063,
            starPos = new THREE.Vector3(),
            planetPos = starPos.clone().add(Math.sphericalToVec3(2787,0,0)),
            moonPos = planetPos.clone().add(Math.sphericalToVec3(457,0,6*Math.PI/7)),
            shipCamPos = planetPos.clone().add(Math.sphericalToVec3(30, 0.25, 0.8)),
            shipCamTgt = Math.sphericalToVec3(2400,0,0);

        var self = this,
            container = document.getElementById("threejs-container"),
            renderer = new Renderer({antialias: false}, "rgb(0,0,0)", 1, container),
            cosmos = new THREE.Scene(),
            ambientLight = new AmbLight("rgb(66,93,120)", cosmos),
            pointLight = new PtLight("rgb(255,185,120)", starPos, cosmos),
            star = new Satellite(starRad, 25, "", "../img/255_185_120_(M8V).jpg", starPos, cosmos),
            planet = new Satellite(planetRad, 100, "Phong", "../img/mercury_enhanced_color.jpg", planetPos, cosmos),
            moon = new Satellite(moonRad, 100, "Phong", "../img/ganymede.jpg", moonPos, cosmos),
            shipCam = new Camera(45, container.offsetWidth/container.offsetHeight, 0.05, shipCamPos, cosmos),
            // state variables
            REQUEST_ID,
            PLAYING;

        // instance API
        self.isSpacePlace = true;

        if(typeof(self.toggleAnimation) !== "function") {
            // stop or start animation
            spacePlace.prototype.toggleAnimation = function() {
                switch(true) {
                    case !PLAYING:
                        (function render() {
                            (function update() {
                                shipCam.repel(shipCamTgt, 0.01);
                            })();
                            renderer.render(cosmos, shipCam);
                            REQUEST_ID = requestAnimationFrame(render);
                        })();
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

    starSystem = new spacePlace();
    starSystem.toggleAnimation();
}
