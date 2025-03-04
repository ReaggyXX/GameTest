import Game from './js/game.js';
import UI from './ui.js';
import Network from './network.js';
import MenuScene from './scenes/menuScene.js';
import LobbyScene from './scenes/lobbyScene.js';
import GameScene from './scenes/gameScene.js';   


async function init() {
    const network = new Network();
    const ui = new UI(network);
    const game = new Game(network, ui);

    game.addScene('menu', new MenuScene(game, ui));
    game.addScene('lobby', new LobbyScene(game, ui, network));
    game.addScene('game', new GameScene(game, ui, network));

    game.setScene('menu');
    network.connect();
    game.start();
}

init()