"use strict";

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.VolumetericLightShader = {
  uniforms: {
    tDiffuse: { value: null },
    lightPosition: { value: new THREE.Vector2(0.5, 0.5) },
    exposure: { value: 0.25 },
    decay: { value: 0.96 },
    density: { value: 0.8 },
    weight: { value: 0.45 },
    samples: { value: 80 }
  },
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),
  fragmentShader: [
    "varying vec2 vUv;",
    "uniform sampler2D tDiffuse;",
    "uniform vec2 lightPosition;",
    "uniform float exposure;",
    "uniform float decay;",
    "uniform float density;",
    "uniform float weight;",
    "uniform int samples;",
    "const int MAX_SAMPLES = 100;",
    "void main() {",
      "vec2 texCoord = vUv;",
      "vec2 deltaTextCoord = texCoord - lightPosition;",
      "deltaTextCoord *= 1.0 / float(samples) * density;",
      "vec4 color = texture2D(tDiffuse, texCoord);",
      "float illuminationDecay = 1.0;",
      "for(int i=0; i < MAX_SAMPLES; i++) {",
        "if(i == samples) {",
           "break;",
        "}",
        "texCoord -= deltaTextCoord;",
        "vec4 sample = texture2D(tDiffuse, texCoord);",
        "sample *= illuminationDecay * weight;",
        "color += sample;",
        "illuminationDecay *= decay;",
      "}",
      "gl_FragColor = color * exposure;",
    "}"
  ].join("\n")
};


THREE.AdditiveBlendingShader = {
  uniforms: {
    tDiffuse: { value: null },
    tAdd: { value: null }
  },
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),
  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tAdd;",
    "varying vec2 vUv;",
    "void main() {",
      "vec4 color = texture2D( tDiffuse, vUv );",
      "vec4 add = texture2D( tAdd, vUv );",
      "gl_FragColor = color + add;",
    "}"
  ].join("\n")
};


THREE.PassThroughShader = {
    uniforms: {
      tDiffuse: { value: null }
    },
    vertexShader: [
      "varying vec2 vUv;",
      "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
      "}"
    ].join( "\n" ),
    fragmentShader: [
      "uniform sampler2D tDiffuse;",
      "varying vec2 vUv;",
      "void main() {",
        "gl_FragColor = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );",
      "}"
    ].join( "\n" )
};


THREE.CopyShader = {
  uniforms: {
    "tDiffuse": { value: null },
    "opacity":  { value: 1.0 }
  },
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join( "\n" ),
  fragmentShader: [
    "uniform float opacity;",
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",
    "void main() {",
      "vec4 texel = texture2D( tDiffuse, vUv );",
      "gl_FragColor = opacity * texel;",
    "}"
  ].join( "\n" )
};


THREE.EffectComposer = function ( renderer, renderTarget ) {
  this.renderer = renderer;
  if ( renderTarget === undefined ) {
    var parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    };
    var size = renderer.getSize();
    renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );
  }
  this.renderTarget1 = renderTarget;
  this.renderTarget2 = renderTarget.clone();
  this.writeBuffer = this.renderTarget1;
  this.readBuffer = this.renderTarget2;
  this.passes = [];
  if ( THREE.CopyShader === undefined ) {
    console.error( "THREE.EffectComposer relies on THREE.CopyShader" );
  }
  this.copyPass = new THREE.ShaderPass( THREE.CopyShader );
};
Object.assign( THREE.EffectComposer.prototype, {
  swapBuffers: function() {
    var tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  },
  addPass: function ( pass ) {
    this.passes.push( pass );
    var size = this.renderer.getSize();
    pass.setSize( size.width, size.height );
  },
  insertPass: function ( pass, index ) {
    this.passes.splice( index, 0, pass );
  },
  render: function ( delta ) {
    var maskActive = false;
    var pass, i, il = this.passes.length;
    for ( i = 0; i < il; i ++ ) {
      pass = this.passes[ i ];
      if ( pass.enabled === false ) continue;
      pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );
      if ( pass.needsSwap ) {
        if ( maskActive ) {
          var context = this.renderer.context;
          context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
          this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );
          context.stencilFunc( context.EQUAL, 1, 0xffffffff );
        }
        this.swapBuffers();
      }
      if ( THREE.MaskPass !== undefined ) {
        if ( pass instanceof THREE.MaskPass ) {
          maskActive = true;
        } else if ( pass instanceof THREE.ClearMaskPass ) {
          maskActive = false;
        }
      }
    }
  },
  reset: function ( renderTarget ) {
    if ( renderTarget === undefined ) {
      var size = this.renderer.getSize();
      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize( size.width, size.height );
    }
    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  },
  setSize: function ( width, height ) {
    this.renderTarget1.setSize( width, height );
    this.renderTarget2.setSize( width, height );
    for ( var i = 0; i < this.passes.length; i ++ ) {
      this.passes[i].setSize( width, height );
    }
  }
} );


THREE.Pass = function () {
  // if set to true, the pass is processed by the composer
  this.enabled = true;
  // if set to true, the pass indicates to swap read and write buffer after rendering
  this.needsSwap = true;
  // if set to true, the pass clears its buffer before rendering
  this.clear = false;
  // if set to true, the result of the pass is rendered to screen
  this.renderToScreen = false;
};
Object.assign( THREE.Pass.prototype, {
  setSize: function( width, height ) {},
  render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {
    console.error( "THREE.Pass: .render() must be implemented in derived pass." );
  }
} );


THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {
  THREE.Pass.call( this );
  this.scene = scene;
  this.camera = camera;
  this.overrideMaterial = overrideMaterial;
  this.clearColor = clearColor;
  this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;
  this.clear = true;
  this.needsSwap = false;
};
THREE.RenderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {
  constructor: THREE.RenderPass,
  render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {
    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    this.scene.overrideMaterial = this.overrideMaterial;
    var oldClearColor, oldClearAlpha;
    if ( this.clearColor ) {
      oldClearColor = renderer.getClearColor().getHex();
      oldClearAlpha = renderer.getClearAlpha();
      renderer.setClearColor( this.clearColor, this.clearAlpha );
    }
    renderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );
    if ( this.clearColor ) {
      renderer.setClearColor( oldClearColor, oldClearAlpha );
    }
    this.scene.overrideMaterial = null;
    renderer.autoClear = oldAutoClear;
  }
} );


THREE.ShaderPass = function ( shader, textureID ) {
  THREE.Pass.call( this );
  this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";
  if ( shader instanceof THREE.ShaderMaterial ) {
    this.uniforms = shader.uniforms;
    this.material = shader;
  } else if ( shader ) {
    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    this.material = new THREE.ShaderMaterial( {
      defines: shader.defines || {},
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    } );
  }
  this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  this.scene = new THREE.Scene();
  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.scene.add( this.quad );
};
THREE.ShaderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {
  constructor: THREE.ShaderPass,
  render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {
    if ( this.uniforms[ this.textureID ] ) {
      this.uniforms[ this.textureID ].value = readBuffer.texture;
    }
    this.quad.material = this.material;
    if ( this.renderToScreen ) {
      renderer.render( this.scene, this.camera );
    } else {
      renderer.render( this.scene, this.camera, writeBuffer, this.clear );
    }
  }
} );
