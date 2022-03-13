import Phaser from "phaser";

/**
 * Takes in an input object from a scene
 * and assigns key bindings for player action.
 * Returns a cursor object
 * 
 * @param input 
 * @returns {Phaser.Types.Input.Keyboard.CursorKeys} 
 */
const setPlayerControls = (
    input
): Phaser.Types.Input.Keyboard.CursorKeys => {
    // Assign WASD to default input keys
    const cursors = input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    return cursors
}

export {
    setPlayerControls
}