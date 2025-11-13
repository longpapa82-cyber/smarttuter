/**
 * PDF Generation Utility
 *
 * Generates PDF reports from HTML content using jsPDF and html2canvas
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  scale?: number;
}

/**
 * Generate PDF from HTML element
 *
 * @param elementId - ID of the HTML element to convert
 * @param options - PDF generation options
 */
export async function generatePDF(
  elementId: string,
  options: PDFOptions = {}
): Promise<void> {
  const {
    filename = 'document.pdf',
    orientation = 'portrait',
    quality = 0.95,
    scale = 2,
  } = options;

  try {
    // Get the element
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Show loading indicator
    showLoadingIndicator();

    // Capture element as canvas with high quality
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        // Improve print quality in cloned document
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.padding = '20px';
        }
      },
    });

    // Calculate PDF dimensions
    const imgWidth = orientation === 'portrait' ? 210 : 297; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', quality);

    // Handle multi-page PDFs
    let heightLeft = imgHeight;
    let position = 0;
    const pageHeight = orientation === 'portrait' ? 297 : 210; // A4 height in mm

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add remaining pages if content is taller than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(filename);

    // Hide loading indicator
    hideLoadingIndicator();

    return Promise.resolve();
  } catch (error) {
    hideLoadingIndicator();
    console.error('PDF generation error:', error);
    throw new Error('PDF 생성에 실패했습니다. 다시 시도해주세요.');
  }
}

/**
 * Generate learning report PDF with proper formatting
 */
export async function generateLearningReportPDF(
  userName: string,
  reportDate: string
): Promise<void> {
  const filename = `${userName}_학습리포트_${reportDate}.pdf`;

  await generatePDF('learning-report-content', {
    filename,
    orientation: 'portrait',
    quality: 0.95,
    scale: 2,
  });
}

/**
 * Show loading indicator during PDF generation
 */
function showLoadingIndicator(): void {
  const indicator = document.createElement('div');
  indicator.id = 'pdf-loading-indicator';
  indicator.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50';
  indicator.innerHTML = `
    <div class="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      <p class="text-lg font-medium text-gray-900">PDF 생성 중...</p>
      <p class="text-sm text-gray-600">잠시만 기다려주세요</p>
    </div>
  `;
  document.body.appendChild(indicator);
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator(): void {
  const indicator = document.getElementById('pdf-loading-indicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Print current page (alternative to PDF download)
 */
export function printPage(): void {
  window.print();
}
