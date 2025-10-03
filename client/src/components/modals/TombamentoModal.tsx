import { useState, useEffect, useMemo } from "react";
import { useCreateTombamento, useUpdateTombamento, useProdutos } from "@/hooks/usePatrimonio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Upload, X } from "lucide-react";
import ImageGallery from "@/components/ImageGallery";

interface TombamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: any;
}

export default function TombamentoModal({ isOpen, onClose, editingItem }: TombamentoModalProps) {
  const [formData, setFormData] = useState({
    fkproduto: "",
    tombamento: "",
    serial: "",
    responsavel: "",
    status: "disponivel",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [searchProduto, setSearchProduto] = useState("");

  const { data: produtos = [] } = useProdutos();

  // Filter products based on search
  const filteredProdutos = useMemo(() => {
    if (!searchProduto.trim()) return produtos;
    return produtos.filter((produto: any) =>
      produto.produto?.toLowerCase().includes(searchProduto.toLowerCase())
    );
  }, [produtos, searchProduto]);
  const createTombamento = useCreateTombamento();
  const updateTombamento = useUpdateTombamento();

  useEffect(() => {
    if (editingItem) {
      setFormData({
        fkproduto: editingItem.fkproduto?.toString() || "",
        tombamento: editingItem.tombamento || "",
        serial: editingItem.serial || "",
        responsavel: editingItem.responsavel || "",
        status: editingItem.status || "disponivel",
      });
      // Handle existing photos if needed
    } else {
      setFormData({
        fkproduto: "",
        tombamento: "",
        serial: "",
        responsavel: "",
        status: "disponivel",
      });
    }
  }, [editingItem]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the removed URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fkproduto || !formData.tombamento) {
      return;
    }

    try {
      const submitFormData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitFormData.append(key, value);
        }
      });

      selectedFiles.forEach(file => {
        submitFormData.append('photos', file);
      });

      if (editingItem) {
        await updateTombamento.mutateAsync({ id: editingItem.pktombamento, formData: submitFormData });
      } else {
        await createTombamento.mutateAsync(submitFormData);
      }
      onClose();
      
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error saving tombamento:", error);
    }
  };

  const isLoading = createTombamento.isPending || updateTombamento.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="tombamento-modal">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Tombamento" : "Novo Tombamento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fkproduto" className="text-sm font-medium text-foreground">
                Produto *
              </Label>
              <Select
                value={formData.fkproduto}
                onValueChange={(value) => setFormData({ ...formData, fkproduto: value })}
                required
              >
                <SelectTrigger data-testid="select-produto">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <div className="sticky top-0 bg-background p-2 border-b">
                    <SearchInput
                      value={searchProduto}
                      onChange={setSearchProduto}
                      placeholder="Pesquisar produto..."
                      data-testid="search-produto"
                      className="h-8"
                    />
                  </div>
                  {filteredProdutos.length > 0 ? (
                    filteredProdutos.map((produto: any) => (
                      <SelectItem key={produto.pkproduto} value={produto.pkproduto.toString()}>
                        {produto.produto}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      {searchProduto ? "Nenhum produto encontrado" : "Carregando produtos..."}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tombamento" className="text-sm font-medium text-foreground">
                Número de Tombamento *
              </Label>
              <Input
                id="tombamento"
                type="text"
                value={formData.tombamento}
                onChange={(e) => setFormData({ ...formData, tombamento: e.target.value })}
                placeholder="Ex: TB-001234"
                required
                data-testid="input-tombamento"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serial" className="text-sm font-medium text-foreground">
                Número Serial
              </Label>
              <Input
                id="serial"
                type="text"
                value={formData.serial}
                onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                placeholder="Ex: LG24MK430H-B"
                data-testid="input-serial"
              />
            </div>
            
            <div>
              <Label htmlFor="responsavel" className="text-sm font-medium text-foreground">
                Responsável
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
          </div>

          <div>
            <Label htmlFor="status" className="text-sm font-medium text-foreground">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="alocado">Alocado</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Fotos do Item
            </Label>

            {/* Show existing photos when editing */}
            {editingItem?.photos && (
              <div className="mb-4">
                <ImageGallery 
                  photos={editingItem.photos} 
                  title="Fotos Existentes"
                  className="space-y-2"
                />
              </div>
            )}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
                data-testid="file-input"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary hover:text-primary/80">Clique para fazer upload</span> ou arraste as fotos aqui
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP até 10MB cada</p>
              </label>
            </div>

            {/* Photo Previews */}
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => removeFile(index)}
                      data-testid={`remove-photo-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={isLoading || !formData.fkproduto || !formData.tombamento}
              data-testid="button-save"
            >
              {isLoading ? "Salvando..." : editingItem ? "Atualizar Tombamento" : "Criar Tombamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
