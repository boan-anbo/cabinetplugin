import path = require("path");
import { FileType, QuickPickItem, Uri } from "vscode";
import { Stats } from "fs";
import { MarkdownPoint } from "../../disserator/types/markdown-point";

export class MarkdownPointItem implements QuickPickItem {

        label: string;
        description: string = '';
        point: MarkdownPoint;

        constructor(markdownPoint: MarkdownPoint) {
                this.point = markdownPoint;
                const cardsLength = markdownPoint.cards.length;
                const header = markdownPoint.mdMarkup.toString().trim();
                this.label = `[${header}] [${cardsLength}] ${markdownPoint.content}`;

                if (markdownPoint.headingLevel) {
                        for (let index = 0; index < markdownPoint.headingLevel - 1; index++) {
                                this.label = '          ' + this.label;

                        }
                }
                this.description = `line: ${markdownPoint.line}`;
        }

}

