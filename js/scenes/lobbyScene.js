import * as THREE from 'three';

class LobbyScene {
    constructor(game, ui, network) {
        this.game = game;
        this.ui = ui;
        this.network = network;
        this.scene = new THREE.Scene();
        this.sceneKey = "lobby";
        this.scene.background = new THREE.Color(0x444444);
    }

    show() {
        this.ui.showLobbyMenu();
    }

    hide() {
        this.ui.hideAllMenus();
    }

    update(deltaTime) {
        // Update logic for the lobby scene
    }

    onSceneActivated() {
        window.gameInstance = this.game;
        window.uiInstance = this.ui;
    }

    onWindowResize(renderer) {
        // Handle window resize for lobby scene if needed.
    }
}

export default LobbyScene;