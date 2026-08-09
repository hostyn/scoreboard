import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import { $route, listenToHistory } from "./router";
import { bootstrap } from "./stores/app";
import { Toaster } from "./ui/Toast";
import Home from "./views/Home";
import Soon from "./views/Soon";

/** Toda la app en una isla: el estado de una partida no sobrevive a recargas. */
export default function App() {
  const route = useStore($route);

  useEffect(() => {
    void bootstrap();
    return listenToHistory();
  }, []);

  return (
    <Toaster>
      <div className="flex min-h-dvh flex-col">
        <View route={route} />
      </div>
    </Toaster>
  );
}

function View({ route }: { route: ReturnType<typeof $route.get> }) {
  switch (route.name) {
    case "home":
      return <Home />;
    case "new-match":
      return <Soon what="Nueva partida · fase 5" />;
    case "match":
      return <Soon what="Pantalla de partida · fase 6" />;
    case "round":
      return <Soon what="Entrada de ronda · fase 7" />;
    case "template":
      return <Soon what="Plantilla de juego · fase 5" />;
    case "not-found":
      return <Soon what="Esa dirección no existe" />;
  }
}
