var rendererHeight, gameWidth, gameHeight, stage, renderer, fsm, loop

var cooldown, fox, bear, logo, gameover_logo, victory_logo, running, bushIndex, bushes, bears, animations

var sfx = {}
var music = {}

var sfxFiles = ['bush', 'found', 'snooze', 'success']
var musicFiles = ['intro', 'sneak']

//var fake = {play: () => {}, stop: () => {}}

document.addEventListener("deviceready", onDeviceReady, false)

function onDeviceReady() {
    sfxFiles.forEach(x => {
      sfx[x] = new Media(`sfx/${x}.wav`)  
    })

    musicFiles.forEach(x => {
      music[x] = new Media(`music/${x}.wav`)  
    })

    music.intro.play()

    init()
}

var scoreCurrent = 0
var scoreMax = 0

var pad = 5
var bushPos = [
    {x: 40, y: 10},
    {x: 130, y: 50},
    {x: 300, y: 40},
]
var bearPos = [
    {x: 90, y: 0},
]

function startLoop() {
    setInterval(gameloop, 16.6666)
}

function addFSM() {
    fsm = new StateMachine({
        init: 'splash',
        transitions: [
            { name: 'start', from: 'gameover', to: 'game' },
            { name: 'start', from: 'splash', to: 'game' },
            { name: 'start', from: 'victory', to: 'game' },

            { name: 'discover', from: 'game', to: 'found' },

            { name: 'foxgone', from: 'found', to: 'gameover' },

            { name: 'finish', from: 'game', to: 'victory' }
        ],
        methods: {
          onSplash: splash,
          onLeaveSplash: function() {
            stage.removeChild(logo)
            renderer.render(stage)
            startLoop()
            music.intro.stop()
          },
          onStart: function() {
            startGame()
            music.sneak.play()
          },
          onDiscover: function() {
            sfx.found.play()
            scoreCurrent = 0
          },
          onGameover: function() {
            gameover_logo = new PIXI.Sprite(PIXI.Texture.fromImage("images/gameover_logo.png"))
            gameover_logo.position.x = 30
            gameover_logo.position.y = 60
            stage.addChild(gameover_logo)
            music.sneak.stop()
          },
          onLeaveGameover: function() {
            stage.removeChild(gameover_logo)
          },
          onLeaveGameover: removePixiChildren,
          onFinish: function() {
            victory_logo = new PIXI.Sprite(PIXI.Texture.fromImage("images/victory_logo.png"))
            victory_logo.position.x = 30
            victory_logo.position.y = 60
            stage.addChild(victory_logo)
            sfx.success.play()
            music.sneak.stop()
            scoreCurrent++
            if (scoreMax < scoreCurrent)
                scoreMax = scoreCurrent
          },
          onLeaveVictory: function() {
            stage.removeChild(victory_logo)
            removePixiChildren()
          },
        }
    })
}

function init() {

    rendererHeight = 256
    gameWidth = 260
    gameHeight = 200

    stage = new PIXI.Container()
    renderer = PIXI.autoDetectRenderer(rendererHeight, rendererHeight, {
        antialias: false,
        transparent: false,
        resolution: 1
    })
    document.body.appendChild(renderer.view)

    renderer.view.style.position = "absolute"
    renderer.view.style.display = "block"
    renderer.view.style.marginLeft = "auto"
    renderer.view.style.marginRight = "auto"
    renderer.view.style.marginTop = "auto"
    renderer.view.style.marginBottom = "auto"
    renderer.view.style.left = "0"
    renderer.view.style.right = "0"
    renderer.view.style.top = "0"
    renderer.view.style.bottom = "0"
    renderer.view.style.imageRendering = 'pixelated'

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST // Default pixel-scaling

    //window.addEventListener("resize", resize)

    resize()
    keyboard()

    //renderer.resize(gameWidth, gameHeight)
    renderer.backgroundColor = 0x4b692f
    PIXI.loader.add('images/fox.png')
    PIXI.loader.add('images/fox2.png')
    PIXI.loader.add('images/bear.png')
    PIXI.loader.add('images/bear_sleeping.png')
    PIXI.loader.add('images/bear_angry.png')
    PIXI.loader.add('images/bush.png')
    PIXI.loader.add('images/bush2.png')
    PIXI.loader.add('images/stub.png')
    PIXI.loader.add('images/logo.png')
    PIXI.loader.add('images/gameover_logo.png')
    PIXI.loader.add('images/victory_logo.png')
    PIXI.loader.load(addFSM)
}

