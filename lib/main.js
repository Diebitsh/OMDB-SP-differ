"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const fs_1 = require("fs");
const console_printer_service_1 = require("./services/console-printer.service");
const differ_file_service_1 = require("./services/differ-services/differ-file.service");
const jsdom_1 = require("jsdom");
const differ_dom_serivce_1 = require("./services/differ-services/differ-dom.serivce");
const file_differ_models_1 = require("./models/file-differ.models");
var timeAppStart = new Date().getTime();
const program = new commander_1.Command();
program
    .version("1.0")
    .description("CLI приложения для сравнения двух html")
    .option("--compare <paths...>", "Сравнение файлов, пример: node lib/main.js C:\\Folder\\old.html C:\\Folder\\new.html")
    .parse(process.argv);
const options = program.opts();
const sourceFileJSdom1 = new jsdom_1.JSDOM(loadFile('././test-pages/4-src.html'));
const destFileJSdom1 = new jsdom_1.JSDOM(loadFile('././test-pages/4-dst.html'));
const SourceBody1 = sourceFileJSdom1.window.document.querySelector('body');
const DestBody1 = destFileJSdom1.window.document.querySelector('body');
const differDomService1 = new differ_dom_serivce_1.DifferDomSerivce(SourceBody1, DestBody1);
let styles1 = '<!DOCTYPE html><html><head>';
styles1 += destFileJSdom1.window.document.querySelector('html')?.innerHTML.split("<body")[0].replace('height: calc(100% - 32px)', '');
let final1 = differDomService1.DOMHandler();
final1 += `<script type="text/javascript" src="./interact.js"></script>`;
fs.writeFileSync(__dirname + `/result.html`, styles1 + final1);
if (options.compare) {
    const paths = options.compare;
    if (!paths || paths.length < 2) {
        throw new Error(`Не указан путь(и) до файлов ${paths}`);
    }
    const source = new file_differ_models_1.ComparableDocument(loadFile(paths[0]).toString().split('\n').map((line, index) => new file_differ_models_1.Line(line.replace('\r', ''), index + 1)));
    const dest = new file_differ_models_1.ComparableDocument(loadFile(paths[1]).toString().split('\n').map((line, index) => new file_differ_models_1.Line(line.replace('\r', ''), index + 1)));
    const differ = new differ_file_service_1.Differ(source, dest);
    var lines = differ.getViewableLines();
    var timeAppEnd = new Date().getTime();
    // console.log(lines);
    //createResultHtmlFileDiffer(HtmlGeneratorService.createHtmlView(lines, timeAppStart, timeAppEnd, paths[0], paths[1]),lines,timeAppEnd);
    const sourceFileJSdom = new jsdom_1.JSDOM(loadFile(paths[0]));
    const destFileJSdom = new jsdom_1.JSDOM(loadFile(paths[1]));
    const SourceBody = sourceFileJSdom.window.document.querySelector('body');
    const DestBody = destFileJSdom.window.document.querySelector('body');
    const differDomService = new differ_dom_serivce_1.DifferDomSerivce(SourceBody, DestBody);
    let styles = '<!DOCTYPE html> <html>';
    styles += destFileJSdom.window.document.querySelector('html')?.innerHTML.split("<body")[0].replace('height: calc(100% - 32px)', '');
    let final = '<body>';
    final += differDomService.DOMHandler();
    final += `<script type="text/javascript" src="./interact.js"></script>`;
    final += '</body>';
    final += '</html>';
    createResultHtmlDomDiffer(styles += final, timeAppEnd);
}
else {
    program.help();
}
function loadFile(filePath) {
    try {
        const file = (0, fs_1.readFileSync)(filePath, "utf-8");
        return file;
    }
    catch (exception) {
        console.error(exception);
        return "";
    }
}
async function createResultHtmlFileDiffer(content, lines, endTime) {
    fs.writeFile(__dirname + `/result.html`, content, (error) => { console.error(error); });
    console.log(`Итоговый файл «result.html» сохранен в директорию ${__dirname}\\result.html. Время работы приложения заняло ${endTime - timeAppStart} мс`);
    const prompt = require("prompt-sync")({ sigint: true });
    const isShowInTerminal = prompt("Вы хотите отобразить изменения в терминале (y/n)");
    if (isShowInTerminal === 'y') {
        const printer = new console_printer_service_1.ConsolePrinter();
        printer.print(lines.reverse());
    }
    else {
        return;
    }
}
async function createResultHtmlDomDiffer(content, endTime) {
    fs.writeFile(__dirname + `/compareresult.html`, content, (error) => { console.error(error); });
    console.log(`Итоговый файл compareresult.html» сохранен в директорию ${__dirname}\\compareresult.html. Время работы приложения заняло ${endTime - timeAppStart} мс`);
}
//# sourceMappingURL=main.js.map