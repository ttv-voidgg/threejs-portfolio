import * as THREE from 'three';
import gsap from "gsap";

import { OrbitControls } from '/src/utils/OrbitControls.js';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

import smokeVertexShader from "./shaders/smoke/vertex.glsl?raw";
import smokeFragmentShader from "./shaders/smoke/fragment.glsl?raw";

// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

// Firebase config from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// Initialize canvas and scene
const canvas = document.querySelector('#experience-canvas');
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const renderTarget = new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    samples: 10000,
});

const scene = new THREE.Scene();
scene.background = new THREE.Color("#000000");

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

// Texture mapping
const textureMap = {
    First: { night: "/textures/First_Text_Pak_Night.webp" },
    Second: { night: "/textures/Second_Text_Pak_Night.webp" },
    Third: { night: "/textures/Third_Text_Pak_Night.webp" },
    Fourth: { night: "/textures/Fourth_Text_Pak_Night.webp" },
    Fifth: { night: "/textures/Fifth_Text_Pak_Night.webp" },
    Sixth: { night: "/textures/Sixth_Text_Pak_Night.webp" },
    Seventh: { night: "/textures/Seventh_Text_Pak_Night.webp" },
    Eight: { night: "/textures/Eight_Text_Pak_Night.webp" },
    Ninth: { night: "/textures/Ninth_Text_Pak_Night.webp" },
    Targets: { night: "/textures/Targets.webp" }
};

const loadedTextures = {
    night: {},
};

// Create material for texture sets
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
    });

    // Set texture filtering for all uniforms
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

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

// Load textures
Object.entries(textureMap).forEach(([key, paths]) => {
    const nightTexture = textureLoader.load(paths.night);
    nightTexture.flipY = false;
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.minFilter = THREE.LinearFilter;
    nightTexture.magFilter = THREE.LinearFilter;
    loadedTextures.night[key] = nightTexture;
});

// Smoke shader setup
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
smokeGeometry.translate(0, 0.5, 0);
smokeGeometry.scale(0.33, 1, 0.33);

const perlinTexture = textureLoader.load("/shaders/perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

const smokeMaterial = new THREE.ShaderMaterial({
    vertexShader: smokeVertexShader,
    fragmentShader: smokeFragmentShader,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
});

// Create smoke meshes
const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
smoke.position.y = 1.53;
smoke.scale.set(.5, .5, .5);

const smoke2 = new THREE.Mesh(smokeGeometry, smokeMaterial);
smoke2.position.y = 1.53;
smoke2.rotation.y = 45;
smoke2.scale.set(.5, .3, .5);

scene.add(smoke);
scene.add(smoke2);

// Raycaster setup
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const mouse = new THREE.Vector2();
let hoveredMesh = null;
let currentPulse = null;

// Mouse move event
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
});

// Color interpolation helper
function lerpColor(color1, color2, factor) {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return c1.lerp(c2, factor);
}

// Variables for model elements
let emitMesh;
const xAxisFans = [];
const yAxisFans = [];
const zAxisFans = [];
let coffeePosition;

// Interactive meshes
const interactiveMeshes = [];
let linkedInMesh = null,
    InstagramMesh = null,
    GitHubMesh = null,
    coinBoxMesh = null,
    plantMesh = null,
    chairTop = null,
    workBtn = null,
    aboutBtn = null,
    contactBtn = null;

// CPU Video setup
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
videoTexture.repeat.set(1.0259642601013184, 0.32274699211120605);

