import { CabinetCardIdentifier, Card } from "cabinet-node";
import { Location, QuickPickItem } from "vscode";
import { cabinetNodeInstance } from "../../extension";
import { cabinetInstanceActions } from "./cabinet-actions";


export class CardLocationItem implements QuickPickItem {

        label: string;
        description: string = '';
        detail = '';
        card: Card | undefined;
        cardCci: CabinetCardIdentifier;
        cardLocation: Location;

        constructor(cci: CabinetCardIdentifier, location: Location) {
                this.cardCci = cci;
                const card = cabinetNodeInstance?.getCardByCci(cci) ?? undefined;
                this.card = card;
                this.label = card ? `[${card.source?.pageIndex}] ${card.title}` : cci.toString();
                if (card) {
                        this.description = card.source?.fileName ?? (card.source?.uniqueId ?? '');
                        this.detail = card.toMarkdown() ?? '';
                }
                this.card = card;
                this.cardLocation = location;
        }


}
