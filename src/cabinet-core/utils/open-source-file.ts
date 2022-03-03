import { execFile } from "child_process";
import { cabinetNodeInstance } from "../../extension";
import * as fs from "fs";

export function openCardSourceFile(cardId: string) {

    const card = cabinetNodeInstance?.getCardById(cardId);
    if (!card) {
        return;
    }

    // insert markdown to the range in current editor
    // card.openFile(`C:\\Program Files (x86)\\Foxit Software\\Foxit PhantomPDF\\FoxitPDFEditor.exe`);

    const readerExecutable = `C:\\Program Files (x86)\\Foxit Software\\Foxit PhantomPDF\\FoxitPDFEditor.exe`;
    const filePath = card?.source?.filePath;
    // check if filePath exists
    if (!filePath || !fs.existsSync(filePath)) {
        throw new Error('File path is not set\n' + filePath);
    }

    execFile(readerExecutable, [
        filePath,
        "/A",
        card.source?.pageIndex ? "page=" + (card.source.pageIndex + 1) : "",
    ]);

}