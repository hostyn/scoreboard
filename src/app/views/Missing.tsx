import { ArrowLeft } from "lucide-react";
import { navigate } from "../router";
import { S } from "../strings";
import { Button } from "../ui/Button";

/** Un enlace a una partida borrada, o una URL inventada. */
export default function Missing() {
  return (
    <div className="mx-auto flex w-full max-w-2xl grow flex-col justify-center gap-4 p-5">
      <h1 className="font-display text-2xl">{S.common.notFound}</h1>
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
