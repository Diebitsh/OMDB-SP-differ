export class Utils {
    private static openingTagRegex: RegExp =
        new RegExp("^\\s*<[^>]+>\\s*$");
        
    private static closingTagTexRegex: RegExp =
    new RegExp("^\\s*</[^>]+>\\s*$");
    
    private static tagWordRegex: RegExp =
    new RegExp("<[^\s>]+");
    
    private static whitespaceRegex: RegExp =
    new RegExp("^(\\s|&nbsp;)+$");

    private static wordRegex: RegExp =
    new RegExp("[\w\#@]+");
    private static readonly SpecialCaseWordTags: string[] = [ "<img" ];

    public static  IsTag(item: string): boolean
    {
        if (Utils.SpecialCaseWordTags.some(re => item != null &&  item.startsWith(re))) return false;
        return Utils.IsOpeningTag(item) || Utils.IsClosingTag(item);
    }
    
    private static IsOpeningTag(item: string): boolean
    {
        return Utils.openingTagRegex.test(item);
    }

    private static  IsClosingTag(item: string): boolean
    {
        return this.closingTagTexRegex.test(item);
    }

    public static  StripTagAttributes(word: string): string
    {
        var tag = this.tagWordRegex.test(word);
        word = tag + (word.endsWith("/>") ? "/>" : ">");
        return word;
    }

    public static  WrapText(text: string, tagName: string, cssClass: string): string
    {
        return (`<${tagName} class='${cssClass}'>${text}</${tagName}>`);
    }

    public static  IsStartOfTag(val: string): boolean
    {
        return val == '<';
    }

    public static  IsEndOfTag(val: string): boolean
    {
        return val == '>';
    }

    public static IsStartOfEntity(val: string): boolean
    {
        return val == '&';
    }

    public static  IsEndOfEntity(val: string): boolean
    {
        return val == ';';
    }

    public static IsWhiteSpace(value: string): boolean
    {
        return this.whitespaceRegex.test(value);
    }

    // public static IsWhiteSpace(value: string): boolean
    // {
    //     return this.string.IsWhiteSpace(value);
    // }

    public static  StripAnyAttributes(word: string): string
    {
        if (this.IsTag(word))
        {
            return this.StripTagAttributes(word);
        }
        return word;
    }

    public static  IsWord(text: string): boolean
    {
        return this.wordRegex.test(text);
    }
}