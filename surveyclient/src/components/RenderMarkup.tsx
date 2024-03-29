import { Markup } from "learning-play-audit-survey";
import React from "react";

export function renderMarkup(markup:Markup|Markup[], key?:number):React.ReactNode {
  if (!markup) {
    return <></>;
  }
  if (typeof markup === "string") {
    return <span key={key}>{markup}</span>;
  }
  if (Array.isArray(markup)) {
    return <>{markup.map((markupElement, currentKey) => renderMarkup(markupElement, currentKey))}</>;
  }
  const { tag, content } = markup;
  const renderedContent = renderMarkup(content, key);

  if (tag === "h2") {
    return <h2 key={key}>{renderedContent}</h2>;
  }
  if (tag === "p") {
    return <p key={key}>{renderedContent}</p>;
  }
  if (tag === "b") {
    return <b key={key}>{renderedContent}</b>;
  }
  throw new Error("unknown tag type: " + markup);
}
