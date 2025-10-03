import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, QrCode, ZoomIn, ZoomOut } from "lucide-react";
import QRCode from 'qrcode';

interface EtiquetaImpressaoProps {
  tombamento: any;
  empresa: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function EtiquetaImpressao({ tombamento, empresa, isOpen, onClose }: EtiquetaImpressaoProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(2); // 2x zoom inicial

  const baseUrl = window.location.origin;
  const qrUrl = `${baseUrl}/tomb/publico/${tombamento.pktombamento}`;

  useEffect(() => {
    if (isOpen && tombamento) {
      generateQRCodeForPreview();
    }
  }, [isOpen, tombamento]);

  const generateQRCodeForPreview = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 128, // Tamanho maior para melhor qualidade
        margin: 2,
        errorCorrectionLevel: 'M', // Nível médio para melhor legibilidade
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        rendererOpts: {
          quality: 1
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code for preview:', error);
    }
  };

  // Função para quebrar texto em linhas respeitando o limite de caracteres
  const breakTextIntoLines = (text: string, maxLength: number, maxLines: number = 2): string[] => {
    if (!text) return [''];
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxLength) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Palavra muito longa, corta
          lines.push(word.substring(0, maxLength));
          currentLine = '';
        }
        
        if (lines.length >= maxLines) {
          break;
        }
      }
    }
    
    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }

    // Garante que sempre retorna o número exato de linhas
    while (lines.length < maxLines) {
      lines.push('');
    }

    return lines.slice(0, maxLines);
  };

  const generateZPL = async () => {
    setIsGenerating(true);

    try {
      // Dados para a etiqueta
      const tombamentoNum = tombamento.tombamento || 'N/A';
      const descricao = tombamento.produto?.nome || 'Produto não informado';
      const empresaNome = empresa?.mantenedora || 'Nome da empresa não informado';

      // Quebrar texto da descrição em 2 linhas (máximo 25 caracteres por linha)
      const descricaoLinhas = breakTextIntoLines(descricao, 25, 2);
      
      // Quebrar texto da empresa em 2 linhas (máximo 20 caracteres por linha)
      const empresaLinhas = breakTextIntoLines(empresaNome, 20, 2);

      // Código ZPL baseado no formato fornecido
      // Etiqueta 50mm x 25mm (400 x 200 dots a 8 dots/mm)
      const zplCode = `
^XA

^FX Comentário - Descrição do equipamento
^CF0,30
^FO15,15^FD${descricaoLinhas[0].toUpperCase()}^FS
^FO15,50^FD${descricaoLinhas[1].toUpperCase()}^FS

^FX QR Code para página do tombamento
^FO15,80^BQ,2,2^FD${qrUrl}^FS

^FX Código do tombamento
^CF0,50
^FO130,100^FD${tombamentoNum.toUpperCase()}^FS

^FX Informações da mantenedora
^CFA,15
^FO130,150^FD${empresaLinhas[0].toUpperCase()}^FS
^FO130,175^FD${empresaLinhas[1].toUpperCase()}^FS

^XZ
      `.trim();

      // Enviar para impressora
      await printZPL(zplCode);

    } catch (error) {
      console.error('Erro ao gerar etiqueta:', error);
      alert('Erro ao gerar etiqueta. Verifique se a impressora está conectada.');
    } finally {
      setIsGenerating(false);
    }
  };

  const printZPL = async (zplCode: string) => {
    try {
      // Tentar imprimir via USB (requer driver da Zebra ou software ZebraDesigner)
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Imprimir Etiqueta ZPL</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                textarea { width: 100%; height: 300px; font-family: monospace; font-size: 12px; }
                button { padding: 10px 20px; margin: 10px 0; background: #007bff; color: white; border: none; cursor: pointer; }
                button:hover { background: #0056b3; }
                .info { background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
              </style>
            </head>
            <body>
              <h2>Código ZPL para Impressora Zebra</h2>
              <div class="info">
                <strong>Instruções:</strong><br>
                1. Copie o código ZPL abaixo<br>
                2. Cole no software ZebraDesigner ou envie direto para a impressora<br>
                3. Configure a impressora para etiquetas de 50mm x 25mm<br>
                4. Ajuste a densidade de impressão se necessário
              </div>
              
              <h3>Dados da Etiqueta:</h3>
              <p><strong>Tombamento:</strong> ${tombamento.tombamento}</p>
              <p><strong>Produto:</strong> ${tombamento.produto?.nome || 'Não informado'}</p>
              <p><strong>Empresa:</strong> ${empresa?.mantenedora || 'Não informado'}</p>
              <p><strong>URL QR Code:</strong> ${qrUrl}</p>
              
              <h3>Código ZPL:</h3>
              <textarea readonly>${zplCode}</textarea>
              <br>
              <button onclick="navigator.clipboard.writeText(\`${zplCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`).then(() => alert('Código ZPL copiado para a área de transferência!'))">
                📋 Copiar Código ZPL
              </button>
              <button onclick="window.print()">
                🖨️ Imprimir esta Página
              </button>
            </body>
          </html>
        `);
        printWindow.document.close();
      }

    } catch (error) {
      console.error('Erro ao imprimir:', error);
      alert('Erro ao imprimir. Verifique se o driver da impressora está instalado e se ela está conectada.');
    }
  };

  const previewEtiquetaReal = () => {
    const descricao = tombamento.produto?.nome || 'Produto não informado';
    const empresaNome = empresa?.mantenedora || 'Nome da empresa não informado';
    
    // Quebrar texto para preview
    const descricaoLinhas = breakTextIntoLines(descricao, 25, 2);
    const empresaLinhas = breakTextIntoLines(empresaNome, 20, 2);

    // Dimensões base da etiqueta (50mm x 25mm)
    const baseWidth = 200;
    const baseHeight = 100;

    return (
      <div 
        className="border-2 border-gray-800 bg-white relative mx-auto"
        style={{ 
          width: `${baseWidth * zoomLevel}px`, 
          height: `${baseHeight * zoomLevel}px`,
          fontSize: `${zoomLevel}px`
        }}
      >
        {/* Conteúdo da etiqueta */}
        <div className="absolute inset-0 p-1">
          {/* Linhas 1 e 2 - Descrição do bem */}
          <div 
            className="text-black font-bold leading-tight mb-1" 
            style={{ 
              fontSize: `${6 * zoomLevel}px`, 
              lineHeight: `${7 * zoomLevel}px` 
            }}
          >
            <div className="truncate">{descricaoLinhas[0].toUpperCase()}</div>
            <div className="truncate">{descricaoLinhas[1].toUpperCase()}</div>
          </div>

          {/* Layout principal - QR Code e informações lado a lado */}
          <div className="flex items-start gap-1">
            {/* QR Code - lado esquerdo */}
            <div className="flex-shrink-0">
              {qrCodeDataUrl && (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  className="border border-gray-300"
                  style={{ 
                    width: `${32 * zoomLevel}px`, 
                    height: `${32 * zoomLevel}px`,
                    imageRendering: 'pixelated'
                  }}
                />
              )}
            </div>

            {/* Informações ao lado do QR Code */}
            <div className="flex-1 min-w-0">
              {/* Linha 3 - Código do tombamento */}
              <div 
                className="font-black text-black leading-none mb-1 truncate" 
                style={{ 
                  fontSize: `${12 * zoomLevel}px`, 
                  lineHeight: `${12 * zoomLevel}px` 
                }}
              >
                {tombamento.tombamento}
              </div>
              
              {/* Linhas 4 e 5 - Mantenedora */}
              <div 
                className="text-black leading-tight" 
                style={{ 
                  fontSize: `${5 * zoomLevel}px`, 
                  lineHeight: `${6 * zoomLevel}px` 
                }}
              >
                <div className="font-semibold truncate">{empresaLinhas[0].toUpperCase()}</div>
                <div className="font-semibold truncate">{empresaLinhas[1].toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleZoomIn = () => {
    if (zoomLevel < 6) setZoomLevel(zoomLevel + 0.5);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) setZoomLevel(zoomLevel - 0.5);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Imprimir Etiqueta de Tombamento</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Preview Real da Etiqueta (50mm x 25mm)</h4>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  className="px-2 py-1"
                >
                  <ZoomOut className="w-3 h-3" />
                </Button>
                <span className="text-xs font-medium min-w-[40px] text-center">
                  {zoomLevel}x
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 6}
                  className="px-2 py-1"
                >
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-100 p-6 rounded overflow-auto max-h-96 flex items-center justify-center">
              {previewEtiquetaReal()}
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              Preview da etiqueta (50mm x 25mm) - Zoom {zoomLevel}x - Use o zoom para testar a legibilidade do QR Code
            </p>
          </div>

          <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
            <div><strong>Tombamento:</strong> {tombamento.tombamento}</div>
            <div><strong>Produto:</strong> {tombamento.produto?.nome || 'Não informado'}</div>
            <div><strong>Empresa:</strong> {empresa?.mantenedora || 'Não informado'}</div>
            <div><strong>QR Code URL:</strong> {qrUrl}</div>
          </div>

          <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
            <p><strong>Informações importantes:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>A etiqueta será gerada no formato ZPL para impressoras Zebra</li>
              <li>Configure sua impressora para etiquetas de 50mm x 25mm</li>
              <li>O QR Code permitirá consulta pública do tombamento</li>
              <li>Textos longos serão automaticamente quebrados em linhas</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={generateZPL} 
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isGenerating ? 'Gerando...' : 'Gerar Etiqueta ZPL'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}