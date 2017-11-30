'use strict';
import * as vscode from 'vscode';
import { Disposable } from 'vscode';
import { open } from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('angular-view is now active');

    let angularView = new AngularView();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(angularView);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export class AngularView {

    private _disposable: Disposable;

    constructor() {
        let subscriptions: Disposable[] = [];
        console.log('AngularView constructor');

        if (this.getConfig('isactive', true)) {
            vscode.window.onDidChangeActiveTextEditor(this._onEditorChange, this, subscriptions);
        }

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    getConfig(_name: string, _defaultValue?) {
        const config = vscode.workspace.getConfiguration('angularview');
        return config.get(_name, _defaultValue);
    }

    getNumberConfig(_name: string, _defaultValue: number = 1): number {
        const val = this.getConfig(_name, _defaultValue);
        let number: number = +val;
        return number;
    }

    _onEditorChange() {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return Promise.resolve();
        }
        const document = editor.document;
        if (document.languageId !== 'typescript') {
            return Promise.resolve();
        }

        if (!document.fileName.match('.component.ts')) {
            return Promise.resolve();
        }

        const htmlFile = document.fileName.replace('.component.ts', '.component.html');
        const cssFile = document.fileName.replace('.component.ts', '.component.css');
        let options = {
            preserveFocus: true,
            preview: false,
            viewColumn: this.getNumberConfig('tsViewColumn', 1)
        };

        return Promise.resolve()
            .then(() => vscode.workspace.openTextDocument(document.fileName))
            .then(_doc => vscode.window.showTextDocument(_doc, options))
            .then(() => vscode.workspace.openTextDocument(htmlFile))
            .then(_doc => {
                options.viewColumn = this.getNumberConfig('htmlViewColumn', 2);
                return vscode.window.showTextDocument(_doc, options);
            })
            .then(() => {
                if (!this.getConfig('displaycss')) {
                    return Promise.reject(false)
                }
                return vscode.workspace.openTextDocument(cssFile);
            })
            .then(_doc => {
                options.viewColumn = this.getNumberConfig('cssViewColumn', 3);
                return vscode.window.showTextDocument(_doc, options);
            })
            .catch(() => {
                return Promise.resolve();
            })
    }
}