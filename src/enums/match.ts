export class Match {
    public StartInOld: number;
    public StartInNew: number;
    public Size: number;
    public get EndInOld()
    {
         { return this.StartInOld + this.Size; }
    }
    
    public get EndInNew()
    {
         { return this.StartInNew + this.Size; }
    }

    constructor(StartInOld: number, StartInNew: number, Size: number) {
        this.StartInOld = StartInOld;
        this.StartInNew = StartInNew;
        this.Size = Size;
    }
}