import * as THREE from 'three';
import Player from '../playerEntity.js';
import Controls from '../controls.js';

class Game {
    constructor(network, ui) {
        this.network = network;
        this.ui = ui;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        this.scenes = {};
        this.currentScene = null;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.player = null;
        this.controls = null;

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    onWindowResize() {
        if (this.currentScene && this.currentScene.onWindowResize) {
            this.currentScene.onWindowResize(this.renderer);
        }
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    addScene(name, scene) {
        this.scenes[name] = scene;
    }

    setScene(name) {
        if (this.currentScene) {
            this.currentScene.hide();
        }
        this.currentScene = this.scenes[name];

        if (this.currentScene.sceneKey === "game") {
            if (!this.player) {
                this.player = new Player(this.currentScene.scene, this.camera, this.network);
            }
            if (!this.controls) {
                this.controls = new Controls(this.camera, this.player, this.renderer.domElement);
            }
        }

        this.currentScene.show();
        this.currentScene.onSceneActivated();
    }

    start() {
        this.renderer.setAnimationLoop(this.animate.bind(this));
    }

    animate() {
        const delta = this.clock.getDelta();

        if (this.currentScene) {
            this.currentScene.update(delta);
            if (this.currentScene.sceneKey === 'game') {
                this.player.update(delta);
                this.controls.update(delta);
            }
        }

        this.renderer.render(this.currentScene ? this.currentScene.scene : new THREE.Scene(), this.camera);
    }
}

export default Game;