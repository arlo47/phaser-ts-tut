import Phaser from 'phaser'

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
    DAMAGE
}

export default class Faune extends Phaser.Physics.Arcade.Sprite {
    private healthState = HealthState.IDLE
    private damageTime = 0

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

    handleDamage(dir: Phaser.Math.Vector2) {
        if (this.healthState === HealthState.DAMAGE) {
            return
        }

        // move the player away from the incoming damage
		this.setVelocity(dir.x, dir.y)
        this.setTint(0xff0000)
        this.healthState = HealthState.DAMAGE
        this.damageTime = 0
    }

    preUpdate(t: number, dt: number) {
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
        if (this.healthState === HealthState.DAMAGE) {
            return
        }

        if (!cursors) {
			return
		}

        const speed = 100;

		if (cursors.left?.isDown) {
			this.anims.play('faune-run-side', true)
			this.setVelocity(-speed, 0)
			// flip character left, as we only have an 
            // image of her running right
			this.scaleX = -1 
			// hitbox moves when we flip the texture, 
			// simple way to fix this is to offset it on flip
			this.body.offset.x = 24
		} else if (cursors.right?.isDown) {
			this.anims.play('faune-run-side', true)
			this.setVelocity(speed, 0)
			// flip character back right
			this.scaleX = 1 
			// hitbox moves when moving left, set hitbox offset 
			// back to 0 when moving right
			this.body.offset.x = 8
		} else if (cursors.up?.isDown) {
			this.anims.play('faune-run-up', true)
			this.setVelocity(0, -speed)
		} else if (cursors.down?.isDown) {
			this.anims.play('faune-run-down', true)
			this.setVelocity(0, speed)
		} else {
			// get keys of current animation
			const parts = this.anims.currentAnim.key.split('-')
			// split & use the direction part of the key (up, down, side)
			this.play(`faune-idle-${parts[2]}`)
			this.setVelocity(0, 0)
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