// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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

// 🔹 ADMIN EMAIL (změň na svůj)
const ADMIN_EMAIL = "hapic.work@gmail.com";

// 🔹 Sledování skladu
let stockCount = 0;
const stockRef = ref(db, "stockCount");

onValue(stockRef, (snapshot) => {
  stockCount = snapshot.exists() ? snapshot.val() : 4;
  updateAvailability(stockCount);
});

// 🔹 Objednávkový formulář
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('orderForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const order = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      email: form.email.value,
      phone: form.phone.value,
      quantity: parseInt(form.quantity.value, 10),
      id: Math.floor(Math.random() * 100000)
    };

    if (isNaN(order.quantity) || order.quantity <= 0 || order.quantity > stockCount) {
      alert('Zadejte platný počet kusů.');
      return;
    }

    // Aktualizace skladu v databázi
    stockCount -= order.quantity;
    set(stockRef, stockCount);
    updateAvailability(stockCount);

    // Odeslání na Discord
    sendToDiscord(order);

    alert('Objednávka byla odeslána!');
    form.reset();
  });
});

// 🔹 Odesílání objednávky na Discord
function sendToDiscord(order) {
  const webhookURL = "https://discord.com/api/webhooks/1334031581873967184/oH8ks4jbvewVhGFEmfax47Gt-6PUhdaY_gum5zUxeX9fY0KdvLiaTcbVdpja9v9LqSCi";

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
  }).catch(console.error);
}

// 🔹 Přihlášení admina (email + heslo)
document.getElementById('adminLogin').addEventListener('click', () => {
  const email = prompt("Zadej email:");
  const password = prompt("Zadej heslo:");

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user.email === ADMIN_EMAIL) {
        alert(`Přihlášen jako admin: ${user.email}`);
        showAdminControls();
      } else {
        alert("Nemáš oprávnění.");
        signOut(auth);
      }
    })
    .catch((error) => {
      alert("Chyba přihlášení: " + error.message);
    });
});

// 🔹 Odhlášení admina
document.getElementById('adminLogout').addEventListener('click', () => {
  signOut(auth).then(() => {
    alert("Odhlášen.");
    hideAdminControls();
  });
});

// 🔹 Zobrazení/Skrytí admin tlačítek
function showAdminControls() {
  document.getElementById('adminButton').style.display = 'inline-block';
  document.getElementById('resetStockButton').style.display = 'inline-block';
}

function hideAdminControls() {
  document.getElementById('adminButton').style.display = 'none';
  document.getElementById('resetStockButton').style.display = 'none';
}

// 🔹 Aktualizace dostupnosti skladu
function updateAvailability(count) {
  const stockStatus = document.getElementById('availability');
  stockStatus.textContent = count > 0 ? `Skladem (${count})` : 'Nedostupný';
}

// 🔹 Reset skladu (admin)
document.getElementById('resetStockButton').addEventListener('click', () => {
  const restockAmount = prompt('Počet položek k přidání:');
  const restockCount = parseInt(restockAmount, 10);
  if (isNaN(restockCount) || restockCount <= 0) return alert('Neplatný počet.');
  stockCount += restockCount;
  set(stockRef, stockCount);
  alert(`Sklad byl navýšen o ${restockCount} položek.`);
});