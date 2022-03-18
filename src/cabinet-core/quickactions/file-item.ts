import path = require("path");
import { FileType, QuickPickItem, Uri } from "vscode";
import { Stats } from "fs";

export class FileItem implements QuickPickItem {

        label: string;
        description: string = '';
        filePath: string;
        fileType?: FileType;
        fileStat: Stats | null;

        constructor(label: string, filePath: string, description?: string, fileType?: FileType, fileStat?: Stats) {
                this.label = label;
                this.description = description || '';
                this.filePath = filePath;
                this.fileType = fileType;
                this.fileStat = fileStat ?? null;
        }

}

