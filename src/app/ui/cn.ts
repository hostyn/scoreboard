type ClassValue = string | false | null | undefined;

/** Une clases ignorando las condicionales apagadas. */
export const cn = (...classes: ClassValue[]): string =>
  classes.filter(Boolean).join(" ");
