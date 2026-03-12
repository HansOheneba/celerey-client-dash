import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { DashCard } from "@/components/dashboard/dash-card";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// palette for random assignment
const palette = ["#80A4ED", "#2d1b4e", "#BCD3F2", "#B118C8", "#1C1C4F"];

// deterministic color per country
function getCountryColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

/**
 * AssetMap — world map that highlights countries where the client holds
 * property/assets.
 *
 * Pass `countries` as full geographic names matching the world atlas
 * (e.g. "United States of America", "United Kingdom").
 * Use `getPropertyGeoCountries()` from lib/property-data.ts to derive
 * this list dynamically from the client's property data.
 *
 * `propertyCount` is the total number of active properties (may differ
 * from countries.length when multiple properties share a country).
 */
export default function AssetMap({
  countries,
  propertyCount,
}: {
  countries: string[];
  propertyCount: number;
}) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  return (
    <DashCard className="p-7 max-w-3xl">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: "#111827",
            margin: 0,
          }}
        >
          Geographic Spread
        </h2>

        <div style={{ color: "#9ca3af", fontSize: 24 }}>•••</div>
      </div>

      <div
        style={{
          height: 1,
          background: "#e5e7eb",
          marginTop: 16,
          marginBottom: 24,
        }}
      />

      <ComposableMap
        width={900}
        height={420}
        projection="geoEqualEarth"
        projectionConfig={{ scale: 180 }}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup center={[0, 15]} zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name;
                const isAsset = countries.includes(name);
                const color = isAsset ? getCountryColor(name) : "#e9ecef";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseMove={(e) => {
                      if (isAsset) {
                        setTooltip(name);
                        setMouse({ x: e.clientX, y: e.clientY });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: {
                        fill: color,
                        stroke: "#d6d9de",
                        strokeWidth: 0.6,
                        outline: "none",
                      },
                      hover: {
                        fill: isAsset ? color : "#e1e5ea",
                        outline: "none",
                      },
                      pressed: {
                        fill: color,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          style={{
            position: "fixed",
            top: mouse.y - 35,
            left: mouse.x + 10,
            background: "#111827",
            color: "#ffffff",
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            pointerEvents: "none",
            zIndex: 999,
          }}
        >
          {tooltip}
        </div>
      )}

      <div
        style={{
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#6b7280",
          fontSize: 13,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: "#9ca3af",
          }}
        />
        You have {propertyCount}{" "}
        {propertyCount === 1 ? "property" : "properties"} across{" "}
        {countries.length} {countries.length === 1 ? "country" : "countries"}
      </div>
    </DashCard>
  );
}
