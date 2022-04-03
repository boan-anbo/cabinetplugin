import { GoalStatus } from "writing-plan/build/main/lib/const/goal-status";

export const annotatorColors: {
    negativeBalance: string;
    positiveBalance: string;
    getBalanceColor: (t: GoalStatus) => string;
} = {
    negativeBalance: 'rgba(255, 0, 0, 0.7)', positiveBalance: 'rgba(0, 228, 0, 1)',
    getBalanceColor: (goal: GoalStatus): string => {
        switch (goal) {
            case GoalStatus.NOT_STARTED:
                // return gray
                return 'rgba(0, 0, 0, 0.3)';
            case GoalStatus.IN_PROGRESS:
                // return rosy pink color
                return 'rgba(255, 0, 255, 0.5)';
                break;
            case GoalStatus.COMPLETED:
                return 'rgba(0, 228, 0, 1)';
            case GoalStatus.EXCEEDED:
                return 'rgba(255, 0, 0, 0.8)';
            default:
                break;
        }
        return '';
    }
};
