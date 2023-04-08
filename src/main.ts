import { Command, AddHelpTextPosition, OutputConfiguration } from 'commander';
import { trace } from 'console';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { readFileSync } from 'fs';
import { ComparableDocument } from './models/comparable-document.model';
import { Line } from './models/line.model';
import { ViewableLine } from './models/viewable-line.model';
import { ConsolePrinter } from './services/console-printer.service';
import { Differ } from './services/differ-services/differ-file.service';
import {HtmlGeneratorService} from './services/html-generator.service'
import path from 'path';
import { JSDOM } from 'jsdom'
import { plainToClass } from "class-transformer";
import { json } from 'stream/consumers';
import { DifferDomSerivce } from './services/differ-services/differ-dom.serivce'

const beautify = require('beautify');


var timeAppStart = new Date().getTime();

const program = new Command();
program
    .version("1.0")
    .description("CLI приложения для сравнения двух html")
    .option("--compare <paths...>", "Сравнение файлов, пример: node lib/main.js C:\\Folder\\old.html C:\\Folder\\new.html")
    .parse(process.argv);
    
const options = program.opts();

const sourceFileJSdom = new JSDOM(loadFile('././test-pages/1-src.html'));
const destFileJSdom = new JSDOM(loadFile('././test-pages/1-src.html'));

const SourceBody = sourceFileJSdom.window.document.querySelector('body');
const DestBody = destFileJSdom.window.document.querySelector('body');

const differDomService = new DifferDomSerivce(SourceBody, DestBody);

const final = differDomService.DOMHandler();

if (options.compare) {

const sourceFileJSdom = new JSDOM(readFileSync("././test-pages/1-src.html").toString());
const destFileJSdom = new JSDOM(readFileSync("././test-pages/1-dst.html").toString());
const SourceBody = sourceFileJSdom.window.document.querySelector('body');
const DestBody = destFileJSdom.window.document.querySelector('body');

const styles = destFileJSdom.window.document.querySelector('html').innerHTML.split("<body")[0];
var t = new HtmlVisualDiff(SourceBody.innerHTML, DestBody.innerHTML);
var result: string = styles;
var tad = t.build();
console.log(result)
tad = tad.replaceAll("<ins>", "")
tad = tad.replaceAll("</ins>", "")
tad = tad.replaceAll("<del>", "")
tad = tad.replaceAll("</del>", "")
tad = tad.replaceAll(",", "")
result += tad;
createResultHtml(result, null, 3);

// if (options.compare) {

//     const paths: string[] = options.compare as string[];
//     if (!paths || paths.length < 2) {
//        throw new Error(`Не указан путь(и) до файлов ${paths}`);
//     }

//     const source: ComparableDocument = new ComparableDocument(
//         loadFile(paths[0]).toString().split('\n').map( (line, index) => new Line(line.replace('\r', ''), index+1) )
//     )
    
//     const dest: ComparableDocument = new ComparableDocument(
//         loadFile(paths[1]).toString().split('\n').map( (line, index) => new Line(line.replace('\r', ''), index+1) )
//     )
    
//     const differ = new Differ(source, dest);

    var lines = differ.getViewableLines();
    var timeAppEnd = new Date().getTime();
    createResultHtmlFileDiffer(HtmlGeneratorService.createHtmlView(lines, timeAppStart, timeAppEnd, paths[0], paths[1]),lines,timeAppEnd);

    const sourceFileJSdom = new JSDOM(loadFile(paths[0]));
    const destFileJSdom = new JSDOM(loadFile(paths[1]));

    const SourceBody = sourceFileJSdom.window.document.querySelector('body');
    const DestBody = destFileJSdom.window.document.querySelector('body');

    const differDomService = new DifferDomSerivce(SourceBody, DestBody);

    let styles = destFileJSdom.window.document.querySelector('html')?.innerHTML.split("<body")[0].replace('height: calc(100% - 32px)', '');
    
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
    
 //   const prompt = require("prompt-sync")({ sigint: true });
    //const isShowInTerminal = prompt("Вы хотите отобразить изменения в терминале (y/n)");

    // if (isShowInTerminal === 'y') {
    //     const printer = new ConsolePrinter();
    //     printer.print(lines.reverse());
    // }
    // else {
    //     return;
    // }
}

async function createResultHtmlDomDiffer(content: string, endTime: number) {
    fs.writeFile(__dirname + `/compareresult.html`, content, (error) => { console.error(error) });
    console.log(`Итоговый файл compareresult.html» сохранен в директорию ${__dirname}\\compareresult.html. Время работы приложения заняло ${endTime - timeAppStart} мс`);
}



