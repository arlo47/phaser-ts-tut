import Phaser, { Physics } from 'phaser'

import { debugDraw } from '../utils/debug'

import { createLizardAnims } from '~/anims/enemyAnims'
import { createCharacterAnims } from '~/anims/characterAnims'
import { createChestAnims } from '../anims/treasureAnims'

import Lizard from '~/actors/enemies/Lizard'
import '../actors/characters/Faune'
import Faune from '../actors/characters/Faune'

import { sceneEvents } from '../events/eventsCenter'
import { setPlayerControls } from '../utils/playerControls' 
import Chest from '~/items/Chest'

export default class Game extends Phaser.Scene {
	// the !: operator tells TS to relax, it's null now but it will exist
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Faune
	private knives!: Phaser.Physics.Arcade.Group
	private lizards!: Phaser.Physics.Arcade.Group

	private playerLizardCollider?: Phaser.Physics.Arcade.Collider

	constructor() {
		super('game')
	}

	preload() {
		this.cursors = setPlayerControls(this.input)
    }

    create() {
		this.scene.run('game-ui')

		createCharacterAnims(this.anims)
		createLizardAnims(this.anims)
		createChestAnims(this.anims)

		const map = this.make.tilemap({ key: 'dungeon' })
		const tileset = map.addTilesetImage('dungeon', 'tiles')

		map.createLayer('Ground', tileset)
		const wallsLayer = map.createLayer('Walls', tileset)

		// add chests to object layer, keys & coordinates
		// are set in Tiled
		const chests = this.physics.add.staticGroup({
			classType: Chest
		})
		const chestsLayer = map.getObjectLayer('Chests')
		chestsLayer.objects.forEach(chestObj => {
			chests.get(
				chestObj.x! + chestObj.width! * 0.5!, 
				chestObj.y! - chestObj.height!, 
				'treasure'
			)
		})

		this.knives = this.physics.add.group({
			classType: Phaser.Physics.Arcade.Image
		})

		/**
		 * add player after creating ground layer, or player
		 * will be underneath the ground
		 * 
		 * this.add[key] can be used due to the GameObjectsFactory
		 * registration in Faune.ts
		 */
		this.faune = this.add.faune(128, 128, 'faune')
		this.faune.setKnives(this.knives)

		// The collides: true property refers to the property
		// set in the tiled map editor, also called collides
		wallsLayer.setCollisionByProperty({ collides: true })

		// debugDraw(wallsLayer, this)

		this.lizards = this.physics.add.group({
			classType: Lizard,
			createCallback: (go) => {
				const lizGo = go as Lizard
				lizGo.body.onCollide = true
			}
		})

		this.lizards.get(256, 128, 'lizard')

		this.physics.add.collider(this.faune, wallsLayer)
		this.physics.add.collider(this.lizards, wallsLayer)

		this.physics.add.collider(
			this.knives, 
			wallsLayer,
			this.handleKnifeWallCollision,
			undefined,
			this
		)

		this.physics.add.collider(
			this.knives, 
			this.lizards, 
			this.handleKnifeLizardCollision,
			undefined,
			this
		)

		this.physics.add.collider(
			this.faune,
			chests,
			this.handlePlayerChestCollision,
			undefined, 
			this
		)

		/**
		 * physics.add.collider can take a cb function
		 * to handle collide events.
		 * 
		 * NOTE this collider must be destroyed on
		 * player death, so the lizard will still be able
		 * to push the player after she has fainted
		 */
		this.playerLizardCollider = this.physics.add.collider(
			this.lizards, 
			this.faune, 
			this.handlePlayerLizardCollision, 
			undefined,
			this
		)

		this.cameras.main.startFollow(this.faune, true)
	}

	private handlePlayerChestCollision(
		obj1: Phaser.GameObjects.GameObject, 
		obj2: Phaser.GameObjects.GameObject
	) {
		const chest = obj2 as Chest
		this.faune.setChest(chest)

	}

	private handleKnifeWallCollision(
		obj1: Phaser.GameObjects.GameObject, 
		obj2: Phaser.GameObjects.GameObject
	) {
		this.knives.killAndHide(obj1)
	}

	private handleKnifeLizardCollision(
		obj1: Phaser.GameObjects.GameObject, 
		obj2: Phaser.GameObjects.GameObject
	) {
		this.knives.killAndHide(obj1)
		this.lizards.killAndHide(obj2)
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

		// check if player is dead, if so, destroy collider
		if (this.faune.health <= 0) {
			// collider is returned when created & stored as 
			// a class variable
			this.playerLizardCollider?.destroy()
		}
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
