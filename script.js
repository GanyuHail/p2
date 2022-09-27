"use strict";
exports.__esModule = true;
var THREE = require("three");
var OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
var GLTFLoader_1 = require("three/examples/jsm/loaders/GLTFLoader");
var stats_module_1 = require("three/examples/jsm/libs/stats.module");
var scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;
var renderer = new THREE.WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var controls = new OrbitControls_1.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
// const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
// const points = new Array()
// points.push( new THREE.Vector3( 0, 0, 0 ) )
// points.push( new THREE.Vector3( 0, 0, .25 ) )
// const geometry = new THREE.BufferGeometry().setFromPoints( points )
// const line = new THREE.Line( geometry, material )
// scene.add( line )
var arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 0.25, 0xffff00);
scene.add(arrowHelper);
var material = new THREE.MeshNormalMaterial();
var boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
var coneGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
var raycaster = new THREE.Raycaster();
var sceneMeshes = [];
var loader = new GLTFLoader_1.GLTFLoader();
loader.load('src/candy.glb', function (gltf) {
    gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            var m = child;
            m.receiveShadow = true;
            m.castShadow = true;
            m.material.flatShading = true;
            sceneMeshes.push(m);
        }
        if (child.isLight) {
            var l = child;
            l.castShadow = true;
            l.shadow.bias = -0.003;
            l.shadow.mapSize.width = 2048;
            l.shadow.mapSize.height = 2048;
        }
    });
    scene.add(gltf.scene);
    // sceneMeshes.push(gltf.scene)
}, function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
}, function (error) {
    console.log(error);
});
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
renderer.domElement.addEventListener('dblclick', onDoubleClick, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event) {
    var mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    };
    // console.log(mouse)
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(sceneMeshes, false);
    if (intersects.length > 0) {
        // console.log(sceneMeshes.length + " " + intersects.length)
        // console.log(intersects[0])
        // console.log(intersects[0].object.userData.name + " " + intersects[0].distance + " ")
        // console.log((intersects[0].face as THREE.Face).normal)
        // line.position.set(0, 0, 0)
        // line.lookAt((intersects[0].face as THREE.Face).normal)
        // line.position.copy(intersects[0].point)
        var n = new THREE.Vector3();
        n.copy(intersects[0].face.normal);
        n.transformDirection(intersects[0].object.matrixWorld);
        arrowHelper.setDirection(n);
        arrowHelper.position.copy(intersects[0].point);
    }
}
function onDoubleClick(event) {
    var mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    };
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(sceneMeshes, false);
    if (intersects.length > 0) {
        var n = new THREE.Vector3();
        n.copy(intersects[0].face.normal);
        n.transformDirection(intersects[0].object.matrixWorld);
        // const cube = new THREE.Mesh(boxGeometry, material)
        var cube = new THREE.Mesh(coneGeometry, material);
        cube.lookAt(n);
        cube.rotateX(Math.PI / 2);
        cube.position.copy(intersects[0].point);
        cube.position.addScaledVector(n, 0.1);
        scene.add(cube);
        sceneMeshes.push(cube);
    }
}
var stats = (0, stats_module_1["default"])();
document.body.appendChild(stats.dom);
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // if (sceneMeshes.length > 1) {
    //     sceneMeshes[1].rotation.x += .002
    // }
    render();
    stats.update();
}
function render() {
    renderer.render(scene, camera);
}
animate();
