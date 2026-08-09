import { ArrowLeft } from "lucide-react";
import { navigate } from "../router";
import { S } from "../strings";
import { Button } from "../ui/Button";

/**
 * Marcador para las vistas que llegan en fases posteriores. Se borra cuando la
 * última de ellas exista.
 */
export default function Soon({ what }: { what: string }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl grow flex-col justify-center gap-4 p-5">
      <h1 className="font-display text-2xl">{S.soon.title}</h1>
      <p className="text-ink-muted">{S.soon.body}</p>
      <p className="text-sm text-ink-faint">{what}</p>
      <Button
        className="self-start"
        icon={<ArrowLeft size={18} />}
        onClick={() => navigate({ name: "home" })}
      >
        {S.common.back}
      </Button>
    </div>
  );
}
