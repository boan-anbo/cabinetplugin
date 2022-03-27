import { QuickPickItem } from "vscode";
import { ZoteroItem } from "../zotero-utils/zotero-endpoints-types";

export class ZoteroPickItem implements QuickPickItem {

        label: string;
        description: string = '';
        detail = '';
        item: ZoteroItem
        picked = false;

        constructor(zoteroItem: ZoteroItem) {
                this.label = `[${zoteroItem.item.itemType}] ${zoteroItem.item.title}`;
                this.description = zoteroItem.item.abstractNote ?? zoteroItem.item.filename ?? zoteroItem.item.title ?? '';
                this.detail = zoteroItem.item.extra ?? this.description;
                this.item = zoteroItem;
        }

        public static fromZoteroItems(zoteroItems: ZoteroItem[]): ZoteroPickItem[] {
                return zoteroItems.map(zoteroItem => new ZoteroPickItem(zoteroItem));
        }
}
