import axios from "axios";
import { ZoteroItem, ZoteroItemsResponse } from "./zotero-endpoints-types";

export const getSelectedZoteroPaths = async (): Promise<string[]> => {
        const url = `http://127.0.0.1:23119/endpoints/select/attachmentPaths`;

        const { data } = await axios.get(url);

        return data.payload;
};

export const getSelectedZoteroItems = async (): Promise<ZoteroItem[]> => {
        const url = `http://127.0.0.1:23119/endpoints/items/selected`;

        const { data } = await axios.get<ZoteroItemsResponse>(url);

        return data.payload;

        // const editor = window.activeTextEditor;
}