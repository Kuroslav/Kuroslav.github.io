// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue, remove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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



function loadOrders() {
const ordersRef = ref(db, 'orders');
get(ordersRef).then((snapshot) => {
  if (snapshot.exists()) {
    const orders = snapshot.val();
    const ordersContainer = document.getElementById('ordersTableBody');  // Změněno na správný element
    ordersContainer.innerHTML = '';  // Vymaže předchozí obsah

    for (const orderId in orders) {
      const order = orders[orderId];
      const orderElement = document.createElement('tr');  // Změněno na <tr> pro tabulku
      orderElement.classList.add('order-item');
      orderElement.innerHTML = `
          <td>#${orderId}</td>
          <td>${order.firstName}</td>
          <td>${order.lastName}</td>
          <td>${order.email}</td>
          <td>${order.phone}</td>
          <td>${order.quantity}</td>
          <td>
            <label for="sentCheckbox-${orderId}">Odesláno</label>
            <input type="checkbox" id="sentCheckbox-${orderId}" class="sentCheckbox" data-index="${orderId}" ${order.sent ? 'checked' : ''}>
          </td>
          <td><button class="deleteButton" data-index="${orderId}">Smazat</button></td>
        `;
      ordersContainer.appendChild(orderElement);
    }

    // Přidání event listeneru pro změnu stavu odeslání
    document.querySelectorAll('.sentCheckbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const orderId = e.target.dataset.index;
        const orderRef = ref(db, `orders/${orderId}`);
        update(orderRef, {
          sent: e.target.checked,
        }).catch((error) => {
          console.error("Chyba při aktualizaci objednávky:", error);
        });
      });
    });

    // Přidání event listeneru pro smazání objednávky
    document.querySelectorAll('.deleteButton').forEach(button => {
      button.addEventListener('click', (e) => {
        const orderId = e.target.dataset.index;
        const orderRef = ref(db, `orders/${orderId}`);
        remove(orderRef)
            .then(() => {
              alert('Objednávka byla smazána');
              loadOrders();  // Znovu načte objednávky po smazání
            })
            .catch((error) => {
              console.error("Chyba při mazání objednávky:", error);
            });
      });
    });

  } else {
    console.log("Žádné objednávky.");
  }
}).catch((error) => {
  console.error("Chyba při načítání objednávek:", error);
});
}


document.addEventListener('DOMContentLoaded', () => {
  loadOrders();

  // Tlačítko pro zpět na parts.html
  document.getElementById('backButton').addEventListener('click', (e) => {
    window.location.href = "parts.html";
  });
});

