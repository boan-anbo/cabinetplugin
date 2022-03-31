export const annotatorColors: {
    negativeBalance: string;
    positiveBalance: string;
    getBalanceColor: (balance: number) => string;
} = {
    negativeBalance: 'rgba(255, 0, 0, 0.7)',
    positiveBalance: 'rgba(0, 228, 0, 1)',
    getBalanceColor: (balance: number) => {
        return balance < 0 ? annotatorColors.negativeBalance : annotatorColors.positiveBalance;
    }
}
