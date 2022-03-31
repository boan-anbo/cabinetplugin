import { Card } from "cabinet-node";
import path = require("path");
import { v4 } from "uuid";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { Section } from "writing-plan/build/main/lib/section";
import { cabinetNodeInstance } from "../../extension";
import { arabic2roman } from "../../utils/arabic-roman";
import { generateProgressBar } from "../utils/progress-bar";

export abstract class WritingPlanTreeItem extends TreeItem {
    itemType: WritingPlanItemType = WritingPlanItemType.Section;
    constructor(label: string, collapsibleState: TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }

}

export class SectionTreeItem extends WritingPlanTreeItem {
    id: string = v4();
    section: Section;
    contextValue: 'root' | 'child';
    cardItems: CardTreeItem[] = [];
    hasCards: boolean;
    cardsNum: number;
    sectionLevelOrderString: string;

    private constructor(
        section: Section,
        collapse?: TreeItemCollapsibleState,
        childrenCardsNum?: number,
    ) {

        super(
            section.marker,
            collapse ?? TreeItemCollapsibleState.Expanded);

        // set section order string
        this.sectionLevelOrderString = `${arabic2roman(section?.level, 1)}.${arabic2roman(section?.levelOrder, 1)}`;

        const cardItems = [];
        if (cabinetNodeInstance) {
            const cards = cabinetNodeInstance.getAllCardsByCciFromText(section.content);
            if (cards) {

                cardItems.push(...CardTreeItem.fromCards(cards));
            }
        }


        // store card items under section items
        this.cardItems = cardItems;


        this.section = section;

        this.tooltip = section.wordCount.toString();
        this.description = `${section.title ? `"${section.title.trim()}": ` : ''} W: ${section?.wordCount} | S: ${section?.wordCountSelf} | B: ${section.wordBalance} | T: ${section?.wordTargetNominal} ${section.isSectionTargetOverflown ? `+ ${section.wordTargetOverflow}` : ''}`;

        if (section.parentId === null) {
            this.contextValue = 'root';
        } else {
            this.contextValue = 'child';
        }

        // set cards info
        this.hasCards = this.cardItems.length > 0;
        this.cardsNum = this.cardItems.length + (childrenCardsNum ?? 0);
        // jump to the line as command
        this.command = {
            title: 'Jump to section',
            command: 'cabinetplugin.writing-plan.goToLine',
            arguments: [
                section.markerOpenLine,
            ]
        };
    }

    updateLabel() {
        const titleLabel = this.section.title ?? this.section.marker;
        const targetLabel = `<${this.section.isSectionTargetOverflown ? `${this.section.wordTargetNominal} + ${this.section.wordTargetOverflow}` : this.section.wordTargetNominal} | ${this.section.wordCount}>`;
        const cardsLabel = `[${this.cardsNum}]`;
        super.label = `${this.sectionLevelOrderString} ${targetLabel} ${titleLabel} ${cardsLabel}`;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'media', 'section-item.svg'),
        dark: path.join(__filename, '..', '..', 'media', 'section-item.svg'),

    };

    static fromSections(sections: Section[],): SectionTreeItem[] {
        let allSectionItems = sections.map(section => new SectionTreeItem(section));

        allSectionItems.forEach(sectionItem => {
            if (sectionItem.section.parentId !== null) {
                const parentSection = allSectionItems.find(item => item.section.id === sectionItem.section.parentId);
                if (parentSection) {
                    parentSection.cardsNum += sectionItem.cardsNum;
                }
            }

        });
        return allSectionItems.map(sectionItem => { sectionItem.updateLabel(); return sectionItem });

    }

    static fromSection(section: Section, collapse?: TreeItemCollapsibleState, childrenCardsNum?: number): SectionTreeItem {
        return new SectionTreeItem(section, collapse, childrenCardsNum);
    }

}
export class CardTreeItem extends WritingPlanTreeItem {
    itemType: WritingPlanItemType = WritingPlanItemType.Card;
    card: Card
    constructor(card: Card) {
        super(card.title ?? 'Card', TreeItemCollapsibleState.None);
        this.card = card;
        this.tooltip = card.title ?? card.source?.fileName ?? 'Card';
        this.description = card.toMarkdown();

    }

    static fromCards(cards: Card[]): CardTreeItem[] {
        return cards.map(card => new CardTreeItem(card));
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'media', 'card-item.svg'),
        dark: path.join(__filename, '..', '..', 'media', 'card-item.svg'),

    };
}

export enum WritingPlanItemType {
    Card,
    Section
}