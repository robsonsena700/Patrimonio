import { useState, useEffect } from "react";
import { useCreateTransferencia, useAlocacoes, useUnidadesSaude, useSetores } from "@/hooks/usePatrimonio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageGallery from "@/components/ImageGallery";

interface TransferenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: any;
}

export default function TransferenciaModal({ isOpen, onClose, editingItem }: TransferenciaModalProps) {
  const [formData, setFormData] = useState({
    fktombamento: "",
    fkunidadesaude_origem: "",
    fkunidadesaude_destino: "",
    fksetor_origem: "",
    fksetor_destino: "",
    responsavel_destino: "",
    datatasnferencia: "",
    responsavel: "",
    observacao: "", // Added observacao field
  });

  const { data: alocacoes = [] } = useAlocacoes();
  const { data: unidades = [] } = useUnidadesSaude();
  const { data: setores = [] } = useSetores();
  const createTransferencia = useCreateTransferencia();

  useEffect(() => {
    if (editingItem) {
      setFormData({
        fktombamento: editingItem.fktombamento?.toString() || "",
        fkunidadesaude_origem: editingItem.fkunidadesaude_origem?.toString() || "",
        fkunidadesaude_destino: editingItem.fkunidadesaude_destino?.toString() || "",
        fksetor_origem: editingItem.fksetor_origem?.toString() || "",
        fksetor_destino: editingItem.fksetor_destino || "",
        responsavel_destino: editingItem.responsavel_destino || "",
        datatasnferencia: editingItem.datatasnferencia ? new Date(editingItem.datatasnferencia).toISOString().split('T')[0] : "",
        responsavel: editingItem.responsavel || "",
        observacao: editingItem.observacao || "", // Initialize observacao if editing
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        fktombamento: "",
        fkunidadesaude_origem: "",
        fkunidadesaude_destino: "",
        fksetor_origem: "",
        fksetor_destino: "",
        responsavel_destino: "",
        datatasnferencia: today,
        responsavel: "",
        observacao: "", // Initialize observacao for new transfer
      });
    }
  }, [editingItem]);

  // When tombamento is selected, auto-fill origem data
  const handleTombamentoChange = (value: string) => {
    setFormData(prev => ({ ...prev, fktombamento: value }));

    const selectedAlocacao = alocacoes.find((a: any) => a.fktombamento.toString() === value);
    if (selectedAlocacao) {
      setFormData(prev => ({
        ...prev,
        fkunidadesaude_origem: selectedAlocacao.fkunidadesaude?.toString() || "",
        fksetor_origem: selectedAlocacao.fksetor?.toString() || "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fktombamento || !formData.fkunidadesaude_destino || !formData.datatasnferencia) {
      return;
    }

    // Validate that origem and destino are different
    if (formData.fkunidadesaude_origem === formData.fkunidadesaude_destino) {
      alert("A unidade de origem deve ser diferente da unidade de destino.");
      return;
    }

    try {
      const submitData = {
        ...formData,
        fktombamento: parseInt(formData.fktombamento),
        fkunidadesaude_origem: formData.fkunidadesaude_origem ? parseInt(formData.fkunidadesaude_origem) : undefined,
        fkunidadesaude_destino: parseInt(formData.fkunidadesaude_destino),
        fksetor_origem: formData.fksetor_origem ? parseInt(formData.fksetor_origem) : undefined,
        datatasnferencia: formData.datatasnferencia,
      };

      await createTransferencia.mutateAsync(submitData);
      onClose();
    } catch (error) {
      console.error("Error saving transferencia:", error);
    }
  };

  const isLoading = createTransferencia.isPending;

  // Get the selected origem info for display
  const selectedTombamento = alocacoes.find((a: any) => a.fktombamento.toString() === formData.fktombamento);
  const origemUnidade = unidades.find((u: any) => u.pkunidadesaude.toString() === formData.fkunidadesaude_origem);
  const origemSetor = setores.find((s: any) => s.pksetor.toString() === formData.fksetor_origem);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="transferencia-modal">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Transferência" : "Nova Transferência"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fktombamento" className="text-sm font-medium text-foreground">
              Item Tombado *
            </Label>
            <Select
              value={formData.fktombamento}
              onValueChange={handleTombamentoChange}
              required
            >
              <SelectTrigger data-testid="select-tombamento">
                <SelectValue placeholder="Selecione um item para transferir" />
              </SelectTrigger>
              <SelectContent>
                {alocacoes.map((alocacao: any) => (
                  <SelectItem key={alocacao.pkalocacao} value={alocacao.fktombamento.toString()}>
                    {alocacao.tombamento?.tombamento} - {alocacao.tombamento?.produto?.nome}
                    ({alocacao.unidadesaude?.nome})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Origem Information Display */}
          {selectedTombamento && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Localização Atual (Origem)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Unidade: </span>
                  <span className="text-foreground">{origemUnidade?.unidadesaude || origemUnidade?.nome || "Não informado"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Setor: </span>
                  <span className="text-foreground">{origemSetor?.setor || origemSetor?.nome || "Não informado"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Image Gallery for the item being transferred */}
          {formData.fktombamento && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-foreground mb-2">Imagens do Item</Label>
              <ImageGallery itemId={parseInt(formData.fktombamento)} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fkunidadesaude_destino" className="text-sm font-medium text-foreground">
                Unidade de Destino *
              </Label>
              <Select
                value={formData.fkunidadesaude_destino}
                onValueChange={(value) => setFormData({ ...formData, fkunidadesaude_destino: value })}
                required
              >
                <SelectTrigger data-testid="select-unidade-destino">
                  <SelectValue placeholder="Selecione a unidade de destino" />
                </SelectTrigger>
                <SelectContent>
                  {unidades
                    .filter((u: any) => u.pkunidadesaude.toString() !== formData.fkunidadesaude_origem)
                    .map((unidade: any) => (
                    <SelectItem key={unidade.pkunidadesaude} value={unidade.pkunidadesaude.toString()}>
                      {unidade.unidadesaude || unidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fksetor_destino" className="text-sm font-medium text-foreground">
                Setor de Destino
              </Label>
              <Select
                value={formData.fksetor_destino}
                onValueChange={(value) => setFormData({ ...formData, fksetor_destino: value })}
              >
                <SelectTrigger data-testid="select-setor-destino">
                  <SelectValue placeholder="Selecione o setor (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((setor: any) => (
                    <SelectItem key={setor.pksetor} value={setor.pksetor.toString()}>
                      {setor.setor || setor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsavel_destino" className="text-sm font-medium text-foreground">
                Responsável no Destino
              </Label>
              <Input
                id="responsavel_destino"
                type="text"
                value={formData.responsavel_destino}
                onChange={(e) => setFormData({ ...formData, responsavel_destino: e.target.value })}
                placeholder="Nome do responsável"
                data-testid="input-responsavel-destino"
              />
            </div>

            <div>
              <Label htmlFor="datatasnferencia" className="text-sm font-medium text-foreground">
                Data da Transferência *
              </Label>
              <Input
                id="datatasnferencia"
                type="date"
                value={formData.datatasnferencia}
                onChange={(e) => setFormData({ ...formData, datatasnferencia: e.target.value })}
                required
                data-testid="input-data-transferencia"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="responsavel" className="text-sm font-medium text-foreground">
              Responsável pela Transferência
            </Label>
            <Input
              id="responsavel"
              type="text"
              value={formData.responsavel}
              onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
              placeholder="Nome do responsável"
              data-testid="input-responsavel"
            />
          </div>

          <div>
            <Label htmlFor="observacao" className="text-sm font-medium text-foreground">
              Observações
            </Label>
            <textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              placeholder="Observações sobre a transferência..."
              rows={2}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="textarea-observacao"
            />
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
              disabled={isLoading || !formData.fktombamento || !formData.fkunidadesaude_destino || !formData.datatasnferencia}
              data-testid="button-save"
            >
              {isLoading ? "Salvando..." : "Criar Transferência"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}