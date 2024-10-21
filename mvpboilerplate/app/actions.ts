'use server'

import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { GoogleAuth } from 'google-auth-library';

// Set up Google Cloud credentials
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const client = new DocumentProcessorServiceClient({
  auth: auth,
});

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = 'en'; // change this if your processor is in a different location
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
    const document = result.document;
    const tables = document.pages.flatMap(page => page.tables);

    // Convert tables to markdown format
    const markdownTables = tables.map((table, index) => {
      const rows = table.bodyRows.map(row => 
        '| ' + row.cells.map(cell => cell.content).join(' | ') + ' |'
      );
      const header = '| ' + table.headerRows[0].cells.map(cell => cell.content).join(' | ') + ' |';
      const separator = '|' + table.headerRows[0].cells.map(() => '---').join('|') + '|';
      
      return `Table ${index + 1}:\n\n${header}\n${separator}\n${rows.join('\n')}`;
    });

    return markdownTables.join('\n\n');
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error('Error processing document');
  }
}