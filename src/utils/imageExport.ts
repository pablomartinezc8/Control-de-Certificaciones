import { toBlob, toPng } from 'html-to-image';
import html2canvasPro from 'html2canvas-pro';

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 1000);
}

export interface ExportImageOptions {
  backgroundColor?: string;
  hideElementIds?: string[];
  scale?: number;
}

/**
 * Exporta un elemento HTML a imagen PNG en alta definición.
 * Utiliza html2canvas-pro / html-to-image con soporte completo para colores OKLCH de Tailwind v4 y SVGs de Recharts.
 */
export async function exportElementToPng(
  element: HTMLElement,
  fileName: string,
  options?: ExportImageOptions
): Promise<boolean> {
  const bg = options?.backgroundColor || '#ffffff';
  const hideIds = options?.hideElementIds || [];
  const scale = options?.scale || 2;

  // Intento 1: html2canvas-pro (fork con soporte nativo de OKLCH y renderizado preciso de Recharts)
  try {
    const canvas = await html2canvasPro(element, {
      scale,
      backgroundColor: bg,
      useCORS: true,
      allowTaint: true,
      logging: false,
      onclone: (clonedDoc) => {
        hideIds.forEach((id) => {
          const el = clonedDoc.getElementById(id);
          if (el) el.style.display = 'none';
        });

        // Asegurar tamaños explícitos en elementos SVG para Recharts
        const svgs = clonedDoc.querySelectorAll('svg');
        svgs.forEach((svg) => {
          const width = svg.clientWidth || svg.getBoundingClientRect().width;
          const height = svg.clientHeight || svg.getBoundingClientRect().height;
          if (width > 0) svg.setAttribute('width', `${width}`);
          if (height > 0) svg.setAttribute('height', `${height}`);
        });
      },
    });

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

    if (blob) {
      downloadBlob(blob, fileName);
      return true;
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      downloadDataUrl(dataUrl, fileName);
      return true;
    }
  } catch (errPro) {
    console.warn('html2canvas-pro falló, intentando con html-to-image:', errPro);
  }

  // Intento 2 (Fallback): html-to-image
  try {
    const blob = await toBlob(element, {
      quality: 0.98,
      pixelRatio: scale,
      backgroundColor: bg,
      skipFonts: true,
      filter: (node: any) => {
        if (node?.id && hideIds.includes(node.id)) {
          return false;
        }
        return true;
      },
      cacheBust: true,
    });

    if (blob) {
      downloadBlob(blob, fileName);
      return true;
    }

    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: scale,
      backgroundColor: bg,
      skipFonts: true,
      filter: (node: any) => {
        if (node?.id && hideIds.includes(node.id)) {
          return false;
        }
        return true;
      },
      cacheBust: true,
    });

    if (dataUrl) {
      downloadDataUrl(dataUrl, fileName);
      return true;
    }
  } catch (errFallback) {
    console.error('Error en fallback de exportación:', errFallback);
    throw errFallback;
  }

  return false;
}
