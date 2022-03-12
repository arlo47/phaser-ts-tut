import Phaser from 'phaser'
import { debugDraw } from '../utils/debug'
import { createLizardAnims } from '~/anims/enemyAnims'
import { createCharacterAnims } from '~/anims/characterAnims'
import Lizard from '~/actors/enemies/Lizard'
import '../actors/characters/Faune'
import Faune from '../actors/characters/Faune'
import { sceneEvents } from '../events/eventsCenter'

export default class Game extends Phaser.Scene {
	// the !: operator tells TS to relax, it's null now but it will exist
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Faune
	private lizard!: Phaser.Physics.Arcade.Sprite

	constructor() {
		super('game')
	}

	preload() {
		// Assign WASD to default input keys
		this.cursors = this.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D
		});
    }

    create() {
		this.scene.run('game-ui')
		createCharacterAnims(this.anims)
		createLizardAnims(this.anims)

		const map = this.make.tilemap({ key: 'dungeon' })
		const tileset = map.addTilesetImage('dungeon', 'tiles')

		map.createLayer('Ground', tileset)
		const wallsLayer = map.createLayer('Walls', tileset)

		/**
		 * add player after creating ground layer, or player
		 * will be underneath the ground
		 * 
		 * this.add[key] can be used due to the GameObjectsFactory
		 * registration in Faune.ts
		 */
		this.faune = this.add.faune(128, 128, 'faune')

		// The collides: true property refers to the property
		// set in the tiled map editor, also called collides
		wallsLayer.setCollisionByProperty({ collides: true })

		debugDraw(wallsLayer, this)

		const lizards = this.physics.add.group({
			classType: Lizard,
			createCallback: (go) => {
				const lizGo = go as Lizard
				lizGo.body.onCollide = true
			}
		})

		lizards.get(256, 128, 'lizard')

		this.physics.add.collider(this.faune, wallsLayer)
		this.physics.add.collider(lizards, wallsLayer)

		// physics.add.collider can take a cb function
		// to handle collide events
		this.physics.add.collider(
			lizards, 
			this.faune, 
			this.handlePlayerLizardCollision, 
			undefined,
			this
		)

		this.cameras.main.startFollow(this.faune, true)
	}

	// collider cb takes 2 parameters
	// Each GameObject involved in the collision.
	// We have access to Faune at the class level
	// so obj1 is not used
	private handlePlayerLizardCollision(
		obj1: Phaser.GameObjects.GameObject, 
		obj2: Phaser.GameObjects.GameObject
	) {
		// remember to cast so we have better intellisense
		const lizard = obj2 as Lizard;
		// direction vector of player to lizard
		const dx = this.faune.x - lizard.x
		const dy = this.faune.y - lizard.y

		// get the direction in which the lizard hit the player
		const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)

		this.faune.handleDamage(dir)
		// emit player-health-changed event on player/lizard collision
		sceneEvents.emit('player-health-changed', this.faune.health)
	}

	/**
	 * @param t 	-> total time
	 * @param dt 	-> delta time (change in time since last frame)
	 */
	update(t: number, dt: number) {
		if (this.faune) {
			this.faune.update(this.cursors)
		}
	}
}
