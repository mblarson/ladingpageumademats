/**
 * Padrão UMADEMATS - Otimização e Compressão Pré-Upload via HTML Canvas
 * 
 * Redimensiona a imagem preservando aspect ratio:
 * - Imagens Horizontais / Desktop: máximo de 1920px de largura e 1080px de altura
 * - Imagens Verticais / Mobile: máximo de 1080px de largura e 1920px de altura
 * Exporta em formato WebP ('image/webp') com qualidade 0.7 (reduz até 80-90% o peso no banco de dados)
 */

export interface CompressImageOptions {
  isVertical?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface CompressImageResult {
  base64: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  reductionPercentage: number;
  format: string;
}

export const formatByteSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Comprime uma imagem File/Blob usando a Canvas API do navegador para WebP
 */
export const compressImageToWebp = async (
  file: File | Blob,
  options: CompressImageOptions = {}
): Promise<CompressImageResult> => {
  const quality = options.quality !== undefined ? options.quality : 0.7;
  const isVertical = options.isVertical ?? false;
  
  // Limites máximos estipulados
  const maxW = options.maxWidth || (isVertical ? 1080 : 1920);
  const maxH = options.maxHeight || (isVertical ? 1920 : 1080);

  return new Promise((resolve, reject) => {
    // 1. Carregar via FileReader ou Object URL
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo para compressão.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao decodificar arquivo de imagem.'));
      img.onload = () => {
        try {
          const naturalW = img.naturalWidth || img.width;
          const naturalH = img.naturalHeight || img.height;

          // Se não foi forçado isVertical, detecta automaticamente pela orientação original
          const autoVertical = isVertical || naturalH > naturalW;
          const targetLimitW = options.maxWidth || (autoVertical ? 1080 : 1920);
          const targetLimitH = options.maxHeight || (autoVertical ? 1920 : 1080);

          // 2. Calcular dimensões proporcionais
          let targetW = naturalW;
          let targetH = naturalH;

          if (targetW > targetLimitW || targetH > targetLimitH) {
            const ratio = Math.min(targetLimitW / naturalW, targetLimitH / naturalH);
            targetW = Math.max(1, Math.round(naturalW * ratio));
            targetH = Math.max(1, Math.round(naturalH * ratio));
          }

          // 3. Renderizar no Canvas com suavização de alta fidelidade
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d', { alpha: true });
          if (!ctx) {
            throw new Error('Falha ao inicializar contexto 2D do Canvas.');
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetW, targetH);

          // 4. Exportar para image/webp qualidade 0.7
          let format = 'image/webp';
          let base64 = canvas.toDataURL(format, quality);

          // Fallback caso o navegador retorne PNG por não suportar WebP
          if (!base64.startsWith('data:image/webp')) {
            format = 'image/jpeg';
            base64 = canvas.toDataURL(format, quality);
          }

          const originalBytes = file.size;
          // Cálculo aproximado de bytes do base64 (removendo prefixo data:image/...)
          const commaIndex = base64.indexOf(',');
          const rawBase64Length = commaIndex >= 0 ? base64.length - (commaIndex + 1) : base64.length;
          const compressedBytes = Math.round((rawBase64Length * 3) / 4);

          const reductionPercentage = originalBytes > 0
            ? Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100))
            : 0;

          resolve({
            base64,
            originalBytes,
            compressedBytes,
            width: targetW,
            height: targetH,
            reductionPercentage,
            format,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
};
