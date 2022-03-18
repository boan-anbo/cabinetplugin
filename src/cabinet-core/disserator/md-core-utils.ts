import Token = require("markdown-it/lib/token");
import { getMdInstance as getMdItInstance } from "./md-it-instance";
import { MarkdownOption } from "./types/markdown-option";

export class MdItCore {
  private mdIt = getMdItInstance();
  constructor() {
  }


  markdownToHtml(mdString: string, options?: MarkdownOption) {

    return this.mdIt.render(mdString);

  }

  parseMd(mdString: string): Token[] {

    return this.mdIt.parse(mdString, {});
  }
}