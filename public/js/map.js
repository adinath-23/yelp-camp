
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: campData.geometry.coordinates, // starting position [lng, lat]
    zoom: 6, // starting zoom
    projection: "globe", // display the map as a 3D globe
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-left')

map.on("style.load", () => {
    map.setFog({}); // Set the default atmosphere style
});


new mapboxgl.Marker()
    .setLngLat(campData.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offeset: 25 })
            .setHTML(
                `<h3>${campData.title}</h3>`
            )
    )
    .addTo(map)