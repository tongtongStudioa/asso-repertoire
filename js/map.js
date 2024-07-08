

let markers = [];
const initializeMap = (coords = null) => {
    if (coords != null) {
        const map = L.map('map').setView(coords, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        return map
    } else {
        // Fallback to default location (e.g., Paris)
        const map = L.map('map').setView([48.8566, 2.3522], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        return map
    }
};

// Fonction pour supprimer tous les marqueurs de la carte
const clearMarkers = () => {
    markers.forEach(marker => {
        // Enlève le marqueur de la map
        marker.remove()
    });
    markers = []; // Réinitialiser la liste des marqueurs
};

const addMarkersToMap = (association) => {
    if (association.geo_point_2d.lon && association.geo_point_2d.lat) {
        const marker = L.marker([association.geo_point_2d.lat, association.geo_point_2d.lon])
            .addTo(map)
            .bindPopup(`<p style=width:200px><b>${association.title}</b></p><p class='object-text'>${association.object}</p>`);
        // Ajouter les marqueurs à la liste
        markers.push(marker);
    } else {
        console.error(`Coordonnées invalides pour l'association: ${association.title}`);
    }
};

// Fonction pour centrer la carte et afficher un popup pour une association
const focusOnAssociation = (association) => {
    if (association.geo_point_2d.lon && association.geo_point_2d.lat) {
        map.setView([association.geo_point_2d.lat, association.geo_point_2d.lon], 15);
        const marker = markers.find(m => m.getLatLng().lat === association.geo_point_2d.lat && m.getLatLng().lng === association.geo_point_2d.lon);
        if (marker) {
            marker.openPopup();
        }
    } else {
        console.error(`Coordonnées invalides pour l'association: ${association.title}`);
    }
};


// Fonction pour calculer la distance en fonction du niveau de zoom
function calculateMaxDistanceFromMap() {
    const distance = map.getBounds().getNorthEast().distanceTo(map.getBounds().getSouthWest()) / 2
    return distance * 0.7
};