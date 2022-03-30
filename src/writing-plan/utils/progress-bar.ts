
// generate text progress bar
// Language: typescript
export const generateProgressBar = (wordCount: number, wordTarget: number, maxWidth: number) => {
    let progressBar = '';
    const progress = wordCount / wordTarget;
    for (let i = 0; i < maxWidth; i++) {
        if (i < progress * maxWidth) {
            progressBar += '█';
        } else {
            progressBar += ' ';
        }
    }
    return progressBar;
};