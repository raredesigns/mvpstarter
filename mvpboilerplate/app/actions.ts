'use server'

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
    console.log('Sending request to Document AI:', JSON.stringify(request, null, 2));
    const [result] = await client.processDocument(request);
    console.log('Received response from Document AI:', JSON.stringify(result, null, 2));

    const document = result.document;
    if (!document || !document.pages) {
      throw new Error('No document or pages found in the result');
    }

    const tables = document.pages.flatMap(page => page.tables || []);

    // Helper function to extract text from textSegments
    const extractText = (textSegments: any[]) => {
      return textSegments?.map(segment => segment.content || '').join(' ').trim() || '';
    };

    // Convert tables to markdown format
    const markdownTables = tables.map((table, index) => {
      const bodyRows = table.bodyRows || [];
      const headerRows = table.headerRows || [];

      if (headerRows.length === 0 || !headerRows[0].cells) {
        return `Table ${index + 1}: No header rows or cells found.`;
      }

      // Process header row
      const header = '| ' + headerRows[0].cells.map(cell => extractText(cell?.layout?.textAnchor?.textSegments || [])).join(' | ') + ' |';
      const separator = '|' + headerRows[0].cells.map(() => '---').join('|') + '|';

      // Process body rows
      const rows = bodyRows.map(row =>
        '| ' + (row?.cells?.map(cell => extractText(cell?.layout?.textAnchor?.textSegments || [])).join(' | ') || '') + ' |'
      );

      return `Table ${index + 1}:\n\n${header}\n${separator}\n${rows.join('\n')}`;
    });

    return markdownTables.join('\n\n');
  } catch (error: any) {
    console.error('Error processing document:', error);
    throw new Error(`Error processing document: ${error.message}`);
  }
}
