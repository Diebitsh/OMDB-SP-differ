import { Command, AddHelpTextPosition, OutputConfiguration } from 'commander';
import { trace } from 'console';
import * as fs from 'fs';
import { readFileSync } from 'fs';
import { ComparableDocument } from './models/comparable-document.model';
import { Line } from './models/line.model';
import { ViewableLine } from './models/viewable-line.model';
import { ConsolePrinter } from './services/console-printer.service';
import { Differ } from './services/differ.service';
import {HtmlGeneratorService} from './services/html-generator.service'
import path from 'path';
import { HtmlVisualDiff } from './services/html-visual-differ.service';

import { JSDOM } from 'jsdom'

var timeAppStart = new Date().getTime();

const program = new Command();
program
    .version("1.0")
    .description("CLI приложения для сравнения двух html")
    .option("--compare <paths...>", "Сравнение файлов, пример: node lib/main.js C:\\Folder\\old.html C:\\Folder\\new.html")
    .parse(process.argv);
    
const options = program.opts();

const source: string =(
    loadFile("C:\\old.html").toString())


const dest: string =
    loadFile("C:\\new.html").toString()

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

//     var lines = differ.getViewableLines();
//     var timeAppEnd = new Date().getTime();
//     createResultHtml(HtmlGeneratorService.createHtmlView(lines, timeAppStart, timeAppEnd, paths[0], paths[1]),lines,timeAppEnd);
// }
// else {
//     program.help();
// }

function loadFile(filePath: string): string {
    try {
        const file = readFileSync(filePath, "utf-8");
        return file;
    } catch (exception) {
        console.error(exception);
        return "";
    }
}

async function createResultHtml(content: string, lines: ViewableLine[], endTime: number) {
    // content += `<span>Время работы программы заняло: ${timeAppEnd - timeAppStart} миллисекунд</span>`
    fs.writeFile(__dirname + `/result.html`, content, (error) => { console.error(error) });
    console.log(`Итоговый файл «result.html» сохранен в директорию ${__dirname}\\result.html. Время работы приложения заняло ${ timeAppStart} мс`);
    
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



