import Phaser from 'phaser'
import { sceneEvents } from '../events/eventsCenter'

export default class GameUI extends Phaser.Scene {
    private hearts!: Phaser.GameObjects.Group
    constructor() {
        super('game-ui')
    }

    create() {
        // create a group of heart images
        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        })
        // create multiple hearts in the group
        this.hearts.createMultiple({
            key: 'ui-heart-full',
            setXY: {
                x: 10,
                y: 10,
                stepX: 16
            },
            quantity: 3
        })

        // listen to player-health-changed event
        sceneEvents.on(
            'player-health-changed', 
            this.handlePlayerHealthChanged,
            this
        )

        // remember to unbind the event on scene shutdown to
        // avoid memory leaks
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off(
                'player-health-changed', 
                this.handlePlayerHealthChanged,
                this
            )
        })
    }

    /**
     * @description pass in health as a number (private field on faune)
     * use the hearts game object image group stored in this
     * loop through each heart, in .each we have access to the game object 
     * (specific heart in group) & index. Using the index we can identify
     * which heart we are currently interating on.
     * @param {number} health
     */
    private handlePlayerHealthChanged(health: number) {
        this.hearts.children.each((go, i) => {
            const heart = go as Phaser.GameObjects.Image
            
            if (i < health) {
                heart.setTexture('ui-heart-full')
            } else {
                heart.setTexture('ui-heart-empty')
            }
        })
    }

}