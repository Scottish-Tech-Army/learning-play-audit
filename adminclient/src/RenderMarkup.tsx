import { Markup } from "learning-play-audit-survey";
import React from "react";

export function renderMarkup(markup: Markup | Markup[]): React.ReactNode {
  if (!markup) {
    return <></>;
  }
  if (typeof markup === "string") {
    return markup;
  }
  if (Array.isArray(markup)) {
    return <>{markup.map(renderMarkup)}</>;
  }
  const { tag, content } = markup;
  const renderedContent = renderMarkup(content);

  if (tag === "h2") {
    return <h2>{renderedContent}</h2>;
  }
  if (tag === "p") {
    return <p>{renderedContent}</p>;
  }
  if (tag === "b") {
    return <b>{renderedContent}</b>;
  }
  throw new Error("unknown tag type: " + markup);
}
