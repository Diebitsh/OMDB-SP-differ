"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableCell = exports.TableRow = exports.Table = exports.Html = exports.LiElement = exports.DivBlock = exports.HtmlGeneratorService = void 0;
class HtmlGeneratorService {
    static createHtmlView(lines, startTime, endTime, sourceFileName, destFileName) {
        let result = new Html();
        const table = new Table();
        let addedCount = 0;
        let deletedCount = 0;
        let equalsCount = 0;
        for (var line of lines.reverse()) {
            switch (line.EditType) {
                case "inserted": {
                    let newLineNumberTd = new TableCell(line.NewLine?.LineIndex.toString() ?? "");
                    newLineNumberTd.style = 'added-number';
                    let newLineContentTd = new TableCell(line.NewLine?.LineValue ?? "");
                    newLineContentTd.style = line.getLineColor();
                    let oldLineNumberTd = new TableCell("");
                    oldLineNumberTd.style = "empty-number";
                    let oldLineContentTd = new TableCell("");
                    oldLineContentTd.style = "empty";
                    const tr = new TableRow([oldLineNumberTd, oldLineContentTd, newLineNumberTd, newLineContentTd]);
                    table.rows.push(tr);
                    addedCount++;
                    break;
                }
                case "deleted": {
                    let newLineNumberTd = new TableCell("");
                    newLineNumberTd.style = "empty-number";
                    let newLineContentTd = new TableCell("");
                    newLineContentTd.style = "empty";
                    let oldLineNumberTd = new TableCell(line.OldLine?.LineIndex.toString() ?? "");
                    oldLineNumberTd.style = "deleted-number";
                    let oldLineContentTd = new TableCell(line.OldLine?.LineValue ?? "");
                    oldLineContentTd.style = line.getLineColor();
                    const tr = new TableRow([oldLineNumberTd, oldLineContentTd, newLineNumberTd, newLineContentTd]);
                    table.rows.push(tr);
                    deletedCount++;
                    break;
                }
                case "equals": {
                    let newLineNumberTd = new TableCell(line.NewLine?.LineIndex.toString() ?? "");
                    newLineNumberTd.style = "equals-number";
                    let newLineContentTd = new TableCell(line.NewLine?.LineValue ?? "");
                    newLineContentTd.style = line.getLineColor();
                    let oldLineNumberTd = new TableCell(line.OldLine?.LineIndex.toString() ?? "");
                    oldLineNumberTd.style = "equals-number";
                    let oldLineContentTd = new TableCell(line.OldLine?.LineValue ?? "");
                    oldLineContentTd.style = line.getLineColor();
                    const tr = new TableRow([oldLineNumberTd, oldLineContentTd, newLineNumberTd, newLineContentTd]);
                    table.rows.push(tr);
                    equalsCount++;
                    break;
                }
                default: break;
            }
        }
        result.table = table;
        let resultHtmlString = "";
        resultHtmlString += `<html>
        <head>
            <link rel="stylesheet" href="${'./style.css'}">
            <script src="${'./highlight.min.js'}"></script>
            <script>hljs.highlightAll();</script>
        </head>`;
        resultHtmlString += `<body>`;
        resultHtmlString += `
    <header>
        <p class="logo">$$$OMDB SOFT PRODUCTS$$$</p>
    </header>
  `;
        resultHtmlString += `<div class="main-view">`;
        resultHtmlString += `<div class="pre-wrapper">`;
        resultHtmlString += `
  <div class="differ-header">
      <div class="info">
        <div class="header-block statistic">

          <div class="file-names">
            <p class="file-name">${sourceFileName} /</p>
            <p class="file-name2">${destFileName}</p>
          </div>
          
          <div class="changes">
            <div class="chng-block chng-ins"><p>${addedCount} +</p></div>
            <div class="chng-block chng-del"><p>${deletedCount} -</p></div>
            <div class="chng-block chng-equ"><p>${equalsCount} =</p></div>
          </div>

          <p class="time-label">Время работы программы: ${(endTime - startTime) / 1000} сек.</p>
        </div>
      </div>
  </div>`;
        resultHtmlString += `<pre>`;
        resultHtmlString += `<table>`;
        for (let tr of result.table.rows) {
            resultHtmlString += `
          <tr>
            <td class=\"${tr.cells[0].style}\">${tr.cells[0].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</td>
            <td class=\"${tr.cells[1].style}\" >${tr.cells[1].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</code></td>
            <td class=\"${tr.cells[2].style}\">${tr.cells[2].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</td>
            <td class=\"${tr.cells[3].style}\" ><code class="javascript">${tr.cells[3].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</code></td>
          </tr>`;
        }
        resultHtmlString += `</table>`;
        resultHtmlString += `</pre>`;
        resultHtmlString += `</div>`;
        resultHtmlString += `</div>`;
        resultHtmlString += `
       <footer>
         <p>Специально для Frank Battle 2023</p>
       </footer>`;
        resultHtmlString += `</body>`;
        return resultHtmlString;
    }
}
exports.HtmlGeneratorService = HtmlGeneratorService;
class DivBlock {
    constructor() {
        this.liElements = [];
    }
}
exports.DivBlock = DivBlock;
class LiElement {
}
exports.LiElement = LiElement;
class Html {
    constructor() {
        this.blocks = [];
    }
}
exports.Html = Html;
class Table {
    constructor() {
        this.rows = [];
    }
}
exports.Table = Table;
class TableRow {
    constructor(cells) {
        this.cells = [];
        this.cells = cells;
    }
}
exports.TableRow = TableRow;
class TableCell {
    constructor(value) { this.content = value; }
}
exports.TableCell = TableCell;
//# sourceMappingURL=html-generator.service.js.map