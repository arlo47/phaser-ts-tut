import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader')
    }

    preload() {
        this.load.image('tiles', 'tiles/0x72_DungeonTilesetII_v1.3.png')
        this.load.tilemapTiledJSON('dungeon', 'tiles/dungeon01.json')

        this.load.atlas('faune', 'character/fauna.png', 'character/fauna.json')
    }

    create() {
        this.scene.start('game')
    }
}