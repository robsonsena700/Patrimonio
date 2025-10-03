import { useState } from "react";
import { useTransferencias } from "@/hooks/usePatrimonio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TransferenciaModal from "@/components/modals/TransferenciaModal";
import { Plus, Search, Eye, Printer, ArrowRightLeft } from "lucide-react";

export default function Transferencia() {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("30");

  const { data: transferencias = [], isLoading } = useTransferencias();

  const filteredTransferencias = transferencias.filter((item: any) => {
    const matchesSearch = 
      (item.tombamento?.tombamento && item.tombamento.tombamento.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tombamento?.produto?.nome && item.tombamento.produto.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.unidade_origem?.nome && item.unidade_origem.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.unidade_destino?.nome && item.unidade_destino.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by period (last X days)
    const days = parseInt(periodFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const transferDate = new Date(item.datatasnferencia);
    const matchesPeriod = transferDate >= cutoffDate;
    
    return matchesSearch && matchesPeriod;
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  // Calculate transfer flow statistics
  const transferStats = {
    totalTransfers: transferencias.length,
    lastMonth: transferencias.filter((t: any) => {
      const date = new Date(t.datatasnferencia);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return date >= lastMonth;
    }).length
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Transferências de Bens</h2>
            <p className="text-muted-foreground">Carregando transferências...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="transferencia-page">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Transferências de Bens</h2>
            <p className="text-muted-foreground">Movimentação de itens entre unidades e setores</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2"
            data-testid="button-new-transferencia"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Transferência</span>
          </Button>
        </div>

        {/* Transfer Flow Visualization */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Fluxo de Transferências (Últimos 30 dias)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">Total Transferências</p>
                <p className="text-2xl font-bold text-primary" data-testid="total-transfers">
                  {transferStats.totalTransfers}
                </p>
                <p className="text-xs text-muted-foreground">histórico completo</p>
              </div>
              
              <div className="flex items-center justify-center">
                <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">Último Mês</p>
                <p className="text-2xl font-bold text-accent" data-testid="monthly-transfers">
                  {transferStats.lastMonth}
                </p>
                <p className="text-xs text-muted-foreground">transferências</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Transferências</CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 3 meses</SelectItem>
                    <SelectItem value="365">Este ano</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar transferência..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-48"
                    data-testid="search-transferencias"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransferencias.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || periodFilter !== "30" ? "Nenhuma transferência encontrada" : "Nenhuma transferência cadastrada"}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTransferencias.map((item: any) => (
                  <Card key={item.pktransferencia} data-testid={`transferencia-row-${item.pktransferencia}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* First line: Tombamento and date */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-foreground">
                            {item.tombamento?.tombamento || "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.datatasnferencia).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        
                        {/* Second line: Product and responsible */}
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground">
                            {item.tombamento?.produto?.nome || "Produto não encontrado"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Responsável: {item.responsavel || "Não informado"}
                          </div>
                        </div>
                        
                        {/* Transfer info and actions */}
                        <div className="space-y-2 pt-2 border-t border-border">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>De: {item.unidade_origem?.nome || "Não informado"}</span>
                            <span>Para: {item.unidade_destino?.nome || "Não informado"}</span>
                          </div>
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Ver detalhes"
                              data-testid={`button-view-${item.pktransferencia}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Imprimir termo"
                              data-testid={`button-print-${item.pktransferencia}`}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <TransferenciaModal
          isOpen={showModal}
          onClose={handleCloseModal}
          editingItem={editingItem}
        />
      )}
    </div>
  );
}
