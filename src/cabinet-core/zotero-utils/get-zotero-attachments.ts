import axios from "axios";

export const getSelectedZoteroPaths = async (): Promise<string[]> => {
        const url = `http://127.0.0.1:23119/endpoints/select/attachmentPaths`;

        const { data } = await axios.get(url);

        return data.payload;
};