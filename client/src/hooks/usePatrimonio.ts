import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Dashboard hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await api.getDashboardStats();
      return response.json();
    },
  });
}

// Classificacoes hooks
export function useClassificacoes() {
  return useQuery({
    queryKey: ["/api/classificacoes"],
    queryFn: async () => {
      const response = await api.getClassificacoes();
      return response.json();
    },
  });
}

export function useCreateClassificacao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.createClassificacao(data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classificacoes"] });
      toast({
        title: "Sucesso",
        description: "Classificação criada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar classificação",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateClassificacao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.updateClassificacao(id, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classificacoes"] });
      toast({
        title: "Sucesso",
        description: "Classificação atualizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar classificação",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteClassificacao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.deleteClassificacao(id);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classificacoes"] });
      toast({
        title: "Sucesso",
        description: "Classificação excluída com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir classificação",
        variant: "destructive",
      });
    },
  });
}

// Produtos hooks
export function useProdutos() {
  return useQuery({
    queryKey: ["/api/produtos"],
    queryFn: async () => {
      const response = await api.getProdutos();
      return response.json();
    },
  });
}

export const useProdutoEntradas = (fkproduto: number | null) => {
  return useQuery({
    queryKey: ['produto-entradas', fkproduto],
    queryFn: async () => {
      if (!fkproduto) return [];
      const response = await api.getProdutoEntradas(fkproduto);
      return response.json();
    },
    enabled: !!fkproduto,
  });
};

export const useProdutoLocalizacao = (fkproduto: number | null) => {
  return useQuery({
    queryKey: ['produto-localizacao', fkproduto],
    queryFn: async () => {
      if (!fkproduto) return null;
      const response = await fetch(`/api/produtos/${fkproduto}/localizacao`);
      return response.json();
    },
    enabled: !!fkproduto,
  });
};

// Tombamentos hooks
export function useTombamentos() {
  return useQuery({
    queryKey: ["/api/tombamentos"],
    queryFn: async () => {
      const response = await api.getTombamentos();
      return response.json();
    },
  });
}

export function useCreateTombamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.createTombamento(formData);
      if (!response.ok) {
        throw new Error("Erro ao criar tombamento");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tombamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      // Invalidate all produto-entradas queries to update available quantities
      queryClient.invalidateQueries({ queryKey: ['produto-entradas'] });

      // Check if it's a batch response
      if (data.count && data.count > 1) {
        toast({
          title: "Sucesso",
          description: `${data.count} tombamentos criados com sucesso em lote`,
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Tombamento criado com sucesso",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar tombamento",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTombamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number, formData: FormData }) => {
      const response = await api.updateTombamento(id, formData);
      if (!response.ok) {
        throw new Error("Erro ao atualizar tombamento");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tombamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Tombamento atualizado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar tombamento",
        variant: "destructive",
      });
    },
  });
}

// Alocacoes hooks
export function useAlocacoes() {
  return useQuery({
    queryKey: ["/api/alocacoes"],
    queryFn: async () => {
      const response = await api.getAlocacoes();
      return response.json();
    },
  });
}

export function useCreateAlocacao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.createAlocacao(formData);
      if (!response.ok) {
        throw new Error("Erro ao criar alocação");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alocacoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tombamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Alocação criada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar alocação",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAlocacao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number, formData: FormData }) => {
      const response = await api.updateAlocacao(id, formData);
      if (!response.ok) {
        throw new Error("Erro ao atualizar alocação");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alocacoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tombamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Alocação atualizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar alocação",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAlocacao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.deleteAlocacao(id);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alocacoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tombamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Alocação excluída com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir alocação",
        variant: "destructive",
      });
    },
  });
}

// Transferencias hooks
export function useTransferencias() {
  return useQuery({
    queryKey: ["/api/transferencias"],
    queryFn: async () => {
      const response = await api.getTransferencias();
      return response.json();
    },
  });
}

export function useCreateTransferencia() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.createTransferencia(data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transferencias"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alocacoes"] });
      toast({
        title: "Sucesso",
        description: "Transferência criada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar transferência",
        variant: "destructive",
      });
    },
  });
}

// Manutencoes hooks
export function useManutencoes() {
  return useQuery({
    queryKey: ["/api/manutencoes"],
    queryFn: async () => {
      const response = await api.getManutencoes();
      return response.json();
    },
  });
}

export function useCreateManutencao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.createManutencao(data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manutencoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tombamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Manutenção criada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar manutenção",
        variant: "destructive",
      });
    },
  });
}

// Support data hooks
export function useUnidadesSaude() {
  return useQuery({
    queryKey: ["/api/unidades-saude"],
    queryFn: async () => {
      const response = await api.getUnidadesSaude();
      return response.json();
    },
  });
}

export function useSetores() {
  return useQuery({
    queryKey: ["/api/setores"],
    queryFn: async () => {
      const response = await api.getSetores();
      return response.json();
    },
  });
}

export function useProfissionais() {
  return useQuery({
    queryKey: ["/api/profissionais"],
    queryFn: async () => {
      const response = await api.getProfissionais();
      return response.json();
    },
  });
}

export function useHistoricoMovimentacao(fktombamento: number) {
  return useQuery({
    queryKey: ["historico-movimentacao", fktombamento],
    queryFn: async () => {
      const response = await api.getHistoricoMovimentacao(fktombamento);
      if (!response.ok) {
        throw new Error('Failed to fetch historico');
      }
      return response.json();
    },
    enabled: !!fktombamento,
  });
}

export const useEmpresa = () => {
  return useQuery({
    queryKey: ["empresa"],
    queryFn: async () => {
      const response = await fetch("/api/empresa");
      if (!response.ok) {
        throw new Error('Failed to fetch empresa');
      }
      return response.json();
    },
  });
};