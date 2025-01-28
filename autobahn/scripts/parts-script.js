document.addEventListener('DOMContentLoaded', () => {
  let stockCount = localStorage.getItem('stockCount');
  if (!stockCount) {
    stockCount = 4;  // Výchozí počet, pokud není uložen v localStorage
    localStorage.setItem('stockCount', stockCount);
  }
  updateAvailability(stockCount);

  const quantityInput = document.getElementById('quantity');
  const orderButton = document.getElementById('orderButton');
  
  // Pokud je zásoba 0 nebo méně, deaktivujeme tlačítko "Objednat"
  if (stockCount <= 0) {
    orderButton.disabled = true;
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

    // Po odeslání objednávky znovu aktualizujeme max a kontrolujeme dostupnost
    quantityInput.setAttribute('max', stockCount);
    if (stockCount <= 0) {
      orderButton.disabled = true;
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

  const encodedRestockPassword = 'c2dyZXN0b2Nr';
  const encodedAdminPassword = 'c2ctMjAyNQ==';

  const resetStockButton = document.getElementById('resetStockButton');
  resetStockButton.addEventListener('click', () => {
    const password = prompt('Zadejte heslo pro obnovení zásob:');
    const adminPassword = atob(encodedRestockPassword);

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
    const correctPassword = atob(encodedAdminPassword);

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