// Video loaded event
video.addEventListener('loadedmetadata', () => {
    // Load 3D model
    loader.load("/models/model.glb", (glb) => {
        glb.scene.traverse(child => {
            if (child.isMesh) {
                // Apply textures based on mesh name
                Object.keys(textureMap).forEach((key) => {
                    if (child.name.includes(key)) {
                        const material = new THREE.MeshStandardMaterial({
                            map: loadedTextures.night[key],
                        });
                        child.material = material;
                    }
                });

                // if (child.isMesh) {
                //     console.log(child.name);
                // }

                // Coffee position
                if (child.name.includes("FifthCoffee")) {
                    coffeePosition = child.position.clone();
                }



                // Fix for SecondAU010
                if (child.name.includes("SecondAU010")) {
                    const currentScale = new THREE.Vector3();
                    child.getWorldScale(currentScale);
                    child.geometry.applyMatrix4(new THREE.Matrix4().makeScale(
                        currentScale.x, currentScale.y, currentScale.z
                    ));
                    child.scale.set(1, 1, 1);
                    child.updateMatrixWorld(true);
                }

                // Add interactive meshes
                if (
                    child.name.includes("SecondAU001") ||
                    child.name.includes("SecondAU002") ||
                    child.name.includes("SecondAU003") ||
                    child.name.includes("SecondAU004") ||
                    child.name.includes("SecondAU005") ||
                    child.name.includes("SecondAU006") ||
                    child.name.includes("SecondAU008") ||
                    child.name.includes("SecondAU009") ||
                    child.name.includes("SecondAU010") ||
                    child.name.includes("SecondAU011") ||
                    child.name.includes("SeventhMenuAbout") ||
                    child.name.includes("SeventhMenuContact") ||
                    child.name.includes("SeventhMenuProjects")
                ) {
                    interactiveMeshes.push(child);
                }

                // Chair animation setup
                if (child.name.includes("ThirdChairSeat")) {
                    chairTop = child;
                    child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
                }

                // Apply video texture to computer screen
                if (child.name.includes("TargetsComputerGPUTarget000")) {
                    child.material = new THREE.MeshBasicMaterial({
                        map: videoTexture,
                    });
                }

                // Coin box and plant setup
                if (child.name === 'FifthbakedCoinBox') {
                    coinBoxMesh = child;
                    interactiveMeshes.push(coinBoxMesh);
                }
                if (child.name === 'FifthbakedCoinBoxPlant') {
                    plantMesh = child;
                    child.scale.set(0, 0, 0);
                }


                // Fan setup
                if (child.name.includes("fan")) {
                    const name = child.name;
                    if (
                        name.includes("CPUfan008") ||
                        name.includes("GPUfan002") ||
                        name.includes("GPUfan009") ||
                        name.includes("GPUfan016")
                    ) {
                        xAxisFans.push(child);
                    } else if (
                        name.includes("GPUfan022") ||
                        name.includes("GPUfan029") ||
                        name.includes("GPUfan041") ||
                        name.includes("CPUfan002")
                    ) {
                        yAxisFans.push(child);
                    }
                }

                // Menu buttons
                if (child.name.includes("SeventhMenuProjects")) {
                    workBtn = child;
                } else if (child.name.includes("SeventhMenuAbout")) {
                    aboutBtn = child;
                } else if (child.name.includes("SeventhMenuContact")) {
                    contactBtn = child;
                }

                // Social media links
                if (child.name.includes('LinkedIn021')) {
                    linkedInMesh = child;
                    interactiveMeshes.push(child);
                }
                if (child.name.includes('LinkedIn023')) {
                    InstagramMesh = child;
                    interactiveMeshes.push(child);
                }
                if (child.name.includes('LinkedIn028')) {
                    GitHubMesh = child;
                    interactiveMeshes.push(child);
                }

                //Monitor 1 Screen
                if (child.name.includes('TargetsMonitorScreen001') ||
                    child.name.includes("SixthSwitch")
                ){
                    interactiveMeshes.push(child);
                }

                // Special material treatments
                if (child.name === 'FifthLampShade') {
                    child.material.side = THREE.DoubleSide;
                    child.material.transparent = true;
                    child.material.opacity = .5;
                    child.material.needsUpdate = true;
                }

                if (child.name === 'TargetsCase') {
                    child.material = new THREE.MeshPhysicalMaterial({
                        transmission: 1,
                        opacity: .5,
                        metalness: 0.1,
                        roughness: 0,
                        ior: 1.5,
                        thickness: 0.01,
                        specularIntensity: 1,
                        lightIntensity: 1,
                        exposure: 1,
                    });
                }

                if (child.name.includes("fan")) {
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0xff6700,
                    });
                    child.material.side = THREE.DoubleSide;
                }

                if (child.name === 'SixthComputerCPUCase') {
                    child.material.side = THREE.DoubleSide;
                    child.material.transparent = false;
                    child.material.opacity = 1;
                    child.material.needsUpdate = true;
                }

                // Emissive materials
                const emissiveMeshes = [
                    'TargetsSleeping',
                    'SixthSixthCPUEmitters',
                    'WallLight',
                    'TargetsEmitterRag',
                    'Text'
                ];

                if (child.isMesh && emissiveMeshes.some(name => child.name.includes(name))) {
                    const intensity = child.name.includes('WallLight') ||
                    child.name.includes('TargetsEmitterRag') ? 5 :
                        child.name.includes('Text') ? 5 :
                            child.name.includes('SixthSixthCPUEmitters') ? 3 : 4;

                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: intensity,
                        side: THREE.DoubleSide
                    });

                    if (child.name === 'TargetsSleeping') {
                        emitMesh = child;
                    }

                    // Apply texture filtering
                    if (child.material.map) {
                        child.material.map.minFilter = THREE.LinearFilter;
                    }
                }
            }

            // Position smoke at coffee position
            if (coffeePosition) {
                smoke.position.set(
                    coffeePosition.x,
                    coffeePosition.y + 0.01,
                    coffeePosition.z
                );
                smoke2.position.set(
                    coffeePosition.x,
                    coffeePosition.y + 0.01,
                    coffeePosition.z
                );
            }
        });

        scene.add(glb.scene);
    });
});

