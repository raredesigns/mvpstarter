'use server';

import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

const client = new DocumentProcessorServiceClient();

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = 'us'; // adjust this if your processor is in a different location
const processorId = process.env.GOOGLE_CLOUD_PROCESSOR_ID;

export async function processDocument(formData: FormData) {
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
    const extractText = (textSegments: any[]) => {
      return textSegments?.map(segment => segment.content || '').join(' ').trim() || '';
    };

    // Extract tables from the response and convert them to markdown format
    const markdownTables: string[] = document.pages.flatMap((page, pageIndex) => {
      const tables = page.tables || [];
      return tables.map((table, tableIndex) => {
        const headerRows = table.headerRows || [];
        const bodyRows = table.bodyRows || [];

        if (headerRows.length === 0 || !headerRows[0].cells) {
          return `Table ${tableIndex + 1} on page ${pageIndex + 1}: No header rows or cells found.`;
        }

        // Process header row (with null check on cells)
        const header = '| ' + headerRows[0].cells?.map(cell =>
          extractText(cell?.layout?.textAnchor?.textSegments || [])
        ).join(' | ') + ' |';

        const separator = '|' + headerRows[0].cells?.map(() => '---').join('|') + '|';

        // Process body rows (with null check on cells)
        const rows = bodyRows.map(row =>
          '| ' + (row?.cells?.map(cell =>
            extractText(cell?.layout?.textAnchor?.textSegments || [])
          ).join(' | ') || '') + ' |'
        );

        return `${header}\n${separator}\n${rows.join('\n')}`; //Table ${tableIndex + 1} on page ${pageIndex + 1}:\n\n
      });
    });

    return markdownTables.join('\n\n');
  } catch (error: any) {
    throw new Error(`Error processing document: ${error.message}`);
  }
}
