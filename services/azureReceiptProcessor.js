const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
const { supabaseAdmin} = require('../utils/db')

// Get Azure credentials from environment variables
const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

if (!endpoint || !key) {
  throw new Error("Azure credentials are not set in environment variables.");
}

// Create the Azure Document Intelligence Client
const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));

// Helper function to extract items from Azure response
function extractItems(itemsField) {
  if (!itemsField || !itemsField.values) {
    return [];
  }

  return itemsField.values.map((item, index) => {
    // Access the actual item object structure from Azure
    const itemData = item.properties || item;
    
    return {
      index: index + 1,
      name: itemData.Name?.value || itemData.Description?.value || null,
      quantity: itemData.Quantity?.value || null,
      price: itemData.Price?.value || null,
      totalPrice: itemData.TotalPrice?.value || null,
      category: itemData.Category?.value || null,
      unitOfMeasure: itemData.UnitOfMeasure?.value || null,
      productCode: itemData.ProductCode?.value || null,
      // Only include confidence for the main fields
      confidence: {
        name: itemData.Name?.confidence || itemData.Description?.confidence || null,
        totalPrice: itemData.TotalPrice?.confidence || null
      }
    };
  });
}

async function processReceiptWithAzure(filePath) {
  try {
    console.log(`Processing file: ${filePath}`);

    // 1. Get a temporary public URL for the file from Supabase Storage
    // This allows Azure's service to access the file directly.
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('receipt-images') // Your bucket name
      .createSignedUrl(filePath, 300); // URL is valid for 5 minutes (300 seconds)

    if (urlError) throw new Error('Could not get signed URL from Supabase.');

    const fileUrl = urlData.signedUrl;
    console.log(`Got temporary URL for file: ${fileUrl}`);

    // 2. Call the Azure Document Intelligence API
    // Use the "prebuilt-receipt" model
    const poller = await client.beginAnalyzeDocument("prebuilt-receipt", fileUrl);

    // Wait for the analysis to complete
    const { documents } = await poller.pollUntilDone();

    // 3. Process the result
    if (!documents || documents.length === 0) {
      throw new Error("Azure did not return any document data.");
    }

    const receipt = documents[0]; // Assuming one receipt per image
    const fields = receipt.fields;

    // console.log("Fields: ", fields);

    // 4. Extract items array with detailed information
    const items = extractItems(fields.Items);

    // 5. Map the Azure fields to a clean JSON object for your database
    const extractedData = {
      merchantName: fields.MerchantName?.value || null,
      merchantPhoneNumber: fields.MerchantPhoneNumber?.value || null,
      merchantAddress: fields.MerchantAddress?.value || null,
      transactionDate: fields.TransactionDate?.value || null,
      transactionTime: fields.TransactionTime?.value || null,
      total: fields.Total?.value || null,
      subtotal: fields.Subtotal?.value || null,
      tax: fields.TotalTax?.value || null,
      tip: fields.Tip?.value || null,
      items: items,
      // Item summary for quick reference
      itemSummary: {
        totalItems: items.length,
        totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
        averageItemPrice: items.length > 0 ? 
          items.reduce((sum, item) => sum + (item.price || 0), 0) / items.length : 0
      },
      receiptType: fields.ReceiptType?.value || null,
      // Store confidence scores for quality assessment
      confidence: {
        total: fields.Total?.confidence || null,
        merchantPhoneNumber: fields.MerchantPhoneNumber?.confidence || null,
        merchantName: fields.MerchantName?.confidence || null,
        items: fields.Items?.confidence || null
      },
      // Metadata
      processedAt: new Date().toISOString(),
      documentId: receipt.docType || 'prebuilt-receipt'
    };

    // 6. Convert to JSON string if needed for storage
    const jsonData = JSON.stringify(extractedData, null, 2);

    console.log("Extraction successful:", extractedData);
    console.log("JSON Data:", jsonData);

    // Return both the object and JSON string
    return jsonData;

  } catch (error) {
    console.error("❌ WORKER: An error occurred during Azure processing:", error);
    console.error("❌ WORKER: Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Create error response in JSON format
    const errorResponse = {
      success: false,
      error: {
        message: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    };

    console.log("❌ WORKER: Error response created:", errorResponse);

    // Re-throw the error so the worker job can handle it (e.g., mark as 'failed')
    throw error;
  }
}

module.exports = { processReceiptWithAzure }