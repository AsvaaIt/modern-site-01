// Connect to backend via Socket.IO
const socket = io();

// Table body where visitors will appear
const tbody = document.getElementById("visitor-table");

// Initialize Leaflet map
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Listen for new visitor events
socket.on("new-visitor", (visitor) => {
  // Add visitor to table
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${visitor.timestamp}</td>
    <td>${visitor.ip}</td>
    <td>${visitor.country}</td>
    <td>${visitor.city}</td>
    <td>${visitor.browser}</td>
    <td>${visitor.os}</td>
    <td>${visitor.device}</td>
    <td>${visitor.url}</td>
  `;
  tbody.prepend(row);

  // Plot visitor on map if coordinates exist
  if (visitor.geo && visitor.geo.ll) {
    const [lat, lon] = visitor.geo.ll;
    L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`<b>${visitor.ip}</b><br>${visitor.city || ''}, ${visitor.country || ''}`);
  }
});
