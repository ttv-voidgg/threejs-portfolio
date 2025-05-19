import './style.scss'

import * as THREE from 'three';
import { OrbitControls } from '/src/utils/OrbitControls.js';
import {DRACOLoader} from "three/addons/loaders/DRACOLoader.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from "gsap";

//import smokeVertexShader from "./shaders/smoke/vertex.glsl";
//import smokeFragmentShader from "./shaders/smoke/fragment.glsl";
//import themeVertexShader from "./shaders/theme/vertex.glsl";
//import themeFragmentShader from "./shaders/theme/fragment.glsl";

//Initialize some stuff

const canvas = document.querySelector('#experience-canvas');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

const scene = new THREE.Scene();
scene.background = new THREE.Color("#000000");

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco/' );

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

const textureMap = {
    First: {
        night:"/textures/First_Text_Pak_Night.webp",
    },
    Second: {
        night:"/textures/Second_Text_Pak_Night.webp",
    },
    Third: {
        night:"/textures/Third_Text_Pak_Night.webp",
    },
    Fourth: {
        night:"/textures/Fourth_Text_Pak_Night.webp",
    },
    Fifth: {
        night:"/textures/Fifth_Text_Pak_Night.webp",
    },
    Sixth: {
        night:"/textures/Sixth_Text_Pak_Night.webp",
    },
    Seventh: {
        night:"/textures/Seventh_Text_Pak_Night.webp",
    },
    Eight: {
        night:"/textures/Eight_Text_Pak_Night.webp",
    },
    Ninth: {
        night:"/textures/Ninth_Text_Pak_Night.webp",
    },
    Targets: {
        night:"/textures/Targets.webp",
    }
};

const loadedTextures = {
    night: {
    },
}

const createMaterialForTextureSet = (textureSet) => {
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uNightTexture1: { value: loadedTextures.night.First },
            uNightTexture2: { value: loadedTextures.night.Second },
            uNightTexture3: { value: loadedTextures.night.Third },
            uNightTexture4: { value: loadedTextures.night.Fourth },
            uNightTexture5: { value: loadedTextures.night.Fifth },
            uNightTexture6: { value: loadedTextures.night.Sixth },
            uNightTexture7: { value: loadedTextures.night.Seventh },
            uNightTexture8: { value: loadedTextures.night.Eight },
            uNightTexture9: { value: loadedTextures.night.Ninth },
            uMixRatio: { value: 0 },
            uTextureSet: { value: textureSet },
        },
        //vertexShader: themeVertexShader,
        //fragmentShader: themeFragmentShader,
    });

    Object.entries(material.uniforms).forEach(([key, uniform]) => {
        if (uniform.value instanceof THREE.Texture) {
            uniform.value.minFilter = THREE.LinearFilter;
            uniform.value.magFilter = THREE.LinearFilter;
        }
    });

    return material;
};

const roomMaterials = {
    First: createMaterialForTextureSet(1),
    Second: createMaterialForTextureSet(2),
    Third: createMaterialForTextureSet(3),
    Fourth: createMaterialForTextureSet(4),
};

const ambientLight = new THREE.AmbientLight(0xffffff,3); // black ambient light
scene.add(ambientLight);

Object.entries(textureMap).forEach(([key, paths]) => {
    const nightTexture = textureLoader.load(paths.night);
    nightTexture.flipY = false;
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.minFilter = THREE.LinearFilter;
    nightTexture.magFilter = THREE.LinearFilter;
    loadedTextures.night[key] = nightTexture;
});


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const mouse = new THREE.Vector2();
let hoveredMesh = null;
let currentPulse = null;

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
});

// Helper to interpolate between two colors
function lerpColor(color1, color2, factor) {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return c1.lerp(c2, factor);
}

let emitMesh;

//Model and Mesh
const xAxisFans = [];
const yAxisFans = [];
const zAxisFans = [];

//CPU Video
const video = document.createElement('video');
video.src = 'videos/1.mp4';
video.loop = true;
video.muted = true;
video.playsInline = true;
video.autoplay = true;
video.play();

const videoTexture = new THREE.VideoTexture(video);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;
videoTexture.repeat.set(1.0259642601013184,  0.32274699211120605);

const interactiveMeshes = [];

