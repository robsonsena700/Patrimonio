
import { useState, useMemo } from "react";
import { useClassificacoes, useCreateClassificacao, useUpdateClassificacao, useDeleteClassificacao } from "@/hooks/usePatrimonio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, ArrowLeft } from "lucide-react";

export default function Classificacoes() {
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    classificacao: "",
    ativo: true,
  });

  const { data: classificacoes = [], isLoading } = useClassificacoes();
  const createClassificacao = useCreateClassificacao();
  const updateClassificacao = useUpdateClassificacao();
  const deleteClassificacao = useDeleteClassificacao();

  const filteredClassificacoes = useMemo(() => {
    if (!searchTerm.trim()) return classificacoes;
    return classificacoes.filter((item: any) =>
      item.classificacao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classificacoes, searchTerm]);

  const handleNewClassificacao = () => {
    setEditingItem(null);
    setFormData({
      classificacao: "",
      ativo: true,
    });
    setViewMode("form");
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      classificacao: item.classificacao || "",
      ativo: item.ativo ?? true,
    });
    setViewMode("form");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setEditingItem(null);
    setFormData({
      classificacao: "",
      ativo: true,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta classificação?")) {
      deleteClassificacao.mutate(id);
    }
  };

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
      handleBackToList();
    } catch (error) {
      console.error("Error saving classificacao:", error);
    }
  };

  const isLoadingForm = createClassificacao.isPending || updateClassificacao.isPending;

  if (viewMode === "form") {
    return (
      <div className="p-6" data-testid="classificacao-form">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToList}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {editingItem ? "Editar Classificação" : "Nova Classificação"}
                </h2>
                <p className="text-muted-foreground">
                  {editingItem ? "Edite as informações da classificação" : "Cadastre uma nova classificação de patrimônio"}
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="classificacao" className="text-sm font-medium text-foreground">
                    Nome da Classificação *
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
                    onClick={handleBackToList}
                    disabled={isLoadingForm}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoadingForm || !formData.classificacao.trim()}
                    data-testid="button-save"
                  >
                    {isLoadingForm ? "Salvando..." : editingItem ? "Atualizar Classificação" : "Criar Classificação"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Classificações de Bens</h2>
            <p className="text-muted-foreground">Carregando classificações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="classificacoes-page">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Classificações de Bens</h2>
            <p className="text-muted-foreground">Gerencie as categorias de classificação do patrimônio</p>
          </div>
          <Button
            onClick={handleNewClassificacao}
            className="flex items-center space-x-2"
            data-testid="button-new-classification"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Classificação</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Classificações</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar classificações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="search-classifications"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredClassificacoes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Nenhuma classificação encontrada" : "Nenhuma classificação cadastrada"}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClassificacoes.map((item: any) => (
                  <Card key={item.pkclassificacao} data-testid={`classification-row-${item.pkclassificacao}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* First line: Classification name and status */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-foreground">{item.classificacao}</div>
                          <Badge variant={item.ativo ? "default" : "secondary"}>
                            {item.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        
                        {/* Second line: ID and creation date */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>ID: {item.pkclassificacao}</span>
                          <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-end space-x-2 pt-2 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            data-testid={`button-edit-${item.pkclassificacao}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.pkclassificacao)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-${item.pkclassificacao}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando <span className="font-medium">1</span> a{" "}
                <span className="font-medium">{filteredClassificacoes.length}</span> de{" "}
                <span className="font-medium">{filteredClassificacoes.length}</span> resultados
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