function gameloop() {
    var found = fsm.state === 'found'
    var game = fsm.state === 'game'

    scoreCurrentContainer.text = scoreCurrent
    scoreMaxContainer.text = scoreMax

    animations.forEach(function(x) { x() })

    if (fox.position.x < 0) {
        fsm.can('foxgone') && fsm.foxgone()
    }

    if (fox.position.x > 270) {
        fsm.can('finish') && fsm.finish()
    }

    cooldown > 0 && cooldown--

    if (running && game) {
        var bush = bushes[bushIndex]

        if (!bush) return
            
        if (fox.position.x < bush.position.x) {
            fox.position.x++
        }
        if (fox.position.x > bush.position.x) {
            fox.position.x--
        }
        if (fox.position.y < bush.position.y) {
            fox.position.y++
        }
        if (fox.position.y > bush.position.y) {
            fox.position.y--
        }
        if (fox.position.x === bush.position.x && fox.position.y === bush.position.y) {
            running = false
            cancelAnims()
            sfx.bush.play()
        }
    }
    if (found) {
        fox.position.x = fox.position.x - 1.5
        fox.scale.x = -1
    }
    bears.forEach(function(bear) {
        bear.timer--
        if (game && bear.timer < 0) {
            bear.awake = !bear.awake
            bear.timer = bear.INTERVAL
            bear.texture = PIXI.Texture.fromImage(bear.awake ? "images/bear.png" : "images/bear_sleeping.png")
        }
        if (bear.awake && running && bushIndex > 0 && game && fox.position.x < gameWidth) {
            animations.push(animation(bear, [
                { texture: PIXI.Texture.fromImage("images/bear.png"), time: 10 },
                { texture: PIXI.Texture.fromImage("images/bear_angry.png"), time: 10 },
            ]))
            fsm.discover()
            effects.found.play()
        }
    })
    renderer.render(stage)
}


function splash() {
    logo = new PIXI.Sprite(PIXI.Texture.fromImage("images/logo.png"))
    stage.addChild(logo)
    renderer.render(stage)   
}

function startGame() {
    animations = []
    running = false
    bushIndex = -1
    cooldown = 20

    fox = new PIXI.Sprite(PIXI.Texture.fromImage("images/fox.png"))
    fox.position.x = 10
    fox.position.y = 10
    stage.addChild(fox)

    const bush2 = new PIXI.Sprite(PIXI.Texture.fromImage("images/bush2.png"))
    bush2.position.x = 100
    bush2.position.y = 140
    stage.addChild(bush2)

    const bush3 = new PIXI.Sprite(PIXI.Texture.fromImage("images/bush2.png"))
    bush3.position.x = 200
    bush3.position.y = 170
    stage.addChild(bush3)

    const stub = new PIXI.Sprite(PIXI.Texture.fromImage("images/stub.png"))
    stub.position.x = 20
    stub.position.y = 120
    stage.addChild(stub)

    bears = bearPos.map(function(pos) {
        const bear = new PIXI.Sprite(PIXI.Texture.fromImage("images/bear.png"))
        bear.position.x = pos.x
        bear.position.y = pos.y
        bear.INTERVAL = 180
        bear.timer = bear.INTERVAL
        bear.awake = true
        stage.addChild(bear)
        return bear
    })

    bushes = bushPos.map(function(pos) {
        const bushContainer = new PIXI.Container()
        bushContainer.position.x = pos.x
        bushContainer.position.y = pos.y
        stage.addChild(bushContainer)
        const bush = new PIXI.Sprite(PIXI.Texture.fromImage("images/bush.png"))
        bush.position.x = -3
        bush.position.y = -3
        bushContainer.addChild(bush)
        return bushContainer
    })
    
    scoreCurrentContainer = new PIXI.Text('test',{fontFamily : 'Arial', fontSize: 14, fill : 0xffffff, align : 'right'});
    scoreCurrentContainer.x = 240
    scoreCurrentContainer.y = 2
    stage.addChild(scoreCurrentContainer)

    scoreMaxContainer = new PIXI.Text('test23',{fontFamily : 'Arial', fontSize: 14, fill : 0xffffff, align : 'right'});
    scoreMaxContainer.x = 240
    scoreMaxContainer.y = 15
    stage.addChild(scoreMaxContainer)
}

