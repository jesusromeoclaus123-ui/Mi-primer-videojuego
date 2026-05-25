// Declaracion de variables para esta escena
var player;
var stars;
var bombs;
var collectedItems = [];
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var timerText;
var timeLeft = 30;

// Clase Play, donde se crean todos los sprites, el escenario del juego y se inicializa y actualiza toda la logica del juego.
export class Play extends Phaser.Scene {
  constructor() {
    // Se asigna una key para despues poder llamar a la escena
    super("Play");
  }

  create() {

    // Reiniciamos el GameOver para que el jugador pueda moverse libremente
    gameOver = false;

    // Reseteamos el score a 0
    score = 0;

    // Reiniciamos el tiempo
    timeLeft = 30;

    //  A simple background for our game
    this.add.image(400, 300, "sky");

    // Texto del score
    scoreText = this.add.text(16, 16, "Score: 0", {
        fontSize: "32px",
        fill: "#000",
    });

    // Texto del tiempo
    timerText = this.add.text(16, 50, "Tiempo: 30", {
        fontSize: "32px",
        fill: "#000",
    });

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, "ground").setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 450, "ground");
    platforms.create(50, 250, "ground");
    platforms.create(750, 290, "ground");
    platforms.create(300, 130, "ground");
    platforms.create(200, 340, "ground");

    // The player and its settings
    player = this.physics.add.sprite(100, 450, "dude");

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group();


const itemTypes = [
    "square_red",
    "triangle_blue",
    "diamond_yellow",
    "bomb"
];

this.time.addEvent({
  delay: 1000,
  callback: () => {

    let randomType = Phaser.Utils.Array.GetRandom(itemTypes);

    let star = stars.create(
      Phaser.Math.Between(50, 750),
      0,
      randomType
    );

    star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

if (randomType === "square_red") {
    star.setScale(0.15);
}
else if (randomType === "bomb") {
    star.setScale(1);
}
else {
    star.setScale(0.05);
}
  },
  callbackScope: this,
  loop: true
});

    stars.children.iterate(function (child) {
      //  Give each star a slightly different bounce
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, this.collectStar, null, this);
    this.time.addEvent({
    delay: 1000,

callback: () => {

    if (gameOver) {
        return;
    }

    timeLeft--;

    timerText.setText("Tiempo: " + timeLeft);

    if (timeLeft <= 0) {

        gameOver = true;

        this.scene.start("Retry", {
            score: score,
            result: "PERDISTE"
        });

    }

},

callbackScope: this,
loop: true
});
  }

  update() {
    if (gameOver) {
      return;
    }

    if (cursors.left.isDown) {
      player.setVelocityX(-160);

      player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);

      player.anims.play("right", true);
    } else {
      player.setVelocityX(0);

      player.anims.play("turn");
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
    }
  }

collectStar(player, star) {

    // SI ES BOMBA
    if (star.texture.key === "bomb") {

        star.disableBody(true, true);

        score -= 20;

        if (score < 0) {
            score = 0;
        }

        scoreText.setText("Score: " + score);

        return;
    }

    // OBJETOS NORMALES
    star.disableBody(true, true);

    collectedItems.push(star.texture.key);

    console.log(collectedItems);

    if (star.texture.key === "square_red") {
        score += 10;
    }

    if (star.texture.key === "triangle_blue") {
        score += 20;
    }

    if (star.texture.key === "diamond_yellow") {
        score += 30;
    }

scoreText.setText("Score: " + score);

if (score >= 100) {

    gameOver = true;

    setTimeout(() => {

    this.scene.start("Retry", {
        score: score,
        result: "GANASTE"
    });

}, 100);

}
}
  hitBomb(player, bomb) {

    bomb.disableBody(true, true);

    score -= 20;

    if (score < 0) {
        score = 0;
    }
    scoreText.setText("Score: " + score);
  }
}
