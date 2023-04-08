import { DOMElement } from "../../models/dom-element.model";

export class DifferDomSerivce {
    constructor (domSource: HTMLBodyElement | null, domDest: HTMLBodyElement | null) {
        this.DomSource = domSource;
        this.DomDest = domDest;
    }

    DomSource: HTMLBodyElement | null;
    DomDest: HTMLBodyElement | null;

    private addedStyle: string = `cursor: pointer; border: 4px solid green; padding: 10px`;
    private deletedStyle: string = `cursor: pointer; border: 4px solid red; padding: 10px`;
    private changedStyle: string = `cursor: pointer; border: 4px solid orange; padding: 10px`;

    public DOMHandler(): string {
        let jsonFromDest = null;
        let jsonFromSource = null;

        if (this.DomSource != null && this.DomDest != null) {
            jsonFromSource = this.markUpToJson(this.DomSource);
            jsonFromDest = this.markUpToJson(this.DomDest);
            
            const DOMSource: any = this.FromJson(JSON.parse(jsonFromSource));
            const DOMDest: any = this.FromJson(JSON.parse(jsonFromDest));

            this.deepCompare(DOMSource, DOMDest);

            return this.convertToHtml(DOMDest)
        }
        
        return 'К сожалению, документы не удалось сравнить';
    }

    private markUpToJson = (e: Element): string =>
    JSON.stringify(this.ElementToDOMElement(e), null, '');

    private ElementToDOMElement = (element: Element): DOMElement => ({
        TagName: element.tagName,
        TextContent: element.textContent ?? "",
        Attributes: element.getAttributeNames(),
        AttributesValue: Array.from(element.attributes, ({value}) => value),
        WasViewed: false,
        Children: Array.from(element.children, this.ElementToDOMElement),
    });

    private FromJson(d: Object): Object {
        return Object.assign(new DOMElement, d);
    }


    //ПРОВЕРИТЬ КАК РАБОТАЕТ С Continue/Return
    private deepCompare(source: DOMElement, dest: DOMElement): void {
        if (source != undefined)
        dest.Children.forEach( (child, index) => {
            if (child.Children.length !== 0) {
                this.deepCompare(source.Children[index], child)
                return;
            }
            
            const sourceElem = source.Children[index];
            const destElem = child;
            //Элемент был добавлен
            if (sourceElem == undefined) {
                this.setAttribute(destElem, ["style","newelement"], [this.addedStyle, "+"]);
                return;
            }
            if (destElem.TagName == sourceElem.TagName) {
                //Элемент был изменен
                if (sourceElem.TextContent != destElem.TextContent) {
                    this.setAttribute(destElem, ["class", "style", "oldValue"],["changedValue", this.changedStyle,`${sourceElem.TextContent}`]);
                }
            }
            else {
                //Старый элемент был удален, на его место был добавлен новый элемент
                this.setAttribute(sourceElem, ["style", "deletedelement"], [this.deletedStyle, "-"]);
                this.setAttribute(destElem, ["style", "newelement"], [this.addedStyle, "+"]);
                dest.Children.unshift(sourceElem);
            }
            //Элементы добавлены из новой версии верстки
            if (dest.Children.length > source.Children.length) {
                dest.Children.forEach( (destChild, index) => {
                    if (source.Children[index] === undefined) {
                        this.setAttribute(destChild, ["style", "newelement"],[this.addedStyle, "+"]);
                    }
                });
            }
            else if (dest.Children.length < source.Children.length) {
                //Элементы удалены из старой версии верстки
                source.Children.forEach( (sourceChild, index) => {
                    if (dest.Children[index] === undefined) {
                        this.setAttribute(sourceChild, ["style", "deletedelement"], [this.deletedStyle, "-"]);
                        dest.Children.push(sourceChild);
                    }
                });
            }
        });
    }

    private convertToHtml(domTree: DOMElement, str = ''): string {
        let result = str;
        if (domTree.Children.length !== 0) {
            domTree.Children.forEach((child) => {
                let attributes = '';
                child.Attributes.forEach((attr, index) => {
                    let equalsSign = '='
                    let quotesSing = '"';
                    if (child.AttributesValue[index] === ' ' || child.AttributesValue[index] === '')
                        equalsSign = ''
                        quotesSing = ''
                    attributes += attr.replace(`"`, '') + `${equalsSign}` + `${quotesSing}${child.AttributesValue[index].replace('=', '')}${quotesSing} `;
                });
                if (child.Children.length !== 0) {
                    child.TextContent = '';
                }
    
                result += `<${child.TagName.toLowerCase()} ${attributes} >${this.convertToHtml(
                    child,
                    str,
                )}${child.TextContent}</${child.TagName.toLowerCase()}>`;
            });
        }
    
        return result;
    };

    private setAttribute(domElement: DOMElement, attributeName: string[], attributeValue: string[]): void {
        attributeName.forEach( (name, valueIndex) => {
            domElement.Attributes.push(name);
            domElement.AttributesValue.push(attributeValue[valueIndex]);
        })
    }
}