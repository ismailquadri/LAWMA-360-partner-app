import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Vehicle } from "@/lib/fleet";

type Props = { fleet: (Vehicle & { flagged: boolean })[]; selected: string; onSelect: (id: string) => void; dark: boolean };

export default function FleetMap({ fleet, selected, onSelect, dark }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef(new Map<string, maplibregl.Marker>());

  useEffect(() => {
    if (!el.current) return;
    const m = new maplibregl.Map({
      container: el.current,
      style: `https://tiles.openfreemap.org/styles/${dark ? "dark" : "positron"}`,
      center: [3.45, 6.52], zoom: 10.3, attributionControl: { compact: true },
    });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.current = m;
    return () => { markers.current.forEach((mk) => mk.remove()); markers.current.clear(); m.remove(); };
  }, [dark]);

  useEffect(() => {
    const m = map.current; if (!m) return;
    for (const v of fleet) {
      let mk = markers.current.get(v.crewId);
      if (!mk) {
        const node = document.createElement("button");
        node.setAttribute("aria-label", `${v.crewName} · ${v.plate}`);
        node.onclick = () => onSelect(v.crewId);
        mk = new maplibregl.Marker({ element: node }).setLngLat([v.lng, v.lat]).addTo(m);
        markers.current.set(v.crewId, mk);
      }
      const node = mk.getElement();
      node.className = "fleet-pin";
      node.dataset["flagged"] = String(v.flagged);
      node.dataset["selected"] = String(v.crewId === selected);
      node.textContent = v.plate.split(" ")[1] ?? "";
      mk.setLngLat([v.lng, v.lat]);
    }
  }, [fleet, selected, onSelect]);

  useEffect(() => {
    const v = fleet.find((f) => f.crewId === selected);
    if (v && map.current) map.current.easeTo({ center: [v.lng, v.lat], zoom: Math.max(map.current.getZoom(), 12.5), duration: 600 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return <div ref={el} className="h-full w-full" />;
}
