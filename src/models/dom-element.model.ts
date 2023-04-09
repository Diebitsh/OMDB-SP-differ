export class DOMElement {
    TagName :string;
    TextContent: string | null;
    Attributes: string[];
    AttributesValue: string[];
    WasViewed: boolean;
    Children: DOMElement[];
}

export enum TrackedChanges {
    Added = "newelement",
    Deleted = "deletedelement",
    Changed = "changedelement"
}