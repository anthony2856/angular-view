'use strict';
import * as vscode from 'vscode';

export class Config {
    static modes = {
        'Component': 'component',
        'Unit tests': 'unitTest',
        'End to End Tests': 'e2eTest',
        'Inactive': 'inactive'
    };

    static defaultViewColumns = {
        ts: 1,
        html: 2,
        css: 3,
        spec: 2,
        e2e: 1,
        po: 2
    };

    static defaultMapFiles = {
        ts: '.component.ts',
        html: '.component.html',
        css: '.component.css',
        spec: '.component.spec.ts',
        e2e: '.e2e-spec.ts',
        po: '.po.ts'
    }

    static defaultSwitchOn = [
        'ts',
        'html',
        'css'
    ];

    static getConfig(_name: string, _defaultValue) {
        const config = vscode.workspace.getConfiguration('angularview');
        return config.get(_name, _defaultValue);
    }

    static async setConfig(_name: string, _value) {
        const config = vscode.workspace.getConfiguration('angularview');
        await config.update('mode', _value);
        vscode.window.showInformationMessage(`Config changed to : ${_value}`);
    }

    static async changeMode() {
        const selected = await vscode.window.showQuickPick(Object.keys(Config.modes));
        if (!selected) {
            return;
        }

        const newValue = Config.modes[selected];
        Config.setConfig('mode', newValue);
    }

    static getViewColumnConfigFor(_extensionName: string): number {
        const viewColumns = Config.getConfig('viewColumns', Config.defaultViewColumns);
        return viewColumns[_extensionName] || Config.defaultViewColumns[_extensionName];
    }

    static getSwitchOnConfig() : string[] {
        return Config.getConfig('switchon', Config.defaultSwitchOn);
    }
}