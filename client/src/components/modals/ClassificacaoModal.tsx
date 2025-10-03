import { useState, useEffect } from "react";
import { useCreateClassificacao, useUpdateClassificacao } from "@/hooks/usePatrimonio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ClassificacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: any;
}

export default function ClassificacaoModal({ isOpen, onClose, editingItem }: ClassificacaoModalProps) {
  const [formData, setFormData] = useState({
    classificacao: "",
    ativo: true,
  });

  const createClassificacao = useCreateClassificacao();
  const updateClassificacao = useUpdateClassificacao();

  useEffect(() => {
    if (editingItem) {
      setFormData({
        classificacao: editingItem.classificacao || "",
        ativo: editingItem.ativo ?? true,
      });
    } else {
      setFormData({
        classificacao: "",
        ativo: true,
      });
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.classificacao.trim()) {
      return;
    }

    try {
      if (editingItem) {
        await updateClassificacao.mutateAsync({
          id: editingItem.pkclassificacao,
          data: formData,
        });
      } else {
        await createClassificacao.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving classificacao:", error);
    }
  };

  const isLoading = createClassificacao.isPending || updateClassificacao.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="classificacao-modal">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Classificação" : "Nova Classificação"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="classificacao" className="text-sm font-medium text-foreground">
              Nome da Classificação
            </Label>
            <Input
              id="classificacao"
              type="text"
              value={formData.classificacao}
              onChange={(e) => setFormData({ ...formData, classificacao: e.target.value })}
              placeholder="Ex: Equipamentos Médicos"
              required
              data-testid="input-classificacao"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: !!checked })}
              data-testid="checkbox-ativo"
            />
            <Label htmlFor="ativo" className="text-sm text-foreground">
              Classificação ativa
            </Label>
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
              disabled={isLoading || !formData.classificacao.trim()}
              data-testid="button-save"
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
