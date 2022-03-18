import { Card } from "cabinet-node";
import { v4 } from "uuid";

export class MarkdownPointCard {
  id: string = v4();
  line = 0;
  card: Card;
  cciString: string;
  constructor(line: number, card: Card) {
    this.line = line;
    this.card = card;
    this.cciString = card.getCci().toCciMarker();
  }

}
