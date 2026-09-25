import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { firebaseConfig } from "./config.js";


// ==============================
// FIREBASE
// ==============================

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Local onde o comando será salvo
const comandoRef = ref(database, "comandos/ultimo");


// ==============================
// ELEMENTOS DO SITE
// ==============================

const btn = document.getElementById("btn-escutar");
const feedback = document.getElementById("feedback");

const statusMicrofone =
    document.getElementById("status-microfone");

const statusTexto =
    document.getElementById("status-texto");


// ==============================
// STATUS DO MICROFONE
// ==============================

function atualizarStatus(ativo, texto = null) {

    statusMicrofone.classList.toggle("ligado", ativo);
    statusMicrofone.classList.toggle("desligado", !ativo);

    if (texto) {
        statusTexto.textContent = texto;
    } else {
        statusTexto.textContent =
            ativo
                ? "Microfone ativado."
                : "Microfone desligado.";
    }
}


// ==============================
// ENVIAR PARA FIREBASE
// ==============================

async function enviarComando(texto) {

    try {

        await set(comandoRef, texto);

        console.log("Comando enviado:", texto);

    } catch (erro) {

        console.error(
            "Erro ao enviar comando para o Firebase:",
            erro
        );

    }
}


// ==============================
// RECONHECIMENTO DE VOZ
// ==============================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (!SpeechRecognition) {

    atualizarStatus(
        false,
        "Reconhecimento de voz indisponível."
    );

    feedback.textContent =
        "Seu navegador não suporta reconhecimento de voz.";

    btn.disabled = true;

} else {

    const recognition = new SpeechRecognition();

    recognition.lang = "pt-BR";

    recognition.interimResults = false;

    recognition.continuous = false;


    // ==============================
    // BOTÃO
    // ==============================

    btn.addEventListener("click", () => {

        feedback.textContent = "Ouvindo...";

        atualizarStatus(true);

        try {

            recognition.start();

        } catch (erro) {

            console.error(
                "Erro ao iniciar reconhecimento:",
                erro
            );

        }

    });


    // ==============================
    // QUANDO COMEÇAR A ESCUTAR
    // ==============================

    recognition.onstart = () => {

        atualizarStatus(
            true,
            "Microfone ativado."
        );

        btn.textContent = "🎙️ Ouvindo...";

    };


    // ==============================
    // QUANDO ENTENDER A FALA
    // ==============================

    recognition.onresult = async (event) => {

        const textoFalado =
            event.results[0][0].transcript
                .toLowerCase()
                .trim();


        // Mostra no site o que foi entendido
        feedback.textContent =
            textoFalado || "Não consegui entender a fala.";


        // Envia SOMENTE para o Firebase
        await enviarComando(textoFalado);

    };


    // ==============================
    // QUANDO PARAR DE ESCUTAR
    // ==============================

    recognition.onend = () => {

        atualizarStatus(
            false,
            "Microfone desligado."
        );

        btn.textContent = "🎙️ Ativar Microfone";

    };


    // ==============================
    // ERROS
    // ==============================

    recognition.onerror = (event) => {

        console.error(
            "Erro no reconhecimento:",
            event.error
        );


        if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
        ) {

            atualizarStatus(
                false,
                "Permissão do microfone negada."
            );

            feedback.textContent =
                "Permita o uso do microfone no navegador.";

        } else if (event.error === "no-speech") {

            atualizarStatus(
                false,
                "Nenhuma fala detectada."
            );

            feedback.textContent =
                "Não detectei nenhuma fala.";

        } else {

            atualizarStatus(
                false,
                "Erro no reconhecimento."
            );

            feedback.textContent =
                "Não foi possível entender a fala.";

        }

        btn.textContent = "🎙️ Ativar Microfone";

    };

}
