'use server';

import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

const client = new DocumentProcessorServiceClient();

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = 'us'; // adjust this if your processor is in a different location
const processorId = process.env.GOOGLE_CLOUD_PROCESSOR_ID;

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

export async function processDocument(formData: FormData): Promise<ProcessedTables> {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file uploaded');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  const request = {
    name,
    rawDocument: {
      content: buffer,
      mimeType: file.type,
    },
  };

  try {
    const [result] = await client.processDocument(request);
    console.log('Received response from Document AI:', JSON.stringify(result, null, 2));

    const document = result.document;
    if (!document || !document.pages) {
      throw new Error('No document or pages found in the result');
    }

    // Helper function to extract text from textSegments
    const extractText = (textSegments: any[]): string => {
      return textSegments?.map(segment => segment.content || '').join(' ').trim() || '';
    };

    // Extract tables from the response and convert them to our Table format
    const processedTables: ProcessedTables = {
      tables: document.pages.flatMap((page: any) => {
        const tables = page.tables || [];
        return tables.map((table: any): Table => {
          const headerRows = table.headerRows || [];
          const bodyRows = table.bodyRows || [];

          return {
            headerRows: headerRows.map((row: any): Row => ({
              cells: (row.cells || []).map((cell: any): Cell => ({
                text: extractText(cell?.layout?.textAnchor?.textSegments || [])
              }))
            })),
            bodyRows: bodyRows.map((row: any): Row => ({
              cells: (row.cells || []).map((cell: any): Cell => ({
                text: extractText(cell?.layout?.textAnchor?.textSegments || [])
              }))
            }))
          };
        });
      })
    };

    return processedTables;
  } catch (error: any) {
    console.error('Error processing document:', error);
    throw new Error(`Error processing document: ${error.message}`);
  }
}