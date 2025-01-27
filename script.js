// Map initialization
const OMAN_BOUNDS = [
    [16.65, 52.00], // SW coordinates
    [26.20, 59.90]  // NE coordinates
];
const map = L.map('map', {
    maxBounds: OMAN_BOUNDS,
    maxBoundsViscosity: 1.0
}).setView([21.4735, 57.9754], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

let markers = [];

// Flight data generation
const generateFlights = () => {
    return Array.from({length: 150}, (_, i) => {
        const [departure, arrival] = ['MCT', 'SLL', 'DQM', 'AUH', 'DXB', 'DOH', 'JED']
            .sort(() => Math.random() - 0.5).slice(0, 2);
        
        return {
            callsign: `OMA${String(i+1000).padStart(4, '0')}`,
            altitude: Math.floor(Math.random() * 35000 + 5000),
            speed: Math.floor(Math.random() * 450 + 250),
            departure,
            arrival,
            aircraft: ['A320', 'B789', 'A350', 'B77W', 'A380'][Math.floor(Math.random() * 5)],
            coordinates: [
                16.65 + Math.random() * 9.55,
                52.00 + Math.random() * 7.90
            ],
            rotation: Math.floor(Math.random() * 360)
        };
    });
};

const allFlights = generateFlights();

const getRandomFlights = () => {
    return [...allFlights].sort(() => Math.random() - 0.5).slice(0, 25);
};

// Marker creation
function createAircraftMarker(flight) {
    return L.divIcon({
        className: 'aircraft-marker',
        html: `<div style="transform: rotate(${flight.rotation}deg)">✈️</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
}

// Update functions
function updateMap(flights) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    flights.forEach(flight => {
        const marker = L.marker(flight.coordinates, {
            icon: createAircraftMarker(flight)
        }).bindPopup(`
            <b>${flight.callsign}</b><br>
            ✈️ ${flight.aircraft}<br>
            🛫 ${flight.departure} → 🛬 ${flight.arrival}<br>
            📏 ${flight.altitude.toLocaleString()} ft<br>
            🚀 ${flight.speed} kts
        `).addTo(map);
        markers.push(marker);
    });

    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
    }
}

function updateTable(flights) {
    const tbody = document.getElementById('flightData');
    tbody.innerHTML = flights.map(flight => `
        <tr>
            <td>${flight.callsign}</td>
            <td>${flight.altitude.toLocaleString()} ft</td>
            <td>${flight.speed} kts</td>
            <td>${flight.departure} → ${flight.arrival}</td>
            <td>${flight.aircraft}</td>
        </tr>
    `).join('');
}

function updateStatus(flights) {
    document.getElementById('flightCount').textContent = `✈️ ${flights.length} Flights Tracked`;
    document.getElementById('updateTime').textContent = `🕒 Last update: ${new Date().toLocaleTimeString('en-OM', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Muscat'
    })} GST`;
}

function refreshData() {
    const flights = getRandomFlights();
    updateStatus(flights);
    updateTable(flights);
    updateMap(flights);
}

// Initialization
refreshData();
setInterval(refreshData, 3000);

// Window resize handler
window.addEventListener('resize', () => {
    map.invalidateSize();
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
    }
});