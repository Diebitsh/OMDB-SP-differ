import { JSDOM } from 'jsdom'
import { DifferDomSerivce } from '../services/differ-services/differ-dom.serivce';
import { Differ } from '../services/differ-services/differ-file.service';
import { HtmlGeneratorService } from '../services/html-generator.service';
import { ComparableHtml } from '../models/dom-element.models';
import { ComparableDocument, Line } from '../models/file-differ.models';

export class MainAppController {

    public compareDOM (req: any, res: any) {
        
        const timeAppStart = new Date().getTime();

        var files =  req.body;
        var src = files.sourceFileText;
        var dest = files.destFileText;

        const sourceFileJSdom = new JSDOM(src);
        const destFileJSdom = new JSDOM(dest);
    
        const SourceBody = sourceFileJSdom.window.document.querySelector('body');
        const DestBody = destFileJSdom.window.document.querySelector('body');
    
        const differDomService = new DifferDomSerivce(SourceBody, DestBody);

        let styles;

        if (files.isStyleContains) {
            styles = destFileJSdom.window.document.querySelector('html')?.innerHTML;
            styles = styles?.substring(styles.indexOf("<head>")+6, styles.lastIndexOf("</head>"));
        }
        else {
            styles = "";
        }
        
        const mainContent = differDomService.DOMHandler();

        const timeAppEnd = new Date().getTime();

        const result = new ComparableHtml(styles, mainContent, timeAppStart-timeAppEnd);
        
        res.send(result);
    };
    
    public compareText (req: any, res: any) {
    
        const timeAppStart = new Date().getTime();

        var files =  req.body;
        var src = files.sourceFileText;
        var dest = files.destFileText;
        
        const source: ComparableDocument = new ComparableDocument(
            src.toString().split('\n').map( (line: string, index: number) => new Line(line.replace('\r', ''), index+1)));
         
        const destination: ComparableDocument = new ComparableDocument(
        dest.toString().split('\n').map( (line: string, index: number) => new Line(line.replace('\r', ''), index+1)));
         
        const differ = new Differ(source, destination);
     
        const lines = differ.getViewableLines();

        const timeAppEnd = new Date().getTime();

        const result = new ComparableHtml("", HtmlGeneratorService.createHtmlView(lines), timeAppEnd-timeAppStart) ;
     
        res.send(result);
     };
}
