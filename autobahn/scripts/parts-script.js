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

// HTML elementy
const adminLogin = document.getElementById("adminLogin");
const adminLogout = document.getElementById("adminLogout");
const adminButton = document.getElementById("adminButton");
const resetStockButton = document.getElementById("resetStockButton");
const orderForm = document.getElementById("orderForm");
const quantityInput = document.getElementById("quantity");
const orderButton = document.getElementById("orderButton");

// Webhook URL pro Discord
const webhookURL = "https://discord.com/api/webhooks/1334031581873967184/oH8ks4jbvewVhGFEmfax47Gt-6PUhdaY_gum5zUxeX9fY0KdvLiaTcbVdpja9v9LqSCi";

// Sledování skladu
let stockCount = 0;
const stockRef = ref(db, "stockCount");

onValue(stockRef, (snapshot) => {
  stockCount = snapshot.exists() ? snapshot.val() : 4;
  updateAvailability(stockCount);
});

// Aktualizace dostupnosti skladu
function updateAvailability(count) {
  const availability = document.getElementById("availability");
  availability.textContent = count > 0 ? `Skladem (${count})` : "Nedostupný";
  quantityInput.setAttribute("max", count);
  orderButton.disabled = count <= 0;
}

// Kontrola, jestli je admin
function checkAdmin(user) {
  if (user && user.email === "hapic.work@gmail.com") {
    localStorage.setItem("isAdmin", "true");
    adminButton.style.display = "inline-block";
    resetStockButton.style.display = "inline-block";
    adminLogin.style.display = "none";
    adminLogout.style.display = "inline-block";
  } else {
    localStorage.removeItem("isAdmin");
  }
}

// Přihlášení admina
adminLogin.addEventListener("click", (e) => {
  e.preventDefault();
  signInWithPopup(auth, provider)
    .then((result) => checkAdmin(result.user))
    .catch((error) => console.error("Chyba přihlášení:", error));
});

// Odhlášení admina
adminLogout.addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth).then(() => {
    localStorage.removeItem("isAdmin");
    adminButton.style.display = "none";
    resetStockButton.style.display = "none";
    adminLogin.style.display = "inline-block";
    adminLogout.style.display = "none";
  });
});

// Zachování admin stavu po reloadu
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isAdmin") === "true") {
    adminButton.style.display = "inline-block";
    resetStockButton.style.display = "inline-block";
    adminLogin.style.display = "none";
    adminLogout.style.display = "inline-block";
  }
});

// Odeslání objednávky na Discord
function sendToDiscord(order) {
  const message = {
    content: "**Nová objednávka!** 📦",
    embeds: [
      {
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
      }
    ]
  };

  fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message)
  }).catch((error) => console.error("Chyba odesílání na Discord:", error));
}

// Odeslání objednávky
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const order = {
    firstName: orderForm.firstName.value,
    lastName: orderForm.lastName.value,
    email: orderForm.email.value,
    phone: orderForm.phone.value,
    quantity: parseInt(orderForm.quantity.value, 10),
    id: `ORD-${Date.now()}`
  };

  if (isNaN(order.quantity) || order.quantity <= 0 || order.quantity > stockCount) {
    alert("Zadejte platný počet kusů.");
    return;
  }

  stockCount -= order.quantity;
  set(stockRef, stockCount);
  updateAvailability(stockCount);

  sendToDiscord(order);
  alert("Objednávka byla odeslána!");
  orderForm.reset();
});

// Reset skladu (pouze admin)
resetStockButton.addEventListener("click", () => {
  const restockAmount = prompt("Počet položek k přidání:");
  const restockCount = parseInt(restockAmount, 10);
  if (isNaN(restockCount) || restockCount <= 0) {
    alert("Neplatný počet.");
    return;
  }
  stockCount += restockCount;
  set(stockRef, stockCount);
  alert(`Sklad byl navýšen o ${restockCount} položek.`);
});