let linkedInMesh = null;
let InstagramMesh = null;
let GitHubMesh = null;
let coinBoxMesh = null;
let plantMesh = null;


video.addEventListener('loadedmetadata', () => {
    const videoAspect = video.videoWidth / video.videoHeight;

loader.load("/models/model.glb", (glb)=>{
    glb.scene.traverse(child=>{
        if(child.isMesh){
            Object.keys(textureMap).forEach((key)=>{
                if(child.name.includes(key)){
                    const material = new THREE.MeshStandardMaterial({
                        map: loadedTextures.night[key],
                    });

                    child.material = material;
                }
            })

            if (child.name.includes("TargetsComputerGPUTarget000")) {
                const bbox = new THREE.Box3().setFromObject(child);
                const size = new THREE.Vector3();
                bbox.getSize(size);

                console.log('Mesh size:', size);
                child.material = new THREE.MeshBasicMaterial({
                    map: videoTexture,
                });
            }

            console.log('Mesh:', child.name, child);

            if (child.name === 'FifthbakedCoinBox') {
                coinBoxMesh = child;
                interactiveMeshes.push(coinBoxMesh);
            }
            if (child.name === 'FifthbakedCoinBoxPlant') {
                plantMesh = child;
                child.scale.set(0, 0, 0);
            }

            if (child.name.includes("fan")) {
                const name = child.name;

                if (
                    name.includes("CPUfan008") ||
                    name.includes("GPUfan002") ||
                    name.includes("GPUfan009") ||
                    name.includes("GPUfan016")
                ) {
                    xAxisFans.push(child);
                }
                else if (
                    name.includes("GPUfan022") ||
                    name.includes("GPUfan029") ||
                    name.includes("GPUfan041") ||
                    name.includes("CPUfan002")
                ) {
                    yAxisFans.push(child);
                }

                console.log("Classified fan:", name);
            }


            if (child.name.includes('LinkedIn021')) {
                linkedInMesh = child;
                interactiveMeshes.push(child);
            }
            if (child.name.includes('LinkedIn023')) {
                InstagramMesh = child;
                interactiveMeshes.push(child);
            }
            if (child.name.includes('LinkedIn028')){
                GitHubMesh = child;
                interactiveMeshes.push(child);
            }

            if (child.material.map) {
                child.material.map.minFilter = THREE.LinearFilter;

            }

            if (child.name === 'FifthLampShade') {
                // Make material double-sided and fully opaque
                child.material.side = THREE.DoubleSide;
                child.material.transparent = true;
                child.material.opacity = .5;
                child.material.needsUpdate = true;

                console.log('Updated mesh:', child.name, child.material);
            }

            if (child.name === 'TargetsCase') {
                // Replace existing material with a white transparent one
                child.material = new THREE.MeshPhysicalMaterial({
                    transmission: 1,
                    opacity: .5,
                    metalness:0.1,
                    roughness:0,
                    ior: 1.5,
                    thickness: 0.01,
                    specularIntensity: 1,
                    lightIntensity: 1,
                    exposure: 1,
                });

                console.log('Updated mesh:', child.name, child.material);
            }

            if(child.name.includes("fan") ) {
                child.material = new THREE.MeshBasicMaterial({
                    color: 0xff6700, // 🔴 Change to any desired color
                });
                child.material.side = THREE.DoubleSide;
            }

            if (child.name === 'SixthComputerCPUCase') {
                // Make material double-sided and fully opaque
                child.material.side = THREE.DoubleSide;
                child.material.transparent = false;
                child.material.opacity = 1;
                child.material.needsUpdate = true;

                console.log('Updated mesh:', child.name, child.material);
            }


            if (child.isMesh && child.name === 'TargetsSleeping') {
                // Create emissive material
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    emissive: new THREE.Color(0xffffff),
                    emissiveIntensity: 1,
                    side: THREE.DoubleSide
                });

                emitMesh = child;
            }

            if (child.isMesh && child.name === 'SixthSixthCPUEmitters') {
                // Create emissive material
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    emissive: new THREE.Color(0xffffff),
                    emissiveIntensity: 3,
                    side: THREE.DoubleSide
                });

                emitMesh = child;
            }

            if (child.isMesh && child.name === 'TargetsEmitterRag') {
                // Create emissive material
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    emissive: new THREE.Color(0xffffff),
                    emissiveIntensity: 5,
                    side: THREE.DoubleSide
                });

                emitMesh = child;
            }

            if (child.isMesh && child.name === 'Text') {
                // Create emissive material
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    emissive: new THREE.Color(0xffffff),
                    emissiveIntensity: 2,
                    side: THREE.DoubleSide
                });

                emitMesh = child;
            }

            if (child.isMesh && child.name === 'TargetsSleeping') {
                // Create emissive material
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    emissive: new THREE.Color(0xffffff),
                    emissiveIntensity: 4,
                    side: THREE.DoubleSide
                });

                emitMesh = child;
            }

        }
        scene.add(glb.scene);
    })
});

});

