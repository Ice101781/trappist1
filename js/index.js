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
        var starRadius = 100,
            planetRadius = 8.26,
            moonRadius = 2.063,
            starShipOrbitSpeed = 0.0001,
            starPosition = new THREE.Vector3(),
            planetPosition = starPosition.clone().add(Math.SpherToVec3(2787,0,0)),
            moonPosition = planetPosition.clone().add(Math.SpherToVec3(457,0,2.69)),
            starShipPosition = planetPosition.clone().add(Math.SpherToVec3(25,0.25,0.5)),
            starShipOrbitAxis = new THREE.Vector3(1,0.75,0);

        var self = this,
            container = document.getElementById("threejs-container"),
            renderer = new Renderer({antialias: false}, "rgb(0,0,0)", 1, container),
            cosmos = new THREE.Scene(),
            ambientLight = new AmbLight("rgb(66,93,120)", cosmos),
            pointLight = new PtLight("rgb(255,185,120)", starPosition, cosmos),
            star = new Satellite(starRadius, 25, "", "../img/255_185_120_(M8V).jpg", starPosition, cosmos),
            planet = new Satellite(planetRadius, 100, "Phong", "../img/mercury_enhanced_color.jpg", planetPosition, cosmos),
            moon = new Satellite(moonRadius, 100, "Phong", "../img/ganymede.jpg", moonPosition, cosmos),
            starShip = new Camera(45, container.offsetWidth/container.offsetHeight, 0.05, starShipPosition, cosmos),
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
                                starShip.orbit(starShipOrbitAxis, starShipOrbitSpeed, planetPosition);
                            })();
                            renderer.render(cosmos, starShip);
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
