mapboxgl.accessToken = mapToken;

// Check whether valid coordinates exist
const hasCoordinates =
    listing.geometry &&
    Array.isArray(listing.geometry.coordinates) &&
    listing.geometry.coordinates.length === 2 &&
    listing.geometry.coordinates.every(Number.isFinite);

if (!hasCoordinates) {
    document.getElementById("map").innerHTML = "<p>Location coordinates are not available for this listing.</p>";
} else {
    const coordinates = listing.geometry.coordinates;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coordinates,
        zoom: 9
    });
    const marker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(coordinates)
        .setPopup( new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${listing.title}
            </h4><p>Exact location will be provided after booking</p>`)
        )
        .addTo(map);
}