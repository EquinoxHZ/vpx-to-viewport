import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  MarkdownString,
  Position,
  Range,
  SnippetString,
  TextDocument
} from 'vscode';

import { FUNCTION_SUGGESTIONS, UNIT_SUGGESTIONS } from './data';

function isInPropertyValue(document: TextDocument, position: Position): boolean {
  const linePrefix = document.lineAt(position).text.substring(0, position.character);
  return /:\s*[^;]*$/.test(linePrefix);
}

function getWordBeforeCursor(document: TextDocument, position: Position): { word: string; range: Range } {
  const lineText = document.lineAt(position).text;
  const textBefore = lineText.substring(0, position.character);

  // 匹配数字+字母的组合，如 "100v", "5max", "12lin"
  const match = textBefore.match(/(\d+\.?\d*)([a-zA-Z-]*)$/);

  if (match) {
    const fullMatch = match[0];
    const number = match[1];
    const letters = match[2];

    const startPos = position.character - fullMatch.length;
    const numberEndPos = startPos + number.length;

    // 返回字母部分作为要匹配的word，以及字母部分的range（用于替换）
    return {
      word: letters,
      range: new Range(
        position.line,
        numberEndPos,
        position.line,
        position.character
      )
    };
  }

  // 如果没有数字，只匹配字母
  const letterMatch = textBefore.match(/([a-zA-Z-]*)$/);
  if (letterMatch) {
    const letters = letterMatch[1];
    return {
      word: letters,
      range: new Range(
        position.line,
        position.character - letters.length,
        position.line,
        position.character
      )
    };
  }

  return { word: '', range: new Range(position, position) };
}

export const completionProvider: CompletionItemProvider = {
  provideCompletionItems(document: TextDocument, position: Position) {
    if (!isInPropertyValue(document, position)) {
      return undefined;
    }

    const { word, range } = getWordBeforeCursor(document, position);
    const items: CompletionItem[] = [];

    // 单位补全:只在输入字母时触发(如 "5v" 中的 "v")
    for (const suggestion of UNIT_SUGGESTIONS) {
      if (suggestion.label.startsWith(word.toLowerCase())) {
        const item = new CompletionItem(suggestion.label, CompletionItemKind.Constant);
        item.detail = suggestion.detail;
        const doc = new MarkdownString(suggestion.documentation);
        doc.isTrusted = true;
        item.documentation = doc;
        item.insertText = suggestion.insertText;
        item.range = range; // 只替换字母部分
        item.sortText = '0' + suggestion.label; // 提高排序优先级
        item.filterText = suggestion.label;
        items.push(item);
      }
    }

    // 函数补全
    for (const suggestion of FUNCTION_SUGGESTIONS) {
      if (suggestion.label.startsWith(word.toLowerCase()) || word === '') {
        const item = new CompletionItem(suggestion.label, CompletionItemKind.Function);
        item.detail = suggestion.detail;
        const doc = new MarkdownString(suggestion.documentation);
        doc.isTrusted = true;
        item.documentation = doc;
        item.insertText = new SnippetString(suggestion.insertText);
        item.range = range;
        item.sortText = '1' + suggestion.label;
        item.filterText = suggestion.label;
        items.push(item);
      }
    }

    return items;
  }
};
