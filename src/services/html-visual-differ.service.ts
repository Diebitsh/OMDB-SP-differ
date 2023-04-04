import { Actions } from "../enums/actions.enum";
import { Match } from "../enums/match";
import { MatchOptions } from "../enums/match0options";
import { Operation } from "../enums/operation";
import { MatchFinder } from "./match-finder";
import { Utils } from "./utils.service";
import { WordSplitterService } from "./word-splitter.service";

export class HtmlVisualDiff {
    private matchGranularityMaximum: number = 4;
    
    private  _content: string;
    private _newText: string;
    private _oldText: string;
    public  RepeatingWordsAccuracy: number;
    public IgnoreWhitespaceDifferences: boolean;
    public OrphanMatchThreshold: number;

    private _specialCaseClosingTags: {[key: string]: number} = {
        "</strong>": 0,
        "</em>": 0,
        "</b>": 0,
        "</big>": 0,
        "</small>": 0,
        "</u>": 0,
        "</sub>": 0,
        "</sup>": 0,
        "</strike>": 0,
        "</s>": 0,
    };

    private _specialCaseOpeningTagRegex: RegExp = RegExp(`<((strong)|(b)|(i)|(em)|(big)|(small)|(u)|(sub)|(sup)|(strike)|(s))[\\>\\s]+`);
    
    private _specialTagDiffStack: string[];
    private _blockExpressions: RegExp[] = []    
    private _newWords: string[];
    private _oldWords: string[];
    private _matchGranularity: number;

    public repeatingWordsAccuracy: number;

    constructor(oldText: string, newText: string) {
        this._oldText = oldText;
        this._newText = newText;
    }
    public  AddBlockExpression( expression: RegExp): void
    {
        this._blockExpressions.push(expression);
    }

    public build(): string {
        if (this._oldText === this._newText) {
            return this._newText
        }
        this.AddBlockExpression(new RegExp(`[\d]{1,2}[\s]*(Jan|Feb)[\s]*[\d]{4}`));
        this.splitInputsToWords();
        
        this._matchGranularity = Math.min(this.matchGranularityMaximum, Math.min(this._oldWords.length, this._newWords.length));

        var operations = this.Operations();

        for (var item of operations)
        {
            this.PerformOperation(item);
        }

        return this._content;
    }

    private splitInputsToWords() {
        this._oldWords = WordSplitterService.ConvertHtmlToListOfWords(this._oldText, this._blockExpressions);

        //free memory, allow it for GC
        this._oldText = "";

        this._newWords = WordSplitterService.ConvertHtmlToListOfWords(this._newText, this._blockExpressions);

        //free memory, allow it for GC
        this._newText = "";
    }
    private  PerformOperation( operation: Operation): void
        {
            //operation.PrintDebugInfo(this._oldWords, this._newWords);


            switch (operation.Action)
            {
                case Actions.equal:
                    this.ProcessEqualOperation(operation);
                    break;
                case Actions.delete:
                    this.ProcessDeleteOperation(operation, "diffdel");
                    break;
                case Actions.insert:
                    this.ProcessInsertOperation(operation, "diffins");
                    break;
                case Actions.none:
                    break;
                case Actions.replace:
                    this.ProcessReplaceOperation(operation);
                    break;
            }
        }
        private  ProcessEqualOperation( operation: Operation): void
        {
            var result =
                this._newWords.filter((s, pos) => pos >= operation.StartInNew && pos < operation.EndInNew);

            this._content += result.join("");
        }
        private  ProcessReplaceOperation( operation: Operation): void
        {
            this.ProcessDeleteOperation(operation, "diffmod");
            this.ProcessInsertOperation(operation, "diffmod");
        }

        private  ProcessInsertOperation(operation: Operation,  cssClass: string): void
        {
            var text = this._newWords.filter((s, pos) => pos >= operation.StartInNew && pos < operation.EndInNew);
            this.InsertTag("ins", cssClass, text);
        }

