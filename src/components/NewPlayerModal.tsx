import { useEffect, useRef } from "react";
import "@material/web/fab/fab";
import {
  MdDialog,
  MdFilledButton,
  MdFilledTextField,
  MdRadio,
  MdTextButton,
} from "@/wrappers/materialWeb";
import { AddIcon, PersonIcon } from "./icons";
import type { MdDialog as MdDialogType } from "@material/web/dialog/dialog";
import { $scoreboard, addPlayer } from "@/stores/scoreboard";
import { useStore } from "@nanostores/react";

export default function NewPlayerModal() {
  const scoreboard = useStore($scoreboard);

  const dialogRef = useRef<MdDialogType>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAddPlayer = () => {
    if (!formRef.current) return;
    const form = new FormData(formRef.current);
    const name = form.get("name") as string;
    const strategy = form.get("strategy") as string;
    const points = form.get("points") as string;

    if (!name) {
      alert("Please enter a name.");
      return;
    }

    if (strategy === "custom" && !points) {
      alert("Please enter the custom points.");
      return;
    }

    addPlayer(
      name,
      strategy === "custom"
        ? parseInt(points)
        : strategy === "zero"
        ? 0
        : undefined
    );

    dialogRef.current?.close();
  };

  useEffect(() => {
    const resetForm = () => {
      formRef.current?.reset();
      const defaultInput =
        formRef.current?.querySelector<HTMLInputElement>("#default");
      if (defaultInput) {
        defaultInput.checked = true;
      }
    };

    dialogRef.current?.addEventListener("close", resetForm);

    return () => {
      dialogRef.current?.removeEventListener("close", resetForm);
    };
  }, [dialogRef, formRef]);

  return (
    <>
      <MdFilledButton
        className="self-start"
        onClick={() => dialogRef.current?.show()}
      >
        Add player
        <AddIcon slot="icon" />
      </MdFilledButton>

      <MdDialog ref={dialogRef}>
        <div slot="headline">
          <h1 className="md-typescale-headline-small">Add player</h1>
        </div>

        <form
          slot="content"
          id="new-game"
          className="flex flex-col gap-4"
          ref={formRef}
        >
          <MdFilledTextField label="Player name" name="name">
            <PersonIcon slot="leading-icon" />
          </MdFilledTextField>

          <div className="flex flex-col gap-3">
            <h1 className="md-typescale-title-large">Points strategy</h1>

            <label className="flex gap-2 md-typescale-body-medium">
              <MdRadio id="default" name="strategy" value="adapt" checked />
              {scoreboard?.morePointsWins
                ? "Less points minus one"
                : "More points plus one"}
            </label>
            <label className="flex gap-2 md-typescale-body-medium">
              <MdRadio name="strategy" value="zero" />0 points
            </label>
            <label className="flex gap-2 md-typescale-body-medium">
              <MdRadio name="strategy" value="custom" />
              Custom points
            </label>
            <MdFilledTextField
              label="Custom points"
              name="points"
              type="number"
            />
          </div>
        </form>
        <div slot="actions">
          <form slot="actions" method="dialog">
            <MdTextButton>Cancel</MdTextButton>
          </form>
          <MdTextButton onClick={handleAddPlayer}>Add player</MdTextButton>
        </div>
      </MdDialog>
    </>
  );
}
