"use strict";

/* =========================================================
   THOR — RECEBIMENTO DA ENTREGA
========================================================= */

const CHAVE_ENTREGAS = "thor_entregas";
const CHAVE_ATUAL = "thor_entrega_atual";

let entregaAtual = null;

let canvas = null;
let ctx = null;

let assinando = false;
let temAssinatura = false;


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    mostrarData();

    carregarPainel();

    verificarEntregaAtual();

    canvas =
        document.getElementById("canvasAssinatura");

    if (canvas) {

        ctx =
            canvas.getContext("2d");

        ajustarCanvas();

        adicionarEventosAssinatura();

        window.addEventListener(
            "resize",
            ajustarCanvas
        );
    }


    document
        .getElementById("btnLimpar")
        ?.addEventListener(
            "click",
            limparAssinatura
        );


    document
        .getElementById("btnConfirmar")
        ?.addEventListener(
            "click",
            confirmarRecebimento
        );
});


/* =========================================================
   DATA ATUAL
========================================================= */

function mostrarData() {

    const elemento =
        document.getElementById("dataHoje");

    if (!elemento) return;

    elemento.textContent =
        new Date().toLocaleDateString(
            "pt-BR"
        );
}


/* =========================================================
   PAINEL DO DIA
========================================================= */

function carregarPainel() {

    const entregas =
        JSON.parse(
            localStorage.getItem(
                CHAVE_ENTREGAS
            )
        ) || [];


    const hoje =
        new Date();


    const entregasHoje =
        entregas.filter(entrega => {

            if (!entrega.id) {
                return false;
            }


            const data =
                new Date(entrega.id);


            return (
                data.getDate() ===
                    hoje.getDate() &&

                data.getMonth() ===
                    hoje.getMonth() &&

                data.getFullYear() ===
                    hoje.getFullYear()
            );
        });


    /*
       Somente entregas do dia atual
       entram no resumo.
    */


    const concluidas =
        entregasHoje.filter(
            entrega =>
                entrega.status ===
                "concluida"
        );


    const pendentes =
        entregasHoje.filter(
            entrega =>
                entrega.status ===
                "pendente"
        );


    const total =
        document.getElementById(
            "totalDia"
        );


    const elementoConcluidas =
        document.getElementById(
            "concluidasDia"
        );


    const elementoPendentes =
        document.getElementById(
            "pendentesDia"
        );


    if (total) {
        total.textContent =
            entregasHoje.length;
    }


    if (elementoConcluidas) {
        elementoConcluidas.textContent =
            concluidas.length;
    }


    if (elementoPendentes) {
        elementoPendentes.textContent =
            pendentes.length;
    }
}


/* =========================================================
   VERIFICAR SE O PDV ENVIOU UMA ENTREGA
========================================================= */

function verificarEntregaAtual() {

    const dados =
        localStorage.getItem(
            CHAVE_ATUAL
        );


    /*
       Se não existe entrega enviada
       pelo PDV, permanece somente
       na tela de resumo.
    */

    if (!dados) {
        mostrarSomenteResumo();
        return;
    }


    try {

        const entrega =
            JSON.parse(dados);


        /*
           Se já foi concluída,
           não abre novamente a assinatura.
        */

        if (
            entrega.status ===
            "concluida"
        ) {

            mostrarSomenteResumo();

            return;
        }


        entregaAtual =
            entrega;


        abrirRecebimento();


    } catch (erro) {

        console.error(
            "Erro ao carregar entrega:",
            erro
        );

        mostrarSomenteResumo();
    }
}


/* =========================================================
   MOSTRAR SOMENTE RESUMO
========================================================= */

function mostrarSomenteResumo() {

    document
        .getElementById("painelInicio")
        ?.classList.remove(
            "escondido"
        );


    document
        .getElementById("recebimento")
        ?.classList.add(
            "escondido"
        );


    document
        .getElementById("sucesso")
        ?.classList.add(
            "escondido"
        );
}


/* =========================================================
   ABRIR RECEBIMENTO
========================================================= */

function abrirRecebimento() {

    document
        .getElementById("painelInicio")
        ?.classList.add(
            "escondido"
        );


    document
        .getElementById("recebimento")
        ?.classList.remove(
            "escondido"
        );


    document
        .getElementById("sucesso")
        ?.classList.add(
            "escondido"
        );


    document.getElementById(
        "cliente"
    ).textContent =
        entregaAtual.cliente ||
        "-";


    document.getElementById(
        "codigo"
    ).textContent =
        entregaAtual.codigo ||
        "-";


    const notas =
        Array.isArray(
            entregaAtual.notas
        )
            ? entregaAtual.notas.join(", ")
            : entregaAtual.notas ||
              "-";


    document.getElementById(
        "notas"
    ).textContent =
        notas;


    document.getElementById(
        "observacao"
    ).textContent =
        entregaAtual.observacao ||
        "Nenhuma";


    setTimeout(() => {

        ajustarCanvas();

    }, 50);
}


/* =========================================================
   CONFIGURAR CANVAS
========================================================= */

function ajustarCanvas() {

    if (!canvas || !ctx) {
        return;
    }


    const largura =
        canvas.parentElement
            .clientWidth;


    const altura =
        canvas.parentElement
            .clientHeight;


    if (
        largura <= 0 ||
        altura <= 0
    ) {
        return;
    }


    const proporcao =
        window.devicePixelRatio ||
        1;


    canvas.width =
        largura * proporcao;


    canvas.height =
        altura * proporcao;


    canvas.style.width =
        largura + "px";


    canvas.style.height =
        altura + "px";


    ctx.setTransform(
        proporcao,
        0,
        0,
        proporcao,
        0,
        0
    );


    ctx.lineWidth = 2.5;

    ctx.lineCap =
        "round";

    ctx.lineJoin =
        "round";

    ctx.strokeStyle =
        "#111111";
}


