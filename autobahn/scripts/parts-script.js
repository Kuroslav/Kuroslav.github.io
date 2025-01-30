// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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

// Odkazy na HTML prvky
const adminButton = document.getElementById('adminButton');
const resetStockButton = document.getElementById('resetStockButton');

// Skryjeme admin tlačítka při načtení
adminButton.style.display = 'none';
resetStockButton.style.display = 'none';

// Kontrola přihlášení a role uživatele
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userRef = ref(db, `users/${user.uid}/role`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists() && snapshot.val() === 'admin') {
        adminButton.style.display = 'inline-block';
        resetStockButton.style.display = 'inline-block';
      }
    });
  }
});

// Sledování skladu
let stockCount = 0;
const stockRef = ref(db, "stockCount");

onValue(stockRef, (snapshot) => {
  stockCount = snapshot.exists() ? snapshot.val() : 4;
  updateAvailability(stockCount);
});

// Objednávkový formulář
document.addEventListener('DOMContentLoaded', () => {
  const quantityInput = document.getElementById('quantity');
  const orderButton = document.getElementById('orderButton');

  function disableOrderButton() {
    orderButton.disabled = true;
  }

  function enableOrderButton() {
    orderButton.disabled = false;
  }

  const form = document.getElementById('orderForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const quantity = parseInt(quantityInput.value, 10);
    const firstName = form.firstName.value;
    const lastName = form.lastName.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const orderId = Date.now();

    if (isNaN(quantity) || quantity <= 0 || quantity > stockCount) {
      alert('Zadejte platný počet kusů.');
      return;
    }

    stockCount -= quantity;
    set(stockRef, stockCount);
    updateAvailability(stockCount);

    const order = {
      id: orderId,
      firstName,
      lastName,
      email,
      phone,
      quantity
    };

    sendToDiscord(order);

    alert('Objednávka byla odeslána!');
    form.reset();
    quantityInput.setAttribute('max', stockCount);
    if (stockCount <= 0) disableOrderButton();
  });

  function updateAvailability(count) {
    const stockStatus = document.getElementById('availability');
    stockStatus.textContent = count > 0 ? `Dostupnost: Skladem (${count})` : 'Dostupnost: Nedostupné';
    quantityInput.setAttribute('max', count);
  }

  // Přihlášení admina
  document.getElementById('adminLogin').addEventListener('click', () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const userRef = ref(db, `users/${user.uid}/role`);
        get(userRef).then((snapshot) => {
          if (snapshot.exists() && snapshot.val() === 'admin') {
            alert(`Přihlášen jako admin: ${user.displayName}`);
            adminButton.style.display = 'inline-block';
            resetStockButton.style.display = 'inline-block';
          } else {
            alert("Nemáš oprávnění.");
            signOut(auth);
          }
        });
      })
      .catch((error) => console.error("Chyba přihlášení:", error));
  });

  // Odhlášení admina
  document.getElementById('adminLogout').addEventListener('click', () => {
    signOut(auth).then(() => {
      alert("Odhlášen.");
      adminButton.style.display = 'none';
      resetStockButton.style.display = 'none';
    });
  });

  // Admin reset skladu
  resetStockButton.addEventListener('click', () => {
    const restockAmount = prompt('Počet položek k přidání:');
    const restockCount = parseInt(restockAmount, 10);
    if (isNaN(restockCount) || restockCount <= 0) return alert('Neplatný počet.');
    stockCount += restockCount;
    set(stockRef, stockCount);
    alert(`Sklad byl navýšen o ${restockCount} položek.`);
  });
});

// Odesílání na Discord
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
    })
    .then(response => console.log("Objednávka odeslána na Discord", response))
    .catch(error => console.error("Chyba při odesílání na Discord:", error));
}