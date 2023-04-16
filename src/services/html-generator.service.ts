import { ViewableLine } from "../models/file-differ.models";


export class HtmlGeneratorService {
    
    public static createHtmlView(lines: ViewableLine[]) : string {
        let result: Html = new Html();
        const table: Table = new Table();

        let i = 0; let y = 0;
        
        for (let line of lines.reverse().filter(x => x.NewLine?.LineIndex != 0 && x.OldLine?.LineIndex != 0)) {
          
          if (line.OldLine?.LineIndex) {
            if (table.rows.some(y => y.cells.some(z => z.content == (Number(line.OldLine?.LineIndex) + i).toString())))
            {
              continue;
            }

            const oldLineNumberTd: TableCell = new TableCell((line.OldLine?.LineIndex).toString() ?? "");
            const oldLineContentTd: TableCell = new TableCell(line.OldLine?.LineValue ?? "");
            
            oldLineContentTd.style = line.getLineColor();

            let newLineNumberTd: TableCell = new TableCell("");
            let newLineContentTd: TableCell = new TableCell("");
            
            if (line.NewLine?.LineIndex) {
              newLineNumberTd = new TableCell((line.NewLine?.LineIndex).toString() ?? "");
              newLineContentTd = new TableCell(line.NewLine?.LineValue ?? "");
              newLineContentTd.style = line.getLineColor();
            } else {
              let newLineIndex = lines.findIndex(x => x.NewLine?.LineIndex == Number(line.OldLine?.LineIndex));
              if (newLineIndex >= 0) {
                let newLine = lines[newLineIndex];
                if (newLine.EditType === "inserted") {
                  newLineNumberTd = new TableCell(newLine.NewLine?.LineIndex.toString() ?? "");
                  newLineContentTd = new TableCell(newLine.NewLine?.LineValue ?? "");
                  newLineContentTd.style = newLine.getLineColor();
                } else if (newLine.EditType === "equals") {
                  var updatedIndex = lines.findIndex(x => x.NewLine?.LineIndex == (Number(line.OldLine?.LineIndex) - i))
                  var updatedLine = lines[updatedIndex];
                  newLineNumberTd = new TableCell(updatedLine.NewLine?.LineIndex.toString() ?? "");
                  newLineContentTd = new TableCell(updatedLine.NewLine?.LineValue ?? "");
                  if (!updatedLine.OldLine) {
                    newLineContentTd.style = updatedLine.getLineColor();
                  }
                  else {
                    newLineNumberTd.content = "";
                    newLineContentTd.content = "";
                    newLineContentTd.style = "grey";
                  }
                  
                  i++;
                }
              } else {
                newLineNumberTd.style = "grey";
                newLineNumberTd.style = "grey";
              }
            }

            const tr: TableRow = new TableRow([oldLineNumberTd, oldLineContentTd, newLineNumberTd, newLineContentTd]);
            table.rows.push(tr);

          } else if (line.NewLine?.LineIndex) {
            if (table.rows.some(x => x.cells.some(z => z.content == (Number(line.NewLine?.LineIndex)).toString())))
            {
              continue;
            }
            const newLineNumberTd: TableCell = new TableCell((line.NewLine?.LineIndex).toString() ?? "");
            const newLineContentTd: TableCell = new TableCell(line.NewLine?.LineValue ?? "");
            
            newLineContentTd.style = line.getLineColor();

            let oldLineNumberTd: TableCell = new TableCell(""); 
            let oldLineContentTd: TableCell = new TableCell("");
            
            if (line.OldLine?.LineIndex) {
              oldLineNumberTd = new TableCell(line.OldLine?.LineIndex.toString() ?? "");
              oldLineContentTd = new TableCell(line.OldLine?.LineValue ?? "");
              oldLineContentTd.style = line.getLineColor();
            } else {
              let oldLineIndex = lines.findIndex(x => x.OldLine?.LineIndex == Number(line.NewLine?.LineIndex));
              if (oldLineIndex >= 0) {
                let oldLine = lines[oldLineIndex];
                if (oldLine.EditType === "deleted") { 
                  var updatedIndex = lines.findIndex(x => x.OldLine?.LineIndex == (Number(line.NewLine?.LineIndex) - y))
                  var updatedLine =lines[updatedIndex];
                  if (!updatedLine) {
                    oldLineNumberTd = new TableCell(oldLine.OldLine?.LineIndex.toString() ?? "");
                    oldLineContentTd = new TableCell(oldLine.OldLine?.LineValue ?? "");
                    oldLineContentTd.style = oldLine.getLineColor();
                  }
                  else {
                    oldLineNumberTd = new TableCell(updatedLine.NewLine?.LineIndex.toString() ?? "");
                    oldLineContentTd = new TableCell(updatedLine.NewLine?.LineValue ?? "");
                    if (!updatedLine.OldLine) {
                      oldLineContentTd.style = updatedLine.getLineColor();
                    }
                    else {
                      oldLineContentTd.content = "";
                      oldLineContentTd.content = "";
                      oldLineContentTd.style = "grey";
                    }
                  }
                  y++;
                } else if (oldLine.EditType === "inserted") {
                  oldLineNumberTd = new TableCell("");
                  oldLineContentTd = new TableCell("");
                  oldLineContentTd.style = "grey";
                  y++;
                }
              } else {
                oldLineContentTd.style = "grey";
                oldLineContentTd.style = "grey";
              }
            }

            const tr: TableRow = new TableRow([oldLineNumberTd, oldLineContentTd, newLineNumberTd, newLineContentTd]);
            table.rows.push(tr);
          }
        }

        result.table = table;
        
        let resultHtmlString: string = "";

        resultHtmlString += `<pre>`;
        resultHtmlString += `<table>`;
        for (let tr of result.table.rows) {
          resultHtmlString += `
          <tr>
            <td class=\"${tr.cells[0].style}\">${tr.cells[0].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</td>
            <td class=\"${tr.cells[1].style}\" >${tr.cells[1].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</code></td>
            <td class=\"${tr.cells[2].style}\">${tr.cells[2].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</td>
            <td class=\"${tr.cells[3].style}\" ><code class="javascript">${tr.cells[3].content?.replaceAll(/\s/g, "&emsp;").replaceAll("<", "&lt").replaceAll(">", "&gt")}</code></td>
          </tr>`
        }

        resultHtmlString += `</table>`;
        resultHtmlString += `</pre>`;
    
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