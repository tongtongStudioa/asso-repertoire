let map;
document.addEventListener('DOMContentLoaded', function () {
    let associations;
    var query = '';
    let mapCenter;
    let distance;
    const searchInput = document.getElementById('search-input');

    // Initialiser la carte à la position de l'utilisateur
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            map = initializeMap([userLat,userLon])
            mapCenter = map.getCenter();
            distance = calculateMaxDistanceFromMap();
            associations = searchAssociations(query, mapCenter, distance)
            displayAssociations(associations)

            // Événement pour le champ de recherche
            searchInput.addEventListener('input', async (event) => {
                query = event.target.value;
                associations = await searchAssociations(query, mapCenter, distance)
                displayAssociations(associations)
            });

            // Mettre à jour les associations lorsque la carte se déplace
            map.on('moveend', async () => {
                mapCenter = map.getCenter();
                distance = calculateMaxDistanceFromMap();
                associations = await searchAssociations(query, mapCenter, distance);
                displayAssociations(associations);
            });

        }, error => {
            console.error('Error getting location:', error);
            map = initializeMap()
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        map = initializeMap()
    }

});
