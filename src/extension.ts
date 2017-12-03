'use strict';
import * as vscode from 'vscode';
import { Disposable } from 'vscode';
import { open } from 'fs';
import { Config } from './config';
import { vscodeHelper } from './vscodeHelper';
import { filenames } from './models/filenames.model';
import { Utils } from './utils';

export function activate(context: vscode.ExtensionContext) {
    console.log('angular-view is now active');

    let angularView = new AngularView();

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

        vscode.window.onDidChangeActiveTextEditor(this._onEditorChange, this, subscriptions);

        subscriptions.push(
            vscode.commands.registerCommand('angularView.changeMode', Config.changeMode),
            vscode.commands.registerCommand('angularView.openTsFile', () => this.openFileWithExtension('ts')),
            vscode.commands.registerCommand('angularView.openHtmlFile', () => this.openFileWithExtension('html')),
            vscode.commands.registerCommand('angularView.openCssFile', () => this.openFileWithExtension('css')),
            vscode.commands.registerCommand('angularView.openUnitTestFile', () => this.openFileWithExtension('spec'))
        )

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    _onEditorChange() {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return Promise.resolve();
        }

        const mode = Config.getConfig('mode', 'component');
        const fileName: string = editor.document.fileName;
        switch (mode) {
            case 'component': return this._onComponentChange(fileName);
            case 'unitTest': return this._onUnitTestChange(fileName);
            case 'e2eTest': return this._onE2eTestChange(fileName);
            case 'inactive':
            default:
                return Promise.resolve();
        }
    }

    getFilenames(_extension: string, _originalFilename?: string): filenames {
        const map = Config.defaultMapFiles;
        let obj = new filenames(_originalFilename);

        if (!obj.originalFilename) {
            obj.originalFilename = vscodeHelper.getCurrentFilename();
        }

        Object.keys(map).forEach(_key => {
            let mapOriginal = map[_key];
            if (obj.originalFilename.match(mapOriginal)) {
                obj.originalExtension = _key;
                obj.newFilename = obj.originalFilename.replace(mapOriginal, map[_extension]);
            }
        });

        return obj;
    }

    openFileWithExtension(_extension: string, _originalFilename?: string) {
        const { originalFilename, originalExtension, newFilename } = this.getFilenames(_extension, _originalFilename);
        if (!originalFilename || !newFilename) {
            return;
        }

        vscodeHelper.openFile(originalFilename, Config.getViewColumnConfigFor(originalExtension));
        vscodeHelper.openFile(newFilename, Config.getViewColumnConfigFor(_extension));
    }

    _onUnitTestChange(fileName: string) {
        const ext = vscodeHelper.getFileExtension(fileName);
        if (ext === 'html' || ext === 'css') {
            return;
        }
        this.openFileWithExtension('ts', fileName);
        this.openFileWithExtension('spec', fileName);
    }

    _onE2eTestChange(fileName: string) {
        this.openFileWithExtension('po', fileName);
        this.openFileWithExtension('e2e', fileName);
    }

    _onComponentChange(fileName: string) {
        const switchon = Config.getSwitchOnConfig();

        Utils.includes(switchon, 'ts') && this.openFileWithExtension('ts', fileName);
        Utils.includes(switchon, 'html') && this.openFileWithExtension('html', fileName);

        if (Config.getConfig('displaycss', true)) {
            Utils.includes(switchon, 'css') && this.openFileWithExtension('css', fileName);
        }
    }
}