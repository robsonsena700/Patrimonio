import { useState, useMemo } from "react";
import { useAlocacoes, useCreateAlocacao, useUpdateAlocacao, useDeleteAlocacao, useTombamentos, useUnidadesSaude, useSetores, useProfissionais } from "@/hooks/usePatrimonio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SearchInput } from "@/components/ui/search-input";
import TransferenciaModal from "@/components/modals/TransferenciaModal";
import HistoricoModal from "@/components/modals/HistoricoModal";
import ImageGallery from "@/components/ImageGallery";
import TermoResponsabilidade from "@/components/TermoResponsabilidade";
import { Plus, Search, Eye, ArrowRightLeft, Pencil, Trash2, History, ArrowLeft, Upload, X, FileText } from "lucide-react";

export default function Alocacao() {
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [showTermoModal, setShowTermoModal] = useState(false);
  const [selectedTombamento, setSelectedTombamento] = useState<any>(null);
  const [selectedAlocacao, setSelectedAlocacao] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [unidadeFilter, setUnidadeFilter] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    fktombamento: "",
    fkunidadesaude: "",
    fksetor: "",
    fkprofissional: "",
    responsavel_unidade: "",
    dataalocacao: "",
    termo: "",
    responsavel: "",
    observacao: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [searchTombamento, setSearchTombamento] = useState("");
  const [searchUnidade, setSearchUnidade] = useState("");
  const [searchSetor, setSearchSetor] = useState("");
  const [searchProfissional, setSearchProfissional] = useState("");

  const { data: alocacoes = [], isLoading } = useAlocacoes();
  const { data: tombamentos = [] } = useTombamentos();
  const { data: unidadesSaude = [] } = useUnidadesSaude();
  const { data: setoresData } = useSetores();
  const setores = Array.isArray(setoresData) ? setoresData : [];
  const { data: profissionaisData } = useProfissionais();
  const profissionais = Array.isArray(profissionaisData) ? profissionaisData : [];
  const createAlocacao = useCreateAlocacao();
  const updateAlocacao = useUpdateAlocacao();
  const deleteAlocacao = useDeleteAlocacao();

  const filteredAlocacoes = useMemo(() => {
    if (!searchTerm.trim() && unidadeFilter === "all") {
      return alocacoes;
    }
    return alocacoes.filter((item: any) => {
      const matchesSearch =
        (item.tombamento?.tombamento && item.tombamento.tombamento.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tombamento?.produto?.nome && item.tombamento.produto.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.unidadesaude?.nome && item.unidadesaude.nome.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesUnidade = unidadeFilter === "all" ||
        (item.unidadesaude?.nome && item.unidadesaude.nome === unidadeFilter);

      return matchesSearch && matchesUnidade;
    });
  }, [alocacoes, searchTerm, unidadeFilter]);

  // Filter available tombamentos (only disponivel status) + current tombamento if editing
  const availableTombamentos = editingItem
    ? tombamentos.filter((t: any) => t.status === "disponivel" || t.pktombamento === editingItem.fktombamento)
    : tombamentos.filter((t: any) => t.status === "disponivel");

  const filteredTombamentos = availableTombamentos.filter((t: any) =>
    (t.tombamento?.toString().toLowerCase().includes(searchTombamento.toLowerCase()) ||
     t.produto?.nome?.toLowerCase().includes(searchTombamento.toLowerCase()))
  );

  const filteredUnidades = (Array.isArray(unidadesSaude) ? unidadesSaude : []).filter((unidade: any) =>
    unidade.unidadesaude?.toLowerCase().includes(searchUnidade.toLowerCase())
  );

  const filteredSetores = (Array.isArray(setores) ? setores : []).filter((setor: any) =>
    setor.setor?.toLowerCase().includes(searchSetor.toLowerCase())
  );

  const filteredProfissionais = (Array.isArray(profissionais) ? profissionais : []).filter((profissional: any) =>
    profissional.interveniente?.toLowerCase().includes(searchProfissional.toLowerCase())
  );

  // Get unique unidades for filter
  const unidades = Array.from(new Set(alocacoes.map((item: any) => item.unidadesaude?.nome).filter(Boolean))) as string[];

  const handleNewAlocacao = () => {
    setEditingItem(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      fktombamento: "",
      fkunidadesaude: "",
      fksetor: "",
      fkprofissional: "",
      responsavel_unidade: "",
      dataalocacao: today,
      termo: "",
      responsavel: "",
      observacao: "",
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setViewMode("form");
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      fktombamento: item.fktombamento?.toString() || "",
      fkunidadesaude: item.fkunidadesaude?.toString() || "",
      fksetor: item.fksetor?.toString() || "",
      fkprofissional: item.fkprofissional?.toString() || "",
      responsavel_unidade: item.responsavel_unidade || "",
      dataalocacao: item.dataalocacao ? new Date(item.dataalocacao).toISOString().split('T')[0] : "",
      termo: item.termo || "",
      responsavel: item.responsavel || "",
      observacao: item.observacao || "",
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setViewMode("form");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setEditingItem(null);
    setFormData({
      fktombamento: "",
      fkunidadesaude: "",
      fksetor: "",
      fkprofissional: "",
      responsavel_unidade: "",
      dataalocacao: "",
      termo: "",
      responsavel: "",
      observacao: "",
    });
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    setSelectedTombamento(null);
  };

  const handleCloseHistoricoModal = () => {
    setShowHistoricoModal(false);
    setSelectedTombamento(null);
  };

  const handleTransfer = (item: any) => {
    setSelectedTombamento(item);
    setShowTransferModal(true);
  };

  const handleShowHistory = (item: any) => {
    setSelectedTombamento(item);
    setShowHistoricoModal(true);
  };

  const handleShowTermo = (item: any) => {
    setSelectedAlocacao(item);
    setShowTermoModal(true);
  };

  const handleCloseTermoModal = () => {
    setShowTermoModal(false);
    setSelectedAlocacao(null);
  };

  const handleDelete = async (item: any) => {
    if (window.confirm(`Tem certeza que deseja excluir a alocação do tombamento ${item.tombamento?.tombamento}?`)) {
      try {
        await deleteAlocacao.mutateAsync(item.pkalocacao);
      } catch (error) {
        console.error('Erro ao excluir alocação:', error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fktombamento || !formData.fkunidadesaude || !formData.responsavel_unidade || !formData.dataalocacao) {
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
        await updateAlocacao.mutateAsync({ id: editingItem.pkalocacao, formData: submitFormData });
      } else {
        await createAlocacao.mutateAsync(submitFormData);
      }

      handleBackToList();
    } catch (error) {
      console.error("Error saving alocacao:", error);
    }
  };

  // Calculate statistics
  const stats = alocacoes.reduce((acc: any, item: any) => {
    const unidadeName = item.unidadesaude?.nome;
    if (unidadeName) {
      acc[unidadeName] = (acc[unidadeName] || 0) + 1;
    }
    return acc;
  }, {});

  const isLoadingForm = createAlocacao.isPending || updateAlocacao.isPending;

  if (viewMode === "form") {
    return (
      <div className="p-6" data-testid="alocacao-form">
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
                  {editingItem ? "Editar Alocação" : "Nova Alocação"}
                </h2>
                <p className="text-muted-foreground">
                  {editingItem ? "Edite as informações da alocação" : "Aloque um item tombado em uma unidade de saúde"}
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações da Alocação</CardTitle>
                <div className="flex flex-col items-end">
                  <Label htmlFor="dataalocacao" className="text-sm font-medium text-foreground mb-1">
                    Data de Alocação *
                  </Label>
                  <Input
                    id="dataalocacao"
                    type="date"
                    value={formData.dataalocacao}
                    onChange={(e) => setFormData({ ...formData, dataalocacao: e.target.value })}
                    required
                    data-testid="input-data-alocacao"
                    className="w-40"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fktombamento" className="text-sm font-medium text-foreground">
                      Tombamento *
                    </Label>
                    <Select
                      value={formData.fktombamento}
                      onValueChange={(value) => setFormData({ ...formData, fktombamento: value })}
                      required
                    >
                      <SelectTrigger data-testid="select-tombamento">
                        <SelectValue placeholder="Selecione um tombamento" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        <div className="sticky top-0 bg-background p-2 border-b">
                          <SearchInput
                            value={searchTombamento}
                            onChange={setSearchTombamento}
                            placeholder="Pesquisar tombamento..."
                            data-testid="search-tombamento"
                            className="h-8"
                          />
                        </div>
                        {filteredTombamentos.length > 0 ? (
                          filteredTombamentos.map((tombamento: any) => (
                            <SelectItem key={tombamento.pktombamento} value={tombamento.pktombamento.toString()}>
                              {tombamento.tombamento} - {tombamento.produto?.nome || "Produto não encontrado"}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">
                            {searchTombamento ? "Nenhum tombamento encontrado" : "Nenhum tombamento disponível"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fkunidadesaude" className="text-sm font-medium text-foreground">
                      Unidade de Saúde *
                    </Label>
                    <Select
                      value={formData.fkunidadesaude}
                      onValueChange={(value) => setFormData({ ...formData, fkunidadesaude: value })}
                      required
                    >
                      <SelectTrigger data-testid="select-unidade">
                        <SelectValue placeholder="Selecione uma unidade" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        <div className="sticky top-0 bg-background p-2 border-b">
                          <SearchInput
                            value={searchUnidade}
                            onChange={setSearchUnidade}
                            placeholder="Pesquisar unidade..."
                            data-testid="search-unidade"
                            className="h-8"
                          />
                        </div>
                        {filteredUnidades.length > 0 ? (
                          filteredUnidades.map((unidade: any) => (
                            <SelectItem key={unidade.pkunidadesaude} value={unidade.pkunidadesaude.toString()}>
                              {unidade.unidadesaude}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">
                            {searchUnidade ? "Nenhuma unidade encontrada" : "Carregando unidades..."}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fksetor" className="text-sm font-medium text-foreground">
                      Setor
                    </Label>
                    <Select
                      value={formData.fksetor}
                      onValueChange={(value) => setFormData({ ...formData, fksetor: value })}
                    >
                      <SelectTrigger data-testid="select-setor">
                        <SelectValue placeholder="Selecione um setor" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        <div className="sticky top-0 bg-background p-2 border-b">
                          <SearchInput
                            value={searchSetor}
                            onChange={setSearchSetor}
                            placeholder="Pesquisar setor..."
                            data-testid="search-setor"
                            className="h-8"
                          />
                        </div>
                        {filteredSetores.length > 0 ? (
                          filteredSetores.map((setor: any) => (
                            <SelectItem key={setor.pksetor} value={setor.pksetor.toString()}>
                              {setor.setor}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">
                            {searchSetor ? "Nenhum setor encontrado" : "Carregando setores..."}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fkprofissional" className="text-sm font-medium text-foreground">
                      Responsável pelo Bem
                    </Label>
                    <Select
                      value={formData.fkprofissional}
                      onValueChange={(value) => setFormData({ ...formData, fkprofissional: value })}
                    >
                      <SelectTrigger data-testid="select-profissional">
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        <div className="sticky top-0 bg-background p-2 border-b">
                          <SearchInput
                            value={searchProfissional}
                            onChange={setSearchProfissional}
                            placeholder="Pesquisar profissional..."
                            data-testid="search-profissional"
                            className="h-8"
                          />
                        </div>
                        {filteredProfissionais.length > 0 ? (
                          filteredProfissionais.map((profissional: any) => (
                            <SelectItem key={profissional.pkinterveniente} value={profissional.pkinterveniente.toString()}>
                              {profissional.interveniente}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">
                            {searchProfissional ? "Nenhum profissional encontrado" : "Carregando profissionais..."}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsavel_unidade" className="text-sm font-medium text-foreground">
                      Responsável na Unidade *
                    </Label>
                    <Input
                      id="responsavel_unidade"
                      type="text"
                      value={formData.responsavel_unidade}
                      onChange={(e) => setFormData({ ...formData, responsavel_unidade: e.target.value })}
                      placeholder="Nome do responsável"
                      required
                      data-testid="input-responsavel-unidade"
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsavel" className="text-sm font-medium text-foreground">
                      Responsável pela Alocação
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
                  <Label htmlFor="termo" className="text-sm font-medium text-foreground">
                    Termo de Responsabilidade
                  </Label>
                  <Textarea
                    id="termo"
                    value={formData.termo}
                    onChange={(e) => setFormData({ ...formData, termo: e.target.value })}
                    placeholder="Detalhes do termo de responsabilidade..."
                    rows={3}
                    data-testid="textarea-termo"
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
                    placeholder="Observações sobre a alocação..."
                    rows={2}
                    data-testid="textarea-observacao"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Fotos da Alocação
                  </Label>
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
                    onClick={handleBackToList}
                    disabled={isLoadingForm}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoadingForm || !formData.fktombamento || !formData.fkunidadesaude || !formData.responsavel_unidade || !formData.dataalocacao}
                    data-testid="button-save"
                  >
                    {isLoadingForm ? "Salvando..." : editingItem ? "Atualizar Alocação" : "Criar Alocação"}
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
            <h2 className="text-2xl font-bold text-foreground">Alocação de Bens</h2>
            <p className="text-muted-foreground">Carregando alocações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="alocacao-page">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Alocação de Bens</h2>
            <p className="text-muted-foreground">Controle onde cada item tombado está alocado nas unidades</p>
          </div>
          <Button
            onClick={handleNewAlocacao}
            className="flex items-center space-x-2"
            data-testid="button-new-alocacao"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Alocação</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(stats).slice(0, 3).map(([unidade, count], index) => (
            <Card key={unidade}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{unidade}</p>
                    <p className="text-2xl font-bold text-foreground" data-testid={`stat-${unidade.toLowerCase().replace(/\s+/g, '-')}`}>
                      {count as number}
                    </p>
                    <p className="text-xs text-muted-foreground">itens alocados</p>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    index === 0 ? 'bg-primary/10' :
                    index === 1 ? 'bg-accent/10' :
                    'bg-secondary/10'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      index === 0 ? 'text-primary' :
                      index === 1 ? 'text-accent' :
                      'text-secondary'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alocações Ativas</CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={unidadeFilter} onValueChange={setUnidadeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as unidades</SelectItem>
                    {unidades.map((unidade: string) => (
                      <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por tombamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-48"
                    data-testid="search-alocacoes"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAlocacoes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || unidadeFilter !== "all" ? "Nenhuma alocação encontrada" : "Nenhuma alocação cadastrada"}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlocacoes.map((item: any) => (
                  <Card key={item.pkalocacao} data-testid={`alocacao-row-${item.pkalocacao}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* First line: Tombamento and Date */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-foreground">
                            {item.tombamento?.tombamento || "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.dataalocacao).toLocaleDateString('pt-BR')}
                          </div>
                        </div>

                        {/* Second line: Product and Unit info */}
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground">
                            {item.tombamento?.produto?.nome || "Produto não encontrado"}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{item.unidadesaude?.nome || "Unidade não informada"}</span>
                            <span>{item.setor?.nome || "Setor não informado"}</span>
                          </div>
                          {item.profissional?.nome && (
                            <div className="text-xs text-blue-600 font-medium">
                              Responsável: {item.profissional.nome}
                            </div>
                          )}
                        </div>

                        {/* Images */}
                        {item.photos && (
                          <div className="pt-2">
                            <ImageGallery 
                              photos={item.photos} 
                              title="Fotos da Alocação"
                              className="space-y-2"
                            />
                          </div>
                        )}

                        {/* Responsible and actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground">
                            {item.responsavel_unidade || "Sem responsável"}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowTermo(item)}
                              className="text-green-600 hover:text-green-800"
                              title="Termo de Responsabilidade"
                              data-testid={`button-termo-${item.pkalocacao}`}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Ver detalhes"
                              data-testid={`button-view-${item.pkalocacao}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowHistory(item)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Histórico de movimentação"
                              data-testid={`button-history-${item.pkalocacao}`}
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTransfer(item)}
                              className="text-accent hover:text-accent"
                              title="Transferir"
                              data-testid={`button-transfer-${item.pkalocacao}`}
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              title="Editar"
                              data-testid={`button-edit-${item.pkalocacao}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item)}
                              className="text-destructive hover:text-destructive"
                              title="Excluir"
                              data-testid={`button-delete-${item.pkalocacao}`}
                            >
                              <Trash2 className="w-4 h-4" />
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

      {showTransferModal && selectedTombamento && (
        <TransferenciaModal
          isOpen={showTransferModal}
          onClose={handleCloseTransferModal}
          editingItem={{
            fktombamento: selectedTombamento.fktombamento,
            fkunidadesaude_origem: selectedTombamento.fkunidadesaude,
            fksetor_origem: selectedTombamento.fksetor
          }}
        />
      )}

      {showHistoricoModal && selectedTombamento && (
        <HistoricoModal
          isOpen={showHistoricoModal}
          onClose={handleCloseHistoricoModal}
          fktombamento={selectedTombamento.fktombamento}
          tombamento={selectedTombamento.tombamento?.tombamento}
        />
      )}

      {showTermoModal && selectedAlocacao && (
        <TermoResponsabilidade
          isOpen={showTermoModal}
          onClose={handleCloseTermoModal}
          alocacao={selectedAlocacao}
          empresa={null}
        />
      )}
    </div>
  );
}