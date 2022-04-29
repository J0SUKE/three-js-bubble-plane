import './css/style.css';
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";
import { Side } from 'three';

/**
 * Canvas
 */
const canvasElement = document.querySelector(".webgl");

let sizes = {
    width:window.innerWidth,
    height:window.innerHeight,
}
const {width,height} = sizes;

/**
 * Scene and camera
 */

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

camera.position.set(0,0,2)
camera.lookAt(new THREE.Vector3())

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas:canvasElement
});
renderer.shadowMap.enabled=true;
renderer.setSize( width, height );
renderer.render(scene,camera);

//Axes helper
//scene.add(new THREE.AxesHelper(1));
// orbit controls
const controls = new OrbitControls( camera, canvasElement);
controls.enableDamping=true;

/**
 * Lights
 */

let ambientLight = new THREE.AmbientLight("white",.4);
scene.add(ambientLight);

let directionalLight = new THREE.DirectionalLight("white",0.5);
directionalLight.position.set(1,1,1);
scene.add(directionalLight);

/**
 * 3D model
 */
let textureloader = new THREE.TextureLoader();

let afficheTexture = textureloader.load("/model/weAreAsGods.jpg");

let geometry = new THREE.PlaneGeometry(3,3,128,128);

let affiche = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial(
        {
            color:"#ff69c3",
            side:THREE.DoubleSide
        }
    )
)
affiche.castShadow=true;
affiche.receiveShadow=true;

const count = affiche.geometry.attributes.position.count;


let origin = {
    x:1,y:1
}

const raycaster = new THREE.Raycaster();


geometry.computeVertexNormals();
geometry.attributes.position.needsUpdate=true;

scene.add(affiche)

const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;

})

let animate = ()=>{
    
    
    raycaster.setFromCamera(mouse, camera);

    const objectsToTest = [affiche]
    const intersects = raycaster.intersectObjects(objectsToTest)

    for(const intersect of intersects)
    {
        origin.x = intersect.point.x;
        origin.y = intersect.point.y;
        for (let i = 0; i < count; i++) 
        {
            const x = geometry.attributes.position.getX(i);
            const y =geometry.attributes.position.getY(i);

            if (distance(x,y,origin)<=0.5) {
                geometry.attributes.position.setZ(i,0.25-Math.pow(origin.x-x,2)-Math.pow(origin.y-y,2));
            }
            else
            {
                geometry.attributes.position.setZ(i,0);
            }
        }


        geometry.computeVertexNormals();
        geometry.attributes.position.needsUpdate=true;
    }


    controls.update();

    renderer.render(scene,camera);
    window.requestAnimationFrame(animate)
}

animate();

function distance(x,y,origin) {
    return Math.sqrt(Math.pow(x-origin.x,2)+Math.pow(y-origin.y,2));
}