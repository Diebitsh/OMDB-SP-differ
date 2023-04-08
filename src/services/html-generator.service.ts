import { ViewableLine } from "../models/viewable-line.model";

export class HtmlGeneratorService {
    
    public static createHtmlView(
      lines: ViewableLine[], 
      startTime: number, 
      endTime: number,
      sourceFileName: string,
      destFileName: string
      ) : string {

        let result: Html = new Html();
        const table: Table = new Table();

        let addedCount = 0;
        let deletedCount = 0;
        let equalsCount = 0;

        for (var line of lines.reverse()) {

          switch (line.EditType) {
            case "inserted": {
              let newLineNumberTd: TableCell = new TableCell(line.NewLine?.LineIndex.toString() ?? "");
              newLineNumberTd.style = 'added-number';
  
              let newLineContentTd: TableCell = new TableCell(line.NewLine?.LineValue ?? "");
              newLineContentTd.style = line.getLineColor();
  
              let oldLineNumberTd: TableCell = new TableCell("");
              oldLineNumberTd.style = "empty-number";
  
              let oldLineContentTd: TableCell = new TableCell("");
              oldLineContentTd.style = "empty";
              
              const tr: TableRow = new TableRow([oldLineNumberTd, oldLineContentTd, newLineNumberTd, newLineContentTd],);
              table.rows.push(tr);
              addedCount++;
              break;
            }
            case "deleted": {
              let newLineNumberTd: TableCell = new TableCell("");
              newLineNumberTd.style = "empty-number";
  
              let newLineContentTd: TableCell = new TableCell("");
              newLineContentTd.style = "empty";
  
              let oldLineNumberTd: TableCell = new TableCell(line.OldLine?.LineIndex.toString() ?? "");
              oldLineNumberTd.style = "deleted-number";
  
              let oldLineContentTd: TableCell = new TableCell(line.OldLine?.LineValue ?? "");
              oldLineContentTd.style = line.getLineColor();
              
              const tr: TableRow = new TableRow([oldLineNumberTd, oldLineContentTd, newLineNumberTd, newLineContentTd]);
              table.rows.push(tr);
              deletedCount++;
              break;
            }
            case "equals": {
              let newLineNumberTd: TableCell = new TableCell(line.NewLine?.LineIndex.toString() ?? "");
              newLineNumberTd.style = "equals-number";

              let newLineContentTd: TableCell = new TableCell(line.NewLine?.LineValue ?? "");
              newLineContentTd.style = line.getLineColor();

              let oldLineNumberTd: TableCell = new TableCell(line.OldLine?.LineIndex.toString() ?? "");
              oldLineNumberTd.style = "equals-number";

              let oldLineContentTd: TableCell = new TableCell(line.OldLine?.LineValue ?? "");
              oldLineContentTd.style = line.getLineColor();
              
              const tr: TableRow = new TableRow([oldLineNumberTd, oldLineContentTd, newLineNumberTd, newLineContentTd]);
              table.rows.push(tr);
              equalsCount++;
              break;
            }
            default: break
          }
        }

        result.table = table;
        
        let resultHtmlString: string = "";

        resultHtmlString += `<html>
        <head>
            <link rel="stylesheet" href="${'./style.css'}">
            <script src="${'./highlight.min.js'}"></script>
            <script>hljs.highlightAll();</script>
        </head>`
        resultHtmlString += `<body>`;
        resultHtmlString += `
    <header>
        <p class="logo">$$$OMDB SOFT PRODUCTS$$$</p>
    </header>
  `
  resultHtmlString += `<div class="main-view">`
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
          <td1 class=\"${tr.cells[0].style}\">${tr.cells[0].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</td>
          <td class=\"${tr.cells[1].style}\" ><code class="javascript">${tr.cells[1].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</code></td>
          <td class=\"${tr.cells[2].style}\">${tr.cells[2].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</td>
          <td class=\"${tr.cells[3].style}\" ><code class="javascript">${tr.cells[3].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</code></td>
          </tr>`
        }

        resultHtmlString += `</table>`;
        resultHtmlString += `</pre>`;
        resultHtmlString += `</div>`;
        resultHtmlString += `</div>`;
       resultHtmlString += `
       <footer>
         <p>Специально для Frank Battle 2023</p>
       </footer>`
        resultHtmlString += `</body>`;

        return resultHtmlString;
    }
}

export class DivBlock {
    class: string;
    liElements: LiElement[] = [];
}

export class LiElement {
    value: string;
    number: number | null;
    color: string;
}

export class Html {
    blocks: DivBlock[] = [];
    table : Table;
}

export class Table {
  rows: TableRow[] = [];
}

export class TableRow {
  constructor(cells: TableCell[]) { this.cells = cells }
  cells: TableCell[] = [];
}

export class TableCell {
  constructor(value: string) { this.content = value }
  content: string;
  style: string;
}