// Camera setup
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

// Renderer setup
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls setup
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

// Set starting camera position based on screen size
if (window.innerWidth <= 1280) {
     camera.position.set(
         16.202353126343645,
         5.131229644533014,
         28.370903777257453
     );
     controls.target.set(
         2,
         3.43913222924336,
         -4
     );
} if (window.innerWidth <= 768) {
    camera.position.set(
        0.42276232499978644, 5.132038077633577, 41.00088647256652
    );
    controls.target.set(
        0.42276232499978644, 4.875297741785342, -3.99838112591722
    );
} else {
    camera.position.set(14.488285527338899, 4.85847717518284, 23.611508023196524);
    controls.target.set(1.9999999999999996, 3.9969178828491003, -3.788852137422142);
}

// Coin box click state
let isFifthbakedCoinBoxClicked = false;

// Click event for interactive elements
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

// Modal handling
const modalIDs = ["projectModal", "aboutModal", "contactModal", "gameModal"];
const modals = {};
let isModalOpen = false;
let touchHappened = false;

const overlay = document.querySelector(".overlay");

// Register modals
modalIDs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) modals[id] = el;
});

// Show modal function
function showModal(modal) {
    if (!modal) return;

    // Remove hidden classes first so they're visible for GSAP
    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");

    // Set initial state immediately after showing
    gsap.set(overlay, { opacity: 0 });
    gsap.set(modal, { opacity: 0, scale: 0.9 });

    // Animate in
    gsap.to(overlay, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
    });

    gsap.to(modal, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
        onComplete: () => {
            gsap.set(modal, { clearProps: "opacity,scale" });
        },
    });

    isModalOpen = true;
}

// Hide modal function
function hideModal(modal) {
    if (!modal) return;

    gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
    });

    gsap.to(modal, {
        opacity: 0,
        scale: 0.9,
        duration: 0.4,
        ease: "back.in(1.7)",
        onComplete: () => {
            overlay.classList.add("hidden");
            modal.classList.add("hidden");
            gsap.set(modal, { clearProps: "opacity,scale" });
        },
    });

    isModalOpen = false;
}

// Overlay dismiss logic
["click", "touchend"].forEach((eventType) => {
    overlay.addEventListener(
        eventType,
        (e) => {
            e.preventDefault();
            if (eventType === "touchend") touchHappened = true;
            const openModal = Object.values(modals).find((m) => !m.classList.contains("hidden"));
            if (openModal) hideModal(openModal);
        },
        { passive: false }
    );
});

