# Scoreboard

Marcador para partidas de mesa y cartas. Pensado para el móvil, en la mesa,
mientras se juega: se usa con una mano, se mira de reojo y funciona sin
cobertura.

**Local-first, sin cuentas.** Todo vive en el dispositivo, en IndexedDB. No hay
backend que mantener ni registro que pedir, y la app entera se puede instalar y
usar sin conexión.

## Cómo funciona

Un **juego** es una plantilla: quién gana (más o menos puntos), cuándo termina,
y cuatro atajos para el teclado. Una **partida** se lleva una copia congelada de
esas reglas, así que editar la plantilla en noviembre no cambia el resultado de
lo que se jugó en septiembre.

Los totales nunca se guardan: se derivan de las rondas. Eso es lo que permite
editar o borrar una ronda pasada y que todo cuadre solo.

## Estructura

```
src/
  domain/     lógica pura: tipos, clasificación, fin de partida. Sin UI ni IO.
  db/         acceso a IndexedDB
  app/        la isla: router de cliente, vistas, store y sistema visual
  pages/      shell estático de Astro con el meta
  styles/     tokens de diseño
```

`domain/` no importa nada de UI ni de persistencia, y es lo que cubren los
tests. `getStandings()` es la única función que calcula posiciones: ninguna
pantalla ordena por su cuenta.

## Comandos

| Comando         | Qué hace                                  |
| :-------------- | :---------------------------------------- |
| `pnpm dev`      | Servidor de desarrollo en `localhost:4321` |
| `pnpm test`     | Tests con vitest                          |
| `pnpm build`    | Comprueba tipos y construye a `dist/`     |
| `pnpm preview`  | Sirve la build local                      |

## Despliegue

Sitio estático. Las rutas de la isla (`/partida/:id`, `/nueva`…) no existen como
ficheros: `404.astro` monta la misma app y el router de cliente resuelve la
vista, que es lo que las hace funcionar en cualquier alojamiento estático. Para
que además devuelvan 200, configura un rewrite de `/*` a `/index.html`.

## Stack

Astro, React en una única isla, Tailwind 4, Radix como primitivas de UI,
nanostores para el estado e `idb-keyval` sobre IndexedDB.
