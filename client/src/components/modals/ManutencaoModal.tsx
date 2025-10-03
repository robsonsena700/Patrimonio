import { useState, useEffect } from "react";
import { useCreateManutencao, useTombamentos } from "@/hooks/usePatrimonio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ImageGallery from "@/components/ImageGallery";

interface ManutencaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: any;
}

export default function ManutencaoModal({ isOpen, onClose, editingItem }: ManutencaoModalProps) {
  const [formData, setFormData] = useState({
    fktombamento: "",
    dataretirada: "",
    motivo: "",
    responsavel: "",
    dataretorno: "",
    observacao: "",
  });

  const { data: tombamentos = [] } = useTombamentos();
  const createManutencao = useCreateManutencao();

  // Filter tombamentos - only alocado or disponivel items can go to maintenance
  const availableTombamentos = tombamentos.filter((t: any) =>
    t.status === "disponivel" || t.status === "alocado"
  );

  useEffect(() => {
    if (editingItem) {
      setFormData({
        fktombamento: editingItem.fktombamento?.toString() || "",
        dataretirada: editingItem.dataretirada ? new Date(editingItem.dataretirada).toISOString().split('T')[0] : "",
        motivo: editingItem.motivo || "",
        responsavel: editingItem.responsavel || "",
        dataretorno: editingItem.dataretorno ? new Date(editingItem.dataretorno).toISOString().split('T')[0] : "",
        observacao: editingItem.observacao || "",
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        fktombamento: "",
        dataretirada: today,
        motivo: "",
        responsavel: "",
        dataretorno: "",
        observacao: "",
      });
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fktombamento || !formData.dataretirada || !formData.motivo) {
      return;
    }

    try {
      const submitData = {
        fktombamento: parseInt(formData.fktombamento),
        dataretirada: new Date(formData.dataretirada),
        motivo: formData.motivo,
        responsavel: formData.responsavel || undefined,
        dataretorno: formData.dataretorno ? new Date(formData.dataretorno) : undefined,
        observacao: formData.observacao || undefined,
      };

      await createManutencao.mutateAsync(submitData);
      onClose();
    } catch (error) {
      console.error("Error saving manutencao:", error);
    }
  };

  const isLoading = createManutencao.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="manutencao-modal">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Manutenção" : "Nova Manutenção"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fktombamento" className="text-sm font-medium text-foreground">
              Item Tombado *
            </Label>
            <Select
              value={formData.fktombamento}
              onValueChange={(value) => setFormData({ ...formData, fktombamento: value })}
              required
            >
              <SelectTrigger data-testid="select-tombamento">
                <SelectValue placeholder="Selecione um item para manutenção" />
              </SelectTrigger>
              <SelectContent>
                {availableTombamentos.map((tombamento: any) => (
                  <SelectItem key={tombamento.pktombamento} value={tombamento.pktombamento.toString()}>
                    {tombamento.tombamento} - {tombamento.produto?.nome || "Produto"}
                    ({tombamento.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataretirada" className="text-sm font-medium text-foreground">
                Data de Retirada *
              </Label>
              <Input
                id="dataretirada"
                type="date"
                value={formData.dataretirada}
                onChange={(e) => setFormData({ ...formData, dataretirada: e.target.value })}
                required
                data-testid="input-data-retirada"
              />
            </div>

            <div>
              <Label htmlFor="dataretorno" className="text-sm font-medium text-foreground">
                Previsão de Retorno
              </Label>
              <Input
                id="dataretorno"
                type="date"
                value={formData.dataretorno}
                onChange={(e) => setFormData({ ...formData, dataretorno: e.target.value })}
                min={formData.dataretirada} // Cannot be before withdrawal date
                data-testid="input-data-retorno"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="motivo" className="text-sm font-medium text-foreground">
              Motivo da Manutenção *
            </Label>
            <Textarea
              id="motivo"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              placeholder="Descreva o motivo da manutenção (defeito, manutenção preventiva, calibração, etc.)"
              rows={3}
              required
              data-testid="textarea-motivo"
            />
          </div>

          <div>
            <Label htmlFor="responsavel" className="text-sm font-medium text-foreground">
              Responsável pela Manutenção
            </Label>
            <Input
              id="responsavel"
              type="text"
              value={formData.responsavel}
              onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
              placeholder="Nome do responsável ou empresa"
              data-testid="input-responsavel"
            />
          </div>

          <div>
            <Label htmlFor="observacao" className="text-sm font-medium text-foreground">
              Observações
            </Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              placeholder="Observações sobre a manutenção..."
              rows={2}
              data-testid="textarea-observacao-manutencao"
            />
          </div>

          {/* Display images if editingItem has associated images */}
          {editingItem && editingItem.imagens && editingItem.imagens.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-foreground">Imagens Associadas</Label>
              <ImageGallery images={editingItem.imagens} />
            </div>
          )}

          {/* Information about maintenance status */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Informações</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• O item será marcado como "Em Manutenção" e ficará indisponível para alocação</li>
              <li>• Se o item estiver alocado, permanecerá na mesma unidade mas com status de manutenção</li>
              <li>• Após o retorno da manutenção, o status voltará para "Disponível"</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.fktombamento || !formData.dataretirada || !formData.motivo}
              data-testid="button-save"
            >
              {isLoading ? "Salvando..." : "Iniciar Manutenção"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}