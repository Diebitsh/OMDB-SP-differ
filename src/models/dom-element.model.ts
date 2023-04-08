export class DOMElement {
    TagName :string;
    TextContent: string | null;
    Attributes: string[];
    AttributesValue: string[];
    WasViewed: boolean;
    Children: DOMElement[];
}