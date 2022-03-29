import axios from "axios";
import { ZoteroItem, ZoteroItemsResponse } from "./zotero-endpoints-types";
import { SearchCondition as ZoteroSearchCondition, SearchRequest as ZoteroSearchRequest } from "./zotero-types/zotero-search";

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


export const getSearchedZoteroItems = async (conditions: ZoteroSearchCondition[]): Promise<ZoteroItem[]> => {
        const url = `http://127.0.0.1:23119/endpoints/search/items`;

        const request: ZoteroSearchRequest = {
                conditions,
        };

        const result = await axios.post(url, request);

        console.log(result.data);

        return result.data.payload as ZoteroItem[];


}