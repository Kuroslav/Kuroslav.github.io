import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyDJlvFTiLQmksr4woGYPd6xqP8hEO49Fmk",
  authDomain: "autobahn-6a567.firebaseapp.com",
  projectId: "autobahn-6a567",
  storageBucket: "autobahn-6a567.appspot.com",
  messagingSenderId: "638021583116",
  appId: "1:638021583116:web:a41810afcfcbf6163a8929",
  measurementId: "G-W2JX0B4YES"
};

// Inicializace Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// Skrytí/zobrazení admin tlačítek
auth.onAuthStateChanged((user) => {
  if (user && user.email === "hapic.work@gmail.com") {  // ZMĚŇ NA SVŮJ EMAIL
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminLogout").style.display = "inline";
  } else {
    document.getElementById("adminPanel").style.display = "none";
    document.getElementById("adminLogin").style.display = "inline";
    document.getElementById("adminLogout").style.display = "none";
  }
});

// Přihlášení admina
document.getElementById("adminLogin").addEventListener("click", () => {
  signInWithPopup(auth, provider).catch((error) => console.error("Chyba přihlášení:", error));
});

// Odhlášení admina
document.getElementById("adminLogout").addEventListener("click", () => {
  signOut(auth);
});

// Funkce odeslání objednávky na Discord
function sendToDiscord(order) {
  const webhookURL = "https://discord.com/api/webhooks/1334031581873967184/oH8ks4jbvewVhGFEmfax47Gt-6PUhdaY_gum5zUxeX9fY0KdvLiaTcbVdpja9v9LqSCi";

  const message = {
    content: "**Nová objednávka!** 📦",
    embeds: [{
      title: "📋 Detaily objednávky",
      color: 16773669,
      fields: [
        { name: "💳 Jméno", value: `${order.firstName} ${order.lastName}` },
        { name: "✉️ Email", value: order.email },
        { name: "📱 Telefon", value: order.phone },
        { name: "📦 Počet", value: `${order.quantity}` },
        { name: "🗂️ Číslo objednávky", value: `${order.id}` }
      ],
      footer: { text: "Odesláno z webové aplikace" }
    }]
  };

  fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message)
  }).catch((error) => console.error("Chyba při odesílání na Discord:", error));
}

// Odeslání objednávky
document.getElementById("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const order = {
    firstName: e.target.firstName.value,
    lastName: e.target.lastName.value,
    email: e.target.email.value,
    phone: e.target.phone.value,
    quantity: e.target.quantity.value,
    id: Date.now()
  };

  sendToDiscord(order);
  alert("Objednávka byla odeslána!");
  e.target.reset();
});