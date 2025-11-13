import * as vscode from 'vscode';

/*
  Функция activate вызывается, когда расширение включается в VS Code.
  INPUT: context — служебный объект VS Code, через который регистрируются команды.
  OUTPUT: отсутствует.
*/
export function activate(context: vscode.ExtensionContext) {
  /*
    Регистрируем команду cppLogHelper.insertCout.
    Эта команда вызывается по сочетанию клавиш.
    INPUT: отсутствует (всё берётся из активного редактора).
    OUTPUT: вставка строки вывода std::cout в код.
  */
  const disposable = vscode.commands.registerCommand('cppLogHelper.insertCout', async () => {
    // Получаем активный редактор (файл, который открыт и редактируется).
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('Нет активного редактора');
      return;
    }
    /*
      Берём выделенный текст — предполагается, что это имя переменной.
      INPUT: выделение пользователя.
      OUTPUT: строка с именем переменной или пустая строка.
    */
    let varName = editor.document.getText(editor.selection).trim();
    if (!varName) {
      /*
      Если пользователь ничего не выделил — спрашиваем вручную.
      INPUT: ввод пользователя в InputBox.
      OUTPUT: имя переменной (string) или пустая строка при отмене.
      */
      varName = (await vscode.window.showInputBox({
        prompt: 'Введите имя переменной (C++)',
        placeHolder: 'например: value'
      }))?.trim() || '';
    }
    if (!varName) {
      // Если пользователь нажал Esc или оставил пусто — отменяем операцию.
      vscode.window.showInformationMessage('Операция отменена.');
      return;
    }

    /*
      Формируем строку логирования
      INPUT: varName — имя переменной.
      OUTPUT: строка вида std::cout << "x = " << x << std::endl;
    */
    const logLine = `std::cout << "${varName} = " << ${varName} << std::endl;`;
    /*
      Вычисляем строку, куда вставить лог.
      Вставляем на следующей строке после места, где стоит курсор.
      INPUT: позиция курсора.
      OUTPUT: новая позиция вставки.
    */
    const line = editor.selection.active.line + 1;
    const pos = new vscode.Position(line, 0);
    
    /*
      Делаем правку в документе.
      INPUT: edit — объект, через который вставляется текст.
      OUTPUT: модифицированный документ с добавленной строкой.
    */
    await editor.edit(edit => {
      // Получаем количество пробелов-отступов на предыдущей строке
      const indent = editor.document.lineAt(Math.max(0, line - 1)).firstNonWhitespaceCharacterIndex;
      // Вставляем строку с отступом + \n
      edit.insert(pos, ' '.repeat(indent) + logLine + '\n');
    });
    // Показываем уведомление о том, что всё выполнено
    vscode.window.showInformationMessage(`Вставлен лог для "${varName}"`);
  });

  // Добавляем команду в список активных
  context.subscriptions.push(disposable);
}
/*
  deactivate вызывается, когда расширение выключается.
  INPUT: нет.
  OUTPUT: нет.
*/
export function deactivate() {}
