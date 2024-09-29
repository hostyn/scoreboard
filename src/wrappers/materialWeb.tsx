import { MdFab as MdFabWebComponent } from "@material/web/fab/fab";
import { createComponent } from "@lit/react";
import React from "react";

export const MdFab = createComponent({
  tagName: "md-fab",
  elementClass: MdFabWebComponent,
  react: React,
});
