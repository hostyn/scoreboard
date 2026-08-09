import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import { $route, listenToHistory, type Route } from "./router";
import { $ready, bootstrap } from "./stores/app";
import { S } from "./strings";
import { Toaster } from "./ui/Toast";
import Home from "./views/Home";
import Match from "./views/Match";
import Missing from "./views/Missing";
import NewMatch from "./views/NewMatch";
import RoundEntry from "./views/RoundEntry";
import TemplateEdit from "./views/TemplateEdit";

/** Toda la app en una isla: el estado de una partida no sobrevive a recargas. */
export default function App() {
  const route = useStore($route);
  const ready = useStore($ready);

  useEffect(() => {
    void bootstrap();
    return listenToHistory();
  }, []);

  return (
    <Toaster>
      <div className="flex min-h-dvh flex-col">
        <View route={route} ready={ready} />
      </div>
    </Toaster>
  );
}

function View({ route, ready }: { route: Route; ready: boolean }) {
  // La home enseña su propio esqueleto. Las demás vistas siembran estado desde
  // el store al montar, así que entrar por URL directa antes de que IndexedDB
  // responda las dejaría con datos vacíos: no se montan hasta tenerlo.
  if (!ready && route.name !== "home") return <Loading />;

  switch (route.name) {
    case "home":
      return <Home />;
    case "new-match":
      return <NewMatch />;
    case "match":
      // La clave reinicia el estado local al cambiar de partida.
      return <Match key={route.matchId} matchId={route.matchId} />;
    case "round":
      return (
        <RoundEntry
          key={`${route.matchId}:${route.roundIndex ?? "nueva"}`}
          matchId={route.matchId}
          roundIndex={route.roundIndex}
        />
      );
    case "template":
      return (
        <TemplateEdit
          key={route.templateId ?? "nuevo"}
          templateId={route.templateId}
        />
      );
    case "not-found":
      return <Missing />;
  }
}

const Loading = () => (
  <div
    className="flex grow items-center justify-center p-8 text-sm text-ink-faint"
    aria-busy
  >
    {S.common.loading}
  </div>
);
