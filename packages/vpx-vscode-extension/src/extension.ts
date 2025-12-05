import { ExtensionContext, languages, workspace } from 'vscode';
import { completionProvider } from './completions';
import { hoverProvider } from './hovers';

const LANGUAGE_SELECTOR = [
  'css',
  'scss',
  'less',
  'vue',
  { scheme: 'file', language: 'javascriptreact' },
  { scheme: 'file', language: 'typescriptreact' }
];

export function activate(context: ExtensionContext) {
  const config = workspace.getConfiguration('vpxCssHelper');
  const enableCompletions = config.get<boolean>('enableCompletions', true);
  const enableHover = config.get<boolean>('enableHover', true);

  if (enableCompletions) {
    const completionDisposable = languages.registerCompletionItemProvider(
      LANGUAGE_SELECTOR,
      completionProvider
    );
    context.subscriptions.push(completionDisposable);
  }

  if (enableHover) {
    const hoverDisposable = languages.registerHoverProvider(LANGUAGE_SELECTOR, hoverProvider);
    context.subscriptions.push(hoverDisposable);
  }
}

export function deactivate() {}
