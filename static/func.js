let lastKnownUpdate = null;

async function fetchDataAndUpdateTable() {
  try {
    const res = await fetch('/data');
    const json = await res.json();

    const data = json.data;
    const tbody = document.getElementById('task-table-body');

    if (data && data.length > 0) {
      tbody.innerHTML = data.map(item => `
        <tr>
          <td>${item.id}</td>
          <td>${item.description}</td>
          <td>${item.details}</td>
          <td>${item.done}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td>1</td><td>Empty</td><td>List seems to be empty</td><td>true</td></tr>';
    }
  } catch (error) {
    console.error(`Failed to update table: ${error.message}`);
  }
}

fetchDataAndUpdateTable();
setInterval(fetchDataAndUpdateTable, 15000);