/* =========================================================
   POSIÇÃO DO DEDO / MOUSE
========================================================= */

function pegarPosicao(evento) {

    const rect =
        canvas.getBoundingClientRect();


    let x;
    let y;


    if (
        evento.touches &&
        evento.touches.length
    ) {

        x =
            evento.touches[0]
                .clientX -
            rect.left;


        y =
            evento.touches[0]
                .clientY -
            rect.top;

    } else {

        x =
            evento.clientX -
            rect.left;


        y =
            evento.clientY -
            rect.top;
    }


    return {
        x,
        y
    };
}


/* =========================================================
   INICIAR ASSINATURA
========================================================= */

function iniciarAssinatura(evento) {

    evento.preventDefault();


    if (!canvas || !ctx) {
        return;
    }


    assinando = true;

    temAssinatura = true;


    const posicao =
        pegarPosicao(
            evento
        );


    ctx.beginPath();


    ctx.moveTo(
        posicao.x,
        posicao.y
    );
}


/* =========================================================
   DESENHAR
========================================================= */

function desenharAssinatura(evento) {

    if (!assinando) {
        return;
    }


    evento.preventDefault();


    const posicao =
        pegarPosicao(
            evento
        );


    ctx.lineTo(
        posicao.x,
        posicao.y
    );


    ctx.stroke();
}


/* =========================================================
   PARAR
========================================================= */

function pararAssinatura(evento) {

    if (evento) {
        evento.preventDefault();
    }


    assinando = false;


    if (ctx) {
        ctx.closePath();
    }
}


/* =========================================================
   EVENTOS DO CANVAS
========================================================= */

function adicionarEventosAssinatura() {

    canvas.addEventListener(
        "mousedown",
        iniciarAssinatura
    );


    canvas.addEventListener(
        "mousemove",
        desenharAssinatura
    );


    canvas.addEventListener(
        "mouseup",
        pararAssinatura
    );


    canvas.addEventListener(
        "mouseleave",
        pararAssinatura
    );


    canvas.addEventListener(
        "touchstart",
        iniciarAssinatura,
        {
            passive: false
        }
    );


    canvas.addEventListener(
        "touchmove",
        desenharAssinatura,
        {
            passive: false
        }
    );


    canvas.addEventListener(
        "touchend",
        pararAssinatura,
        {
            passive: false
        }
    );
}


/* =========================================================
   LIMPAR
========================================================= */

function limparAssinatura() {

    if (!canvas || !ctx) {
        return;
    }


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    temAssinatura = false;
}


/* =========================================================
   CONFIRMAR RECEBIMENTO
========================================================= */

function confirmarRecebimento() {

    if (!entregaAtual) {

        alert(
            "Nenhuma entrega foi selecionada."
        );

        return;
    }


    const nome =
        document
            .getElementById("nome")
            .value
            .trim();


    const documento =
        document
            .getElementById("documento")
            .value
            .trim();


    if (!nome) {

        alert(
            "Digite o nome de quem recebeu a entrega."
        );

        document
            .getElementById("nome")
            .focus();

        return;
    }


    if (!documento) {

        alert(
            "Digite o CPF ou documento."
        );

        document
            .getElementById("documento")
            .focus();

        return;
    }


    if (!temAssinatura) {

        alert(
            "Faça a assinatura para confirmar o recebimento."
        );

        return;
    }


    const imagemAssinatura =
        canvas.toDataURL(
            "image/png"
        );


    entregaAtual.assinatura = {

        nome:
            nome,

        documento:
            documento,

        data:
            new Date()
                .toLocaleString(
                    "pt-BR"
                ),

        imagem:
            imagemAssinatura
    };


    entregaAtual.status =
        "concluida";


    salvarEntrega();


    /*
       Remove a entrega atual para
       não pedir assinatura novamente
       quando a página for aberta.
    */

    localStorage.removeItem(
        CHAVE_ATUAL
    );


    document.getElementById(
        "sucessoCliente"
    ).textContent =
        entregaAtual.cliente ||
        "-";


    document.getElementById(
        "sucessoNome"
    ).textContent =
        nome;


    document.getElementById(
        "sucessoCodigo"
    ).textContent =
        entregaAtual.codigo ||
        "-";


    document
        .getElementById(
            "recebimento"
        )
        .classList.add(
            "escondido"
        );


    document
        .getElementById(
            "painelInicio"
        )
        .classList.add(
            "escondido"
        );


    document
        .getElementById(
            "sucesso"
        )
        .classList.remove(
            "escondido"
        );


    carregarPainel();
}


/* =========================================================
   SALVAR ENTREGA
========================================================= */

function salvarEntrega() {

    const entregas =
        JSON.parse(
            localStorage.getItem(
                CHAVE_ENTREGAS
            )
        ) || [];


    const indice =
        entregas.findIndex(
            entrega =>
                entrega.codigo ===
                entregaAtual.codigo
        );


    if (indice !== -1) {

        entregas[indice] =
            entregaAtual;

    } else {

        entregas.push(
            entregaAtual
        );
    }


    localStorage.setItem(
        CHAVE_ENTREGAS,
        JSON.stringify(
            entregas
        )
    );
}


/* =========================================================
   PROTEÇÃO DE TEXTO
========================================================= */

function escaparHTML(texto) {

    return String(texto)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}