import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface TermoResponsabilidadeProps {
  isOpen: boolean;
  onClose: () => void;
  alocacao: any;
  empresa: any;
}

export default function TermoResponsabilidade({ isOpen, onClose, alocacao, empresa }: TermoResponsabilidadeProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto print when modal opens
  React.useEffect(() => {
    if (isOpen) {
      handlePrint();
    }
  }, [isOpen]);

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const generateTermoContent = () => {
    const empresaNome = empresa?.mantenedora || '[NOME_DA_EMPRESA]';
    const tombamento = alocacao?.tombamento?.tombamento || '[CODIGO_TOMBAMENTO]';
    const produto = alocacao?.tombamento?.produto?.nome || '[DESCRICAO_PRODUTO]';
    const produtoCodigo = alocacao?.tombamento?.observacao || '[CODIGO_PRODUTO]';
    const serial = alocacao?.tombamento?.serial || '[NUMERO_SERIE]';
    const imei = alocacao?.tombamento?.imei || '[IMEI_EQUIPAMENTO]';
    const mac = alocacao?.tombamento?.mac || '[ENDERECO_MAC]';
    const unidade = alocacao?.unidadesaude?.nome || '[UNIDADE_DE_SAUDE]';
    const unidadeCnes = alocacao?.unidadesaude?.cnes || '[CNES_UNIDADE]';
    const setor = alocacao?.setor?.nome || '[SETOR]';
    const responsavelUnidade = alocacao?.responsavel_unidade || '[RESPONSAVEL_UNIDADE]';
    const intervenienteNome = alocacao?.interveniente?.nome || '[NOME_INTERVENIENTE]';
    const intervenienteCns = alocacao?.interveniente?.cnscnes || '[CNS_INTERVENIENTE]';
    const intervenienteCpf = alocacao?.interveniente?.cpfcnpj || '[CPF_INTERVENIENTE]';
    const mantenedoraNome = alocacao?.mantenedora?.nome || empresa?.mantenedora || '[NOME_MANTENEDORA]';
    const mantenedoraCnpj = alocacao?.mantenedora?.cnpj || empresa?.cnpj || '[CNPJ_MANTENEDORA]';
    const dataAlocacao = formatDate(alocacao?.dataalocacao) || '[DATA_ALOCACAO]';
    const dataAtual = formatDate(new Date());

    return `
                                    TERMO DE RESPONSABILIDADE
                                  GUARDA E USO DE EQUIPAMENTOS

Eu, [${intervenienteNome || responsavelUnidade}], Portador do CNS [${intervenienteCns}],
lotado na unidade de saúde [${unidade}] CNES [${unidadeCnes}], declaro que recebi do
[${mantenedoraNome}], CNPJ [${mantenedoraCnpj}] a título de
guarda, responsabilizando-me pelo uso adequado e os cuidados devidos, conforme
Secretaria Municipal de Saúde, e o assumo conforme meu cargo abaixo descrito, o equipamento
abaixo especificado neste termo:

Equipamento: [${produto}] [${produtoCodigo}]
IMEI: [${imei}]
Serial: [${serial}]
MAC: [${mac}]

Pelo qual declaro estar ciente de que:

1. Se o equipamento for danificado ou inutilizado por emergência manutencão, mau uso ou
   negligência, deverá comunicar o ocorrido ao responsável da Secretaria Municipal da
   Saúde, ficando sujeito às responsabilidades respectivas de cada conduta;

2. No caso de extravio, furto ou roubo deverá notificar crimes, deverá se apresentar
   boletim de ocorrência imediatamente;

3. Em caso de troca por dano, furto ou roubo, o nome equipamento acarretará custos não
   previstos para a Instituição, visto que a Instituição não tem obrigação de substituir
   equipamentos danificados nos casos acima citados;

4. Em caso de troca por dano, furto ou roubo, poderei vir a receber equipamentos de
   qualidade inferior, inclusive usados, resultados de outras marcas;

5. Em caso de troca por contrato entre a Instituição IGM e o município de Cascavel (PR) ou
   outros ente dos contratos firmados, deverá responsável pela devolução, sem direito a
   completo e em perfeito estado os equipamentos, constituindo-se o tempo de uso dos
   mesmo, no Instituto IGM/Empresa;

6. O equipamento em minha posse não é protegido, devendo-ter apenas dados de trabalho
   nele, ou seja, todos os dados, programas e demais informações estão sendo
   salvos pelo usuário por sua conta e risco;

7. Estando os equipamentos em minha posse, estarei sujeito a inspeções sem prévio aviso;

Cliente: _____________________________________


Termo de responsabilidade instrumental:

[${intervenienteNome || responsavelUnidade}]
CPF [cpf_do_responsavel_unidade]

                                            Grupo IS
                                       SWITCH ® SYSCOM`;
  };

  const handlePrint = () => {
    setIsGenerating(true);

    try {
      // Coletando dados reais
      const intervenienteNome = alocacao?.interveniente_nome || alocacao?.responsavel_unidade;
      const intervenienteCns = alocacao?.interveniente_cns;
      const intervenienteCpf = alocacao?.interveniente_cpf;
      const unidadeNome = alocacao?.unidade_nome;
      const unidadeCnes = alocacao?.cnes;
      const mantenedoraNome = alocacao?.mantenedora;
      const mantenedoraCnpj = alocacao?.cnpj;
      const produtoNome = alocacao?.produto_nome;
      const produtoCodigo = alocacao?.produto_codigo;
      const equipamentoImei = alocacao?.imei;
      const equipamentoSerial = alocacao?.serial;
      const equipamentoMac = alocacao?.mac;

      const printWindow = window.open('', '_blank');

      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Termo de Responsabilidade</title>
              <meta charset="utf-8">
              <style>
                @page {
                  size: A4;
                  margin: 0;
                }

                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }

                body {
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                  line-height: 1.4;
                  color: #000;
                  width: 210mm;
                  height: 297mm;
                  position: relative;
                  background-color: #ffffff;
                  overflow: hidden;
                }

                .background-container {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 210mm;
                  height: 297mm;
                  z-index: -1;
                }

                .background-container iframe {
                  width: 210mm;
                  height: 297mm;
                  border: none;
                  opacity: 0.25;
                  transform: scale(1);
                  transform-origin: top left;
                }

                .content-wrapper {
                  padding: 140px 35px 50px 35px;
                  position: relative;
                  z-index: 10;
                  width: 100%;
                  height: 100%;
                }

                .title-section {
                  text-align: center;
                  margin-bottom: 30px;
                  background: rgba(255, 255, 255, 0.95);
                  padding: 15px;
                  border-radius: 4px;
                }

                .title-section h1 {
                  font-size: 18px;
                  font-weight: bold;
                  margin: 0 0 10px 0;
                  text-transform: uppercase;
                }

                .title-section h2 {
                  font-size: 16px;
                  font-weight: bold;
                  margin: 0;
                  text-transform: uppercase;
                }

                .main-text {
                  text-align: justify;
                  margin-bottom: 25px;
                  line-height: 1.6;
                  background: rgba(255, 255, 255, 0.95);
                  padding: 20px;
                  border-radius: 4px;
                }

                .equipment-info {
                  margin: 25px 0;
                  line-height: 1.6;
                  background: rgba(255, 255, 255, 0.95);
                  padding: 20px;
                  border-radius: 4px;
                }

                .equipment-info p {
                  margin: 8px 0;
                  font-size: 13px;
                }

                .conditions {
                  margin: 25px 0;
                  text-align: justify;
                  background: rgba(255, 255, 255, 0.95);
                  padding: 20px;
                  border-radius: 4px;
                }

                .conditions p {
                  margin-bottom: 15px;
                  font-weight: bold;
                  font-size: 13px;
                }

                .conditions ol {
                  padding-left: 25px;
                  margin: 15px 0;
                }

                .conditions li {
                  margin: 12px 0;
                  text-align: justify;
                  line-height: 1.5;
                  font-size: 12px;
                }

                .signatures {
                  margin-top: 60px;
                  background: rgba(255, 255, 255, 0.95);
                  padding: 20px;
                  border-radius: 4px;
                }

                .signature-section {
                  margin: 40px 0;
                }

                .signature-line {
                  width: 400px;
                  height: 1px;
                  background: #000;
                  margin: 50px auto 15px auto;
                }

                @media print {
                  @page {
                    size: A4;
                    margin: 0 !important;
                  }

                  html, body {
                    width: 210mm !important;
                    height: 297mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }

                  .background-container {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 210mm !important;
                    height: 297mm !important;
                    z-index: -1 !important;
                  }

                  .background-container iframe {
                    width: 210mm !important;
                    height: 297mm !important;
                    opacity: 0.25 !important;
                  }

                  .content-wrapper {
                    position: relative !important;
                    z-index: 10 !important;
                    width: 210mm !important;
                    height: 297mm !important;
                    padding: 140px 35px 50px 35px !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="background-container">
                <iframe src="/Timbre.pdf"></iframe>
              </div>

              <div class="content-wrapper">
                <div class="title-section">
                  <h1>TERMO DE RESPONSABILIDADE</h1>
                  <h2>GUARDA E USO DE EQUIPAMENTOS</h2>
                </div>

                <div class="main-text">
                  <p>
                    Eu, <strong>${intervenienteNome ? String(intervenienteNome) : '________________'}</strong>${intervenienteCns ? `, Portador do CNS <strong>${String(intervenienteCns)}</strong>` : ''}, lotado na unidade de saúde <strong>${unidadeNome ? String(unidadeNome) : '________________'}</strong>${unidadeCnes ? `, CNES <strong>${String(unidadeCnes)}</strong>` : ''}, declaro que recebi do <strong>${mantenedoraNome ? String(mantenedoraNome) : '________________'}</strong>${mantenedoraCnpj ? `, CNPJ <strong>${String(mantenedoraCnpj)}</strong>` : ''} a título de guarda, transporte e conservação, para uso exclusivo nos sistemas determinados pela SMS – Secretaria Municipal de Saúde, e a trabalho conforme meu cargo acima declarado, o equipamento abaixo especificado neste termo:
                  </p>
                </div>

                ${(produtoNome || produtoCodigo || equipamentoImei || equipamentoSerial || equipamentoMac) ? `
                <div class="equipment-info">
                  ${produtoNome ? `<p><strong>Equipamento:</strong> ${String(produtoNome)}${produtoCodigo ? ' - ' + String(produtoCodigo) : ''}</p>` : ''}
                  ${equipamentoImei ? `<p><strong>IMEI:</strong> ${String(equipamentoImei)}</p>` : ''}
                  ${equipamentoSerial ? `<p><strong>Serial:</strong> ${String(equipamentoSerial)}</p>` : ''}
                  ${equipamentoMac ? `<p><strong>MAC:</strong> ${String(equipamentoMac)}</p>` : ''}
                </div>
                ` : ''}

                <div class="conditions">
                  <p>Pelo qual declaro estar ciente de que:</p>
                  <ol>
                    <li>Se o equipamento for danificado ou inutilizado por emergência, manutenção, mau uso ou negligência, deverá comunicar o ocorrido ao responsável da Secretaria Municipal da Saúde, ficando sujeito às responsabilidades respectivas de cada conduta;</li>
                    <li>No caso de extravio, furto ou roubo deverá notificar crimes, deverá se apresentar boletim de ocorrência imediatamente;</li>
                    <li>Em caso de troca por dano, furto ou roubo, o novo equipamento acarretará custos não previstos para a Instituição, visto que a Instituição não tem obrigação de substituir equipamentos danificados nos casos acima citados;</li>
                    <li>Em caso de troca por dano, furto ou roubo, poderei vir a receber equipamentos de qualidade inferior, inclusive usados, resultados de outras marcas;</li>
                    <li>Em caso de troca por contrato entre a Instituição IGM e o município de Cascavel (PR) ou outros ente dos contratos firmados, deverá responsável pela devolução, sem direito a completo e em perfeito estado os equipamentos, constituindo-se o tempo de uso dos mesmo, no Instituto IGM/Empresa;</li>
                    <li>O equipamento em minha posse não é protegido, devendo ter apenas dados de trabalho nele, ou seja, todos os dados, programas e demais informações estão sendo salvos pelo usuário por sua conta e risco;</li>
                    <li>Estando os equipamentos em minha posse, estarei sujeito a inspeções sem prévio aviso;</li>
                  </ol>
                </div>

                <div class="signatures">
                  <div class="signature-section">
                    <p>Cliente:</p>
                    <div class="signature-line"></div>
                  </div>

                  <div class="signature-section">
                    <p><strong>Termo de responsabilidade instrumental:</strong></p>
                    <div style="margin-top: 30px;">
                      <p><strong>${intervenienteNome ? String(intervenienteNome) : '________________'}</strong></p>
                      <p>CPF: ${intervenienteCpf ? String(intervenienteCpf) : '________________'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);

        printWindow.document.close();
        
        // Aguarda o carregamento e dispara a impressão automaticamente
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            // Fecha a janela após a impressão
            printWindow.onafterprint = () => {
              printWindow.close();
              onClose(); // Fecha o modal
            };
          }, 1000);
        };
      }
    } catch (error) {
      console.error('Erro ao gerar termo:', error);
      alert('Erro ao gerar o termo de responsabilidade.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    setIsGenerating(true);

    try {
      const content = generateTermoContent();
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `termo-responsabilidade-${alocacao?.tombamento?.tombamento || 'alocacao'}-${formatDate(new Date()).replace(/\//g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar termo:', error);
      alert('Erro ao baixar o termo de responsabilidade.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Extracting data for conditional rendering in the preview
  const intervenienteNome = alocacao?.interveniente?.nome;
  const intervenienteCns = alocacao?.interveniente?.cnscnes;
  const unidade = alocacao?.unidadesaude?.nome;
  const unidadeCnes = alocacao?.unidadesaude?.cnes;
  const mantenedoraNome = alocacao?.mantenedora?.nome || empresa?.mantenedora;
  const mantenedoraCnpj = alocacao?.mantenedora?.cnpj || empresa?.cnpj;
  const produto = alocacao?.tombamento?.produto?.nome;
  const produtoCodigo = alocacao?.tombamento?.observacao;
  const imei = alocacao?.tombamento?.imei;
  const serial = alocacao?.tombamento?.serial;
  const mac = alocacao?.tombamento?.mac;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isGenerating ? 'Gerando Termo de Responsabilidade...' : 'Preparando Termo de Responsabilidade'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {isGenerating ? 'Gerando documento para impressão...' : 'Preparando impressão...'}
          </p>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
            className="mt-4"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}