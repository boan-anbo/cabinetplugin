import { CabinetNode, Card } from "cabinet-node";
import { version } from "os";
import { parseMdStructure } from "./get-markdown-structure";
import { MdItCore } from "./md-core-utils";
import { InsertCardOptions } from "./types/insert-card-options";
import { MarkdownPoint } from "./types/markdown-point";

import * as vscode from "vscode";
import { insertText } from "../utils/insert-text";

export class Disserator {
  cabinetInstance: CabinetNode;
  mdItCore: MdItCore = new MdItCore();

  constructor(cabinetInstance: CabinetNode) {
    this.cabinetInstance = cabinetInstance;
  }


  getStructure(documentText: string) {

    return parseMdStructure(this.cabinetInstance, documentText);

  }

  async insertCards(point: MarkdownPoint, cards: Card[], insertCardOptions?: InsertCardOptions) {

    const line = point.line;
    // insert empty line first
    await insertText('', {
      linesBefore: 1,
    }, line);


    cards.forEach((card) => {
      insertText(card.getCci().toJsonString(), {
        linesBefore: 1,
        linesAfter: 1,
      }, line);
    });

  }
}
