/**
 * @description This code allows us to colour wall tiles with collision
 * endabled. It can be turned on to see which walls the player
 * will collide with.
 * 
 * @param layer 
 * @param scene 
 */
const debugDraw = (layer: Phaser.Tilemaps.TilemapLayer, scene: Phaser.Scene) => {
    const debugGraphics = scene.add.graphics().setAlpha(0.75)
    layer.renderDebug(debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    })
}

export {
    debugDraw
}