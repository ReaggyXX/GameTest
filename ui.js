class UI {
    constructor(network) {
        this.network = network;
        this.container = document.getElementById('ui-container');
        this.createMainMenu();
        this.createLobbyMenu();
        this.createGameUI();
        this.hideAllMenus(); // Start with all menus hidden
    }

    hideAllMenus() {
        this.mainMenu.classList.add('hidden');
        this.lobbyMenu.classList.add('hidden');
        this.gameUI.classList.add('hidden');
    }

    createMainMenu() {
        this.mainMenu = document.createElement('div');
        this.mainMenu.classList.add('menu');
        this.mainMenu.id = "main-menu";

        const createLobbyButton = document.createElement('button');
        createLobbyButton.textContent = 'Create Lobby';
        createLobbyButton.addEventListener('click', () => {
            this.network.createLobby();
        });

        const joinLobbyButton = document.createElement('button');
        joinLobbyButton.textContent = 'Join Lobby';
        joinLobbyButton.addEventListener('click', () => {
            this.showLobbyMenu();
        });

        this.mainMenu.appendChild(createLobbyButton);
        this.mainMenu.appendChild(joinLobbyButton);
        this.container.appendChild(this.mainMenu);
    }

    createLobbyMenu() {
        this.lobbyMenu = document.createElement('div');
        this.lobbyMenu.classList.add('menu', 'hidden');
        this.lobbyMenu.id = "lobby-menu";

        const lobbyListContainer = document.createElement('div');
        lobbyListContainer.id = 'lobby-list-container';
        this.lobbyList = document.createElement('div');
        this.lobbyList.id = 'lobby-list';
        lobbyListContainer.appendChild(this.lobbyList);

        const backButton = document.createElement('button');
        backButton.textContent = 'Back to Main Menu';
        backButton.addEventListener('click', () => {
            this.showMainMenu();
        });

        this.lobbyMenu.appendChild(lobbyListContainer);
        this.lobbyMenu.appendChild(backButton);
        this.container.appendChild(this.lobbyMenu);
    }

    createGameUI() {
        this.gameUI = document.createElement('div');
        this.gameUI.classList.add('menu', 'hidden');
        this.gameUI.id = "game-ui";

        // Add in-game UI elements here (e.g., health bar, score, etc.)
        const healthBar = document.createElement('div');
        healthBar.id = 'health-bar';
        healthBar.style.width = '100%';
        healthBar.style.height = '20px';
        healthBar.style.backgroundColor = 'red';
        this.gameUI.appendChild(healthBar);

        this.container.appendChild(this.gameUI);
    }

    showMainMenu() {
        this.hideAllMenus();
        this.mainMenu.classList.remove('hidden');
    }

    showLobbyMenu() {
        this.hideAllMenus();
        this.lobbyMenu.classList.remove('hidden');
        this.network.requestLobbyList(); // Ask server for lobby list.
    }

    updateLobbyList(lobbies) {
        this.lobbyList.innerHTML = ''; // Clear existing list
        if (lobbies.length === 0) {
            const noLobbiesMessage = document.createElement('p');
            noLobbiesMessage.textContent = 'No lobbies available.';
            this.lobbyList.appendChild(noLobbiesMessage);
        } else {
            lobbies.forEach(lobby => {
                const lobbyItem = document.createElement('div');
                lobbyItem.textContent = `Lobby ${lobby.id} (${lobby.players.length} players)`;
                lobbyItem.addEventListener('click', () => {
                    this.network.joinLobby(lobby.id);
                });
                this.lobbyList.appendChild(lobbyItem);
            });
        }
    }

    showGameUI() {
        this.hideAllMenus();
        this.gameUI.classList.remove('hidden');
    }

    hideGameUI() {
        this.gameUI.classList.add('hidden');
    }
}

export default UI;