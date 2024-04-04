import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Login extends Scene
{
    logoTween;
    
    websocket;

    constructor ()
    {
        super('Login');
    }
    
    preload() {
        this.load.image('olympia_banner', 'assets/olympia.png');
    }

    create ()
    {
        // const x= this.add.image(512, 384, 'olympia_banner');
        this.add.text(512, 200, 'Login your account', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setDepth(100).setOrigin(0.5);
        
        this.createTextInput()
        
        EventBus.emit('current-scene-ready', this);
    }
    
    
    createTextInput() {
        this.add.text(350, 300, 'Enter your name:', { font: '32px Courier', fill: '#ffffff' });

        const textEntry = this.add.text(350, 400, '', { font: '32px Courier', fill: '#ffff00' });

        this.input.keyboard.on('keydown', event =>
        {
            if (event.keyCode === 8 && textEntry.text.length > 0) // When press Backspace
            {
                textEntry.text = textEntry.text.substr(0, textEntry.text.length - 1);
            }
            else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode <= 90))
            {
                textEntry.text += event.key;
            } else if (event.keyCode == 13) {
                this.login(textEntry.text)
            }
        });
    }
    
    
    login(credentials){
        // const gameServerUrl = 'ws://localhost:8080/game'
        const gameServerUrl = 'ws://cdb8-34-174-1-75.ngrok-free.app/game'
        const websocket = new WebSocket(gameServerUrl)

        if (!this.websocket) {
            websocket.onopen = () => {
                console.log(`Connected to ${gameServerUrl}`)
                this.websocket = websocket
                websocket.send(`LOGIN-${credentials}`)
            }
        } else {
            this.websocket.send(`LOGIN-${credentials}`)
        }

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.sessionId) {
                    this.parseLoginResponse(data)
                }
            } catch (e) {

            }
        }
    }

    parseLoginResponse(data) {
        if (data.sessionId) {
            console.log('Login succeeded', data)
            this.game.sessionData = data
            this.scene.start('Lobby')
            localStorage.setItem('sessionData', JSON.stringify(data))
        }
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

    moveLogo (vueCallback)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        }
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    vueCallback({
                        x: Math.floor(this.logo.x),
                        y: Math.floor(this.logo.y)
                    });
                }
            });
        }
    }
}
