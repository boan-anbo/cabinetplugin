import { Card } from "cabinet-node";
import path = require("path");
import { FileType, QuickPickItem, Uri } from "vscode";

export class FileItem implements QuickPickItem {

        label: string;
        description: string = '';
        filePath: string;
        fileType?: FileType;

        constructor(label: string, filePath: string, description?: string, fileType?: FileType) {
                this.label = label;
                this.description = description || '';
                this.filePath = filePath;
                this.fileType = fileType;
        }

}

export class CardItem implements QuickPickItem {

        label: string;
        description: string = '';
        card: Card;

        constructor(card: Card) {
                this.label = `[${card.source?.pageIndex}] ${card.title}`;
                this.description = card.source?.fileName ?? (card.source?.uniqueId ?? '');
                this.card = card;
        }
}