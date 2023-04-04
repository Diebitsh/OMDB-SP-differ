import { Mode } from "../enums/mode.enum";
import { Utils } from "./utils.service";


export class WordSplitterService {
    public static ConvertHtmlToListOfWords(text: string, blockExpressions: RegExp[]): string[] {
        var mode = Mode.Character;
            var currentWord: string = "";
            var words: string[] = [];
            var blockLocations = WordSplitterService.FindBlocks(text, blockExpressions);
            var isBlockCheckRequired = blockLocations != null;
            var isGrouping = false;
            var groupingUntil = -1;

            for (var index = 0; index < text.length; index++)
            {
                if (text[index] === "П") {
                    console.log(1)
                }
                var character = text[index];

                // Don't bother executing block checks if we don't have any blocks to check for!
                if (isBlockCheckRequired)
                {
                    // Check if we have completed grouping a text sequence/block
                    if (groupingUntil == index)
                    {
                        groupingUntil = -1;
                        isGrouping = false;
                    }

                    // Check if we need to group the next text sequence/block
                    var until = 0;
                    if (blockLocations.has(index))
                    {
                        isGrouping = true;
                        groupingUntil = blockLocations.get(index);
                    }

                    // if we are grouping, then we don't care about what type of character we have, it's going to be treated as a word
                    if (isGrouping)
                    {
                        currentWord += character;
                        mode = Mode.Character;
                        continue;
                    }
                }

                switch (mode)
                {
                    case Mode.Character:

                        if (Utils.IsStartOfTag(character))
                        {
                            if (currentWord.length != 0)
                            {
                                words.push(currentWord);
                            }

                            currentWord = "";
                            currentWord += ('<');
                            mode = Mode.Tag;
                        }
                        else if (Utils.IsStartOfEntity(character))
                        {
                            if (currentWord.length != 0)
                            {
                                words.push(currentWord);
                            }

                            currentWord = "";
                            currentWord += (character);
                            mode = Mode.Entity;
                        }
                        else if (Utils.IsWhiteSpace(character))
                        {
                            if (currentWord.length != 0)
                            {
                                words.push(currentWord);
                            }
                            currentWord ="";
                            currentWord += (character);
                            mode = Mode.Whitespace;
                        }
                        else if (Utils.IsWord(character)
                            && (currentWord.length == 0 || Utils.IsWord(currentWord.slice(-1))))
                        {
                            currentWord += (character);
                        }
                        else
                        {
                            if (currentWord.length != 0)
                            {
                                words.push(currentWord);
                            }
                            currentWord = "";
                            currentWord +=(character);
                        }

                        break;
                    case Mode.Tag:

                        if (Utils.IsEndOfTag(character))
                        {
                            currentWord +=(character);
                            words.push(currentWord);
                            currentWord = "";

                            mode = Utils.IsWhiteSpace(character) ? Mode.Whitespace : Mode.Character;
                        }
                        else
                        {
                            currentWord +=(character);
                        }

                        break;
                    case Mode.Whitespace:

                        if (Utils.IsStartOfTag(character))
                        {
                            if (currentWord.length != 0)
                            {
                                words.push(currentWord);
                            }
                            currentWord = "";
                            currentWord += (character);
                            mode = Mode.Tag;
                        }
                        else if (Utils.IsStartOfEntity(character))
                        {
                            if (currentWord.length != 0)
                            {
                                words.push(currentWord);
                            }

                            currentWord ="";
                            currentWord +=(character);
                            mode = Mode.Entity;
                        }
                        else if (Utils.IsWhiteSpace(character))
                        {
                            currentWord +=(character);
                        }
                        else
                        {
                            if (currentWord.length != 0)
                            {
                                words.push(currentWord);
                            }

                            currentWord = "";
                            currentWord += (character);
                            mode = Mode.Character;
                        }

                        break;
                    case Mode.Entity:
                        if (Utils.IsStartOfTag(character))
                        {
                            if (currentWord.length != 0)
                            {
                                words.push(currentWord);
                            }

                            currentWord = "";
                            currentWord += (character);
                            mode = Mode.Tag;
                        }
                        else if ((isEmptyOrSpaces(character)))
                        {
                            if (currentWord.length != 0)
                            {
                                words.push(currentWord);
                            }
                            currentWord ="";
                            currentWord +=(character);
                            mode = Mode.Whitespace;
                        }
                        else if (Utils.IsEndOfEntity(character))
                        {
                            var switchToNextMode = true;
                            if (currentWord.length != 0)
                            {
                                currentWord +=(character);
                                words.push(currentWord);

                                //join &nbsp; entity with last whitespace
                                if (words.length > 2
                                    && Utils.IsWhiteSpace(words[words.length - 2])
                                    && Utils.IsWhiteSpace(words[words.length - 1]))
                                {
                                    var w1 = words[words.length - 2];
                                    var w2 = words[words.length - 1];
                                    words.splice(words.length - 2, 2);
                                    currentWord = "";
                                    currentWord +=(w1);
                                    currentWord +=(w2);
                                    mode = Mode.Whitespace;
                                    switchToNextMode = false;
                                }
                            }
                            if (switchToNextMode)
                            {
                                currentWord = "";
                                mode = Mode.Character;
                            }
                        }
                        else if (Utils.IsWord(character))
                        {
                            currentWord +=(character);
                        }
                        else
                        {
                            if (currentWord.length != 0)
                            {
                                words.push(currentWord);
                            }
                            currentWord ="";
                            currentWord +=(character);
                            mode = Mode.Character;
                        }
                        break;
                }
            }
            if (currentWord.length != 0)
            {
                words.push(currentWord);
            }

            return words;
    }

    private static FindBlocks(
         text: string, blockExpressions: RegExp[])
    {
        let blockLocations: Map<number, number> = new Map<number, number>();
        
        if (blockExpressions == null)
        {
            return blockLocations;
        }

        for (var exp of blockExpressions)
        {
            
            var matches = exp.exec(text);
            if (matches) {

                    try
                    {
                        blockLocations.set(matches.index, matches.index + matches.length);
                    }
                    catch (ArgumentException)
                    {
                       
                    }
            }
        }
        return blockLocations;
    }
    
}
function isEmptyOrSpaces(str: string): boolean{
    return str === null || str.match(/^ *$/) !== null;
}
