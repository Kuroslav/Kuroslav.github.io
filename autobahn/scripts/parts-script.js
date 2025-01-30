// Import Firebase
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

    if (isNaN(quantity) || quantity <= 0 || quantity > stockCount) {
      alert('Zadejte platný počet kusů.');
      return;
    }

    stockCount -= quantity;
    set(stockRef, stockCount);
    updateAvailability(stockCount);

    alert('Objednávka byla odeslána!');
    form.reset();
    quantityInput.setAttribute('max', stockCount);
    if (stockCount <= 0) disableOrderButton();
  });

  function updateAvailability(count) {
    const stockStatus = document.getElementById('stockStatus');
    stockStatus.textContent = count > 0 ? `Skladem (${count})` : 'Nedostupný';
    stockStatus.classList.toggle('in-stock', count > 0);
    stockStatus.classList.toggle('out-of-stock', count <= 0);
    quantityInput.setAttribute('max', count);
  }

  // Přihlášení admina
  document.getElementById('adminLogin').addEventListener('click', () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        if (user.email === "hapic.work@gmail.com") {  // ZMĚŇ NA SVŮJ EMAIL
          alert(`Přihlášen jako admin: ${user.displayName}`);
          document.getElementById('adminPanel').style.display = 'block';
        } else {
          alert("Nemáš oprávnění.");
          signOut(auth);
        }
      })
      .catch((error) => console.error("Chyba přihlášení:", error));
  });

  // Odhlášení admina
  document.getElementById('adminLogout').addEventListener('click', () => {
    signOut(auth).then(() => {
      alert("Odhlášen.");
      document.getElementById('adminPanel').style.display = 'none';
    });
  });

  // Admin reset skladu
  document.getElementById('resetStockButton').addEventListener('click', () => {
    const restockAmount = prompt('Počet položek k přidání:');
    const restockCount = parseInt(restockAmount, 10);
    if (isNaN(restockCount) || restockCount <= 0) return alert('Neplatný počet.');
    stockCount += restockCount;
    set(stockRef, stockCount);
    alert(`Sklad byl navýšen o ${restockCount} položek.`);
  });
});
