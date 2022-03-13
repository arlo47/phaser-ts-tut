import Phaser from 'phaser'
import Chest from '~/items/Chest'
import { sceneEvents } from '../../events/eventsCenter'
/**
 * inject the faune type into the GameObjectFactory
 * interface for intellisense
 */
declare global {
    namespace Phaser.GameObjects {
        interface GameObjectFactory {
            faune(
                x: number, 
                y: number, 
                texture: string, 
                frame?: string | number
            ): Faune
        }
    }
}

enum HealthState {
    IDLE,
    DAMAGE,
    DEAD
}

export default class Faune extends Phaser.Physics.Arcade.Sprite {
    private healthState = HealthState.IDLE
    private damageTime = 0
    private _health = 3
    private activeChest?: Chest
    private _coins: number = 0

    private knives?: Phaser.Physics.Arcade.Group

    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        texture: string, 
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame)
        this.anims.play('faune-idle-down')
    }

    get health() {
        return this._health
    }

    private throwKnife() {
        if (!this.knives) {
            return
        }

        const parts = this.anims.currentAnim.key.split('-')
        const direction = parts[2]

        const vec = new Phaser.Math.Vector2(0, 0)

        switch (direction) {
            case 'up':
            vec.y = -1
                break;
            case 'down':
                vec.y = 1
                break;
            case 'side':
            default:
                if (this.scaleX < 0) {
                    vec.x = -1
                } else {
                    vec.x = 1
                }
                break;
        }

        const angle = vec.angle()
        const knife = this.knives
            .get(this.x, this.y, 'knife')  as Phaser.Physics.Arcade.Image

        knife.setActive(true)
        knife.setVisible(true)
        knife.setRotation(angle)

        // reposition knife to be thrown from in front
        // of faune, instead of from center of sprite
        knife.x += vec.x * 16
        knife.y += vec.y * 16

        knife.setVelocity(vec.x * 300, vec.y * 300)
    }

    setKnives(knives: Phaser.Physics.Arcade.Group) {
		this.knives = knives
	}

    setChest(chest: Chest) {
        this.activeChest = chest
    }

    handleDamage(dir: Phaser.Math.Vector2) {
        if (this._health <= 0) {
            return
        }

        if (this.healthState === HealthState.DAMAGE) {
            return
        }

        --this._health

        if (this._health <= 0) {
            // set healthState to DEAD
            this.healthState = HealthState.DEAD
            // animate faint
            this.play('faune-faint')
            this.setVelocity(0, 0)
        } else {
            // move the player away from the incoming damage
            this.setVelocity(dir.x, dir.y)
            this.setTint(0xff0000)
            this.healthState = HealthState.DAMAGE
            this.damageTime = 0
        }
    }

    preUpdate(t: number, dt: number) {
        super.preUpdate(t, dt)

        switch (this.healthState) {
            case HealthState.IDLE:
                break
            case HealthState.DAMAGE:
                this.damageTime += dt
                if (this.damageTime >= 250) {
                    this.healthState = HealthState.IDLE
                    this.setTint(0xffffff)
                }
                break
        }
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (
            this.healthState === HealthState.DAMAGE 
            || this.healthState === HealthState.DEAD
        ) {
            return
        }

        if (!cursors) {
			return
		}

        if (Phaser.Input.Keyboard.JustDown(cursors.space!)) {

            if (this.activeChest) {
                const coins = this.activeChest.open()
                this._coins += coins
                sceneEvents.emit('player-coins-changed', this._coins)
            } else {
                this.throwKnife()
            }
            return
        }

        const speed = 100;
        const leftDown = cursors.left?.isDown
        const rightDown = cursors.right?.isDown
        const upDown = cursors.up?.isDown
        const downDown = cursors.down?.isDown

		if (leftDown) {
			this.anims.play('faune-run-side', true)
			this.setVelocity(-speed, 0)
			// flip character left, as we only have an 
            // image of her running right
			this.scaleX = -1 
			// hitbox moves when we flip the texture, 
			// simple way to fix this is to offset it on flip
			this.body.offset.x = 24
		} else if (rightDown) {
			this.anims.play('faune-run-side', true)
			this.setVelocity(speed, 0)
			// flip character back right
			this.scaleX = 1 
			// hitbox moves when moving left, set hitbox offset 
			// back to 0 when moving right
			this.body.offset.x = 8
		} else if (upDown) {
			this.anims.play('faune-run-up', true)
			this.setVelocity(0, -speed)
		} else if (downDown) {
			this.anims.play('faune-run-down', true)
			this.setVelocity(0, speed)
		} else {
			// get keys of current animation
			const parts = this.anims.currentAnim.key.split('-')
			// split & use the direction part of the key (up, down, side)
			this.anims.play(`faune-idle-${parts[2]}`)
			this.setVelocity(0, 0)
		}

        if (
            leftDown || rightDown || upDown || downDown) {
            this.activeChest = undefined
        }

    }
}

/**
 * Register the character sprite in the GameObjectFactory
 * so it can be accessed by the key faune in any scene by
 * using this.add[key]
 */
Phaser.GameObjects.GameObjectFactory.register(
    'faune', 
    function (
        this: Phaser.GameObjects.GameObjectFactory, 
        x: number, 
        y: number, 
        texture: string,
        frame?: string | number
    ) {
	const sprite = new Faune(this.scene, x, y, texture, frame)

	this.displayList.add(sprite)
	this.updateList.add(sprite)

	this.scene.physics.world.enableBody(
        sprite, 
        Phaser.Physics.Arcade.DYNAMIC_BODY
    )

    sprite.body.setSize(sprite.width * 0.5, sprite.height * 0.8)
	return sprite
})