        private  ProcessDeleteOperation(operation: Operation,  cssClass: string): void
        {
            var text = this._oldWords.filter((s, pos) => pos >= operation.StartInOld && pos < operation.EndInOld);
            this.InsertTag("del", cssClass, text);
        }
        private  InsertTag( tag: string,  cssClass: string, words: string[]): void
        {
            while (true)
            {
                if (words.length == 0)
                {
                    break;
                }

                var nonTags = this.ExtractConsecutiveWords(words, (x: string) => !Utils.IsTag(x));

                var specialCaseTagInjection = "";
                var specialCaseTagInjectionIsBefore = false;

                if (nonTags.length != 0)
                {
                    var text = Utils.WrapText(nonTags.join(""), tag, cssClass);

                    this._content +=(text);
                }
                else
                {
                    // Check if the tag is a special case
                    if (this._specialCaseOpeningTagRegex.test(words[0]))
                    {
                        this._specialTagDiffStack.push(words[0]);
                        specialCaseTagInjection = "<ins class='mod'>";
                        if (tag == "del")
                        {
                            words.shift();

                            // following tags may be formatting tags as well, follow through
                            while (words.length > 0 && this._specialCaseOpeningTagRegex.test(words[0]))
                            {
                                words.shift();   
                            }
                        }
                    }

                    else if (this._specialCaseClosingTags[words[0]])
                    {
                        var openingTag = this._specialTagDiffStack.length == 0 ? null : this._specialTagDiffStack.pop();

                        // If we didn't have an opening tag, and we don't have a match with the previous tag used 
                        if (openingTag == null || openingTag != words.slice(-1)[0].replace("/", ""))
                        {
                            // do nothing
                        }
                        else
                        {
                            specialCaseTagInjection = "</ins>";
                            specialCaseTagInjectionIsBefore = true;
                        }

                        if (tag == "del")
                        {
                            words.shift();

                            // following tags may be formatting tags as well, follow through
                            while (words.length > 0 && this._specialCaseClosingTags[words[0]])
                            {
                                words.shift();
                            }
                        }
                    }
                }

                if (words.length == 0 && specialCaseTagInjection.length == 0)
                {
                    break;
                }

                if (specialCaseTagInjectionIsBefore)
                {
                    this._content +=(specialCaseTagInjection + this.ExtractConsecutiveWords(words, Utils.IsTag).join(""));
                }
                else
                {
                    this._content +=  ([this.ExtractConsecutiveWords(words, Utils.IsTag), specialCaseTagInjection]).join("");
                }
            }
        }
        private  ExtractConsecutiveWords( words: string[],  condition: (x: string) => boolean): string[]
        {
             let indexOfFirstTag: number = null;

            for (var i = 0; i < words.length; i++)
            {
                var word = words[i];

                if (i == 0 && word == " ")
                {
                    words[i] = "&nbsp;";
                }

                if (!condition(word))
                {
                    indexOfFirstTag = i;
                    break;
                }
            }

            if (indexOfFirstTag != null)
            {
                var items = words.filter((s, pos) => pos >= 0 && pos < indexOfFirstTag);
                if (indexOfFirstTag > 0)
                {
                    words.splice(0, indexOfFirstTag);
                }
                return items;
            }
            else
            {
                var items = words.filter((s, pos) => pos >= 0 && pos <= words.length);
                words.splice(0, words.length);
                return items;
            }
        }
    private  Operations(): Operation[]
        {
            let positionInOld: number = 0;
            let positionInNew: number = 0;
            var operations: Operation[] = [] ;

            var matches = this.MatchingBlocks();

            matches.push(new Match(this._oldWords.length, this._newWords.length, 0));

            //Remove orphans from matches.
            //If distance between left and right matches is 4 times longer than length of current match then it is considered as orphan
            var mathesWithoutOrphans = this.RemoveOrphans(matches);

            for (var match of mathesWithoutOrphans)
            {
                var matchStartsAtCurrentPositionInOld = (positionInOld == match.StartInOld);
                var matchStartsAtCurrentPositionInNew = (positionInNew == match.StartInNew);

                 let action: Actions;

                if (matchStartsAtCurrentPositionInOld == false
                    && matchStartsAtCurrentPositionInNew == false)
                {
                    action = Actions.replace;
                }
                else if (matchStartsAtCurrentPositionInOld
                         && matchStartsAtCurrentPositionInNew == false)
                {
                    action = Actions.insert;
                }
                else if (matchStartsAtCurrentPositionInOld == false)
                {
                    action = Actions.delete;
                }
                else // This occurs if the first few words are the same in both versions
                {
                    action = Actions.none;
                }

                if (action != Actions.none)
                {
                    operations.push(
                        new Operation(action,
                            positionInOld,
                            match.StartInOld,
                            positionInNew,
                            match.StartInNew));
                }

                if (match.Size != 0)
                {
                    operations.push(new Operation(
                        Actions.equal,
                        match.StartInOld,
                        match.EndInOld,
                        match.StartInNew,
                        match.EndInNew));
                }

                positionInOld = match.EndInOld;
                positionInNew = match.EndInNew;
            }

            return operations;
        }
        
