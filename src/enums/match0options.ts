export class MatchOptions{
    BlockSize: number;
    RepeatingWordsAccuracy: number;
    IgnoreWhitespaceDifferences: boolean;

    constructor(BlockSize: number
        , RepeatingWordsAccuracy: number,
        IgnoreWhitespaceDifferences: boolean) {
            this.BlockSize = BlockSize;
            this.RepeatingWordsAccuracy = RepeatingWordsAccuracy;
            this.IgnoreWhitespaceDifferences = IgnoreWhitespaceDifferences;
    }
}
