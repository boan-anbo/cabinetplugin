export class SearchCondition {
    field: string
    operator: string
    query: string

    constructor(field: string, operator: string, query: string) {
        this.field = field
        this.operator = operator
        this.query = query
    }

    static fromJSON(request: SearchRequest): SearchCondition[] {
        const conditions: SearchCondition[] = []

        for (const condition of request.conditions) {
            // if any of the fields are missing, throw an error
            if (!condition.field || !condition.operator || !condition.query) {
                throw new Error('Invalid search condition');
            }
            conditions.push(new SearchCondition(condition.field, condition.operator, condition.query));
        }

        return conditions;


    }
}

export interface SearchRequest {
    conditions: SearchCondition[]
}
