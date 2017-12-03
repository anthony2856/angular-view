'use strict';
import * as vscode from 'vscode';

export class vscodeHelper {
    static async openFile(fileName: string, columnNumber: number) {
        const options = {
            preserveFocus: true,
            preview: false,
            viewColumn: columnNumber
        };

        const doc = await vscode.workspace.openTextDocument(fileName);
        return vscode.window.showTextDocument(doc, options);
    }

    static getCurrentFilename(): string {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return '';
        }

        return editor.document.fileName;
    }

    static getFileExtension(_filename: string) {
        const arr = _filename.split('.');
        const ext = arr[arr.length - 1];
        const ext1 = arr[arr.length - 2];

        return ext1 === 'spec' ? ext1 : ext;
    }
}