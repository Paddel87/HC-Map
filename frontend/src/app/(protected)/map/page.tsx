import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MapPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Karte</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          MapLibre-Integration folgt mit M6.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platzhalter</CardTitle>
          <CardDescription>
            Karte mit MapLibre GL JS, Tile-Proxy zu MapTiler und Marker-Clustering folgen mit M6.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-500 dark:text-slate-400">
          Geokoordinaten werden bereits server-seitig erfasst (siehe Dashboard).
        </CardContent>
      </Card>
    </div>
  );
}
