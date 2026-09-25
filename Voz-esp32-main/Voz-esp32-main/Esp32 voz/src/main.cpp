#include <WiFi.h>
#include <HTTPClient.h>

// ==============================
// WIFI
// ==============================

const char* WIFI_SSID = "moto g34 5G_1686";
const char* WIFI_PASSWORD = "edumug12";


// ==============================
// FIREBASE
// ==============================

// Coloque aqui a URL do seu Firebase
const char* FIREBASE_URL =
    "https://voz-esp-default-rtdb.firebaseio.com";


// ==============================
// LED INTERNO
// ==============================

#define LED_PIN 2


// ==============================
// SETUP
// ==============================

void setup() {

    Serial.begin(115200);

    pinMode(LED_PIN, OUTPUT);

    digitalWrite(LED_PIN, LOW);


    // Conecta no Wi-Fi

    Serial.println();
    Serial.println("Conectando ao Wi-Fi...");

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED) {

        delay(500);

        Serial.print(".");
    }

    Serial.println();
    Serial.println("Wi-Fi conectado!");

    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
}


// ==============================
// LER COMANDO DO FIREBASE
// ==============================

void verificarComando() {

    if (WiFi.status() != WL_CONNECTED) {
        return;
    }


    HTTPClient http;


    String url =
        String(FIREBASE_URL) +
        "/comandos/ultimo.json";


    http.begin(url);


    int codigo = http.GET();


    if (codigo > 0) {

        String resposta = http.getString();

        Serial.print("Firebase: ");
        Serial.println(resposta);


        // Remove aspas do JSON
        resposta.replace("\"", "");


        // ==========================
        // LIGAR
        // ==========================

        if (resposta == "ligar") {

            digitalWrite(LED_PIN, HIGH);

            Serial.println("LED LIGADO");
        }


        // ==========================
        // DESLIGAR
        // ==========================

        else if (resposta == "desligar") {

            digitalWrite(LED_PIN, LOW);

            Serial.println("LED DESLIGADO");
        }
    }

    else {

        Serial.print("Erro HTTP: ");
        Serial.println(codigo);
    }


    http.end();
}


// ==============================
// LOOP
// ==============================

void loop() {

    verificarComando();

    delay(1000);
}