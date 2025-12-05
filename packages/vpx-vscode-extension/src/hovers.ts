import {
  Hover,
  HoverProvider,
  MarkdownString,
  Position,
  Range,
  TextDocument
} from 'vscode';

import { HOVER_ENTRIES } from './data';

export const hoverProvider: HoverProvider = {
  provideHover(document: TextDocument, position: Position) {
    const range = document.getWordRangeAtPosition(position, /[a-zA-Z-]+/);
    if (!range) {
      return undefined;
    }

    const word = document.getText(range);
    const entry = HOVER_ENTRIES.get(word);
    if (!entry) {
      return undefined;
    }

    const markdown = new MarkdownString(entry, true);
    markdown.isTrusted = true;
    return new Hover(markdown, new Range(range.start, range.end));
  }
};
