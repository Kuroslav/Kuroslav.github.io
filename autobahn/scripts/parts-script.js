// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyDJlvFTiLQmksr4woGYPd6xqP8hEO49Fmk",
  authDomain: "autobahn-6a567.firebaseapp.com",
  databaseURL: "https://autobahn-6a567-default-rtdb.europe-west1.firebasedatabase.app",
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

// Reference na skladové zásoby
const stockRef = ref(db, 'stockCount');

// Element pro zobrazení dostupnosti
const availabilityElement = document.getElementById('stockCount');

// Funkce pro zobrazení dostupnosti
function updateAvailability() {
  get(stockRef).then(snapshot => {
    const stockCount = snapshot.exists() ? snapshot.val() : 10; // Defaultní hodnota 10, pokud není záznam
    if (stockCount > 0) {
      availabilityElement.textContent = `Skladem ${stockCount}`;
      availabilityElement.style.color = 'green'; // Zelená pro skladem
    } else {
      availabilityElement.textContent = 'Nedostupný';
      availabilityElement.style.color = 'red'; // Červená pro nedostupnost
    }
  }).catch(error => {
    console.error('Chyba při načítání skladových zásob:', error);
  });
}

// Funkce pro objednání dílů
function orderPart(quantity) {
  get(stockRef).then(snapshot => {
    const stockCount = snapshot.exists() ? snapshot.val() : 10;
    if (quantity <= stockCount) {
      set(stockRef, stockCount - quantity); // Uložení nové hodnoty skladových zásob
      alert(`Objednáno ${quantity} dílů.`);
      // Případně zapiš objednávku do přehledu nebo pošli na Discord
    } else {
      alert('Není dostatečný počet dílů na skladě!');
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM načten");
  console.log("adminText:", document.getElementById('adminText'));
  console.log("adminLogout:", document.getElementById('adminLogout'));
  console.log("resetStockButton:", document.getElementById('resetStockButton'));
  console.log("ordersOverview:", document.getElementById('ordersOverview'));

  // Zobrazí dostupnost při načtení stránky
  updateAvailability();
});

// Funkce pro správu UI
function toggleLoginControls(show) {
  document.getElementById('loginButton').style.display = show ? 'inline-block' : 'none';
}

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.style.display = 'inline-block';
  }
});

function toggleAdminControls(show) {
  const adminText = document.getElementById('adminText');
  const adminLogout = document.getElementById('adminLogout');
  const resetStockButton = document.getElementById('resetStockButton');
  const ordersOverview = document.getElementById('ordersOverview');

  if (adminText) adminText.style.display = show ? 'inline-block' : 'none';
  if (adminLogout) adminLogout.style.display = show ? 'inline-block' : 'none';
  if (resetStockButton) resetStockButton.style.display = show ? 'inline-block' : 'none';
  if (ordersOverview) ordersOverview.style.display = show ? 'inline-block' : 'none';
}

onAuthStateChanged(auth, async (user) => {
  console.log("Uživatel přihlášen:", user);  // Zkontroluj, že uživatel je přihlášen
  if (user) {
    toggleLoginControls(true);
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      console.log("Data uživatele:", snapshot.val());  // Zkontroluj data uživatele
      if (snapshot.val().role === 'admin') {
        toggleAdminControls(true);  // Zobraz admin tlačítka
        toggleLoginControls(false);
      } else {
        toggleAdminControls(false);  // Skrytí admin tlačítek
      }
    } else {
      console.log("Uživatel nenalezen v databázi");
      toggleAdminControls(false);
    }
  } else {
    toggleLoginControls(true);  // Zobraz login tlačítko, pokud není přihlášený
    toggleAdminControls(false);  // Skrytí admin tlačítek
  }
});

// Odhlášení admina
document.getElementById("adminLogout")?.addEventListener("click", () => {
  signOut(auth).then(() => {
    alert("Odhlášen.");
    window.location.href = "login.html";
  }).catch(console.error);
});

// Odesílání objednávek na Discord
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
      .then(response => {
        if (!response.ok) throw new Error("Chyba při odesílání na Discord");
        console.log("Objednávka byla odeslána na Discord!");
      })
      .catch(error => console.error("Chyba:", error));
}

// Obnovení skladu pouze adminem
document.getElementById('resetStockButton')?.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return alert("Nejste přihlášen.");

  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists() || snapshot.val().role !== 'admin') return alert("Nemáte oprávnění.");

  const restockAmount = prompt('Zadejte, kolik položek chcete přidat na sklad:');
  const parsedAmount = parseInt(restockAmount, 10);

  if (!isNaN(parsedAmount) && parsedAmount > 0) {
    const currentStockSnapshot = await get(stockRef);
    const currentStock = currentStockSnapshot.exists() ? currentStockSnapshot.val() : 0;
    const newStock = currentStock + parsedAmount;

    await set(stockRef, newStock); // Uložení nového stavu skladu do Firebase
    alert('Zásoby byly obnoveny!');
    updateAvailability();  // Aktualizace dostupnosti po obnovení skladu
  }
});

document.getElementById("ordersOverview")?.addEventListener("click", (e) => {
  e.preventDefault(); // Zabraňuje výchozímu chování
  window.location.href = "overview.html";  // Přesměruje na přehled objednávek
});
