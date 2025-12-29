import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import { Button } from "@/components/ui/button";

type HeatPoint = [number, number, number];

// Amoeba-style heatmap generator
const generateAmoeba = (lat: number, lon: number): HeatPoint[] => [
  [lat, lon, 0.85],
  [lat + 0.0009, lon + 0.0028, 0.7],
  [lat - 0.0006, lon + 0.0038, 0.6],
  [lat + 0.0014, lon + 0.0048, 0.5],
  [lat + 0.0028, lon + 0.0012, 0.55],
  [lat - 0.0009, lon - 0.0018, 0.4],
];

export default function Heatmap() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState("");

  const searchLocation = async () => {
    if (!query) return;
    setLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}, India`
      );
      const data = await res.json();

      if (!data.length) {
        alert("Location not found");
        setLoading(false);
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      setCenter([lat, lon]);
      setHeatPoints(generateAmoeba(lat, lon));
      setLocationName(data[0].display_name.split(",").slice(0, 2).join(", "));
    } catch {
      alert("Failed to fetch location");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <header style={{ textAlign: "center", padding: "20px" }}>
        <h1>Crop Disease Risk Map</h1>
        <p>
          AI-powered visualization of disease risk across farming regions in
          India.
        </p>
      </header>

      {/* SEARCH */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <input
          style={{ padding: "8px", width: "260px" }}
          type="text"
          placeholder="Enter village / district / city"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          style={{ marginLeft: "10px" }}
          onClick={searchLocation}
        >
          {loading ? "Analyzing…" : "Analyze"}
        </Button>
      </div>

      {/* STATUS */}
      {center && (
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          Showing disease risk for <strong>{locationName}</strong>
        </div>
      )}

      {/* MAP */}
      {center && (
        <div style={{ height: "65vh", marginBottom: "20px" }}>
          <MapContainer
            center={center}
            zoom={15}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />

            <HeatmapLayer
              points={heatPoints}
              latitudeExtractor={(p) => p[0]}
              longitudeExtractor={(p) => p[1]}
              intensityExtractor={(p) => p[2]}
              radius={140}
              blur={100}
              max={1}
              gradient={{
                "0.0": "#22c55e",
                "0.35": "#facc15",
                "0.6": "#fb923c",
                "0.85": "#ef4444",
              }}
            />
          </MapContainer>
        </div>
      )}

      {/* 🔥 TREATMENT BUTTON – ALWAYS VISIBLE */}
      <div
        style={{
          position: "sticky",
          bottom: "20px",
          display: "flex",
          justifyContent: "center",
          padding: "20px",
          background: "linear-gradient(to top, white, transparent)",
        }}
      >
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate("/treatment")}
        >
          🌱 View Treatment Recommendations
        </Button>
      </div>
    </div>
  );
}
