import { Card } from "cabinet-node";

export interface CardPlace {
        card?: Card;
        id: string;
        line: number;
        column: number;
        lineText: string;
        documentUri: string;
}
