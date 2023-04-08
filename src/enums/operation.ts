import { Actions } from "./actions.enum";

export class Operation {
    public Action: Actions;
    public StartInOld: number;
    public EndInOld: number;
    public StartInNew: number;
    public EndInNew: number;

    constructor(action: Actions, 
        startInOld: number,
        endInOld: number,
        startInNew: number,
        endInNew: number,
        ) {
        this.Action = action;
        this.StartInOld = startInOld;
        this.EndInOld = endInOld;
        this.StartInNew = startInNew;
        this.EndInNew = endInNew;
    }
}