async function searchAssociations(query = '', mapCenter = null, distance = null) {
    const request = createRequest(query, mapCenter, distance)
    console.log("Final request : ", request)
    try {
        const response = await fetch(request);
        const data = await response.json();
        //console.log('Données reçues de l\'API:', data);
        return data.results; // todo : attribute for object data return by request
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

const displayAssociations = (associations) => {
    // Enlever tous les marqueurs précédents
    clearMarkers()
    const associationsList = document.getElementById('associations-list');
    associationsList.innerHTML = '';
    associations.forEach(association => {
        const listItem = document.createElement('div');
        listItem.className = 'association-item';
        listItem.setAttribute('data-lat', association.lat);
        listItem.setAttribute('data-lon', association.lon);
        listItem.innerHTML = `<h4>${association.title}</h4>`;
        if (association.object)
            listItem.innerHTML += `<p class='object-text'>${capitalizeFirstLetter(association.object)}</p>`
        if (association.street_name_manager && association.pc_address_manager)
            listItem.innerHTML += `<p>${association.street_name_manager}, ${association.pc_address_manager}</p>`
        if (association.website)
            // voir si l'adresse est spécifié avec 'https://' ou non
            listItem.innerHTML += `<a href='${ensureHttps(association.website)}'>${association.website}</a>`

        // Ajouter un événement click sur chaque association
        listItem.addEventListener('click', () => {
            focusOnAssociation(association);
        });
        associationsList.appendChild(listItem);

        // Ajout d'un marqueur à la carte
        addMarkersToMap(association);
    });
};


function createRequest(query, mapCenter, distance) {
    const baseUrl = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/ref-france-association-repertoire-national/records?'
    let request = baseUrl;
    const hasWebsite = document.getElementById('hasWebsite').checked;
    const selectedTheme = document.getElementById('theme').value;

    // Filtre automatique
    request += `where=position='Active' `

    // Filtre sur le champ de recherche
    if (query != '') {
        //console.log("Query : ", query)
        request += `and (object like '${query}' or title like '${query}')`
    }
    if (mapCenter) {
        const lat = mapCenter.lat;
        const lon = mapCenter.lng;
        const unit = 'm'; // mètres
        //console.log("distance : ", distance)
        //console.log("Map center : ", `${lat},${lon}`)
        request += `and within_distance(geo_point_2d, GEOM'POINT(${lon} ${lat})', ${distance}${unit})`;
    }

    if (hasWebsite)
        request += `and website is not null`

    request += `&limit=15`;
    return request
}

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const ensureHttps = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
};