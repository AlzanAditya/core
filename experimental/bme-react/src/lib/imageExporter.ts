import { toPng, toJpeg } from 'html-to-image';
import { formatFileName } from './utils';

// Wait for all fonts to be loaded (CRITICAL for Desktop-Android consistency)
async function waitForFonts() {
  try {
    await document.fonts.ready;
    const timesLoaded = document.fonts.check('12px "Times New Roman"');
    if (!timesLoaded) {
      console.warn('Times New Roman font not detected, waiting additional time...');
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (error) {
    console.warn('Font loading check failed:', error);
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
}

// Convert image to base64 data URL
async function imageToDataURL(imagePath: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve('');
      }
    };

    img.onerror = () => {
      console.warn(`Failed to load image for data URL: ${imagePath}`);
      resolve('');
    };

    img.src = imagePath;
  });
}

// Create off-screen iframe with complete HTML (includes styles)
async function createOffscreenIframe(htmlString: string): Promise<HTMLIFrameElement> {
  // Try converting relative logo path or fallback path to data URL
  const logoPath = 'https://qydhvqhkmmrfizawfgvx.supabase.co/storage/v1/object/public/icons/logo-bme.png';
  let logoDataURL = '';

  try {
    logoDataURL = await imageToDataURL(logoPath);
  } catch (error) {
    console.warn('Could not convert logo to data URL:', error);
  }

  // Replace logo src with data URL if available
  if (logoDataURL) {
    htmlString = htmlString.replace(
      /src="\/assets\/icons\/logo-bme\.png"/g,
      `src="${logoDataURL}"`
    );
    htmlString = htmlString.replace(
      /src="assets\/icons\/logo-bme\.png"/g,
      `src="${logoDataURL}"`
    );
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-99999px';
  iframe.style.top = '0';
  iframe.style.zIndex = '-1';
  iframe.style.width = '210mm'; // A4 width
  iframe.style.height = '297mm'; // A4 height
  iframe.style.border = 'none';

  document.body.appendChild(iframe);

  iframe.srcdoc = htmlString;

  // Wait for iframe to load
  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    // Fallback in case onload doesn't fire
    setTimeout(resolve, 500);
  });

  return iframe;
}

function removeOffscreenIframe(iframe: HTMLIFrameElement) {
  if (iframe && iframe.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
}

// Export to PNG
export async function exportToPNG(htmlString: string, filename: string): Promise<boolean> {
  let iframe: HTMLIFrameElement | null = null;

  try {
    await waitForFonts();
    iframe = await createOffscreenIframe(htmlString);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Could not access iframe document');

    const pageContainer = iframeDoc.querySelector('.page-container');
    const targetElement = (pageContainer || iframeDoc.body) as HTMLElement;

    // Wait for layout to stabilize and fonts to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dataUrl = await toPng(targetElement, {
      quality: 1.0,
      pixelRatio: 2, // High resolution
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();

    document.dispatchEvent(new CustomEvent('download-complete'));
    return true;
  } catch (error) {
    console.error('PNG export failed:', error);
    alert('Gagal mengekspor ke PNG. Silakan coba lagi.');
    return false;
  } finally {
    if (iframe) {
      removeOffscreenIframe(iframe);
    }
  }
}

// Export to JPEG
export async function exportToJPEG(htmlString: string, filename: string): Promise<boolean> {
  let iframe: HTMLIFrameElement | null = null;

  try {
    await waitForFonts();
    iframe = await createOffscreenIframe(htmlString);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Could not access iframe document');

    const pageContainer = iframeDoc.querySelector('.page-container');
    const targetElement = (pageContainer || iframeDoc.body) as HTMLElement;

    // Wait for layout to stabilize and fonts to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dataUrl = await toJpeg(targetElement, {
      quality: 0.95,
      pixelRatio: 2, // High resolution
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = `${filename}.jpeg`;
    link.href = dataUrl;
    link.click();

    document.dispatchEvent(new CustomEvent('download-complete'));
    return true;
  } catch (error) {
    console.error('JPEG export failed:', error);
    alert('Gagal mengekspor ke JPEG. Silakan coba lagi.');
    return false;
  } finally {
    if (iframe) {
      removeOffscreenIframe(iframe);
    }
  }
}

// Export both Invoice and Surat Jalan
export async function exportBothDocuments(
  invoiceHTML: string,
  suratJalanHTML: string,
  title: string,
  fileFormats: { invoice: string; suratJalan: string },
  format: 'png' | 'jpeg' = 'png'
): Promise<boolean> {
  const invoiceFilename = formatFileName(fileFormats.invoice, title);
  const suratJalanFilename = formatFileName(fileFormats.suratJalan, title);

  try {
    if (format === 'png') {
      await exportToPNG(invoiceHTML, invoiceFilename);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await exportToPNG(suratJalanHTML, suratJalanFilename);
    } else {
      await exportToJPEG(invoiceHTML, invoiceFilename);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await exportToJPEG(suratJalanHTML, suratJalanFilename);
    }
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}
