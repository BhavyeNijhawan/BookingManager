import { Fragment } from "react";

/** Keeps "pay-at-property" on one line instead of breaking after a hyphen */
export function keepHyphens(text: string) {
  return text.split(" ").map((w, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      {w.includes("-") ? <span className="whitespace-nowrap">{w}</span> : w}
    </Fragment>
  ));
}
