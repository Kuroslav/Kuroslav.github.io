function loadOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const tableBody = document.getElementById('ordersTableBody');

  tableBody.innerHTML = '';

  if (orders.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="8">Žádné objednávky</td></tr>';
    return;
  }

  orders.sort((a, b) => b.id - a.id);

  orders.forEach((order, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.firstName}</td>
      <td>${order.lastName}</td>
      <td>${order.email}</td>
      <td>${order.phone}</td>
      <td>${order.quantity}</td>
      <td><input type="checkbox" class="sentCheckbox" ${order.sent ? 'checked' : ''} data-index="${index}"></td>
      <td><button class="deleteButton" data-index="${index}">Smazat</button></td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll('.sentCheckbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const index = e.target.dataset.index;
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      orders[index].sent = e.target.checked;
      localStorage.setItem('orders', JSON.stringify(orders));
    });
  });

  document.querySelectorAll('.deleteButton').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      orders.splice(index, 1);
      localStorage.setItem('orders', JSON.stringify(orders));
      loadOrders();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadOrders();

  document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = 'parts.html';
  });
});