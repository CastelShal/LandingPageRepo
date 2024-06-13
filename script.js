import * as THREE from 'three';

const fragment = `
#define M_PI 3.14159265358979323846
varying vec2 vUv;
uniform float uTime;
uniform sampler2D image;
float cubicPulse(float c, float w, float x) {
    x = abs(x - c);
    if(x > w)
        return 0.0;
    x /= w;
    return 1.0 - x * x * (3.0 - 2.0 * x);
}

void main() {
    vec4 texture = texture2D(image, vUv);
    texture.rgb *= clamp(cubicPulse(uTime, 0.2, length(vUv - vec2(0.5, 0.9))) * 2.,1.,1.6);
    texture.rgb *= clamp(cubicPulse(step(.5, uTime) * (uTime - .65), 0.2, length(vUv - vec2(0.5, 0.))) * 2.,1.,2.);
    // texture.rgb *= clamp(cubicPulse(uTime , 0.04, length(vUv - vec2(0.5, 0.5))) * 2.,1.,2.);
    // texture.rgb *= clamp(cubicPulse(uTime , 0.07, length(vUv - vec2(0.5, 0.5))) * 2.,1.,2.);
    gl_FragColor = texture;
}
`

const vertex = `
varying vec2 vUv;
void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
}
`
const container = document.querySelector('.logo-cont')

const width = 350, height = 350;
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('logo')});
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(29, width / height, 0.1, 10000);

renderer.setSize(width, height);
renderer.setClearColor(0x0f0c0c);   
// document.querySelector('#container').appendChild(renderer.domElement);

const texture = new THREE.TextureLoader().load('./logo.png');
texture.colorSpace = THREE.LinearSRGBColorSpace

const uniforms = {
    'uProgress': 0.0,
    'uTime': { type: 'f', value: 0.0 },
    'uResolution': new THREE.Vector2(width, height),
    'image': { type: 't', value: texture }
}

camera.position.set(0, 0, 1000);
const geometry = new THREE.PlaneGeometry(536, 536, 1, 1);
const material = new THREE.ShaderMaterial({
    fragmentShader: fragment,
    vertexShader: vertex,
    transparent: 1,
    uniforms,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
let time = 0;

function renderLoop() {
    time += 0.0025;
    time %= 1.85;
    material.uniforms.uTime.value = time;
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(renderLoop);

container.addEventListener('resize', function () {
    camera.aspect = container.innerWidth / container.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.innerWidth, container.innerHeight);
})