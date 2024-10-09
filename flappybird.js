// board (tablero del juego)
let board; // Elemento del canvas
let boardWidth = 760; // Ancho del canvas
let boardHeight = 740; // Altura del canvas
let context; // Contexto del canvas para dibujar en 2D

// bird (pájaro)
let birdWidth = 34; // Ancho del pájaro, relación de aspecto = 408/228 = 17/12
let birdHeight = 24; // Altura del pájaro
let birdX = boardWidth / 8; // Posición inicial en X (un octavo del ancho del tablero)
let birdY = boardHeight / 2; // Posición inicial en Y (centro vertical del tablero)
let birdImg; // Imagen del pájaro

// Definición del objeto 'bird' con sus propiedades
let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// pipes (tuberías)
let pipeArray = []; // Arreglo para almacenar las tuberías
let pipeWidth = 64; // Ancho de la tubería, relación de aspecto 1/8
let pipeHeight = 612; // Altura de la tubería
let pipeX = boardWidth; // Posición X de inicio de las tuberías (fuera de la pantalla)
let pipeY = 0; // Posición Y inicial de las tuberías (parte superior)

// Imágenes de las tuberías
let topPipeImg; // Imagen de la tubería superior
let bottomPipeImg; // Imagen de la tubería inferior

// physics (física)
let velocityX = -2; // Velocidad de desplazamiento de las tuberías hacia la izquierda
let velocityY = 0; // Velocidad de salto del pájaro
let gravity = 0.4; // Gravedad que afecta al pájaro

let gameOver = false; // Estado del juego (si está terminado o no)
let score = 0; // Puntuación del jugador

// window.onload se ejecuta cuando se carga la página
window.onload = function() {
    board = document.getElementById("board"); // Se obtiene el elemento canvas
    board.height = boardHeight; // Se establece la altura del canvas
    board.width = boardWidth; // Se establece el ancho del canvas
    context = board.getContext("2d"); // Se obtiene el contexto para dibujar en 2D

    // Cargar y dibujar la imagen del pájaro
    birdImg = new Image();
    birdImg.src = "./bird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    // Cargar las imágenes de las tuberías
    topPipeImg = new Image();
    topPipeImg.src = "./imagen2.png"; // Imagen de la tubería superior

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./muro1.png"; // Imagen de la tubería inferior

    requestAnimationFrame(update); // Iniciar la animación
    setInterval(placePipes, 1500); // Colocar tuberías cada 1.5 segundos
    document.addEventListener("keydown", moveBird); // Detectar pulsaciones de teclas para mover el pájaro
};

// update: función para actualizar el juego
function update() {
    requestAnimationFrame(update); // Llama a sí misma en cada frame para animar continuamente
    if (gameOver) {
        return; // Si el juego ha terminado, no hacer nada más
    }
    context.clearRect(0, 0, board.width, board.height); // Limpiar el canvas

    // Actualizar la posición del pájaro con gravedad
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // Evitar que el pájaro salga por la parte superior
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height); // Dibujar el pájaro

    if (bird.y > board.height) {
        gameOver = true; // Terminar el juego si el pájaro toca la parte inferior
    }

    // Dibujar y mover las tuberías
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX; // Mover las tuberías hacia la izquierda
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height); // Dibujar las tuberías

        // Incrementar la puntuación cuando el pájaro pase una tubería
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // Sumar 0.5 por cada tubería
            pipe.passed = true; // Marcar que esta tubería ya fue pasada
        }

        // Detectar colisión entre el pájaro y la tubería
        if (detectCollision(bird, pipe)) {
            gameOver = true; // Terminar el juego si hay colisión
        }
    }

    // Limpiar las tuberías que ya salieron de la pantalla
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // Eliminar la primera tubería del arreglo
    }

    // Dibujar la puntuación en el canvas
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45); // Mostrar la puntuación

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90); // Mostrar mensaje de fin de juego
    }
}

// Función para colocar las tuberías en el juego
function placePipes() {
    if (gameOver) {
        return; // No colocar tuberías si el juego ha terminado
    }

    // Generar tuberías con una apertura aleatoria
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4; // Espacio entre tuberías

    // Tubería superior
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false // Indica si ya fue pasada por el pájaro
    };
    pipeArray.push(topPipe); // Agregar tubería superior al arreglo

    // Tubería inferior
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe); // Agregar tubería inferior al arreglo
}

// Función para mover el pájaro cuando se presiona una tecla
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6; // El pájaro salta hacia arriba

        // Reiniciar el juego si ha terminado
        if (gameOver) {
            bird.y = birdY; // Restablecer la posición del pájaro
            pipeArray = []; // Vaciar el arreglo de tuberías
            score = 0; // Reiniciar la puntuación
            gameOver = false; // Cambiar el estado a "no terminado"
        }
    }
}

// Función para detectar colisiones entre el pájaro y una tubería
function detectCollision(a, b) {
    return a.x < b.x + b.width && // Verifica si el borde derecho del pájaro choca con el borde izquierdo de la tubería
        a.x + a.width > b.x && // Verifica si el borde izquierdo del pájaro choca con el borde derecho de la tubería
        a.y < b.y + b.height && // Verifica si el borde inferior del pájaro choca con la parte superior de la tubería
        a.y + a.height > b.y; // Verifica si el borde superior del pájaro choca con la parte inferior de la tubería
}