const camera = new THREE.PerspectiveCamera(
    35,
    sizes.width / sizes.height,
    0.1,
    200
);


const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

const baseCamY = cameraGroup.position.y || 0;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 45;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.update();

//_Vector3 {x: 12.798676274812095, y: 16.512783721539325, z: 12.785748391518231}
//_Vector3 {x: -0.487544531130077, y: 3.667334068422673, z: -1.6516437315843748}
//Set starting camera position
if (window.innerWidth < 768) {
    camera.position.set(
        29.567116827654726,
        14.018476147584705,
        31.37040363900147
    );
    controls.target.set(
        -0.08206262548844094,
        3.3119233527087255,
        -0.7433922282864018
    );
} else {
    camera.position.set(14.488285527338899, 4.85847717518284, 23.611508023196524);
    controls.target.set(1.9999999999999996, 3.9969178828491003, -3.788852137422142 );
}


window.addEventListener('click', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        if (clickedMesh === linkedInMesh) {
            window.open('https://www.linkedin.com/in/jcedeborja', '_blank');
        }
        if (clickedMesh === InstagramMesh) {
            window.open('https://www.instagram.com/kai._.0008/', '_blank');
        }
        if (clickedMesh === GitHubMesh) {
            window.open('https://github.com/ttv-voidgg/', '_blank');
        }
    }
});

let isFifthbakedCoinBoxClicked = false;

window.addEventListener('click', (event) => {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes);

    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;

        if (clickedMesh.name === 'FifthbakedCoinBox') {
            isFifthbakedCoinBoxClicked = true;

            const plant = scene.getObjectByName('FifthbakedCoinBoxPlant');
            if (plant) {
                gsap.to(plant.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.3,
                    ease: "Power2.easeOut"
                });
            }
        }
    }
});

function handleRaycasterInteraction() {
    if (currentIntersects.length > 0) {
        const object = currentIntersects[0].object;

        Object.entries(socialLinks).forEach(([key, url]) => {
            if (object.name.includes(key)) {
                const newWindow = window.open();
                newWindow.opener = null;
                newWindow.location = url;
                newWindow.target = "_blank";
                newWindow.rel = "noopener noreferrer";
            }
        });

        // if (object.name.includes("Work_Button")) {
        //     showModal(modals.work);
        // } else if (object.name.includes("About_Button")) {
        //     showModal(modals.about);
        // } else if (object.name.includes("Contact_Button")) {
        //     showModal(modals.contact);
        // }
    }
}



//Event Listeners
window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update Camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Required for postprocessing
const composer = new EffectComposer(renderer);
composer.setSize(sizes.width, sizes.height);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Add the normal render pass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add Unreal Bloom Pass
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
        .2,  // strength
        .2,  // radius
    0.85  // threshold
);
composer.addPass(bloomPass);

const targetsSleeping = scene.getObjectByName('TargetsSleeping');
const baseY = 4;
const amplitude = 0.2; // how high it goes up and down
const frequency = .05; // oscillations per second
const textAmplitude = .5; // how high it goes up and down
const rotationAmplitude = 0.00025; // how much it rotates
const rotationFrequency = .1; // oscillations per second
let clock = new THREE.Clock();

