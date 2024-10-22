import { NextResponse } from 'next/server'

type Cell = {
  text: string;
};

type Row = {
  cells: Cell[];
};

type Table = {
  headerRows: Row[];
  bodyRows: Row[];
};

type ProcessedTables = {
  tables: Table[];
};

export async function extractTablesFromJson(data: any): Promise<ProcessedTables> {
  const processedTables: ProcessedTables = {
    tables: [],
  };

  // Check if pages and tables exist in the data
  if (!data.pages || !Array.isArray(data.pages)) {
    return processedTables;
  }

  data.pages.forEach((page: any) => {
    if (page.tables && Array.isArray(page.tables)) {
      page.tables.forEach((table: any) => {
        const processedTable: Table = {
          headerRows: [],
          bodyRows: [],
        };

        // Process header rows
        if (table.headerRows && Array.isArray(table.headerRows)) {
          table.headerRows.forEach((row: any) => {
            const processedRow: Row = { cells: [] };
            if (row.cells && Array.isArray(row.cells)) {
              row.cells.forEach((cell: any) => {
                const text = extractTextFromCell(cell, data.text);
                processedRow.cells.push({ text });
              });
            }
            processedTable.headerRows.push(processedRow);
          });
        }

        // Process body rows
        if (table.bodyRows && Array.isArray(table.bodyRows)) {
          table.bodyRows.forEach((row: any) => {
            const processedRow: Row = { cells: [] };
            if (row.cells && Array.isArray(row.cells)) {
              row.cells.forEach((cell: any) => {
                const text = extractTextFromCell(cell, data.text);
                processedRow.cells.push({ text });
              });
            }
            processedTable.bodyRows.push(processedRow);
          });
        }

        processedTables.tables.push(processedTable);
      });
    }
  });

  return processedTables;
}

function extractTextFromCell(cell: any, fullText: string): string {
  if (cell.layout && cell.layout.textAnchor && cell.layout.textAnchor.textSegments) {
    const segment = cell.layout.textAnchor.textSegments[0];
    if (segment.startIndex !== undefined && segment.endIndex !== undefined) {
      return fullText.substring(segment.startIndex, segment.endIndex).trim();
    }
  }
  return '';
}

export async function POST(request: Request) {
  const data = await request.json();
  const processedTables = await extractTablesFromJson(data);
  return NextResponse.json(processedTables);
}