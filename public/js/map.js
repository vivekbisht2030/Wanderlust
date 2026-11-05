// mapboxgl.accessToken = mapToken;

// const map = new mapboxgl.Map({
//     container: 'map', // container ID
//     center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
//     zoom: 9 // starting zoom
// });

// const marker = new mapboxgl.Marker({ color: 'red'})
//         .setLngLat(listing.geometry.coordinates) // Listing.geometry.coordinates
//         .setPopup(new mapboxgl.Popup(({offset: 25})).setHTML(`<h4>${listing.title}</h4> <p>Exact location will be provided after booking</p>`))
//         .addTo(map);

mapboxgl.accessToken = mapToken;

const coordinates = (listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length) ? listing.geometry.coordinates : [77.209, 28.6139];

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coordinates,
    zoom: 9
});

const marker = new mapboxgl.Marker({ color: 'red' })
    .setLngLat(coordinates)
    .setPopup(new mapboxgl.Popup({offset: 25}).setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`))
    .addTo(map);