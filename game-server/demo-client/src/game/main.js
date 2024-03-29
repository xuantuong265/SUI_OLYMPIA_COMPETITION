import { Boot } from './scenes/Boot';
import { Login } from './scenes/Login';
import { Lobby } from './scenes/Lobby';

import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#408dc9',
    scene: [
        Boot,
        Preloader,
        Login,
        Lobby,
    ]
};

const StartGame = (parent) => {

    return new Phaser.Game({ ...config, parent });
}

export default StartGame;
