// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyDJlvFTiLQmksr4woGYPd6xqP8hEO49Fmk",
  authDomain: "autobahn-6a567.firebaseapp.com",
  databaseURL:
      "https://autobahn-6a567-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "autobahn-6a567",
  storageBucket: "autobahn-6a567.appspot.com",
  messagingSenderId: "638021583116",
  appId: "1:638021583116:web:a41810afcfcbf6163a8929",
  measurementId: "G-W2JX0B4YES",
};

// Inicializace Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// Element pro zobrazení dostupnosti
const availabilityElement = document.getElementById("stockCount");

// Funkce pro zobrazení dostupnosti
// Funkce pro zobrazení dostupnosti
function updateAvailability() {
  const stockRef = ref(db, "stock/stockCount");
  onValue(stockRef, (snapshot) => {
    if (snapshot.exists()) {
      const stockCount = snapshot.val();
      availabilityElement.textContent =
          stockCount > 0 ? `Skladem ${stockCount}` : "Nedostupný";
      availabilityElement.style.color = stockCount > 0 ? "green" : "red";
    }
  });
}

// Zavolání updateAvailability při načtení stránky
document.addEventListener("DOMContentLoaded", updateAvailability);

// Funkce pro objednání dílů
function orderPart(quantity, orderDetails) {
  const stockRef = ref(db, "stock/stockCount");
  get(stockRef).then((snapshot) => {
    if (snapshot.exists()) {
      let stockCount = snapshot.val();
      console.log(stockCount, quantity);
      if (quantity <= stockCount) {
        stockCount -= quantity;
        set(stockRef, stockCount).then(() => {
          alert(`Objednáno ${quantity} dílů. Zbývá skladem: ${stockCount}`);

          const orderRef = push(ref(db, "orders"));
          set(orderRef, {
            id: orderRef.key,
            quantity: quantity,
            status: "Objednáno",
            timestamp: Date.now(),
            ...orderDetails,
          })
              .then(() => {
                console.log(
                    "Objednávka úspěšně uložena do Firebase:",
                    orderDetails
                );
                sendToDiscord({ ...orderDetails, id: orderRef.key, quantity });
                updateAvailability();
              })
              .catch((error) =>
                  console.error("Chyba při zápisu objednávky:", error)
              );
        });
      }
    }
  });
}

// Funkce pro odeslání objednávky na Discord
function sendToDiscord(order) {
  const webhookURL =
      "https://discord.com/api/webhooks/1334031581873967184/oH8ks4jbvewVhGFEmfax47Gt-6PUhdaY_gum5zUxeX9fY0KdvLiaTcbVdpja9v9LqSCi";

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
          { name: "🗂️ Číslo objednávky", value: `${order.id}` },
        ],
        footer: { text: "Odesláno z webové aplikace" },
      },
    ],
  };

  fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  })
      .then((response) => {
        if (!response.ok) throw new Error("Chyba při odesílání na Discord");
        console.log("Objednávka byla odeslána na Discord!");
      })
      .catch((error) => console.error("Chyba:", error));
}

// Funkce pro správu UI
function toggleLoginControls(show) {
  document.getElementById("loginButton").style.display = show
      ? "inline-block"
      : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("loginButton");
  if (loginButton) {
    loginButton.style.display = "inline-block";
  }
});

function toggleAdminControls(show) {
  const adminText = document.getElementById("adminText");
  const adminLogout = document.getElementById("adminLogout");
  const resetStockButton = document.getElementById("resetStockButton");
  const ordersOverview = document.getElementById("ordersOverview");

  if (adminText) adminText.style.display = show ? "inline-block" : "none";
  if (adminLogout) adminLogout.style.display = show ? "inline-block" : "none";
  if (resetStockButton)
    resetStockButton.style.display = show ? "inline-block" : "none";
  if (ordersOverview)
    ordersOverview.style.display = show ? "inline-block" : "none";
}

onAuthStateChanged(auth, async (user) => {
  console.log("Uživatel přihlášen:", user); // Zkontroluj, že uživatel je přihlášen
  if (user) {
    toggleLoginControls(true);
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      console.log("Data uživatele:", snapshot.val()); // Zkontroluj data uživatele
      if (snapshot.val().role === "admin") {
        toggleAdminControls(true); // Zobraz admin tlačítka
        toggleLoginControls(false);
      } else {
        toggleAdminControls(false); // Skrytí admin tlačítek
      }
    } else {
      console.log("Uživatel nenalezen v databázi");
      toggleAdminControls(false);
    }
  } else {
    toggleLoginControls(true); // Zobraz login tlačítko, pokud není přihlášený
    toggleAdminControls(false); // Skrytí admin tlačítek
  }
});

// Odhlášení admina
document.getElementById("adminLogout")?.addEventListener("click", () => {
  signOut(auth)
      .then(() => {
        alert("Odhlášen.");
        window.location.href = "login.html";
      })
      .catch(console.error);
});

// Obnovení skladu pouze adminem
document
    .getElementById("resetStockButton")
    ?.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) return alert("Nejste přihlášen.");

      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists() || snapshot.val().role !== "admin")
        return alert("Nemáte oprávnění.");

      const restockAmount = prompt(
          "Zadejte, kolik položek chcete přidat na sklad:"
      );
      const parsedAmount = parseInt(restockAmount, 10);

      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        const stockRef = ref(db, "stock/stockCount");
        get(stockRef).then((snapshot) => {
          if (snapshot.exists()) {
            let stockCount = snapshot.val();
            stockCount += parsedAmount;
            set(stockRef, stockCount)
                .then(() => {
                  alert("Zásoby byly obnoveny!");
                  updateAvailability(); // Aktualizace dostupnosti po obnovení skladu
                })
                .catch((error) => {
                  console.error("Chyba při obnově skladu:", error);
                  alert("Došlo k chybě při obnově skladu.");
                });
          }
        });
      }
    });

document.getElementById("ordersOverview")?.addEventListener("click", (e) => {
  e.preventDefault(); // Zabraňuje výchozímu chování
  window.location.href = "overview.html"; // Přesměruje na přehled objednávek
});

document.addEventListener("DOMContentLoaded", () => {
  const orderButton = document.getElementById("orderButton");

  if (orderButton) {
    orderButton.addEventListener("click", () => {
      const orderDetails = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
      };

      orderPart(document.getElementById("quantity").value, orderDetails);
    });
  } else {
    console.error("Tlačítko objednat nebylo nalezeno!");
  }
});