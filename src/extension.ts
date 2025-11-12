import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Регистрируем команду
  const disposable = vscode.commands.registerCommand('cppLogHelper.insertCout', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('Нет активного редактора');
      return;
    }

    // Получаем имя переменной
    let varName = editor.document.getText(editor.selection).trim();
    if (!varName) {
      varName = (await vscode.window.showInputBox({
        prompt: 'Введите имя переменной (C++)',
        placeHolder: 'например: value'
      }))?.trim() || '';
    }
    if (!varName) {
      vscode.window.showInformationMessage('Операция отменена.');
      return;
    }

    // Формируем строку лога
    const logLine = `std::cout << "${varName} = " << ${varName} << std::endl;`;

    // Вставляем строку после курсора
    const line = editor.selection.active.line + 1;
    const pos = new vscode.Position(line, 0);

    await editor.edit(edit => {
      const indent = editor.document.lineAt(Math.max(0, line - 1)).firstNonWhitespaceCharacterIndex;
      edit.insert(pos, ' '.repeat(indent) + logLine + '\n');
    });

    vscode.window.showInformationMessage(`Вставлен лог для "${varName}"`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
