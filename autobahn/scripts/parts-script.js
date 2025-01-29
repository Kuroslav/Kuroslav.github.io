document.addEventListener('DOMContentLoaded', () => {
  let stockCount = localStorage.getItem('stockCount');
  if (!stockCount) {
    stockCount = 4;
    localStorage.setItem('stockCount', stockCount);
  }
  updateAvailability(stockCount);

  const quantityInput = document.getElementById('quantity');
  const orderButton = document.getElementById('orderButton');

  function disableOrderButton() {
    orderButton.disabled = true;
  }

  function enableOrderButton() {
    orderButton.disabled = false;
  }

  if (stockCount <= 0) {
    disableOrderButton();
  } else {
    enableOrderButton();
  }

  quantityInput.setAttribute('max', stockCount);

  const form = document.getElementById('orderForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const quantity = parseInt(quantityInput.value, 10);
    if (isNaN(quantity) || quantity <= 0 || quantity > stockCount) {
      alert('Zadejte platný počet kusů, který nepřesahuje dostupný počet na skladě.');
      return;
    }

    const formData = new FormData(form);
    const order = {
      id: generateOrderId(),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      quantity: quantity,
      sent: false
    };

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    stockCount -= quantity;
    localStorage.setItem('stockCount', stockCount);
    updateAvailability(stockCount);

    alert('Objednávka byla úspěšně odeslána!');
    form.reset();
    quantityInput.setAttribute('max', stockCount);
    if (stockCount <= 0) {
      disableOrderButton();
    }

    sendToDiscord(order);
  });

  function sendToDiscord(order) {
    const webhookURL = "https://discord.com/api/webhooks/1334031581873967184/oH8ks4jbvewVhGFEmfax47Gt-6PUhdaY_gum5zUxeX9fY0KdvLiaTcbVdpja9v9LqSCi";
    const message = {
      content: "**Nová objednávka!** 📦",
      embeds: [
        {
          title: "📋 Detaily objednávky",
          color: ab0202, 
          fields: [
            { name: "👤 Jméno", value: `${order.firstName} ${order.lastName}`, inline: true },
            { name: "📧 Email", value: order.email, inline: true },
            { name: "📞 Telefon", value: order.phone, inline: true },
            { name: "📦 Počet kusů", value: `${order.quantity}`, inline: false },
            { name: "🆔 Číslo objednávky", value: `${order.id}`, inline: false }
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

  function updateAvailability(count) {
    const stockStatus = document.getElementById('stockStatus');
    if (count > 0) {
      stockStatus.textContent = `Skladem (${count})`;
      stockStatus.classList.remove('out-of-stock');
      stockStatus.classList.add('in-stock');
    } else {
      stockStatus.textContent = 'Nedostupný';
      stockStatus.classList.remove('in-stock');
      stockStatus.classList.add('out-of-stock');
    }
  }

  function generateOrderId() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders.length === 0) {
      return 1;
    }
    const maxId = Math.max(...orders.map(order => order.id));
    return maxId + 1;
  }
});