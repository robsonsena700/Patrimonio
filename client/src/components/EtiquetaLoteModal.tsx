
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Printer, Search, Filter, CheckSquare, Square, QrCode, Download } from "lucide-react";
import { useTombamentos } from "@/hooks/usePatrimonio";
import QRCode from 'qrcode';

interface EtiquetaLoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: any;
}

export default function EtiquetaLoteModal({ isOpen, onClose, empresa }: EtiquetaLoteModalProps) {
  const { data: tombamentos = [], isLoading } = useTombamentos();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [responsavelFilter, setResponsavelFilter] = useState("all");
  const [selectedTombamentos, setSelectedTombamentos] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTombamentos(new Set());
      setSearchTerm("");
      setStatusFilter("all");
      setResponsavelFilter("all");
    }
  }, [isOpen]);

  // Filtered tombamentos
  const filteredTombamentos = useMemo(() => {
    return tombamentos.filter((item: any) => {
      const matchesSearch = !searchTerm.trim() || 
        item.tombamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.produto?.nome?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      const matchesResponsavel = responsavelFilter === "all" || 
        (responsavelFilter === "sem_responsavel" ? !item.responsavel : item.responsavel === responsavelFilter);

      return matchesSearch && matchesStatus && matchesResponsavel;
    });
  }, [tombamentos, searchTerm, statusFilter, responsavelFilter]);

  // Get unique responsaveis for filter
  const responsaveis = useMemo(() => {
    const uniqueResponsaveis = new Set<string>();
    tombamentos.forEach((item: any) => {
      if (item.responsavel) {
        uniqueResponsaveis.add(item.responsavel);
      }
    });
    return Array.from(uniqueResponsaveis).sort();
  }, [tombamentos]);

  const handleSelectAll = () => {
    if (selectedTombamentos.size === filteredTombamentos.length) {
      setSelectedTombamentos(new Set());
    } else {
      const allIds = new Set(filteredTombamentos.map((item: any) => item.pktombamento));
      setSelectedTombamentos(allIds);
    }
  };

  const handleSelectTombamento = (id: number) => {
    const newSelected = new Set(selectedTombamentos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTombamentos(newSelected);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponivel":
        return <Badge className="bg-green-100 text-green-800 text-xs">Disponível</Badge>;
      case "alocado":
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Alocado</Badge>;
      case "manutencao":
        return <Badge className="bg-red-100 text-red-800 text-xs">Manutenção</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  // Função para quebrar texto em linhas
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

    while (lines.length < maxLines) {
      lines.push('');
    }

    return lines.slice(0, maxLines);
  };

  const generateBatchZPL = async () => {
    if (selectedTombamentos.size === 0) {
      alert('Selecione pelo menos um tombamento para gerar as etiquetas.');
      return;
    }

    setIsGenerating(true);

    try {
      const selectedItems = tombamentos.filter((item: any) => 
        selectedTombamentos.has(item.pktombamento)
      );

      let batchZPL = '';
      const baseUrl = window.location.origin;

      for (const tombamento of selectedItems) {
        const tombamentoNum = tombamento.tombamento || 'N/A';
        const descricao = tombamento.produto?.nome || 'Produto não informado';
        const empresaNome = empresa?.mantenedora || 'Nome da empresa não informado';
        const qrUrl = `${baseUrl}/tomb/publico/${tombamento.pktombamento}`;

        // Quebrar texto da descrição em 2 linhas
        const descricaoLinhas = breakTextIntoLines(descricao, 25, 2);
        
        // Quebrar texto da empresa em 2 linhas
        const empresaLinhas = breakTextIntoLines(empresaNome, 20, 2);

        // Código ZPL para cada etiqueta
        const etiquetaZPL = `
^XA

^FX Comentário - Descrição do equipamento
^CF0,30
^FO20,20^FD${descricaoLinhas[0].toUpperCase()}^FS
^FO20,55^FD${descricaoLinhas[1].toUpperCase()}^FS

^FX QR Code para página do tombamento
^FO20,90^BQN,2,2^FDMA,${qrUrl}^FS

^FX Código do tombamento
^CF0,50
^FO120,100^FD${tombamentoNum.toUpperCase()}^FS

^FX Informações da mantenedora
^CFA,15
^FO120,150^FD${empresaLinhas[0].toUpperCase()}^FS
^FO120,175^FD${empresaLinhas[1].toUpperCase()}^FS

^XZ
        `.trim();

        batchZPL += etiquetaZPL + '\n\n';
      }

      // Abrir janela com código ZPL completo
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Etiquetas em Lote - ${selectedItems.length} etiquetas</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                textarea { width: 100%; height: 400px; font-family: monospace; font-size: 11px; }
                button { padding: 10px 20px; margin: 10px 5px 10px 0; background: #007bff; color: white; border: none; cursor: pointer; border-radius: 4px; }
                button:hover { background: #0056b3; }
                .info { background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
                .summary { background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
                .item { background: #f9f9f9; padding: 8px; margin: 5px 0; border-radius: 3px; }
                h3 { color: #333; margin-top: 25px; }
              </style>
            </head>
            <body>
              <h2>🏷️ Etiquetas de Tombamento em Lote</h2>
              
              <div class="summary">
                <h3>📊 Resumo do Lote</h3>
                <p><strong>Total de Etiquetas:</strong> ${selectedItems.length}</p>
                <p><strong>Empresa:</strong> ${empresa?.mantenedora || 'Não informado'}</p>
                <p><strong>Data de Geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              </div>

              <div class="info">
                <strong>📋 Instruções de Impressão:</strong><br>
                1. Copie todo o código ZPL abaixo<br>
                2. Cole no software ZebraDesigner ou envie direto para a impressora<br>
                3. Configure a impressora para etiquetas de 50mm x 25mm<br>
                4. O código contém ${selectedItems.length} etiquetas que serão impressas em sequência<br>
                5. Ajuste a densidade de impressão se necessário
              </div>
              
              <h3>📦 Itens do Lote:</h3>
              ${selectedItems.map((item: any) => `
                <div class="item">
                  <strong>${item.tombamento}</strong> - ${item.produto?.nome || 'Produto não informado'}
                  ${item.serial ? ` (Serial: ${item.serial})` : ''}
                  ${item.responsavel ? ` - ${item.responsavel}` : ''}
                </div>
              `).join('')}
              
              <h3>💻 Código ZPL Completo:</h3>
              <textarea readonly>${batchZPL}</textarea>
              <br>
              <button onclick="navigator.clipboard.writeText(\`${batchZPL.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`).then(() => alert('Código ZPL copiado para a área de transferência!'))">
                📋 Copiar Código ZPL
              </button>
              <button onclick="window.print()">
                🖨️ Imprimir esta Página
              </button>
              <button onclick="downloadZPL()">
                💾 Download ZPL
              </button>

              <script>
                function downloadZPL() {
                  const element = document.createElement('a');
                  const file = new Blob([\`${batchZPL.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = 'etiquetas_lote_${new Date().toISOString().split('T')[0]}_${selectedItems.length}_itens.zpl';
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }

      // Reset selections after generating
      setSelectedTombamentos(new Set());
      
    } catch (error) {
      console.error('Erro ao gerar etiquetas em lote:', error);
      alert('Erro ao gerar etiquetas. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isAllSelected = filteredTombamentos.length > 0 && selectedTombamentos.size === filteredTombamentos.length;
  const isIndeterminate = selectedTombamentos.size > 0 && selectedTombamentos.size < filteredTombamentos.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Impressão de Etiquetas em Lote</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="text-sm font-medium">
                    Buscar
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Tombamento, serial, produto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="alocado">Alocado</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Responsável</Label>
                  <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="sem_responsavel">Sem Responsável</SelectItem>
                      {responsaveis.map((responsavel) => (
                        <SelectItem key={responsavel} value={responsavel}>
                          {responsavel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="text-sm text-muted-foreground">
                    {selectedTombamentos.size} de {filteredTombamentos.length} selecionados
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-full overflow-hidden">
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isIndeterminate;
                          }}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Tombamento</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Responsável</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTombamentos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {isLoading ? "Carregando..." : "Nenhum tombamento encontrado"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTombamentos.map((item: any) => (
                        <TableRow
                          key={item.pktombamento}
                          className={selectedTombamentos.has(item.pktombamento) ? "bg-accent/20" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedTombamentos.has(item.pktombamento)}
                              onCheckedChange={() => handleSelectTombamento(item.pktombamento)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{item.tombamento}</TableCell>
                          <TableCell>{item.produto?.nome || "Produto não encontrado"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.serial || "Não informado"}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-sm">
                            {item.responsavel || "Sem responsável"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Informações do lote */}
          {selectedTombamentos.size > 0 && (
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p><strong>Lote selecionado:</strong> {selectedTombamentos.size} etiquetas</p>
                  <p className="text-xs mt-1">As etiquetas serão geradas no formato ZPL em sequência</p>
                </div>
                <div className="text-2xl">🏷️</div>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Total: {filteredTombamentos.length} tombamentos • {selectedTombamentos.size} selecionados
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={generateBatchZPL} 
              disabled={isGenerating || selectedTombamentos.size === 0}
              className="flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>
                {isGenerating 
                  ? 'Gerando...' 
                  : `Gerar ${selectedTombamentos.size} Etiquetas`
                }
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
