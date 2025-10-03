
import { useHistoricoMovimentacao } from "@/hooks/usePatrimonio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, FileText, ArrowRightLeft } from "lucide-react";

interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fktombamento: number;
  tombamento?: string;
}

export default function HistoricoModal({ isOpen, onClose, fktombamento, tombamento }: HistoricoModalProps) {
  const { data: historico = [], isLoading } = useHistoricoMovimentacao(fktombamento);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Histórico de Movimentação - {tombamento}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma movimentação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historico.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.tipo === 'alocacao' ? (
                        <MapPin className="w-4 h-4 text-primary" />
                      ) : (
                        <ArrowRightLeft className="w-4 h-4 text-accent" />
                      )}
                      <Badge variant={item.tipo === 'alocacao' ? 'default' : 'secondary'}>
                        {item.tipo === 'alocacao' ? 'Alocação' : 'Transferência'}
                      </Badge>
                      {!item.ativo && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(item.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Local:</p>
                      <p className="text-muted-foreground">{item.unidade}</p>
                      {item.setor && (
                        <p className="text-muted-foreground">Setor: {item.setor}</p>
                      )}
                    </div>
                    
                    {item.responsavel && (
                      <div>
                        <p className="font-medium text-foreground flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>Responsável:</span>
                        </p>
                        <p className="text-muted-foreground">{item.responsavel}</p>
                      </div>
                    )}
                  </div>
                  
                  {item.termo && (
                    <div>
                      <p className="font-medium text-foreground">Observações:</p>
                      <p className="text-muted-foreground text-sm">{item.termo}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
