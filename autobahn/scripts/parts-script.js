document.addEventListener('DOMContentLoaded', () => {
  let stockCount = localStorage.getItem('stockCount');
  if (!stockCount) {
    stockCount = 4;  // Výchozí počet, pokud není uložen v localStorage
    localStorage.setItem('stockCount', stockCount);
  }
  updateAvailability(stockCount);

  const quantityInput = document.getElementById('quantity');
  const orderButton = document.getElementById('orderButton');

  // Funkce pro deaktivaci tlačítka "Objednat"
  function disableOrderButton() {
    orderButton.disabled = true;
  }

  // Funkce pro aktivaci tlačítka "Objednat"
  function enableOrderButton() {
    orderButton.disabled = false;
  }

  // Pokud je zásoba 0 nebo méně, deaktivujeme tlačítko "Objednat"
  if (stockCount <= 0) {
    disableOrderButton();
  } else {
    enableOrderButton();
  }

  // Nastavení maximální hodnoty na základě aktuálního stavu zásob
  quantityInput.setAttribute('max', stockCount);

  // Přidáme listener pro změnu počtu v inputu
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
          color: 3447003, 
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
    
    // Po odeslání objednávky znovu aktualizujeme max a kontrolujeme dostupnost
    quantityInput.setAttribute('max', stockCount);
    if (stockCount <= 0) {
      disableOrderButton();
    }
  });
  
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

    // Dynamická aktualizace max pro input
    const quantityInput = document.getElementById('quantity');
    quantityInput.setAttribute('max', count); // Dynamicky aktualizujeme max
  }

  const resetStockButton = document.getElementById('resetStockButton');
  resetStockButton.addEventListener('click', () => {
    const password = prompt('Zadejte heslo pro obnovení zásob:');
    const adminPassword = atob('c2dyZXN0b2Nr');

    if (password === adminPassword) {
      const restockAmount = prompt('Zadejte, kolik položek chcete přidat na sklad:');
      const restockCount = parseInt(restockAmount, 10);

      if (isNaN(restockCount) || restockCount <= 0) {
        alert('Zadejte platný počet položek.');
        return;
      }

      stockCount = (parseInt(localStorage.getItem('stockCount'), 10) || 0) + restockCount;
      localStorage.setItem('stockCount', stockCount);
      updateAvailability(stockCount);
      alert(`Sklad byl obnoven o ${restockCount} položek!`);
    } else {
      alert('Nesprávné heslo!');
    }
  });

  const adminButton = document.getElementById('adminButton');
  adminButton.addEventListener('click', () => {
    const password = prompt('Zadejte heslo pro přístup k přehledu objednávek:');
    const correctPassword = atob('c2ctMjAyNQ==');

    if (password === correctPassword) {
      window.location.href = 'overwiev.html';
    } else {
      alert('Nesprávné heslo!');
    }
  });

  function generateOrderId() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders.length === 0) {
      return 1;
    }
    const maxId = Math.max(...orders.map(order => order.id));
    return maxId + 1;
  }
});
