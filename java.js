
const canvasFundo = document.getElementById("fundo-hexagonos");
const canvasNeon = document.getElementById("efeito-neon");

const ctxFundo = canvasFundo.getContext("2d");
const ctxNeon = canvasNeon.getContext("2d");

const HEX_CRAD = 32;
const HEX_GAP = 4;
const HEX_HLW = 2;
const T_SWITCH = 64;

const NEON_PALETE = [
    "#cb3301", "#ff0066",
    "#ff6666", "#feff99",
    "#ffff67", "#ccff66",
    "#99fe00", "#fe99ff",
    "#ff99cb", "#fe349a",
    "#cc99fe", "#6599ff",
    "#00ccff", "#ffffff"
];

const unitX = 3 * HEX_CRAD + HEX_GAP * Math.sqrt(3);
const unitY = HEX_CRAD * Math.sqrt(3) * 0.5 + HEX_GAP * 0.5;
const offX = 1.5 * HEX_CRAD + HEX_GAP * Math.sqrt(3) * 0.5;

let largura;
let altura;
let tamanhoMinimo;
let grade = [];
let tempo = 0;
let indiceCor = 0;
let animacao = null;

let mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
};


function mudarTema() {
    const corpo = document.body;
    const botao = document.getElementById("botao-tema");

    corpo.classList.toggle("modo-claro");

    const claro = corpo.classList.contains("modo-claro");

    botao.textContent = claro ? "🌙" : "☀️";

    localStorage.setItem("tema", claro ? "claro" : "escuro");

    desenharGrade();
    ctxNeon.clearRect(0, 0, largura, altura);
}

if (localStorage.getItem("tema") === "claro") {
    document.body.classList.add("modo-claro");
    document.getElementById("botao-tema").textContent = "🌙";
}


function obterCor(nome) {
    return getComputedStyle(document.body)
        .getPropertyValue(nome)
        .trim();
}

function converterRGB(hex) {
    const numero = parseInt(hex.replace("#", ""), 16);

    return {
        r: (numero >> 16) & 255,
        g: (numero >> 8) & 255,
        b: numero & 255
    };
}

function criarHexagono(x, y) {
    const pontos = [];
    const destaque = [];

    for (let i = 0; i < 6; i++) {
        const angulo = i * Math.PI / 3;

        pontos.push({
            x: x + HEX_CRAD * Math.cos(angulo),
            y: y + HEX_CRAD * Math.sin(angulo)
        });

        if (i > 2) {
            const raio = HEX_CRAD - HEX_HLW / 2;

            destaque.push({
                x: x + raio * Math.cos(angulo),
                y: y + raio * Math.sin(angulo)
            });
        }
    }

    return { pontos, destaque };
}

function criarGrade() {
    grade = [];

    const linhas = Math.ceil(altura / unitY) + 2;
    const colunas = Math.ceil(largura / unitX) + 2;

    for (let linha = 0; linha < linhas; linha++) {
        const y = linha * unitY;

        for (let coluna = 0; coluna < colunas; coluna++) {
            const x = (linha % 2 === 0 ? 0 : offX)
                + coluna * unitX;

            grade.push(criarHexagono(x, y));
        }
    }
}

function desenharCaminho(contexto, pontos) {
    contexto.moveTo(pontos[0].x, pontos[0].y);

    for (let i = 1; i < pontos.length; i++) {
        contexto.lineTo(pontos[i].x, pontos[i].y);
    }
}

function desenharGrade() {
    const claro = document.body.classList.contains("modo-claro");

    const fundo = obterCor("--fundo");
    const corHexagono = claro ? "#dce5e8" : "#171717";
    const corLinha = claro ? "#9baeb5" : "#2a2a2a";

    ctxFundo.clearRect(0, 0, largura, altura);
    ctxFundo.fillStyle = fundo;
    ctxFundo.fillRect(0, 0, largura, altura);

    ctxFundo.fillStyle = corHexagono;
    ctxFundo.beginPath();

    for (const hexagono of grade) {
        desenharCaminho(ctxFundo, hexagono.pontos);
        ctxFundo.closePath();
    }

    ctxFundo.fill();

    ctxFundo.strokeStyle = corLinha;
    ctxFundo.lineWidth = 1;
    ctxFundo.beginPath();

    for (const hexagono of grade) {
        desenharCaminho(ctxFundo, hexagono.destaque);
    }

    ctxFundo.stroke();
}

function misturarCores(cor1, cor2, progresso) {
    const a = converterRGB(cor1);
    const b = converterRGB(cor2);

    const r = Math.round(a.r * (1 - progresso) + b.r * progresso);
    const g = Math.round(a.g * (1 - progresso) + b.g * progresso);
    const azul = Math.round(a.b * (1 - progresso) + b.b * progresso);

    return `rgb(${r}, ${g}, ${azul})`;
}

function animarNeon() {
    const claro = document.body.classList.contains("modo-claro");

    const progresso = (tempo % T_SWITCH) / T_SWITCH;

    const proximaCor = (indiceCor + 1) % NEON_PALETE.length;

    const cor = misturarCores(
        NEON_PALETE[indiceCor],
        NEON_PALETE[proximaCor],
        progresso
    );
    const raio = Math.max(1, tamanhoMinimo * 1);


    const luz = ctxNeon.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, raio
    );

    if (claro) {
		luz.addColorStop(0, cor);
		luz.addColorStop(0.15, cor);
		luz.addColorStop(0.45, "rgba(0,0,0,0.15)");
		luz.addColorStop(1, "rgba(0,0,0,0)");
	} else {
		luz.addColorStop(0, cor);
		luz.addColorStop(0.15, "rgba(0,0,0,0)");
		luz.addColorStop(0.5, "rgba(0,0,0,0)");
		luz.addColorStop(1, "rgba(0,0,0,0)");
	}

    ctxNeon.fillStyle = claro
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.04)";

    ctxNeon.fillRect(0, 0, largura, altura);

    ctxNeon.fillStyle = luz;
    ctxNeon.fillRect(0, 0, largura, altura);

    tempo++;

    if (tempo % T_SWITCH === 0) {
        indiceCor = (indiceCor + 1) % NEON_PALETE.length;
    }

    animacao = requestAnimationFrame(animarNeon);
}

function iniciarFundo() {
    if (animacao !== null) {
        cancelAnimationFrame(animacao);
    }

    largura = window.innerWidth;
    altura = window.innerHeight;

    tamanhoMinimo = Math.min(largura, altura) * 0.38;

    canvasFundo.width = largura;
    canvasFundo.height = altura;

    canvasNeon.width = largura;
    canvasNeon.height = altura;

    criarGrade();
    desenharGrade();

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        animacao = requestAnimationFrame(animarNeon);
    } else {
        animacao = null;
    }
}

window.addEventListener("mousemove", function(evento) {
    mouse.x = evento.clientX;
    mouse.y = evento.clientY;
});

window.addEventListener("resize", iniciarFundo);

iniciarFundo();
