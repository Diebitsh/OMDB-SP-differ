import { Match } from "../enums/match";
import { MatchOptions } from "../enums/match0options";
import { Utils } from "./utils.service";

export class MatchFinder {
    private readonly _oldWords: string[];
    private readonly  _newWords: string[];
    private readonly  _startInOld: number;
    private readonly  _endInOld: number;
    private readonly  _startInNew: number;
    private readonly  _endInNew: number;
    private  _wordIndices: Map<string, number[]>;
    private readonly  _options: MatchOptions;

    /// <summary>
    /// </summary>
    /// <param name="oldWords"></param>
    /// <param name="newWords"></param>
    /// <param name="startInOld"></param>
    /// <param name="endInOld"></param>
    /// <param name="startInNew"></param>
    /// <param name="endInNew"></param>
    /// <param name="options"></param>
    constructor(oldWords: string[] , newWords: string[] , startInOld: number,  endInOld: number,  startInNew : number,  endInNew: number,  options: MatchOptions)
    {
        this._oldWords = oldWords;
        this._newWords = newWords;
        this._startInOld = startInOld;
        this._endInOld = endInOld;
        this._startInNew = startInNew;
        this._endInNew = endInNew;
        this._options = options;
    }
    private NormalizeForIndex(word: string): string
    {
        word = Utils.StripAnyAttributes(word);
        if (this._options.IgnoreWhitespaceDifferences && Utils.IsWhiteSpace(word))
            return " ";

        return word;
    }
    private IndexNewWords(): void
    {
        this._wordIndices = new Map<string, number[]>;
        var block = new Array<string>(this._options.BlockSize);
        for (var i = this._startInNew; i < this._endInNew; i++)
        {
            // if word is a tag, we should ignore attributes as attribute changes are not supported (yet)
            var word = this.NormalizeForIndex(this._newWords[i]);
            var key = MatchFinder.PutNewWord(block, word, this._options.BlockSize);

            if (key == null)
                continue;

            let indicies: number[] =[];
            if (this._wordIndices.get(key))
            {
                indicies.push(i);
            }
            else
            {
                this._wordIndices.set(key, [i]);
            }
        }
    }

private static PutNewWord( block: string[],  word: string,  blockSize: number): string | null
    {
        block.push(word);
        if (block.length > blockSize)
            block.shift();

        if (block.length != blockSize)
            return null;

        var result = "";
        for(var s of block)
        {
            result +=s;
        }
        return result;
    }

    /// <summary>
    /// Converts the word to index-friendly value so it can be compared with other similar words
    /// </summary>
    /// <param name="word"></param>
    /// <returns></returns>
    

    public  FindMatch(): Match | null
    {
        this.IndexNewWords();
        this.RemoveRepeatingWords();

        if (this._wordIndices.size == 0)
            return null;

        var bestMatchInOld = this._startInOld;
        var bestMatchInNew = this._startInNew;
        var bestMatchSize = 0;

        var matchLengthAt = new Map<number, number>();
        var block = new Array<string>(this._options.BlockSize);

        for (var indexInOld = this._startInOld; indexInOld < this._endInOld; indexInOld++)
        {
            var word = this.NormalizeForIndex(this._oldWords[indexInOld]);
            var index = MatchFinder.PutNewWord(block, word, this._options.BlockSize);

            if (index == null)
                continue;

            var newMatchLengthAt = new Map<number, number>();

            if (!this._wordIndices.has(index))
            {
                matchLengthAt = newMatchLengthAt;
                continue;
            }
            
            for (var indexInNew of this._wordIndices.get(index))
            {
                var newMatchLength = (matchLengthAt.has(indexInNew - 1) ? matchLengthAt.get(indexInNew - 1) : 0) +
                                     1;
                newMatchLengthAt.set(indexInNew, newMatchLength) ;

                if (newMatchLength > bestMatchSize)
                {
                    bestMatchInOld = indexInOld - newMatchLength + 1 - this._options.BlockSize + 1;
                    bestMatchInNew = indexInNew - newMatchLength + 1 - this._options.BlockSize + 1;
                    bestMatchSize = newMatchLength;
                }
            }

            matchLengthAt = newMatchLengthAt;
        }

        return bestMatchSize != 0 ? new Match(bestMatchInOld, bestMatchInNew, bestMatchSize + this._options.BlockSize - 1) : null;
    }

    /// <summary>
    /// This method removes words that occur too many times. This way it reduces total count of comparison operations
    /// and as result the diff algoritm takes less time. But the side effect is that it may detect false differences of
    /// the repeating words.
    /// </summary>
    private  RemoveRepeatingWords(): void
    {
        var threshold = this._newWords.length * this._options.RepeatingWordsAccuracy;
        var repeatingWords: string [] =[];
        var keys = this._wordIndices.keys();
        for (let key of keys) {
            if (this._wordIndices.get(key).length > threshold) {
                repeatingWords.push(key)
            }
        }
        for (var w in repeatingWords)
        {
            this._wordIndices.delete(w);
        }
    }
}