// Exit button logic
document.querySelectorAll(".modal-exit-button").forEach((button) => {
    function handleClose(e) {
        e.preventDefault();
        const modal = e.target.closest(".modal");
        if (!modal) return;

        // Button feedback
        gsap.to(button, {
            scale: 1.3,
            duration: 0,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(button, {
                    scale: 1,
                    duration: 0,
                    ease: "elastic.out(1, 0.5)",
                    onComplete: () => {
                        gsap.set(button, { clearProps: "scale" });
                        hideModal(modal);
                    },
                });
            },
        });
    }

    button.addEventListener("click", (e) => {
        if (!touchHappened) handleClose(e);
    });

    button.addEventListener("touchend", (e) => {
        touchHappened = true;
        handleClose(e);
    }, { passive: false });
});

// For testing with console or devtools
window.openModalByKey = function (key) {
    const modal = modals[key];
    if (modal) {
        showModal(modal);
    }
};

// Window resize event
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

// Click event for interactive elements
window.addEventListener('click', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;

        if (clickedMesh) {
            logEvent(analytics, 'mesh_click', {
                mesh_name: clickedMesh.name
            });
        }

        // Social media links
        if (clickedMesh === linkedInMesh) {
            window.open('https://www.linkedin.com/in/jcedeborja', '_blank');
        }
        if (clickedMesh === InstagramMesh) {
            window.open('https://www.instagram.com/kai._.0008/', '_blank');
        }
        if (clickedMesh === GitHubMesh) {
            window.open('https://github.com/ttv-voidgg/', '_blank');
        }

        // Menu buttons
        if (clickedMesh.name === 'SeventhMenuProjects') {
            showModal(modals.projectModal);
            return;
        }
        if (clickedMesh.name === 'SeventhMenuAbout') {
            showModal(modals.aboutModal);
            return;
        }
        if (clickedMesh.name === 'SeventhMenuContact') {
            showModal(modals.contactModal);
            return;
        }

        //Handle PC On
        const beep = new Audio('/audio/beep.mp3');

        function playBeepOnce() {
            if (beep.paused) {
                beep.currentTime = 0; // rewind just in case
                beep.play();
            }
        }

        if (clickedMesh.name === 'SixthSwitch') {
            playBeepOnce();
        }

        // Monitor screen interaction
        if (clickedMesh.name === 'TargetsMonitorScreen001') {
            const newCameraPos = {
                x: -0.5242167526559158,
                y: 6.570725013126704,
                z: 0.999009930642536
            };

            const newTarget = {
                x: -0.6237140558221332,
                y: 6.570725013126704,
                z: -3.999999999999996
            };

            // Animate camera position
            gsap.to(camera.position, {
                x: newCameraPos.x,
                y: newCameraPos.y,
                z: newCameraPos.z,
                duration: 2,
                onUpdate: () => {
                    controls.update(); // Keeps controls synced
                }
            });

            // Animate OrbitControls target
            gsap.to(controls.target, {
                x: newTarget.x,
                y: newTarget.y,
                z: newTarget.z,
                duration: 2,
                onUpdate: () => {
                    controls.update();
                },
                onComplete: () => {
                    showModal(modals.gameModal);
                    return;
                }
            });
        }
    }
});

// Post-processing setup
const composer = new EffectComposer(renderer, renderTarget);
const fxaaPass = new ShaderPass(FXAAShader);

composer.setSize(sizes.width, sizes.height);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

fxaaPass.material.uniforms['resolution'].value.set(1 / sizes.width, 1 / sizes.height);
composer.addPass(fxaaPass);

