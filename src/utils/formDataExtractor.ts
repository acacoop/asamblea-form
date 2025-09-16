import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import templateUrl from "../assets/template.docx?url";

/**
 * Debug function to check localStorage data structure
 */
export function debugLocalStorageData() {
  const formData = localStorage.getItem("formExistingData");
  const cooperativaData = localStorage.getItem("cooperativa");
  
  console.log('=== DEBUG localStorage ===');
  console.log('formExistingData raw:', formData);
  console.log('cooperativa raw:', cooperativaData);
  
  if (formData) {
    const parsed = JSON.parse(formData);
    console.log('formExistingData parsed:', parsed);
    console.log('formExistingData.cooperativa:', parsed.cooperativa);
    console.log('formExistingData.datos:', parsed.datos);
  }
  
  if (cooperativaData) {
    const parsed = JSON.parse(cooperativaData);
    console.log('cooperativa parsed:', parsed);
    console.log('cooperativa.name:', parsed.name);
    console.log('cooperativa.nombre:', parsed.nombre);
    console.log('All cooperativa keys:', Object.keys(parsed));
  }
  
  return { formData, cooperativaData };
}

/**
 * Simple function to extract and format form data into JSON
 */
export function extractFormDataAsJSON() {
  const formData = localStorage.getItem("formExistingData");
  const cooperativaData = localStorage.getItem("cooperativa");
  
  const parsedForm = formData ? JSON.parse(formData) : {};
  const parsedCoop = cooperativaData ? JSON.parse(cooperativaData) : {};
  
  console.log('Raw parsed form:', parsedForm);
  console.log('Raw parsed coop:', parsedCoop);
  
  // Get cartas poder to find apoderados
  const cartasPoder = parsedForm?.datos?.cartasPoder || [];
  console.log('Cartas poder:', cartasPoder);
  
  // Helper function to find apoderado for a person
  const findApoderado = (personId: string, allPeople: any[]) => {
    const carta = cartasPoder.find((c: any) => c.poderanteId === personId);
    if (!carta?.apoderadoId) return ""; // Return empty string instead of null
    
    const apoderado = allPeople.find((p: any) => p.id === carta.apoderadoId);
    return apoderado?.nombre || "";
  };
  
  // Normalize arrays
  const parseArray = (field: any) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return [];
  };
  
  const titulares = parseArray(parsedForm?.datos?.titulares || []);
  const suplentes = parseArray(parsedForm?.datos?.suplentes || []);
  const allPeople = [...titulares, ...suplentes];
  
  console.log('Parsed titulares:', titulares);
  console.log('Parsed suplentes:', suplentes);
  
  // Add apoderado to each titular
  const titularesWithApoderado = titulares.map((titular: any) => ({
    ...titular,
    apoderado: findApoderado(titular.id, allPeople)
  }));
  
  // Add apoderado to each suplente (if needed)
  const suplentesWithApoderado = suplentes.map((suplente: any) => ({
    ...suplente,
    apoderado: findApoderado(suplente.id, allPeople)
  }));
  
  const result = {
    cooperativa: parsedCoop,
    formData: {
      ...parsedForm,
      titulares: titularesWithApoderado,
      suplentes: suplentesWithApoderado
    }
  };
  
  console.log('Final extracted data:', result);
  return result;
}

/**
 * Generate PDF from DOCX template using the form data
 */
export async function generatePDF(formData: any): Promise<Blob> {
  try {
    // Load the template from the assets folder
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      throw new Error('Template file not found');
    }
    
    // Read the template file as ArrayBuffer
    const templateBuffer = await templateResponse.arrayBuffer();
    
    // Create a PizZip instance with the template
    const zip = new PizZip(templateBuffer);
    
    // Create docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Prepare data for the template - flatten the structure for docxtemplater
    const templateData = {
      // Flatten cooperativa to root level
      cooperativaName: formData.cooperativa?.name || formData.cooperativa?.nombre || '',
      cooperativaCode: formData.cooperativa?.code || formData.cooperativa?.codigo || '',
      
      // Also keep nested structure in case template uses it
      cooperativa: {
        name: formData.cooperativa?.name || formData.cooperativa?.nombre || '',
        code: formData.cooperativa?.code || formData.cooperativa?.codigo || ''
      },
      
      titulares: (formData.formData?.titulares || formData.titulares || []).map((t: any) => ({
        nombre: t.nombre || '',
        documento: t.documento || t.dni || '',
        apoderado: t.apoderado || ''
      })),
      suplentes: (formData.formData?.suplentes || formData.suplentes || []).map((s: any) => ({
        nombre: s.nombre || '',
        documento: s.documento || s.dni || '',
        apoderado: s.apoderado || ''
      }))
    };
    
    console.log('Template data being passed:', templateData); // Debug log
    
    // Render the document (replace placeholders with actual data)
    doc.render(templateData);
    
    // Generate the document as blob
    const output = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    
    return output;
    
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors.map((err: any) => err.properties.explanation).join(", ");
      throw new Error(`Template error: ${errorMessages}`);
    }
    throw new Error('Failed to generate PDF from template');
  }
}

/**
 * Upload PDF to SharePoint via Power Automate endpoint
 */
export async function uploadPDF(
  pdfBlob: Blob, 
  fileName: string, 
  powerAutomateEndpoint: string,
  cooperativaCode: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', pdfBlob, fileName);
    formData.append('cooperativaCode', cooperativaCode);
    formData.append('fileName', fileName);
    
    const response = await fetch(powerAutomateEndpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
      }
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      fileUrl: result.fileUrl || result.url
    };
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Fetch all PDF links for the logged cooperativa
 */
export async function fetchPDFs(
  powerAutomateEndpoint: string,
  cooperativaCode: string
): Promise<{ success: boolean; files?: Array<{name: string, url: string, date: string}>; error?: string }> {
  try {
    const url = new URL(powerAutomateEndpoint);
    url.searchParams.append('cooperativaCode', cooperativaCode);
    url.searchParams.append('action', 'list');
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      files: result.files || []
    };
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch PDFs'
    };
  }
}

/**
 * Complete workflow: Extract data, generate PDF, and upload to SharePoint
 */
export async function processFormSubmission(
  powerAutomateEndpoint: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    // Step 1: Extract form data
    const formData = extractFormDataAsJSON();
    
    if (!formData.cooperativa?.code) {
      throw new Error('Cooperativa code is required');
    }
    
    // Step 2: Generate PDF from template
    const pdfBlob = await generatePDF(formData);
    
    // Step 3: Create filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `Asamblea_${formData.cooperativa.code}_${timestamp}.docx`;
    
    // Step 4: Upload to SharePoint
    const uploadResult = await uploadPDF(
      pdfBlob, 
      fileName, 
      powerAutomateEndpoint,
      formData.cooperativa.code
    );
    
    return uploadResult;
  } catch (error) {
    console.error('Error in form submission process:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Form submission failed'
    };
  }
}

/**
 * Download the generated document locally (for testing/backup)
 */
export async function downloadGeneratedDocument(): Promise<void> {
  try {
    const formData = extractFormDataAsJSON();
    const pdfBlob = await generatePDF(formData);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `Asamblea_${formData.cooperativa?.code || 'Unknown'}_${timestamp}.docx`;
    
    saveAs(pdfBlob, fileName);
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}