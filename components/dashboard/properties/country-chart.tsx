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

// palette for deterministic assignment
const palette = ["#80A4ED", "#2d1b4e", "#BCD3F2", "#B118C8", "#1C1C4F"];

// deterministic color per country
function getCountryColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

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
    <DashCard className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-sm text-gray-900">Geographic Spread</h2>
      </div>

    

      {/* Map container */}

      <div className="w-full h-auto aspect-2/1">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 175 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={[0, 20]} zoom={1}>
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
      </div>

      {/* Tooltip */}
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

      {/* Footer info */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2.5 h-2.5 rounded-sm bg-gray-400" />
        You have {propertyCount}{" "}
        {propertyCount === 1 ? "property" : "properties"} across{" "}
        {countries.length} {countries.length === 1 ? "country" : "countries"}
      </div>
    </DashCard>
  );
}
