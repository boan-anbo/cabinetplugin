import { MarkdownOption } from "cabinet-node";
import MarkdownIt = require("markdown-it");

export const getMdInstance = () => {

  const mditInstance = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    xhtmlOut: true,
  })
    // .use(MarkdownItCollapsible)
    // .use(MarkdownItAnchor, { permalink: true, permalinkBefore: true, permalinkSymbol: '' })
    // .use(MarkdownItTocDoneRight);
    ;
  return mditInstance;
};