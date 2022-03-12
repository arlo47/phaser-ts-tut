import Phaser from 'phaser'

/**
 * Since anims are global, they do not need to be created
 * upon initialization of each sprite. They can be created once
 * and be shared across all instance of the sprite
 */
const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) {
    anims.create({
        key: 'faune-idle-down',
        frames: [{ key: 'faune', frame: 'walk-down/walk-down-1.png' }]
    })

    anims.create({
        key: 'faune-idle-up',
        frames: [{ key: 'faune', frame: 'walk-up/walk-up-1.png' }]
    })

    anims.create({
        key: 'faune-idle-side',
        frames: [{ key: 'faune', frame: 'walk-side/walk-side-1.png' }]
    })

    anims.create({
        key: 'faune-run-down',
        frames: anims.generateFrameNames(
            'faune', 
            { start: 1, end: 8, prefix: 'run-down/run-down-', suffix: '.png' }
        ),
        repeat: -1,
        frameRate: 15
    })

    anims.create({
        key: 'faune-run-side',
        frames: anims.generateFrameNames(
            'faune', 
            { start: 1, end: 8, prefix: 'run-side/run-side-', suffix: '.png' }
        ),
        repeat: -1,
        frameRate: 15
    })

    anims.create({
        key: 'faune-run-up',
        frames: anims.generateFrameNames(
            'faune', 
            { start: 1, end: 8, prefix: 'run-up/run-up-', suffix: '.png' }
        ),
        repeat: -1,
        frameRate: 15
    })
}

export {
    createCharacterAnims
}