    private MatchingBlocks(): Match[]
    {
        var matchingBlocks: Match[] = [] ;
        this.FindMatchingBlocks(0, this._oldWords.length, 0, this._newWords.length, matchingBlocks);
        return matchingBlocks;
    }

    private FindMatchingBlocks(
        startInOld: number, 
        endInOld: number, 
        startInNew: number, 
        endInNew: number,
        matchingBlocks: Match[] )
    {
        var match = this.FindMatch(startInOld, endInOld, startInNew, endInNew);

        if (match != null)
        {
            if (startInOld < match.StartInOld && startInNew < match.StartInNew)
            {
                this.FindMatchingBlocks(startInOld, match.StartInOld, startInNew, match.StartInNew, matchingBlocks);
            }

            matchingBlocks.push(match);

            if (match.EndInOld < endInOld && match.EndInNew < endInNew)
            {
                this.FindMatchingBlocks(match.EndInOld, endInOld, match.EndInNew, endInNew, matchingBlocks);
            }
        }
    }
    private  FindMatch(startInOld: number, endInOld: number, startInNew: number, endInNew: number): Match
        {
            // For large texts it is more likely that there is a Match of size bigger than maximum granularity.
            // If not then go down and try to find it with smaller granularity.
            for (var i = this._matchGranularity; i > 0 ; i--)
            {
                var options = new MatchOptions
                (
                    i,
                    this.RepeatingWordsAccuracy,
                    this.IgnoreWhitespaceDifferences
                );
                var finder = new MatchFinder(this._oldWords, this._newWords, startInOld, endInOld, startInNew, endInNew, options);
                var match = finder.FindMatch();
                if (match != null)
                    return match;
            }
            return null;
    }
    
    *RemoveOrphans(matches: Match[]): IterableIterator<Match>
    {
        let prev: Match = null;
        let curr: Match = null;
        for (var next of matches)
        {
            if (curr == null)
            {
                prev = new Match(0, 0, 0);
                curr = next;
                continue;
            }

            if (prev.EndInOld == curr.StartInOld && prev.EndInNew == curr.StartInNew
                || curr.EndInOld == next.StartInOld && curr.EndInNew == next.StartInNew)
            //if match has no diff on the left or on the right
            {
                yield curr;
                prev = curr;
                curr = next;
                continue;
            }
            var t =[...Array(5).keys()]
            var oldDistanceInChars = this.range(prev.EndInOld, next.StartInOld - prev.EndInOld)
                .reduce(i => this._oldWords[i].length);
            var newDistanceInChars = this.range(prev.EndInNew, next.StartInNew - prev.EndInNew)
                .reduce(i => this._newWords[i].length);
            var currMatchLengthInChars = this.range(curr.StartInNew, curr.EndInNew - curr.StartInNew)
                .reduce(i => this._newWords[i]?.length);
            if (currMatchLengthInChars > Math.max(oldDistanceInChars, newDistanceInChars) * this.OrphanMatchThreshold)
            {
                yield   curr;
            }
            
            prev = curr;
            curr = next;
        }

        yield curr; //assume that the last match is always vital
    }
    range = (start: number, stop: number, step = 1) => {
        if (stop < start) {
            return [...Array(start - stop).keys()]
            .filter(i => !(i % Math.round(step)))
            .map(v => start + v)
        }
        return [...Array(stop - start).keys()]
          .filter(i => !(i % Math.round(step)))
          .map(v => start + v)
      }
}
    
