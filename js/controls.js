class Controls {
    constructor(camera, player, domElement) {
        this.camera = camera;
        this.player = player;
        this.domElement = domElement;
        this.isPointerLocked = false;
        this.pitch = 0;
        this.yaw = 0;
        this.lookSpeed = 0.002;

        this.domElement.addEventListener('click', this.onClick.bind(this), false);
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }

    onClick() {
        if (!this.isPointerLocked) {
            this.domElement.requestPointerLock();
        }
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.domElement;
    }

    onMouseMove(event) {
        if (this.isPointerLocked) {
            this.yaw -= event.movementX * this.lookSpeed;
            this.pitch -= event.movementY * this.lookSpeed;
            this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
            this.camera.rotation.y = this.yaw;
            this.camera.rotation.x = this.pitch;
        }
    }

    onKeyDown(event) {
        let sendInput = false;
        switch (event.code) {
            case 'KeyW':
                this.player.setMovement('forward', true);
                sendInput = true;
                break;
            case 'KeyS':
                this.player.setMovement('backward', true);
                sendInput = true;
                break;
            case 'KeyA':
                this.player.setMovement('left', true);
                sendInput = true;
                break;
            case 'KeyD':
                this.player.setMovement('right', true);
                sendInput = true;
                break;
            case 'Space':
                this.player.setMovement('jump', true);
                sendInput = true;
                break;
        }
        if (sendInput) {
            this.sendInputToServer();
        }
    }

    onKeyUp(event) {
        let sendInput = false;
        switch (event.code) {
            case 'KeyW':
                this.player.setMovement('forward', false);
                sendInput = true;
                break;
            case 'KeyS':
                this.player.setMovement('backward', false);
                sendInput = true;
                break;
            case 'KeyA':
                this.player.setMovement('left', false);
                sendInput = true;
                break;
            case 'KeyD':
                this.player.setMovement('right', false);
                sendInput = true;
                break;
            case 'Space':
                this.player.setMovement('jump', false);
                sendInput = true;
                break;
        }
        if (sendInput) {
            this.sendInputToServer();
        }
    }

    sendInputToServer() {
        if (this.player && this.player.network) {
            this.player.network.sendInput(this.player.move);
        }
    }

    update(deltaTime) {
        // Update logic for controls if needed
    }
}

export default Controls;