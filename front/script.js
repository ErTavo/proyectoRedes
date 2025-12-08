const API = 'http://localhost:3000/api/items';

async function loadItems() {
  try {
    const res = await fetch(API);
    const items = await res.json();
    const tbody = document.getElementById('items-body');
    tbody.innerHTML = '';
    items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.email)}</td>
        <td>${escapeHtml(item.message)}</td>
        <td>${item.created_at}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Error: ' + (err.error || 'unknown'));
      return;
    }
    e.target.reset();
    await loadItems();
  } catch (err) {
    console.error(err);
    alert('Error al conectar con el backend');
  }
});

loadItems();
