let map;
document.addEventListener('DOMContentLoaded', function () {
    let associations;
    var query = '';
    let mapCenter;
    let distance;

    const hasWebsiteCheckbox = document.getElementById('hasWebsite');
    const themeSelect = document.getElementById('theme');
    const searchInput = document.getElementById('search-input');

    // Initialiser la carte 
    map = initializeMap()
    mapCenter = map.getCenter();
    distance = calculateMaxDistanceFromMap();
    searchAssociations(query, mapCenter, distance).then(displayAssociations);

    
    const performSearch = async () => {
        const query = searchInput.value;
        const associations = await searchAssociations(query,mapCenter,distance);
        displayAssociations(associations);
    };

    const onMapMoveEnd = async () => {
        mapCenter = map.getCenter();
        distance = calculateMaxDistanceFromMap();
        associations = await searchAssociations(query, mapCenter, distance);
        displayAssociations(associations);
    }

    // Mettre à jour les associations lorsque la carte se déplace
    map.on('moveend',onMapMoveEnd);

    // Evénement pour les différents filtres
    hasWebsiteCheckbox.addEventListener('change', performSearch);
    themeSelect.addEventListener('change', performSearch);

    // Mettre la vue à la position de l'utilisateur (si possible)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            map.setView([userLat,userLon],15);
            mapCenter = map.getCenter();
            distance = calculateMaxDistanceFromMap();
            searchAssociations(query, mapCenter, distance).then(displayAssociations);
        }, error => {
            console.error('Error getting location:', error);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }

    // Événement pour le champ de recherche
    searchInput.addEventListener('input', async (event) => {
        query = event.target.value;
        associations = await searchAssociations(query, mapCenter, distance)
        displayAssociations(associations)
    });
});
