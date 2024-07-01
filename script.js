document.addEventListener('DOMContentLoaded', function() {
    const associationsList = document.getElementById('associations-list');
    const searchInput = document.getElementById('search-input');
    let map;
    let markers = [];
    const baseUrl = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/ref-france-association-repertoire-national/records?'

    searchInput.addEventListener('input', () => {
        fetchAssociations(searchInput.value);
    });

    const fetchAssociations = (query = '', map = null) => {
        clearMarkers(); // Supprimer tous les marqueurs existants
        let request = baseUrl ;
        const center = map.getCenter();
        const lat = center.lat;
        const lon = center.lng;
         // Calculer la distance en fonction du niveau de zoom
         const zoomLevel = map.getZoom();
         const distance = calculateDistanceFromZoom(zoomLevel);
        const unit = 'm'; // mètres

        console.log("zoom :", zoomLevel)
        console.log("distance : ",distance)
        //console.log("Map center : ", `${lat},${lon}`)
        //console.log("Query : ", query)
        if (query != '' && map) {
            request += `where=(object like '${query}' or title like '${query}') and within_distance(geo_point_2d, GEOM'POINT(${lon} ${lat})', ${distance}${unit})&`
        }
        if (map && query == '') {
            request += `where= within_distance(geo_point_2d, GEOM'POINT(${lon} ${lat})', ${distance}${unit})&`;
        }
        request += `order_by website, geo_point_2d&limit=100`;
        console.log("Final request : ",request)
        fetch(request)
            .then(response => response.json())
            .then(data => {
                console.log('Données reçues de l\'API:', data);
                displayAssociations(data);
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    const displayAssociations = (data) => {
        associationsList.innerHTML = '';
        if (Array.isArray(data.results)) {
            data.results.forEach(association => {
                const div = document.createElement('div');
                div.className = 'association';
                div.setAttribute('data-lat', association.lat);
                div.setAttribute('data-lon', association.lon);
                div.innerHTML = `<h2>${association.title}</h2><p>${association.object}</p><p>${association.street_name_manager}, ${association.pc_address_manager}</p>`;
                div.innerHTML += `<p>${association.website}</p>`
                associationsList.appendChild(div);

                // Ajout d'un marqueur à la carte
                addMarkersToMap(association);

                // Ajouter un événement click sur chaque association
                div.addEventListener('click', () => {
                    focusOnAssociation(this.geo_point_2d, this.title, this.object);
                });
            });
        } else {
            console.error('Les données reçues ne sont pas un tableau');
        }
    };

    const addMarkersToMap = (association) => {
        if (association.geo_point_2d.lon && association.geo_point_2d.lat) {
            const marker = L.marker([association.geo_point_2d.lat, association.geo_point_2d.lon])
                .addTo(map)
                .bindPopup(`<b>${association.title}</b><br>${association.object}`);
                markers.push(marker);
        } else {
            console.error(`Coordonnées invalides pour l'association: ${association.title}`);
        }
    };

    // Fonction pour centrer la carte et afficher un popup pour une association
    const focusOnAssociation = (geo_point_2d,title,object) => {
        if (geo_point_2d.lat && geo_point_2d.lon) {
            map.setView([geo_point_2d.lat, geo_point_2d.lon], 15);
            const marker = markers.find(m => m.getLatLng().lat === geo_point_2d.lat && m.getLatLng().lng === geo_point_2d.lon);
            if (marker) {
                marker.openPopup();
            }
        } else {
            console.error(`Coordonnées invalides pour l'association: ${association.title}`);
        }
    };

    // Initialiser la carte à la position de l'utilisateur
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            map = L.map('map').setView([userLat, userLon], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            //Fetch initial associations based on user's location
            fetchAssociations('', map);

            // Événement pour le champ de recherche
            searchInput.addEventListener('input', () => {
                fetchAssociations(searchInput.value, map);
            });

            // Mettre à jour les associations lorsque la carte se déplace
            map.on('moveend', () => {
                fetchAssociations(searchInput.value, map);
            });
        }, error => {
            console.error('Error getting location:', error);
            // Fallback to default location (e.g., Paris)
            //initializeMap([48.8566, 2.3522]);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        // Fallback to default location (e.g., Paris)
        initializeMap([48.8566, 2.3522]);
    }

    // Fonction pour supprimer tous les marqueurs de la carte
    const clearMarkers = () => {
        markers.forEach(marker => marker.remove());
        markers = []; // Réinitialiser la liste des marqueurs
    };

    // Fonction pour calculer la distance en fonction du niveau de zoom
    const calculateDistanceFromZoom = (zoomLevel) => {
    // Ajustez les valeurs selon vos besoins
    const baseDistance = 500000; // Distance de base au niveau de zoom 0 (500 km, par exemple)
    const zoomFactor = 1.4; // Facteur d'ajustement empirique

    // Calculer la distance en fonction du zoom
    return baseDistance / Math.pow(zoomFactor, zoomLevel);
};

    const initializeMap = (coords) => {
        map = L.map('map').setView(coords, 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Fetch initial associations
        fetchAssociations('', map);

        // Événement pour le champ de recherche
        searchInput.addEventListener('input', () => {
            fetchAssociations(searchInput.value, map);
        });

        // Mettre à jour les associations lorsque la carte se déplace
        map.on('moveend', () => {
            fetchAssociations(searchInput.value, map);
        });
    };

    initializeMap([48.8566, 2.3522]);
});
