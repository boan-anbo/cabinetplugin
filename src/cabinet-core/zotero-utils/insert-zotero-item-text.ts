import { InsertOption } from "../types/insert-option";
import { insertText } from "../utils/insert-text";
import { ZoteroItem } from "./zotero-endpoints-types";

export enum InsertZoteroItemTextType {
    Latex = 'Latex',
}

export const insertZoteroItemsText = async (zoteroItems: ZoteroItem[], type: InsertZoteroItemTextType, opt?: InsertOption) => {
    // loop
    for await (const zoteroItem of zoteroItems) {
        await insertZoteroItemText(zoteroItem, type, opt);
    }

    return;
}

export const insertZoteroItemText = async (zoteroItem: ZoteroItem, type: InsertZoteroItemTextType, opt?: InsertOption) => {

    let text = undefined;
    switch (type) {
        case InsertZoteroItemTextType.Latex:
            if (!zoteroItem.citationKey) {
                throw new Error(`Cannot insert Zotero item text as latex autocites: Zotero item has no cite key`);
                return;
            }
            text = `[][]{${zoteroItem.citationKey}}`;
            break;
        default:
            break;
    }
    if (text) {
        await insertText(text, opt);
    }
}