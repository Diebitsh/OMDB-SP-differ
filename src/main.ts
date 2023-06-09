import { Command, AddHelpTextPosition, OutputConfiguration } from 'commander';
import * as fs from 'fs';
import { readFileSync } from 'fs';
import { ViewableLine } from './models/file-differ.models';
import { ConsolePrinter } from './services/console-printer.service';
import { Differ } from './services/differ-services/differ-file.service';
import { JSDOM } from 'jsdom'
import { DifferDomSerivce } from './services/differ-services/differ-dom.serivce'
import { HtmlGeneratorService } from './services/html-generator.service';
import { ComparableDocument, Line } from './models/file-differ.models';

var timeAppStart = new Date().getTime();

const program = new Command();
program
    .version("1.0")
    .description("CLI приложения для сравнения двух html")
    .option("--compare <paths...>", "Сравнение файлов, пример: node lib/main.js C:\\Folder\\old.html C:\\Folder\\new.html")
    .parse(process.argv);
    
const options = program.opts();

const sourceFileJSdom1 = new JSDOM(loadFile('././test-pages/4-src.html'));
const destFileJSdom1 = new JSDOM(loadFile('././test-pages/4-dst.html'));

const SourceBody1 = sourceFileJSdom1.window.document.querySelector('body');
const DestBody1 = destFileJSdom1.window.document.querySelector('body');

const differDomService1 = new DifferDomSerivce(SourceBody1, DestBody1);

let styles1 = '<!DOCTYPE html><html><head>';
styles1 += destFileJSdom1.window.document.querySelector('html')?.innerHTML.split("<body")[0].replace('height: calc(100% - 32px)', '');

let final1 = differDomService1.DOMHandler();
final1 += `<script type="text/javascript" src="./interact.js"></script>`

fs.writeFileSync(__dirname + `/result.html`, styles1+final1);

if (options.compare) {

    const paths: string[] = options.compare as string[];
    if (!paths || paths.length < 2) {
       throw new Error(`Не указан путь(и) до файлов ${paths}`);
    }

    const source: ComparableDocument = new ComparableDocument(
        loadFile(paths[0]).toString().split('\n').map( (line, index) => new Line(line.replace('\r', ''), index+1) )
    )
    
    const dest: ComparableDocument = new ComparableDocument(
        loadFile(paths[1]).toString().split('\n').map( (line, index) => new Line(line.replace('\r', ''), index+1) )
    )
    
    const differ = new Differ(source, dest);

    var lines = differ.getViewableLines();
    var timeAppEnd = new Date().getTime();

    // console.log(lines);

    createResultHtmlFileDiffer(HtmlGeneratorService.createHtmlView(lines),lines,timeAppEnd);

    const sourceFileJSdom = new JSDOM(loadFile(paths[0]));
    const destFileJSdom = new JSDOM(loadFile(paths[1]));

    const SourceBody = sourceFileJSdom.window.document.querySelector('body');
    const DestBody = destFileJSdom.window.document.querySelector('body');

    const differDomService = new DifferDomSerivce(SourceBody, DestBody);

    let styles = '<!DOCTYPE html> <html>';
    styles += destFileJSdom.window.document.querySelector('html')?.innerHTML.split("<body")[0].replace('height: calc(100% - 32px)', '');
    
    let final = '<body>';
    final += differDomService.DOMHandler();
    final += `<script type="text/javascript" src="./interact.js"></script>`
    final += '</body>';
    final += '</html>';

    createResultHtmlDomDiffer(styles += final, timeAppEnd)
}
else {
    program.help();
}

function loadFile(filePath: string): string {
    try {
        const file = readFileSync(filePath, "utf-8");
        return file;
    } catch (exception) {
        console.error(exception);
        return "";
    }
}

async function createResultHtmlFileDiffer(content: string, lines: ViewableLine[], endTime: number) {
    fs.writeFile(__dirname + `/result.html`, content, (error) => { console.error(error) });
    console.log(`Итоговый файл «result.html» сохранен в директорию ${__dirname}\\result.html. Время работы приложения заняло ${endTime - timeAppStart} мс`);
    
    const prompt = require("prompt-sync")({ sigint: true });
    const isShowInTerminal = prompt("Вы хотите отобразить изменения в терминале (y/n)");

    if (isShowInTerminal === 'y') {
        const printer = new ConsolePrinter();
        printer.print(lines.reverse());
    }
    else {
        return;
    }
}

async function createResultHtmlDomDiffer(content: string, endTime: number) {
    fs.writeFile(__dirname + `/compareresult.html`, content, (error) => { console.error(error) });
    console.log(`Итоговый файл compareresult.html» сохранен в директорию ${__dirname}\\compareresult.html. Время работы приложения заняло ${endTime - timeAppStart} мс`);
}



