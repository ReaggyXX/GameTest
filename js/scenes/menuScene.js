import * as THREE from 'three';

class MenuScene {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
        this.scene = new THREE.Scene();
        this.sceneKey = "menu";
        this.scene.background = new THREE.Color(0x222222);
    }

    show() {
        this.ui.showMainMenu();
    }

    hide() {
        this.ui.hideAllMenus();
    }

    update(deltaTime) {
        // Update any animations or logic for the menu scene
    }

    onSceneActivated() {
        window.gameInstance = this.game;
        window.uiInstance = this.ui;
    }

    onWindowResize(renderer) {
        // Handle window resize for menu scene if needed.
    }
}

export default MenuScene;