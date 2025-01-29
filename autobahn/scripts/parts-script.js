document.addEventListener('DOMContentLoaded', () => {
  let stockCount = parseInt(localStorage.getItem('stockCount'), 10);
  if (isNaN(stockCount)) {
    stockCount = 4;
    localStorage.setItem('stockCount', stockCount.toString());
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
    quantityInput.setAttribute('max', count);
  }

  updateAvailability(stockCount);

  const quantityInput = document.getElementById('quantity');
  const orderButton = document.getElementById('orderButton');

  function disableOrderButton() {
    if (orderButton) orderButton.disabled = true;
  }

  function enableOrderButton() {
    if (orderButton) orderButton.disabled = false;
  }

  if (stockCount <= 0) {
    disableOrderButton();
  } else {
    enableOrderButton();
  }

  quantityInput.setAttribute('max', stockCount);

  quantityInput.addEventListener('input', () => {
    const quantity = parseInt(quantityInput.value, 10);
    if (quantity > stockCount) {
      quantityInput.setCustomValidity('Zadejte počet, který není vyšší než dostupný na skladě.');
    } else {
      quantityInput.setCustomValidity('');
    }
  });

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
      quantity: quantity
    };

    sendToDiscord(order);

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    stockCount -= quantity;
    localStorage.setItem('stockCount', stockCount.toString());
    updateAvailability(stockCount);

    alert('Objednávka byla úspěšně odeslána!');
    form.reset();

    quantityInput.setAttribute('max', stockCount);
    if (stockCount <= 0) {
      disableOrderButton();
    }
  });

  const resetStockButton = document.getElementById('resetStockButton');
  resetStockButton.addEventListener('click', () => {
    const password = prompt('Zadejte heslo pro obnovení zásob:');
    const adminPassword = atob('c2dyZXN0b2Nr'); // "sgrestock"

    if (password === adminPassword) {
      const restockAmount = prompt('Zadejte, kolik položek chcete přidat na sklad:');
      const restockCount = parseInt(restockAmount, 10);

      if (isNaN(restockCount) || restockCount <= 0) {
        alert('Zadejte platný počet položek.');
        return;
      }

      stockCount += restockCount;
      localStorage.setItem('stockCount', stockCount.toString());
      updateAvailability(stockCount);
      alert(`Sklad byl obnoven o ${restockCount} položek!`);
    } else {
      alert('Nesprávné heslo!');
    }
  });

  const adminButton = document.getElementById('adminButton');
  adminButton.addEventListener('click', () => {
    const password = prompt('Zadejte heslo pro přístup k přehledu objednávek:');
    const correctPassword = atob('c2ctMjAyNQ=='); // "sg-2025"

    if (password === correctPassword) {
      window.location.href = 'overwiev.html';
    } else {
      alert('Nesprávné heslo!');
    }
  });

  function generateOrderId() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    return orders.length === 0 ? 1 : Math.max(...orders.map(order => order.id)) + 1;
  }

  function sendToDiscord(order) {
    const webhookURL = localStorage.getItem('discordWebhook') || "https://discord.com/api/webhooks/1334031581873967184/oH8ks4jbvewVhGFEmfax47Gt-6PUhdaY_gum5zUxeX9fY0KdvLiaTcbVdpja9v9LqSCi";

    const embed = {
      title: "📦 Nová objednávka!",
      color: 3447003,
      fields: [
        { name: "🆔 ID objednávky", value: `${order.id}`, inline: true },
        { name: "👤 Jméno", value: `${order.firstName} ${order.lastName}`, inline: true },
        { name: "📧 Email", value: order.email, inline: false },
        { name: "📞 Telefon", value: order.phone, inline: false },
        { name: "📦 Počet kusů", value: `${order.quantity}`, inline: true }
      ],
      timestamp: new Date()
    };

    fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Autodíly", embeds: [embed] })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      console.log("Objednávka byla odeslána na Discord!");
    })
    .catch(error => console.error("Chyba při odesílání na Discord:", error));
  }
});