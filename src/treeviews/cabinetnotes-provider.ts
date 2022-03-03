import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { posix } from 'path';
import { Card, CardConvert, MarkdownPoint } from 'cabinet-node';
import { cabinetNodeInstance } from '../extension';

export class CabinetNotesProvider implements vscode.TreeDataProvider<CardItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CardItem | undefined | void> = new vscode.EventEmitter<CardItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<CardItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor() { }

    getTreeItem(element: CardItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CardItem): Thenable<CardItem[]> {

        return Promise.resolve(this.getMarkdownPoints(element));
    }


    refresh(): any {
        this._onDidChangeTreeData.fire();
    }



    private async getMarkdownPoints(element?: CardItem): Promise<CardItem[]> {

        if (element?.cards) {
            return element.cards
                .filter(card => card[1])
                .map(cardEntries => {
                    return CardItem.fromCardEntry(cardEntries);
                });
        }

        const editor = vscode.window.activeTextEditor;


        // Get the document last line.
        if (editor) {
            const doc = editor.document.getText();

            const cards = cabinetNodeInstance?.parseMdStructure(doc) ?? [];
            const result = cards.map(point => {
                return CardItem.fromPoint(point);
            });

            return new Promise<CardItem[]>((resolve, reject) => {
                resolve(result);
            });


        }
        return [];
    }
}

class CardItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,

        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly cards?: [number, Card][],
        public readonly line?: number,
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        this.description = description;
        this.line = (line ?? 0) + 1;
        this.command = {
            command: 'cabinetOutline.goToLine',
            title: 'Go to',
            arguments: [this.line - 1]
        }
    }
    static fromPoint(point: MarkdownPoint) {
        return new CardItem(
            point.content,
            `[${point.cards?.length ?? 0}] [${point.mdMarkup}] [${point.line + 1}]`,
            vscode.TreeItemCollapsibleState.Collapsed,
            point.cards,
            point.line
        );
    }

    static fromCardEntry(cardEntry: [number, Card]) {
        const [line, card] = cardEntry;
        return new CardItem(
            `[${line + 1}]`,
            card?.text ?? 'text',
            vscode.TreeItemCollapsibleState.None,
            [],
            line);
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    };
}
