import Phaser from 'phaser'
import { debugDraw } from '../utils/debug'

export default class Game extends Phaser.Scene {

	// the !: operator tells TS to relax, it's null now but it will exist
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Phaser.Physics.Arcade.Sprite

	constructor() {
		super('game')
	}

	preload() {
		this.cursors = this.input.keyboard.createCursorKeys()
    }

    create() {
		const map = this.make.tilemap({ key: 'dungeon' })
		const tileset = map.addTilesetImage('dungeon', 'tiles')

		map.createLayer('Ground', tileset)
		const wallsLayer = map.createLayer('Walls', tileset)

		// The collides: true property refers to the property
		// set in the tiled map editor, also called collides
		wallsLayer.setCollisionByProperty({ collides: true })

		debugDraw(wallsLayer, this)

		this.faune = this.physics.add.sprite(128, 128, 'faune', 'run-down/run-down-1.png')

		this.anims.create({
			key: 'faune-idle-down',
			frames: [{ key: 'faune', frame: 'walk-down/walk-down-1.png' }]
		})

		this.anims.create({
			key: 'faune-idle-up',
			frames: [{ key: 'faune', frame: 'walk-up/walk-up-1.png' }]
		})

		this.anims.create({
			key: 'faune-idle-side',
			frames: [{ key: 'faune', frame: 'walk-side/walk-side-1.png' }]
		})
    
		this.anims.create({
			key: 'faune-run-down',
			frames: this.anims.generateFrameNames(
				'faune', 
				{ start: 1, end: 8, prefix: 'run-down/run-down-', suffix: '.png' }
			),
			repeat: -1,
			frameRate: 15
		})

		this.anims.create({
			key: 'faune-run-side',
			frames: this.anims.generateFrameNames(
				'faune', 
				{ start: 1, end: 8, prefix: 'run-side/run-side-', suffix: '.png' }
			),
			repeat: -1,
			frameRate: 15
		})

		this.anims.create({
			key: 'faune-run-up',
			frames: this.anims.generateFrameNames(
				'faune', 
				{ start: 1, end: 8, prefix: 'run-up/run-up-', suffix: '.png' }
			),
			repeat: -1,
			frameRate: 15
		})

		this.faune.anims.play('faune-idle-side')
		this.faune.body.setSize(this.faune.width * 0.5, this.faune.height * 0.8)

		this.physics.add.collider(this.faune, wallsLayer)

		this.cameras.main.startFollow(this.faune, true)
	}

	/**
	 * @param t 	-> total time
	 * @param dt 	-> delta time (change in time since last frame)
	 */
	update(t: number, dt: number) {
		if (!this.cursors || !this.faune) {
			return
		}

		const speed = 100;

		if (this.cursors.left.isDown) {
			this.faune.anims.play('faune-run-side', true)
			this.faune.setVelocity(-speed, 0)
			// flip character left, as we only have an image of her running right
			this.faune.scaleX = -1 
			// hitbox moves when we flip the texture, 
			// simple way to fix this is to offset it on flip
			this.faune.body.offset.x = 24
		} else if (this.cursors.right.isDown) {
			this.faune.anims.play('faune-run-side', true)
			this.faune.setVelocity(speed, 0)
			// flip character back right
			this.faune.scaleX = 1 
			// hitbox moves when moving left, set hitbox offset 
			// back to 0 when moving right
			this.faune.body.offset.x = 8
		} else if (this.cursors.up.isDown) {
			this.faune.anims.play('faune-run-up', true)
			this.faune.setVelocity(0, -speed)
		} else if (this.cursors.down.isDown) {
			this.faune.anims.play('faune-run-down', true)
			this.faune.setVelocity(0, speed)
		} else {
			// get keys of current animation
			const parts = this.faune.anims.currentAnim.key.split('-')
			// split & use the direction part of the key (up, down, side)
			this.faune.play(`faune-idle-${parts[2]}`)
			this.faune.setVelocity(0, 0)
		}
	}
}
