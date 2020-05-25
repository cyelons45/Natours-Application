// const locations = JSON.parse(document.getElementById('map').dataset.locations);

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiY3llbG9uczQ1IiwiYSI6ImNrYTdwYXdsbDA1ZmMycW83ZXBjaGh5aGsifQ.fnxRmg2p1_Wo67ZQreqkRA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/cyelons45/cka7pqd41030b1ipr0puydhkv',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    var popup = new mapboxgl.Popup({closeOnClick: false, offset: 30})
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    var marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