const render = () => {
    //VARS
    const elapsed = clock.getElapsedTime();

    // Amplitude = how much it moves, Frequency = how fast it moves
    const wobbleAmount = .5; // Increase this for more wobble
    const wobbleSpeed = .5;

    // Float up/down
    cameraGroup.position.y = baseCamY + Math.sin(elapsed * wobbleSpeed) * wobbleAmount;
    //Orbit Controls
    controls.update();

    // Update fan rotations
    xAxisFans.forEach(fan => fan.rotation.x += 0.02);
    yAxisFans.forEach(fan => fan.rotation.y += 0.02);
    zAxisFans.forEach(fan => fan.rotation.y -= 0.02);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes, false);

    const targetsSleeping = scene.getObjectByName('TargetsSleeping');

    if (targetsSleeping) {
        const baseRotationX = targetsSleeping.rotation.x; // Save original rotation
        const sine = Math.sin(elapsed * frequency * Math.PI * 2);
        const rotationSine = Math.sin(elapsed * rotationFrequency * Math.PI * 2);

        targetsSleeping.position.y = baseY + sine * (amplitude / 2);

        // Oscillate rotation
        targetsSleeping.rotation.x = baseRotationX + rotationSine * rotationAmplitude;
    }

    const TextName = scene.getObjectByName('Text');

    if (TextName) {

        if (window.innerWidth <= 768) {
            TextName.visible = false;
        } else {
            TextName.visible = true;
        }

        const baseRotationX = TextName.rotation.x; // Save original rotation
        const sine = Math.sin(elapsed * frequency * Math.PI * 2);
        const rotationSine = Math.sin(elapsed * rotationFrequency * Math.PI * 2);

        TextName.position.y = baseY + sine * (textAmplitude / 2);
    }

    if (intersects.length > 0) {
        const target = intersects[0].object;

        if (hoveredMesh !== target) {
            // Reset previous hovered mesh
            if (hoveredMesh) {
                gsap.to(hoveredMesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
                gsap.to(hoveredMesh.material, { emissiveIntensity: 0, duration: 0.3 });
            }

            hoveredMesh = target;

            // Ensure emissive setup without overwriting texture
            if (hoveredMesh.material) {
                hoveredMesh.material.emissive = new THREE.Color(0xFFD700); // white glow
                hoveredMesh.material.emissiveIntensity = 0; // safe default
                hoveredMesh.material.needsUpdate = true;
            }

            // Scale up
            gsap.to(hoveredMesh.scale, {
                x: 1.2,
                y: 1.2,
                z: 1.2,
                duration: 0.3,
                ease: "Power2.easeInOut",
            });

            // Emissive pulse if material has it
            if (hoveredMesh.material.emissiveIntensity !== undefined) {
                // Kill old tween
                if (currentPulse) currentPulse.kill();

                currentPulse = gsap.to(hoveredMesh.material, {
                    emissiveIntensity: .1,
                    duration: 0.6,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        }

// When hovering
        if (hoveredMesh.name === 'FifthbakedCoinBox' && isFifthbakedCoinBoxClicked) {
            const plant = scene.getObjectByName('FifthbakedCoinBoxPlant');
            if (plant) {
                const duration = 0.4;
                const ease = "Power2.easeOut";

                gsap.to(plant.scale, {
                    x: 1.2,
                    y: 1.2,
                    z: 1.2,
                    duration,
                    ease
                });

                gsap.to(plant.position, {
                    y: 6.100522613525391,
                    duration:1,
                    ease
                });
            }
        }

        canvas.style.cursor = 'pointer';
    } else {
        // Reset if no intersection
        if (hoveredMesh) {
            gsap.to(hoveredMesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });

            if (hoveredMesh.material.emissiveIntensity !== undefined) {
                gsap.to(hoveredMesh.material, {
                    emissiveIntensity: 0,
                    duration: 0.3,
                    ease: "Power2.easeOut"
                });
            }

            if (currentPulse) currentPulse.kill();
            hoveredMesh = null;
        }

        // Reset plant scale if no longer hovering FifthbakedCoinBox
        // On mouse out
        const plant = scene.getObjectByName('FifthbakedCoinBoxPlant');
        if (plant && isFifthbakedCoinBoxClicked) {
            const duration = 0.3;
            const ease = "Power2.easeOut";

            gsap.to(plant.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration,
                ease
            });

            gsap.to(plant.position, {
                y: 6.000522613525391,
                duration,
                ease
            });
        }

        canvas.style.cursor = 'default';
    }

    //console.log(camera.position);
    //console.log(controls.target);


    composer.render(scene, camera);
    requestAnimationFrame(render);
};


render();