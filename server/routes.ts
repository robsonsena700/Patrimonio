import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { query } from "./db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

/**
 * API Routes with menu parameter support
 * 
 * All frontend routes support the 'menu' query parameter:
 * - menu=false: Hides the sidebar and header for embedded/modal display
 * - menu=true or omitted: Shows full interface with sidebar and header
 * 
 * Examples:
 * - /?menu=false (Dashboard without menu)
 * - /tombamento?menu=false (Tombamento page without menu)
 * - /classificacoes?menu=false (Classificações page without menu)
 */

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Serve uploaded images
  app.get("/api/uploads/:filename", (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(process.cwd(), 'uploads', filename);

      // Check if file exists
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Imagem não encontrada' });
      }

      // Set appropriate headers for image serving
      const ext = path.extname(filename).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif'
      }[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

      // Stream the file
      const fileStream = fs.createReadStream(filepath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Empresa route
  app.get("/api/empresa", async (req, res) => {
    try {
      const empresa = await storage.getEmpresa();
      res.json(empresa);
    } catch (error) {
      console.error('Error fetching empresa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Classificacao routes
  app.get("/api/classificacoes", async (req, res) => {
    try {
      const classificacoes = await storage.getClassificacoes();
      res.json(classificacoes);
    } catch (error) {
      console.error('Error fetching classificacoes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get("/api/classificacoes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const classificacao = await storage.getClassificacao(id);

      if (!classificacao) {
        return res.status(404).json({ error: 'Classificação não encontrada' });
      }

      res.json(classificacao);
    } catch (error) {
      console.error('Error fetching classificacao:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post("/api/classificacoes", async (req, res) => {
    try {
      const { classificacao, ativo = true } = req.body;

      if (!classificacao) {
        return res.status(400).json({ error: 'Nome da classificação é obrigatório' });
      }

      const newClassificacao = await storage.createClassificacao({
        classificacao,
        ativo,
        fkuser: 0 // Default user
      });

      res.status(201).json(newClassificacao);
    } catch (error) {
      console.error('Error creating classificacao:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.put("/api/classificacoes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const classificacao = await storage.updateClassificacao(id, updates);
      res.json(classificacao);
    } catch (error) {
      console.error('Error updating classificacao:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.delete("/api/classificacoes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClassificacao(id);

      if (success) {
        res.json({ message: 'Classificação excluída com sucesso' });
      } else {
        res.status(404).json({ error: 'Classificação não encontrada' });
      }
    } catch (error) {
      console.error('Error deleting classificacao:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Produto routes
  app.get("/api/produtos", async (req, res) => {
    try {
      const produtos = await storage.getProdutos();
      res.json(produtos);
    } catch (error) {
      console.error('Error fetching produtos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Get product entries for tombamento form
  app.get("/api/produtos/:id/entradas", async (req, res) => {
    try {
      const fkproduto = parseInt(req.params.id);

      if (isNaN(fkproduto)) {
        return res.status(400).json({ error: "ID do produto inválido" });
      }

      console.log('API call - Getting entries for product ID:', fkproduto);

      const result = await query(`
        SELECT 
          pe.pkpedido,
          pe.datapedido,
          pe.tipo as tipo_pedido,
          CASE pe.tipo 
            WHEN 6 THEN 'E'
            ELSE 'O'
          END as tipo_texto,
          pi.pkpedidoitem,
          pi.quantidadeentrada::text,
          COALESCE(t.quantidade_tombada, 0) as quantidade_tombada
        FROM sotech.est_pedidoitem pi
        INNER JOIN sotech.est_pedido pe ON pi.fkpedido = pe.pkpedido
        LEFT JOIN (
          SELECT 
            fkpedidoitem,
            COUNT(*) as quantidade_tombada
          FROM sotech.est_tombamento 
          WHERE fkpedidoitem IS NOT NULL
          GROUP BY fkpedidoitem
        ) t ON pi.pkpedidoitem = t.fkpedidoitem
        WHERE pi.fkproduto = $1
        AND pe.tipo = 6
        AND pi.quantidadeentrada > 0
        ORDER BY pe.datapedido DESC
      `, [fkproduto]);

      console.log('Searching for product entries with fkproduto:', fkproduto);
      console.log('Found entries:', result.rows);

      // Calculate available quantity for each entry
      const entriesWithAvailability = result.rows.map(row => {
        const quantidadeEntrada = parseFloat(row.quantidadeentrada);
        const quantidadeTombada = parseInt(row.quantidade_tombada) || 0;
        const quantidadeDisponivel = quantidadeEntrada - quantidadeTombada;

        return {
          ...row,
          quantidadeentrada: quantidadeEntrada,
          quantidade_tombada: quantidadeTombada,
          quantidade_disponivel: quantidadeDisponivel
        };
      }).filter(entry => entry.quantidade_disponivel > 0);

      console.log('API response - Found', entriesWithAvailability.length, 'entries for product', fkproduto);

      res.json(entriesWithAvailability);
    } catch (error) {
      console.error("Error fetching product entries:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get product location for tombamento formatting
  app.get("/api/produtos/:id/localizacao", async (req, res) => {
    try {
      const fkproduto = parseInt(req.params.id);

      if (isNaN(fkproduto)) {
        return res.status(400).json({ error: "ID do produto inválido" });
      }

      const result = await query(`
        SELECT localizacao
        FROM sotech.est_produto
        WHERE pkproduto = $1
      `, [fkproduto]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      res.json({ localizacao: result.rows[0].localizacao || "" });
    } catch (error) {
      console.error("Error fetching product location:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });


  // Tombamento routes
  app.get("/api/tombamentos", async (req, res) => {
    try {
      const tombamentos = await storage.getTombamentos();
      res.json(tombamentos);
    } catch (error) {
      console.error('Error fetching tombamentos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get("/api/tombamentos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tombamento = await storage.getTombamento(id);

      if (!tombamento) {
        return res.status(404).json({ error: 'Tombamento não encontrado' });
      }

      res.json(tombamento);
    } catch (error) {
      console.error('Error fetching tombamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post("/api/tombamentos", upload.array('photos'), async (req, res) => {
    try {
      const { fkproduto, fkpedidoitem, tombamento, serial, imei, mac, observacao, responsavel, status = 'disponivel' } = req.body;

      if (!fkproduto || !tombamento) {
        return res.status(400).json({ error: 'Produto e número de tombamento são obrigatórios' });
      }

      // Validate IMEI if provided
      if (imei && !/^\d{15}$/.test(imei)) {
        return res.status(400).json({ error: 'IMEI deve conter exatamente 15 dígitos' });
      }

      // Validate MAC address if provided
      if (mac && !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac)) {
        return res.status(400).json({ error: 'MAC deve estar no formato XX:XX:XX:XX:XX:XX ou XX-XX-XX-XX-XX-XX' });
      }

      // Handle uploaded photos
      let photos = undefined;
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        photos = (req.files as Express.Multer.File[]).map(file => ({
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size
        }));
      }

      // Check if it's a batch tombamento (starts with $)
      if (tombamento.startsWith('$')) {
        const batchPattern = /^\$(\d+)-(\d+)$/;
        const match = tombamento.match(batchPattern);

        if (!match) {
          return res.status(400).json({ error: 'Formato de lote inválido. Use $inicio-fim (ex: $11-15)' });
        }

        const startNum = parseInt(match[1]);
        const endNum = parseInt(match[2]);

        if (startNum >= endNum) {
          return res.status(400).json({ error: 'O número inicial deve ser menor que o final' });
        }

        if (endNum - startNum > 100) {
          return res.status(400).json({ error: 'Limite máximo de 100 tombamentos por lote' });
        }

        // Get product location for formatting
        const produtoResult = await query(`
          SELECT localizacao FROM sotech.est_produto WHERE pkproduto = $1
        `, [parseInt(fkproduto)]);

        const localizacao = produtoResult.rows[0]?.localizacao || '';

        // Create batch tombamentos
        const createdTombamentos = [];
        for (let i = startNum; i <= endNum; i++) {
          const paddedNumber = i.toString().padStart(6, '0');
          const formattedTombamento = localizacao ? `${localizacao}${paddedNumber}` : paddedNumber;

          const newTombamento = await storage.createTombamento({
            fkproduto: parseInt(fkproduto),
            fkpedidoitem: fkpedidoitem ? parseInt(fkpedidoitem) : undefined,
            tombamento: formattedTombamento,
            serial: serial || '',
            imei: imei || undefined,
            mac: mac || undefined,
            observacao: observacao || undefined,
            photos,
            responsavel,
            status,
            fkuser: 0
          });

          createdTombamentos.push(newTombamento);
        }

        res.status(201).json({
          message: `${createdTombamentos.length} tombamentos criados com sucesso`,
          tombamentos: createdTombamentos,
          count: createdTombamentos.length
        });
      } else {
        // Single tombamento creation
        const newTombamento = await storage.createTombamento({
          fkproduto: parseInt(fkproduto),
          fkpedidoitem: fkpedidoitem ? parseInt(fkpedidoitem) : undefined,
          tombamento,
          serial,
          imei: imei || undefined,
          mac: mac || undefined,
          observacao: observacao || undefined,
          photos,
          responsavel,
          status,
          fkuser: 0
        });

        res.status(201).json(newTombamento);
      }
    } catch (error) {
      console.error('Error creating tombamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.put("/api/tombamentos/:id", upload.array('photos'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = { ...req.body };

      // Handle uploaded photos
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        updates.photos = (req.files as Express.Multer.File[]).map(file => ({
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size
        }));
      }

      if (updates.fkproduto) {
        updates.fkproduto = parseInt(updates.fkproduto);
      }

      const tombamento = await storage.updateTombamento(id, updates);
      res.json(tombamento);
    } catch (error) {
      console.error('Error updating tombamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.delete("/api/tombamentos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTombamento(id);

      if (success) {
        res.json({ message: 'Tombamento excluído com sucesso' });
      } else {
        res.status(404).json({ error: 'Tombamento não encontrado' });
      }
    } catch (error) {
      console.error('Error deleting tombamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Alocacao routes
  app.get("/api/alocacoes", async (req, res) => {
    try {
      const alocacoes = await storage.getAlocacoes();
      res.json(alocacoes);
    } catch (error) {
      console.error('Error fetching alocacoes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post("/api/alocacoes", upload.array('photos'), async (req, res) => {
    try {
      const { fktombamento, fkunidadesaude, fksetor, responsavel_unidade, dataalocacao, termo, responsavel, observacao } = req.body;

      if (!fktombamento || !fkunidadesaude || !responsavel_unidade || !dataalocacao) {
        return res.status(400).json({ error: 'Tombamento, unidade, responsável e data são obrigatórios' });
      }

      // Handle uploaded photos
      let photos = undefined;
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        photos = (req.files as Express.Multer.File[]).map(file => ({
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size
        }));
      }

      const newAlocacao = await storage.createAlocacao({
        fktombamento: parseInt(fktombamento),
        fkunidadesaude: parseInt(fkunidadesaude),
        fksetor: fksetor ? parseInt(fksetor) : undefined,
        responsavel_unidade,
        dataalocacao: new Date(dataalocacao),
        photos,
        termo,
        responsavel,
        observacao: observacao || undefined,
        fkuser: 0
      });

      res.status(201).json(newAlocacao);
    } catch (error) {
      console.error('Error creating alocacao:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.put("/api/alocacoes/:id", upload.array('photos'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = { ...req.body };

      // Handle uploaded photos
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        updates.photos = (req.files as Express.Multer.File[]).map(file => ({
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size
        }));
      }

      // Convert string fields to proper types
      if (updates.fktombamento) updates.fktombamento = parseInt(updates.fktombamento);
      if (updates.fkunidadesaude) updates.fkunidadesaude = parseInt(updates.fkunidadesaude);
      if (updates.fksetor) updates.fksetor = parseInt(updates.fksetor);
      if (updates.dataalocacao) updates.dataalocacao = new Date(updates.dataalocacao);

      const updatedAlocacao = await storage.updateAlocacao(id, updates);
      res.json(updatedAlocacao);
    } catch (error) {
      console.error('Error updating alocacao:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.delete("/api/alocacoes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAlocacao(id);

      if (success) {
        res.json({ message: 'Alocação excluída com sucesso' });
      } else {
        res.status(404).json({ error: 'Alocação não encontrada' });
      }
    } catch (error) {
      console.error('Error deleting alocacao:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Transferencia routes
  app.get("/api/transferencias", async (req, res) => {
    try {
      const transferencias = await storage.getTransferencias();
      res.json(transferencias);
    } catch (error) {
      console.error('Error fetching transferencias:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post("/api/transferencias", async (req, res) => {
    try {
      const { fktombamento, fkunidadesaude_origem, fkunidadesaude_destino, fksetor_origem, fksetor_destino, responsavel_destino, datatasnferencia, responsavel, observacao } = req.body;

      if (!fktombamento || !fkunidadesaude_destino || !datatasnferencia) {
        return res.status(400).json({ error: 'Tombamento, unidade destino e data são obrigatórios' });
      }

      const newTransferencia = await storage.createTransferencia({
        fktombamento: parseInt(fktombamento),
        fkunidadeorigem: fkunidadesaude_origem ? parseInt(fkunidadesaude_origem) : 0,
        fkunidadesaude_origem: fkunidadesaude_origem ? parseInt(fkunidadesaude_origem) : undefined,
        fkunidadedestino: parseInt(fkunidadesaude_destino),
        fkunidadesaude_destino: parseInt(fkunidadesaude_destino),
        fksetor_origem: fksetor_origem ? parseInt(fksetor_origem) : undefined,
        fksetor_destino,
        responsavel_origem: responsavel || '',
        responsavel_destino,
        datatasnferencia: new Date(datatasnferencia),
        responsavel,
        observacao: observacao || undefined,
        fkuser: 0
      });

      res.status(201).json(newTransferencia);
    } catch (error) {
      console.error('Error creating transferencia:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Manutencao routes
  app.get("/api/manutencoes", async (req, res) => {
    try {
      const manutencoes = await storage.getManutencoes();
      res.json(manutencoes);
    } catch (error) {
      console.error('Error fetching manutencoes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post("/api/manutencoes", async (req, res) => {
    try {
      const { fktombamento, dataretirada, motivo, responsavel, dataretorno, observacao } = req.body;

      if (!fktombamento || !dataretirada || !motivo) {
        return res.status(400).json({ error: 'Tombamento, data de retirada e motivo são obrigatórios' });
      }

      const newManutencao = await storage.createManutencao({
        fktombamento: parseInt(fktombamento),
        data_entrada: new Date(dataretirada),
        dataretirada: new Date(dataretirada),
        tipo_manutencao: 'corretiva',
        descricao_problema: motivo,
        motivo,
        responsavel,
        dataretorno: dataretorno ? new Date(dataretorno) : undefined,
        observacao: observacao || undefined,
        fkuser: 0
      });

      res.status(201).json(newManutencao);
    } catch (error) {
      console.error('Error creating manutencao:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Support data routes
  app.get("/api/unidades-saude", async (req, res) => {
    try {
      const unidades = await storage.getUnidadesSaude();
      res.json(unidades);
    } catch (error) {
      console.error('Error fetching unidades:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get("/api/setores", async (req, res) => {
    try {
      const setores = await storage.getSetores();
      res.json(setores);
    } catch (error) {
      console.error('Error fetching setores:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get("/api/profissionais", async (req, res) => {
    try {
      const profissionais = await storage.getProfissionais();
      res.json(profissionais);
    } catch (error) {
      console.error('Error fetching profissionais:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get("/api/tombamentos/:id/historico", async (req, res) => {
    try {
      const fktombamento = parseInt(req.params.id);
      const historico = await storage.getHistoricoMovimentacao(fktombamento);
      res.json(historico);
    } catch (error) {
      console.error('Error fetching movement history:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Fallback para rotas client-side (apenas em produção)
  if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
      // Apenas para rotas que não são da API e não são arquivos estáticos
      if (!req.path.startsWith('/api') && !req.path.includes('.')) {
        const indexPath = path.join(process.cwd(), 'client', 'dist', 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('Página não encontrada');
        }
      } else {
        res.status(404).send('Não encontrado');
      }
    });
  }

  const httpServer = createServer(app);

  return httpServer;
}