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

    getViewColumnConfigFor(_name: string, _defaultValue: number = 1): number {
        const defaultViewColumns = {
            "ts": 1,
            "html": 2,
            "css": 3
        };
        const viewColumns = this.getConfig('viewColumns', defaultViewColumns);
        return viewColumns[_name] || _defaultValue;
    }

    _onEditorChange() {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return Promise.resolve();
        }

        const fileName: string = editor.document.fileName;
        const switchon: string[] = this.getConfig('switchon', ["ts", "html", "css"]);

        if (switchon.findIndex(el => el === 'ts') !== -1 && fileName.match('.component.ts')) {
            return this._onFileChange('ts', fileName);
        }

        if (switchon.findIndex(el => el === 'html') !== -1 && fileName.match('.component.html')) {
            return this._onFileChange('html', fileName);
        }

        if (switchon.findIndex(el => el === 'css') !== -1 && fileName.match('.component.css')) {
            return this._onFileChange('css', fileName);
        }
    }

    _onFileChange(_originalExtension: string, _originalFilename: string) {
        let tsFilename: string;
        let htmlFilename: string;
        let cssFilename: string;
        switch (_originalExtension) {
            case 'html':
                htmlFilename = _originalFilename; 
                tsFilename = htmlFilename.replace('.component.html', '.component.ts');
                cssFilename = htmlFilename.replace('.component.html', '.component.css');
                break;
            case 'css':
                cssFilename = _originalFilename;
                tsFilename = cssFilename.replace('.component.css', '.component.ts');
                htmlFilename = cssFilename.replace('.component.css', '.component.html');
                break;
            default:
                tsFilename = _originalFilename;    
                htmlFilename = tsFilename.replace('.component.ts', '.component.html');
                cssFilename = tsFilename.replace('.component.ts', '.component.css');
                break;
        }
        let options = {
            preserveFocus: true,
            preview: false,
            viewColumn: this.getViewColumnConfigFor('ts', 1)
        };

        return Promise.resolve()
            .then(() => vscode.workspace.openTextDocument(tsFilename))
            .then(_doc => vscode.window.showTextDocument(_doc, options))
            .then(() => vscode.workspace.openTextDocument(htmlFilename))
            .then(_doc => {
                options.viewColumn = this.getViewColumnConfigFor('html', 2);
                return vscode.window.showTextDocument(_doc, options);
            })
            .then(() => {
                if (!this.getConfig('displaycss')) {
                    return Promise.reject(false)
                }
                return vscode.workspace.openTextDocument(cssFilename);
            })
            .then(_doc => {
                options.viewColumn = this.getViewColumnConfigFor('css', 3);
                return vscode.window.showTextDocument(_doc, options);
            })
            .catch(() => {
                return Promise.resolve();
            })
    }
}