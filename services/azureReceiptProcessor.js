// A new file, e.g., /services/azureReceiptProcessor.js

const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
// import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
// import { supabaseAdmin } from "../utils/db";
const { supabaseAdmin} = require('../utils/db')

// Get Azure credentials from environment variables
const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

if (!endpoint || !key) {
  throw new Error("Azure credentials are not set in environment variables.");
}

// Create the Azure Document Intelligence Client
const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));

async function processReceiptWithAzure(filePath) {
  // try {
  //   console.log(`Processing file: ${filePath}`);

  //   // 1. Get a temporary public URL for the file from Supabase Storage
  //   // This allows Azure's service to access the file directly.
  //   const { data: urlData, error: urlError } = await supabaseAdmin.storage
  //     .from('receipt-images') // Your bucket name
  //     .createSignedUrl(filePath, 300); // URL is valid for 5 minutes (300 seconds)

  //   if (urlError) throw new Error('Could not get signed URL from Supabase.');

  //   const fileUrl = urlData.signedUrl;
  //   console.log(`Got temporary URL for file: ${fileUrl}`);

  //   // 2. Call the Azure Document Intelligence API
  //   // Use the "prebuilt-receipt" model
  //   const poller = await client.beginAnalyzeDocument("prebuilt-receipt", fileUrl);

  //   // Wait for the analysis to complete
  //   const { documents } = await poller.pollUntilDone();

  //   // 3. Process the result
  //   if (!documents || documents.length === 0) {
  //     throw new Error("Azure did not return any document data.");
  //   }

  //   const receipt = documents[0]; // Assuming one receipt per image
  //   const fields = receipt.fields;

  //   // 4. Map the Azure fields to a clean object for your database
  //   const extractedData = {
  //     merchantName: fields.MerchantName?.value,
  //     transactionDate: fields.TransactionDate?.value,
  //     total: fields.Total?.value,
  //     subtotal: fields.Subtotal?.value,
  //     tax: fields.TotalTax?.value,
  //     // You can add more fields as needed (e.g., items)
  //     rawFields: fields // Store the full response for debugging
  //   };

  //   console.log("Extraction successful:", extractedData);
  //   return extractedData;

  // } catch (error) {
  //   console.error("An error occurred during Azure processing:", error);
  //   // Re-throw the error so the worker job can handle it (e.g., mark as 'failed')
  //   throw error;
  // }


  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ message: 'filePath is required' });
    }

    // Create a job ID and queue the processing
    const jobId = await boss.send(JOBS.PROCESS_RECEIPT, {
      filePath,
      userId: req.user?.id, // Assuming you have user context
      createdAt: new Date().toISOString()
    });

    // Create a database record to track the job
    const { data, error } = await supabaseAdmin
      .from('receipt_jobs')
      .insert({
        id: jobId,
        file_path: filePath,
        status: 'pending',
        user_id: req.user?.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create job record');
    }

    // Return immediately with job ID
    res.status(200).json({
      success: true,
      data: {
        jobId,
        status: 'pending',
        message: 'Receipt processing started'
      }
    });

  } catch (error) {
    console.error('Process receipt error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start processing'
    });
  }
}
module.exports = {processReceiptWithAzure}