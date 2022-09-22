import React, { createRef } from "react";

import tt from "@tomtom-international/web-sdk-maps";
import { services } from "@tomtom-international/web-sdk-services";

import "@tomtom-international/web-sdk-maps/dist/maps.css";
import "./App.css";

const API_KEY = "Get your free API KEY at developer.tomtom.com";
const SAN_FRANCISCO = [-122.4194, 37.7749];

class App extends React.Component {
  constructor(props) {
    super(props);

    this.mapElement = createRef();

    this.state = {
      markers: []
    };
  }

  componentDidMount() {
    this.map = tt.map({
      key: API_KEY,
      container: this.mapElement.current,
      center: SAN_FRANCISCO,
      zoom: 12
    });

    this.map.on("click", this.addMarker);
  }

  componentWillUnmount() {
    this.map.remove();
  }

  addMarker = (event) => {
    const { markers } = this.state;

    if (markers.length < 2) {
      const marker = new tt.Marker().setLngLat(event.lngLat).addTo(this.map);
      this.setState({ markers: [...markers, marker] });
    }
  };

  route = () => {
    const { markers } = this.state;

    if (markers.length < 2) return;

    const key = API_KEY;
    const locations = markers.map((marker) => marker.getLngLat());

    this.calculateRoute("green", {
      key,
      locations
    });

    this.calculateRoute("red", {
      key,
      locations,
      travelMode: "truck",
      vehicleLoadType: "otherHazmatExplosive",
      vehicleWeight: 8000
    });
  };

  calculateRoute = async (color, routeOptions) => {
    try {
      const response = await services.calculateRoute(routeOptions);
      const geojson = response.toGeoJson();

      this.map.addLayer({
        id: color,
        type: "line",
        source: {
          type: "geojson",
          data: geojson
        },
        paint: {
          "line-color": color,
          "line-width": 6
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  clear = () => {
    const { markers } = this.state;

    markers.forEach((marker) => marker.remove());
    this.setState({ markers: [] });

    this.removeRoute("green");
    this.removeRoute("red");
  };

  removeRoute = (id) => {
    this.map.removeLayer(id);
    this.map.removeSource(id);
  };

  render() {
    return (
      <div className="App">
        <div ref={this.mapElement} className="mapDiv">
          <button className="clearButton" onClick={this.clear}>
            Clear
          </button>
          <button className="routeButton" onClick={this.route}>
            Route
          </button>
        </div>
      </div>
    );
  }
}

export default App;
