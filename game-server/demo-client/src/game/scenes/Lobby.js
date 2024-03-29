import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Lobby extends Scene
{
    logoTween;

    constructor ()
    {
        super('Lobby');
    }

    create ()
    {
        this.add.image(512, 250, 'background');

        this.add.text(512, 500, `Welcome`, {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setDepth(100).setOrigin(0.5);


        this.add.text(800, 100, `Total online Users: ${this.game.sessionData.onlineCount}`)

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }
}
