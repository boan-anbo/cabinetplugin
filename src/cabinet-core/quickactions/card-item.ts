import { Card } from "cabinet-node";
import { QuickPickItem } from "vscode";


export class CardItem implements QuickPickItem {

        label: string;
        description: string = '';
        detail = '';
        card: Card;

        constructor(card: Card) {
                this.label = `[${card.source?.pageIndex}] ${card.title}`;
                this.description = card.source?.fileName ?? (card.source?.uniqueId ?? '');
                this.detail = card.toMarkdown() ?? '';
                this.card = card;
        }

        public static fromCards(cards: Card[]): CardItem[] {
                return cards.map(card => new CardItem(card));
        }
}
