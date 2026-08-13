import { ParsedSlide, Theme } from '../types';

interface ExportOptions {
  accessToken: string;
  title: string;
  slides: ParsedSlide[];
  theme: Theme;
  onProgress?: (progress: number, message: string) => void;
}

export async function exportToGoogleSlides(options: ExportOptions): Promise<{ presentationId: string; presentationUrl: string }> {
  const { accessToken, title, slides, theme, onProgress } = options;

  if (!accessToken) {
    throw new Error('Google OAuth access token is required.');
  }

  // Helper for Google API fetch
  const apiFetch = async (url: string, init: RequestInit = {}) => {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google API Error (${res.status}): ${errText}`);
    }

    return res.json();
  };

  // Step 1: Create Presentation
  onProgress?.(10, 'Creating new Google Slides presentation...');
  const createRes = await apiFetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    body: JSON.stringify({
      title: title || 'Markdown Generated Presentation',
    }),
  });

  const presentationId = createRes.presentationId;
  const initialSlideId = createRes.slides?.[0]?.objectId;

  onProgress?.(25, 'Configuring slides and theme layouts...');

  // Helper: Hex color to Google Slides RGB object (0.0 to 1.0)
  const hexToRgb = (hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
    const num = parseInt(clean, 16);
    return {
      red: ((num >> 16) & 255) / 255,
      green: ((num >> 8) & 255) / 255,
      blue: (num & 255) / 255,
    };
  };

  const bgRgb = hexToRgb(theme.slideBgHex);
  const textRgb = hexToRgb(theme.textColorHex);
  const accentRgb = hexToRgb(theme.accentHex);

  // Prepare batch requests
  const requests: any[] = [];

  // Delete initial default slide if we have custom slides
  if (initialSlideId) {
    requests.push({
      deleteObject: { objectId: initialSlideId },
    });
  }

  slides.forEach((slide, idx) => {
    const slideObjectId = `slide_obj_${idx}_${Date.now()}`;
    const titleShapeId = `title_shape_${idx}_${Date.now()}`;
    const bodyShapeId = `body_shape_${idx}_${Date.now()}`;

    // 1. Create Slide
    requests.push({
      createSlide: {
        objectId: slideObjectId,
        insertionIndex: idx,
        slideLayout: { predefinedLayout: 'BLANK' },
      },
    });

    // 2. Set Background Color
    requests.push({
      updatePageProperties: {
        objectId: slideObjectId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: { rgbColor: bgRgb },
            },
          },
        },
        fields: 'pageBackgroundFill',
      },
    });

    // 3. Title Text Box
    const slideTitleText = slide.title || `Slide ${idx + 1}`;
    requests.push({
      createShape: {
        objectId: titleShapeId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideObjectId,
          size: {
            width: { magnitude: 650, unit: 'PT' },
            height: { magnitude: 60, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 35,
            translateY: 35,
            unit: 'PT',
          },
        },
      },
    });

    requests.push({
      insertText: {
        objectId: titleShapeId,
        text: slideTitleText,
      },
    });

    requests.push({
      updateTextStyle: {
        objectId: titleShapeId,
        textRange: { type: 'ALL' },
        style: {
          bold: true,
          fontSize: { magnitude: 26, unit: 'PT' },
          foregroundColor: { solidFill: { color: { rgbColor: accentRgb } } },
          fontFamily: 'Arial',
        },
        fields: 'bold,fontSize,foregroundColor,fontFamily',
      },
    });

    // 4. Content / Body Box
    let bodyText = '';
    if (slide.subtitle) bodyText += `${slide.subtitle}\n\n`;

    if (slide.stats && slide.stats.length > 0) {
      slide.stats.forEach((st) => {
        bodyText += `• ${st.value} — ${st.label}\n`;
      });
      bodyText += '\n';
    }

    if (slide.bullets && slide.bullets.length > 0) {
      slide.bullets.forEach((b) => {
        bodyText += `• ${b}\n`;
      });
    }

    if (slide.quotes && slide.quotes.length > 0) {
      slide.quotes.forEach((q) => {
        bodyText += `"${q}"\n`;
      });
    }

    if (slide.codeBlock) {
      bodyText += `Code:\n${slide.codeBlock.code}\n`;
    }

    if (bodyText.trim()) {
      requests.push({
        createShape: {
          objectId: bodyShapeId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideObjectId,
            size: {
              width: { magnitude: 650, unit: 'PT' },
              height: { magnitude: 280, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 35,
              translateY: 105,
              unit: 'PT',
            },
          },
        },
      });

      requests.push({
        insertText: {
          objectId: bodyShapeId,
          text: bodyText.trim(),
        },
      });

      requests.push({
        updateTextStyle: {
          objectId: bodyShapeId,
          textRange: { type: 'ALL' },
          style: {
            fontSize: { magnitude: 16, unit: 'PT' },
            foregroundColor: { solidFill: { color: { rgbColor: textRgb } } },
            fontFamily: 'Arial',
          },
          fields: 'fontSize,foregroundColor,fontFamily',
        },
      });
    }
  });

  onProgress?.(60, 'Populating slides in Google Slides REST API...');

  // Execute Batch Update
  await apiFetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ requests }),
  });

  onProgress?.(90, 'Finalizing presentation metadata...');

  const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

  onProgress?.(100, 'Successfully exported presentation!');

  return {
    presentationId,
    presentationUrl,
  };
}
