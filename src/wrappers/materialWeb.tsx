import React from "react";
import { createComponent } from "@lit/react";

import { MdFab as MdFabWebComponent } from "@material/web/fab/fab";
import { MdDialog as MdDialogWebComponent } from "@material/web/dialog/dialog";
import { MdFilledTextField as MdFilledTextFieldWebComponent } from "@material/web/textfield/filled-text-field";
import { MdElevatedButton as MdElevatedButtonWebComponent } from "@material/web/button/elevated-button";
import { MdFilledButton as MdFilledButtonWebComponent } from "@material/web/button/filled-button";
import { MdFilledTonalButton as MdFilledTonalButtonWebComponent } from "@material/web/button/filled-tonal-button";
import { MdTextButton as MdTextButtonWebComponent } from "@material/web/button/text-button";
import { MdIconButton as MdIconButtonWebComponent } from "@material/web/iconbutton/icon-button";
import { MdRadio as MdRadioWebComponent } from "@material/web/radio/radio";

export const MdFab = createComponent({
  tagName: "md-fab",
  elementClass: MdFabWebComponent,
  react: React,
});

export const MdDialog = createComponent({
  tagName: "md-dialog",
  elementClass: MdDialogWebComponent,
  react: React,
});

export const MdFilledTextField = createComponent({
  tagName: "md-filled-text-field",
  elementClass: MdFilledTextFieldWebComponent,
  react: React,
});

export const MdElevatedButton = createComponent({
  tagName: "md-elevated-button",
  elementClass: MdElevatedButtonWebComponent,
  react: React,
});

export const MdFilledButton = createComponent({
  tagName: "md-filled-button",
  elementClass: MdFilledButtonWebComponent,
  react: React,
});

export const MdFilledTonalButton = createComponent({
  tagName: "md-filled-tonal-button",
  elementClass: MdFilledTonalButtonWebComponent,
  react: React,
});

export const MdTextButton = createComponent({
  tagName: "md-text-button",
  elementClass: MdTextButtonWebComponent,
  react: React,
});

export const MdIconButton = createComponent({
  tagName: "md-icon-button",
  elementClass: MdIconButtonWebComponent,
  react: React,
});

export const MdRadio = createComponent({
  tagName: "md-radio",
  elementClass: MdRadioWebComponent,
  react: React,
});
