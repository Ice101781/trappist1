"use strict";

function Renderer(attr, col, opac, par) {
    THREE.WebGLRenderer.call(this, attr);
    this.setup(col, opac, par);
}
(function(supProto) {
    Renderer.prototype = Object.create(supProto);
    Renderer.prototype.constructor = Renderer;

    Renderer.prototype.setup = function(col, opac, par) {
        this.setClearColor(col, opac);
        this.setPixelRatio(window.devicePixelRatio);
        this.setSize(par.offsetWidth, par.offsetHeight);
        par.appendChild(this.domElement);
    }
    Renderer.prototype.compositeRender = function(cam, post) {
        //occlusion layer
        cam.layers.set(1);
        this.setClearColor(0x000000);
        post[1].render();

        cam.layers.set(0);
        this.setClearColor(0x090611);
        post[0].render();
    }
})(THREE.WebGLRenderer.prototype);


function AmbLight(col, scn) {
    THREE.AmbientLight.call(this, col);
    this.setup(scn);
}
(function(supProto) {
    AmbLight.prototype = Object.create(supProto);
    AmbLight.prototype.constructor = AmbLight;

    AmbLight.prototype.setup = function(scn) {
        scn.add(this);
    }
})(THREE.AmbientLight.prototype);


function PtLight(col, pos, scn) {
    THREE.PointLight.call(this, col);
    this.setup(pos, scn);
}
(function(supProto) {
    PtLight.prototype = Object.create(supProto);
    PtLight.prototype.constructor = PtLight;

    PtLight.prototype.setup = function(pos, scn) {
        this.position.copy(pos);
        scn.add(this);
    }
})(THREE.PointLight.prototype);


function Camera(vfov, asp, near, pos, scn) {
    THREE.PerspectiveCamera.call(this, vfov, asp, near, near*Math.pow(10,6));
    this.setup(pos, scn);
}
(function(supProto) {
    Camera.prototype = Object.create(supProto);
    Camera.prototype.constructor = Camera;

    Camera.prototype.setup = function(pos, scn) {
        this.position.copy(pos);
        scn.add(this);
    }
    Camera.prototype.orbit = function(axis, spd, pt) {
        // thanks to @WestLangley
        var rotationQuaternion = new THREE.Quaternion();
        return function(axis, spd, pt) {
            rotationQuaternion.setFromAxisAngle(axis, spd);
            this.quaternion.multiply(rotationQuaternion);
            this.position.sub(pt);
            this.position.applyQuaternion(rotationQuaternion);
            this.position.add(pt);
        };
    }();
    Camera.prototype.repel = function(spd, pt) {
        this.position.z += spd;
        this.lookAt(pt);
    }
})(THREE.PerspectiveCamera.prototype);


// galaxy, star, planet, moon, occlusion bodies
function Satellite(rad, matTyp, imgLoc, pos, scn) {
    THREE.Mesh.call(this, new THREE.SphereBufferGeometry(rad, 100, 100), matTyp === "Phong" ? new THREE.MeshPhongMaterial() : new THREE.MeshBasicMaterial());
    this.setup(imgLoc, pos, scn);
}
(function(supProto) {
    Satellite.prototype = Object.create(supProto);
    Satellite.prototype.constructor = Satellite;

    Satellite.prototype.setup = function(imgLoc, pos, scn) {
        if(imgLoc !== "") {
            switch(imgLoc) {
                // galaxy - darken material and ensure it gets mapped to the inside of its geometry
                case "./images/starmap_paulbourke_dot_net":
                    this.material.color.setHex(0x888888);
                    this.material.side = THREE.BackSide;
                    break;
                // star - add to occlusion layer
                case "./images/255_185_120_(M8V).jpg":
                    this.layers.set(1);
                    break;
            }
            this.textureToMaterial(imgLoc);
        } else {
            // occlusion bodies - render as black, add to occlusion layer
            this.material.color.setHex(0x000000);
            this.layers.set(1);
        }
        this.position.copy(pos);
        scn.add(this);
    }
    // map texture from image to material for satellite surface
    Satellite.prototype.textureToMaterial = function(imgLoc) {
        var self = this,
            img = new Image();
        img.src = imgLoc;
        img.onload = function() {
            var tex = new THREE.Texture(this);
            self.material.map = tex;
            tex.needsUpdate = true;
            self.material.needsUpdate = true;
        }
        img.onerror = function(e) { console.log(e) }
    }
})(THREE.Mesh.prototype);


function PostProcessor(shdr, rdr, scn, cam) {
    this.shader = shdr;
    this.renderTarget = this.shader === THREE.VolumetricLightShader ? new THREE.WebGLRenderTarget(window.innerWidth*0.95, window.innerHeight*0.95) : undefined;
    THREE.EffectComposer.call(this, rdr, this.renderTarget);
    this.setup(scn, cam);
}
(function(supProto) {
    PostProcessor.prototype = Object.create(supProto);
    PostProcessor.prototype.constructor = PostProcessor;

    PostProcessor.prototype.setup = function(scn, cam) {
        this.addPass(new THREE.RenderPass(scn, cam));
        if(this.shader === THREE.VolumetricLightShader) {
            this.shdrPass = new THREE.ShaderPass(THREE.VolumetericLightShader);
            this.shdrPass.needsSwap = false;
        } else if(this.shader === THREE.AdditiveBlendingShader) {
            this.shdrPass = new THREE.ShaderPass(THREE.AdditiveBlendingShader);
            this.shdrPass.renderToScreen = true;
        }
        this.addPass(this.shdrPass);
    }
    PostProcessor.prototype.setUniforms = function(pos, cam) {
        if(this.shader === THREE.VolumetricLightShader) {
            var vec = pos.clone().project(cam);
            this.shdrPass.uniforms.lightPosition.value.set((vec.x+1)/2, (vec.y+1)/2);
        }
    }
})(THREE.EffectComposer.prototype);
