import path = require("path");
import { FileType, QuickPickItem, Uri } from "vscode";

export class FileItem implements QuickPickItem {

        label!: string;
        description: string = '';
        filePath!: string;
        fileType?: FileType;

        constructor(input: Partial<FileItem>) {
                Object.assign(this, input);
        }
}