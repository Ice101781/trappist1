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
        var galaxyPosition = new THREE.Vector3(),
            starPosition = new THREE.Vector3(),
            planetPosition = starPosition.clone().add(Math.SpherToVec3(2787,0,0)),
            moonPosition = planetPosition.clone().add(Math.SpherToVec3(457,0,2.69)),
            shipPosition = planetPosition.clone().add(Math.SpherToVec3(17.5,0.5,0.75)),
            shipOrbitAxis = new THREE.Vector3(1,0.75,0).normalize(),
            shipOrbitSpeed = 0.00005;

        var self = this,
            container = document.getElementById("threejs-container"),
            renderer = new Renderer({antialias: false}, "rgb(0,0,0)", 1, container),
            cosmos = new THREE.Scene(),
            ambientLight = new AmbLight("rgb(66,93,120)", cosmos),
            pointLight = new PtLight("rgb(255,185,120)", starPosition, cosmos),
            galaxy = new Satellite(25000, "", "../img/starmap_paulbourke_dot_net", galaxyPosition, cosmos),
            star = new Satellite(100, "", "../img/255_185_120_(M8V).jpg", starPosition, cosmos),
            planet = new Satellite(8.26, "Phong", "../img/mercury_enhanced_color_nasa.jpg", planetPosition, cosmos),
            moon = new Satellite(2.063, "Phong", "../img/ganymede_nasa.jpg", moonPosition, cosmos),
            ship = new Camera(45, container.offsetWidth/container.offsetHeight, 0.05, shipPosition, cosmos),
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
                                ship.orbit(shipOrbitAxis, shipOrbitSpeed, planetPosition);
                            })();
                            renderer.render(cosmos, ship);
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