function keyboard() {

    window.addEventListener("keydown", function(e) {

        if (e.keyCode === 49 && fsm.can('start')) {
            fsm.start()
            console.log('state is', fsm.state)
        }
        if (e.keyCode === 50 && fsm.can('discover')) {
            fsm.discover()
            console.log('state is', fsm.state)
        }
        if (e.keyCode === 51 && fsm.can('foxgone')) {
            fsm.foxgone()
            console.log('state is', fsm.state)
        }
        if (e.keyCode === 52 && fsm.can('finish')) {
            fsm.finish()
            console.log('state is', fsm.state)
        }
        if (e.keyCode === 32) {
            if (fsm.state === 'game') {
                cooldown === 0 && run()
            }
            fsm.can('start') && fsm.start()
        }
    })

    window.addEventListener("touchstart", function(e) {

        if (fsm.state === 'game') {
            cooldown === 0 && run()
        }
        fsm.can('start') && fsm.start()
    })

    window.addEventListener("touchend", function(e) {
        //console.log('end', e)
    })

    window.addEventListener("touchcancel", function(e) {
        //console.log('touchcancel', e)
    })

    window.addEventListener("touchmove", function(e) {
        //console.log('touchmove', e)
    })

}

function resize() {

    window.screen.orientation.lock('landscape')

    //PC
    //var zoomScaleWidth = (window.innerWidth - (window.innerWidth % gameWidth)) / gameWidth
    //var zoomScaleHeight = (window.innerHeight - (window.innerHeight % gameHeight)) / gameHeight
    //var zoomScale = Math.min(zoomScaleWidth, zoomScaleHeight)
    var zoomScale = 1.5
    renderer.view.style.width = gameWidth * zoomScale + 'px'
    renderer.view.style.height = gameHeight * zoomScale + 'px'
    renderer.resize(gameWidth, gameHeight)

    //console.log('resize to width', window, window.innerWidth, zoomScaleWidth, zoomScale)
    
    /*
    // Cocoon IO
    var scale = Math.min(window.innerHeight/gameHeight, window.innerWidth/gameWidth);

    renderer.view.style.width = gameWidth * scale
    renderer.view.style.height = gameHeight * scale
    renderer.view.style.left = (window.innerWidth * 0.5 - gameWidth * scale * 0.5)
    renderer.view.style.top = (window.innerHeight * 0.5 - gameHeight * scale * 0.5)
    */
}

function run() {
    if (running) return
    running = true
    bushIndex++
    runFox()
}

function runFox() {
    animations.push(animation(fox, [
        { texture: PIXI.Texture.fromImage("images/fox.png"), time: 5 },
        { texture: PIXI.Texture.fromImage("images/fox2.png"), time: 5 }
    ]))
}

function cancelAnims() {
    animations = []
}

function animation(sprite, frames) {

    var timer = 0
    var idx = 0

    return function() {
        timer++
        if (timer >= frames[idx].time) {
            timer = 0
            idx++
            if (idx > frames.length - 1) {
                idx = 0    
            }
            sprite.texture = frames[idx].texture
        }
    }
}

function removePixiChildren() {
    for (var i = stage.children.length - 1; i >= 0; i--) {  stage.removeChild(stage.children[i]);};
}