// Add the normal render pass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Film shader for softer colors
const FilmShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0 },
        tint: { value: new THREE.Vector3(0.05, 0.02, 0.0) },
        noiseIntensity: { value: 0.001 },
        grayscale: { value: false }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform vec3 tint;
    uniform float noiseIntensity;
    uniform bool grayscale;

    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);

      // Add tint
      texel.rgb += tint;

      // Optional grayscale
      if (grayscale) {
        float gray = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
        texel.rgb = vec3(gray);
      }

      // Noise
      float noise = rand(vUv + time);
      texel.rgb += noiseIntensity * (noise - 0.5);
      gl_FragColor = texel;
    }
  `
};

// Add bloom pass
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3,  // strength
    1.5,  // radius
    0.85  // threshold
);
composer.addPass(bloomPass);

// Animation constants
const baseY = 4;
const amplitude = 0.2; // how high it goes up and down
const frequency = .05; // oscillations per second
const textAmplitude = .5; // how high it goes up and down
const rotationAmplitude = 0.00025; // how much it rotates
const rotationFrequency = .1; // oscillations per second
const clock = new THREE.Clock();

// Render loop
const render = (timestamp) => {

    console.log(camera.position);
    console.log(controls.target);

    // Get elapsed time
    const elapsed = clock.getElapsedTime();

    // Update smoke animation
    smokeMaterial.uniforms.uTime.value = elapsed;

    // Camera wobble
    const wobbleAmount = .5; // Increase this for more wobble
    const wobbleSpeed = .5;
    cameraGroup.position.y = baseCamY + Math.sin(elapsed * wobbleSpeed) * wobbleAmount;

    // Update controls
    controls.update();

    // Update fan rotations
    xAxisFans.forEach(fan => fan.rotation.x += 0.02);
    yAxisFans.forEach(fan => fan.rotation.y += 0.02);
    zAxisFans.forEach(fan => fan.rotation.y -= 0.02);

    // Chair rotate animation
    if (chairTop) {
        const time = timestamp * 0.001;
        const baseAmplitude = Math.PI / 8;

        const rotationOffset =
            baseAmplitude *
            Math.sin(time * 0.5) *
            (1 - Math.abs(Math.sin(time * 0.5)) * 0.3);

        chairTop.rotation.z = chairTop.userData.initialRotation.z + rotationOffset;
    }

    // Raycaster for hover effects
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes, false);

    // Animate floating elements
    const targetsSleeping = scene.getObjectByName('TargetsSleeping');
    if (targetsSleeping) {
        const baseRotationX = targetsSleeping.rotation.x; // Save original rotation
        const sine = Math.sin(elapsed * frequency * Math.PI * 2);
        const rotationSine = Math.sin(elapsed * rotationFrequency * Math.PI * 2);

        targetsSleeping.position.y = baseY + sine * (amplitude / 2);
        targetsSleeping.rotation.x = baseRotationX + rotationSine * rotationAmplitude;
    }

    // Text animation
    const TextName = scene.getObjectByName('Text');
    if (TextName) {
        // Hide on mobile
        TextName.visible = window.innerWidth > 768;

        const baseRotationX = TextName.rotation.x;
        const sine = Math.sin(elapsed * frequency * Math.PI * 2);
        const rotationSine = Math.sin(elapsed * rotationFrequency * Math.PI * 2);

        TextName.position.y = baseY + sine * (textAmplitude / 2);
    }

    // Handle hover effects
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
                hoveredMesh.material.emissive = new THREE.Color(0xFFD700); // gold glow
                hoveredMesh.material.emissiveIntensity = 0; // safe default
                hoveredMesh.material.needsUpdate = true;
            }

            // Scale up
            if (hoveredMesh.name === 'TargetsMonitorScreen001' ||
                hoveredMesh.name === 'SixthSwitch'
            ) {

            } else {
                gsap.to(hoveredMesh.scale, {
                    x: 1.2,
                    y: 1.2,
                    z: 1.2,
                    duration: 0.3,
                    ease: "Power2.easeInOut",
                });
            }


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

        // When hovering over coin box
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
                    duration: 1,
                    ease
                });
            }
        }

        canvas.style.cursor = 'url(/images/cursor/pointer.png), auto';
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

        canvas.style.cursor = 'url(/images/cursor/default.png), auto';
    }

    // Render the scene
    composer.render(scene, camera);
    requestAnimationFrame(render);
};

// Start the render loop
render();

function handleIframeMessage(event) {
    if (event.data?.type === 'IFRAME_CLICKED') {
        ParentFunction(event.data.value);
    }
}

function ParentFunction(value) {
    const modal = document.querySelector('#gameModal');
    gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
    });

    gsap.to(modal, {
        opacity: 0,
        scale: 0.9,
        duration: 0.4,
        ease: "back.in(1.7)",
        onComplete: () => {
            overlay.classList.add("hidden");
            modal.classList.add("hidden");
            gsap.set(modal, { clearProps: "opacity,scale" });
        },
    });

    isModalOpen = false;
}

window.addEventListener('message', handleIframeMessage, false);