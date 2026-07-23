
/**
 * Padrão UMADEMATS - Utilitários para o HERO
 */

/**
 * Converte links de compartilhamento do Google Drive em links diretos de imagem
 * Suporta:
 * - drive.google.com/file/d/ID/view
 * - drive.google.com/uc?id=ID
 * - drive.google.com/open?id=ID
 */
export const getDirectDriveUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (!url.includes('drive.google.com')) return url;

  try {
    let fileId = '';
    
    if (url.includes('/file/d/')) {
      fileId = url.split('/file/d/')[1].split('/')[0].split('?')[0];
    } else if (url.includes('id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    }

    if (fileId) {
      // Usar o novo endpoint do Google Drive que é mais confiável para imagens
      // Adicionando =s4000 para garantir alta resolução (ou s0 para original)
      return `https://lh3.googleusercontent.com/d/${fileId}=s4000`;
    }
  } catch (e) {
    console.error('Erro ao converter URL do Drive:', e);
  }

  return url;
};

/**
 * Verifica se uma determinada URL aponta para um recurso de vídeo
 */
export const isVideoUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  const cleanUrl = lower.split('?')[0];
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v') ||
    lower.includes('/video/upload/') ||
    lower.includes('video/mp4') ||
    lower.includes('format=mp4') ||
    lower.includes('.mp4?') ||
    lower.includes('.webm?') ||
    lower.includes('.mov?')
  );
};
