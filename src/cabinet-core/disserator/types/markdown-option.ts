
export class MarkdownOption {
  constructor(markdownOption?: Partial<MarkdownOption>) {
    if (markdownOption) {
      Object.assign(this, markdownOption)

    }
  }

  collapsable = false;
  blockQuote = false;
}
