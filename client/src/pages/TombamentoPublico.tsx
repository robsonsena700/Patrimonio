
import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Package, Hash, Building } from "lucide-react";

export default function TombamentoPublico() {
  const { id } = useParams();
  const [tombamento, setTombamento] = useState<any>(null);
  const [empresa, setEmpresa] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Buscar dados do tombamento
        const tombamentoResponse = await fetch(`/api/tombamentos/${id}`);
        if (!tombamentoResponse.ok) {
          throw new Error('Tombamento não encontrado');
        }
        const tombamentoData = await tombamentoResponse.json();

        // Buscar dados da empresa
        const empresaResponse = await fetch('/api/empresa');
        if (empresaResponse.ok) {
          const empresaData = await empresaResponse.json();
          setEmpresa(empresaData);
        }

        setTombamento(tombamentoData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponivel":
        return <Badge className="bg-green-100 text-green-800">Disponível</Badge>;
      case "alocado":
        return <Badge className="bg-blue-100 text-blue-800">Alocado</Badge>;
      case "manutencao":
        return <Badge className="bg-red-100 text-red-800">Manutenção</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações do bem...</p>
        </div>
      </div>
    );
  }

  if (error || !tombamento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Bem não encontrado
            </h2>
            <p className="text-gray-600">
              {error || 'O tombamento solicitado não foi encontrado no sistema.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Informações do Bem Patrimonial</h1>
          <p className="text-gray-600 mt-2">Consulta pública via QR Code</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-800">
                Tombamento: {tombamento.tombamento}
              </CardTitle>
              {getStatusBadge(tombamento.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Descrição do Bem</p>
                    <p className="font-medium text-gray-800">
                      {tombamento.produto?.nome || 'Não informado'}
                    </p>
                  </div>
                </div>

                {tombamento.serial && (
                  <div className="flex items-start space-x-3">
                    <Hash className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Número Serial</p>
                      <p className="font-medium text-gray-800">{tombamento.serial}</p>
                    </div>
                  </div>
                )}

                {tombamento.responsavel && (
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Responsável</p>
                      <p className="font-medium text-gray-800">{tombamento.responsavel}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Data de Cadastro</p>
                    <p className="font-medium text-gray-800">
                      {tombamento.datacadastro 
                        ? new Date(tombamento.datacadastro).toLocaleDateString('pt-BR')
                        : 'Não informado'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {tombamento.alocacao && (
                  <>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Localização Atual</p>
                        <p className="font-medium text-gray-800">
                          {tombamento.alocacao.unidade?.nome || 'Não informado'}
                        </p>
                        {tombamento.alocacao.setor && (
                          <p className="text-sm text-gray-600">
                            Setor: {tombamento.alocacao.setor.nome}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Fotos do item */}
                {(() => {
                  try {
                    const photos = tombamento.photos ? JSON.parse(tombamento.photos) : [];
                    return photos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Fotos do Item</p>
                        <div className="grid grid-cols-2 gap-2">
                          {photos.slice(0, 4).map((photo: any, index: number) => (
                            <img
                              key={index}
                              src={`/uploads/${photo.filename}`}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.error('Error parsing photos:', error);
                    return null;
                  }
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações da empresa */}
        {empresa && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Equipamento de propriedade de:</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {empresa.mantenedora}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Esta consulta foi gerada via QR Code</p>
          <p>Data e hora: {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
}
