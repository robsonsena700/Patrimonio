import { query } from './db.js';

// Types
interface User {
  id: string;
  username: string;
  password: string;
}

interface InsertUser {
  username: string;
  password: string;
}

interface Classificacao {
  pkclassificacao: number;
  classificacao: string;
  ativo: boolean;
  fkuser: number;
}

interface InsertClassificacao {
  classificacao: string;
  ativo?: boolean;
  fkuser: number;
}

interface InsertTombamento {
  fkproduto: number;
  fkpedidoitem?: number;
  tombamento: string;
  serial?: string;
  imei?: string;
  mac?: string;
  observacao?: string;
  photos?: any[];
  responsavel?: string;
  status?: string;
  fkuser?: number;
}

interface Tombamento {
  pktombamento: number;
  fkproduto: number;
  tombamento: string;
  serial?: string;
  imei?: string;
  mac?: string;
  observacao?: string;
  photos?: string;
  responsavel?: string;
  status: string;
  ativo: boolean;
  fkuser: number;
  created_at: Date;
  version: number;
  produto?: {
    pkproduto: number;
    nome?: string;
    descricao?: string;
  };
}

interface Produto {
  pkproduto: number;
  produto: string;
  ativo: boolean;
}

interface Alocacao {
  pkalocacao: number;
  fktombamento: number;
  fkunidadesaude: number;
  fksetor?: number;
  fkprofissional?: number;
  responsavel_unidade: string;
  dataalocacao: Date;
  photos?: string;
  termo?: string;
  responsavel?: string;
  observacao?: string;
  ativo: boolean;
  fkuser: number;
  created_at: Date;
  version: number;
}

interface InsertAlocacao {
  fktombamento: number;
  fkunidadesaude: number;
  fksetor?: number;
  fkprofissional?: number;
  responsavel_unidade: string;
  dataalocacao: Date;
  photos?: any[];
  termo?: string;
  responsavel?: string;
  observacao?: string;
  fkuser?: number;
}

interface Transferencia {
  pktransferencia: number;
  fktombamento: number;
  fkunidadeorigem: number;
  fkunidadedestino: number;
  data_transferencia: Date;
  responsavel_origem: string;
  responsavel_destino: string;
  motivo?: string;
  observacao?: string;
  status: string;
  ativo: boolean;
  fkuser: number;
  created_at: Date;
  version: number;
}

interface InsertTransferencia {
  fktombamento: number;
  fkunidadeorigem?: number;
  fkunidadesaude_origem?: number;
  fkunidadedestino: number;
  fkunidadesaude_destino: number;
  fksetor_origem?: number;
  fksetor_destino?: number;
  data_transferencia?: Date;
  datatasnferencia: Date;
  responsavel_origem?: string;
  responsavel_destino: string;
  responsavel?: string;
  motivo?: string;
  observacao?: string;
  status?: string;
  fkuser?: number;
}

interface Manutencao {
  pkmanutencao: number;
  fktombamento: number;
  data_entrada: Date;
  data_saida?: Date;
  tipo_manutencao: string;
  descricao_problema: string;
  descricao_solucao?: string;
  responsavel: string;
  custo?: number;
  status: string;
  ativo: boolean;
  fkuser: number;
  created_at: Date;
  version: number;
}

interface InsertManutencao {
  fktombamento: number;
  data_entrada: Date;
  dataretirada: Date;
  data_saida?: Date;
  dataretorno?: Date;
  tipo_manutencao: string;
  descricao_problema: string;
  descricao_solucao?: string;
  responsavel: string;
  motivo?: string;
  observacao?: string;
  custo?: number;
  status?: string;
  fkuser?: number;
}

interface UnidadeSaude {
  pkunidadesaude: number;
  nome: string;
  endereco?: string;
  telefone?: string;
  responsavel?: string;
  ativo: boolean;
}

interface Setor {
  pksetor: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface DashboardStats {
  totalItems: number;
  available: number;
  allocated: number;
  maintenance: number;
  transferred: number;
  itemsByUnit: Array<{ unit: string; count: number }>;
  itemsByClassification: Array<{ classification: string; count: number }>;
  recentActivities: Array<{
    type: string;
    description: string;
    date: string;
  }>;
}

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Classificacao methods
  getClassificacoes(): Promise<Classificacao[]>;
  getClassificacao(id: number): Promise<Classificacao | undefined>;
  createClassificacao(classificacao: InsertClassificacao): Promise<Classificacao>;
  updateClassificacao(id: number, classificacao: Partial<InsertClassificacao>): Promise<Classificacao>;
  deleteClassificacao(id: number): Promise<boolean>;

  // Produto methods
  getProdutos(): Promise<Produto[]>;
  getProduto(id: number): Promise<Produto | undefined>;

  // Tombamento methods
  getTombamentos(): Promise<Tombamento[]>;
  getTombamento(id: number): Promise<Tombamento | undefined>;
  createTombamento(tombamento: InsertTombamento): Promise<Tombamento>;
  updateTombamento(id: number, tombamento: Partial<InsertTombamento>): Promise<Tombamento>;
  deleteTombamento(id: number): Promise<boolean>;

  // Alocacao methods
  getAlocacoes(): Promise<Alocacao[]>;
  getAlocacao(id: number): Promise<Alocacao | undefined>;
  getAlocacaoById(id: number): Promise<Alocacao | null>;
  createAlocacao(alocacao: InsertAlocacao): Promise<Alocacao>;
  updateAlocacao(id: number, alocacao: Partial<InsertAlocacao>): Promise<Alocacao>;
  deleteAlocacao(id: number): Promise<boolean>;

  // Transferencia methods
  getTransferencias(): Promise<Transferencia[]>;
  getTransferencia(id: number): Promise<Transferencia | undefined>;
  createTransferencia(transferencia: InsertTransferencia): Promise<Transferencia>;
  updateTransferencia(id: number, transferencia: Partial<InsertTransferencia>): Promise<Transferencia>;
  deleteTransferencia(id: number): Promise<boolean>;

  // Manutencao methods
  getManutencoes(): Promise<Manutencao[]>;
  getManutencao(id: number): Promise<Manutencao | undefined>;
  createManutencao(manutencao: InsertManutencao): Promise<Manutencao>;
  updateManutencao(id: number, manutencao: Partial<InsertManutencao>): Promise<Manutencao>;
  deleteManutencao(id: number): Promise<boolean>;

  // Support data methods
  getUnidadesSaude(): Promise<UnidadeSaude[]>;
  getSetores(): Promise<Setor[]>;
  getProfissionais(): Promise<any[]>;

  // Product entries methods
  getProdutoEntradas(fkproduto: number): Promise<any[]>;

  // Dashboard methods
  getDashboardStats(): Promise<DashboardStats>;

  // Company methods
  getEmpresa(): Promise<any | null>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [insertUser.username, insertUser.password]
    );
    return result.rows[0];
  }

  // Classificacao methods
  async getClassificacoes(): Promise<Classificacao[]> {
    const result = await query('SELECT * FROM sotech.pat_classificacao WHERE ativo = true ORDER BY classificacao');
    return result.rows;
  }

  async getClassificacao(id: number): Promise<Classificacao | undefined> {
    const result = await query('SELECT * FROM sotech.pat_classificacao WHERE pkclassificacao = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createClassificacao(classificacao: InsertClassificacao): Promise<Classificacao> {
    const result = await query(
      'INSERT INTO sotech.pat_classificacao (classificacao, fkuser, ativo) VALUES ($1, $2, $3) RETURNING *',
      [classificacao.classificacao, classificacao.fkuser || 0, classificacao.ativo ?? true]
    );
    return result.rows[0];
  }

  async updateClassificacao(id: number, classificacao: Partial<InsertClassificacao>): Promise<Classificacao> {
    const setClause = Object.keys(classificacao).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(classificacao);

    const result = await query(
      `UPDATE sotech.pat_classificacao SET ${setClause}, version = version + 1 WHERE pkclassificacao = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteClassificacao(id: number): Promise<boolean> {
    const result = await query('UPDATE sotech.pat_classificacao SET ativo = false WHERE pkclassificacao = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  // Produto methods
  async getProdutos(): Promise<Produto[]> {
    const result = await query(`
      SELECT p.pkproduto, p.produto, p.ativo
      FROM sotech.est_produto p
      LEFT JOIN sotech.est_subgrupo sg ON p.fksubgrupo = sg.pksubgrupo
      LEFT JOIN sotech.est_grupo g ON sg.fkgrupo = g.pkgrupo
      LEFT JOIN sotech.est_subtipo st ON g.fksubtipo = st.pksubtipo
      LEFT JOIN sotech.est_tipo t ON st.fktipo = t.pktipo
      WHERE p.ativo = true AND t.pktipo = 2
      ORDER BY p.produto
    `);
    return result.rows.map(row => ({
      pkproduto: row.pkproduto,
      produto: row.produto,
      nome: row.produto, // Add nome property for compatibility
      ativo: row.ativo
    }));
  }

  async getProduto(id: number): Promise<Produto | undefined> {
    const result = await query('SELECT * FROM sotech.est_produto WHERE pkproduto = $1', [id]);
    return result.rows[0] || undefined;
  }

  // Tombamento methods
  async getTombamentos(): Promise<Tombamento[]> {
    const result = await query(`
      SELECT t.pktombamento, t.fkproduto, t.fkpedidoitem, t.tombamento, t.serial, 
             t.imei, t.mac, t.observacao, t.photos, t.responsavel, t.status, 
             t.ativo, t.fkuser, t.created_at, t.version,
             p.produto as produto_nome, p.produto as produto_descricao
      FROM sotech.pat_tombamento t
      LEFT JOIN sotech.est_produto p ON t.fkproduto = p.pkproduto
      WHERE t.ativo = true
      ORDER BY t.created_at DESC
    `);

    return result.rows.map(row => ({
      ...row,
      produto: row.produto_nome ? {
        pkproduto: row.fkproduto,
        nome: row.produto_nome,
        descricao: row.produto_descricao
      } : undefined
    }));
  }

  async getTombamento(id: number): Promise<Tombamento | undefined> {
    const result = await query(`
      SELECT t.*, p.produto as produto_nome, p.produto as produto_descricao
      FROM sotech.pat_tombamento t
      LEFT JOIN sotech.est_produto p ON t.fkproduto = p.pkproduto
      WHERE t.pktombamento = $1
    `, [id]);

    if (!result.rows[0]) return undefined;

    const row = result.rows[0];
    return {
      ...row,
      produto: row.produto_nome ? {
        pkproduto: row.fkproduto,
        nome: row.produto_nome,
        descricao: row.produto_descricao
      } : undefined
    };
  }

  async createTombamento(tombamento: InsertTombamento): Promise<Tombamento> {
    const result = await query(`
      INSERT INTO sotech.pat_tombamento
      (fkproduto, fkpedidoitem, tombamento, serial, imei, mac, observacao, photos, responsavel, status, fkuser)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      tombamento.fkproduto,
      tombamento.fkpedidoitem || null,
      tombamento.tombamento,
      tombamento.serial,
      tombamento.imei,
      tombamento.mac,
      tombamento.observacao,
      tombamento.photos ? JSON.stringify(tombamento.photos) : null,
      tombamento.responsavel,
      tombamento.status || 'disponivel',
      tombamento.fkuser || 0
    ]);
    return result.rows[0];
  }

  async updateTombamento(id: number, tombamento: Partial<InsertTombamento>): Promise<Tombamento> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(tombamento).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${++paramCount}`);
        values.push(key === 'photos' && value ? JSON.stringify(value) : value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const result = await query(`
      UPDATE sotech.pat_tombamento
      SET ${fields.join(', ')}, version = version + 1
      WHERE pktombamento = $1
      RETURNING *
    `, [id, ...values]);

    return result.rows[0];
  }

  async deleteTombamento(id: number): Promise<boolean> {
    const result = await query('UPDATE sotech.pat_tombamento SET ativo = false WHERE pktombamento = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  // Alocacao methods
  async getAlocacoes(): Promise<Alocacao[]> {
    const result = await query(`
      SELECT 
        a.pkalocacao,
        a.fktombamento,
        a.fkunidadesaude,
        a.fksetor,
        a.responsavel_unidade,
        a.dataalocacao,
        a.termo,
        a.responsavel,
        a.observacao,
        a.photos,

        -- Dados do tombamento
        t.tombamento,
        t.serial,
        t.imei,
        t.mac,

        -- Dados do produto
        p.produto as produto_nome,
        p.codigo as produto_codigo,

        -- Dados da unidade de saúde
        us.unidadesaude as unidade_nome,
        ux.cnes,

        -- Dados do setor
        s.setor as setor_nome,

        -- Dados da empresa/mantenedora
        m.mantenedora,
        m.cnpj,

        -- Dados do interveniente (se existir)
        i.interveniente as interveniente_nome,
        i.cnscnes as interveniente_cns,
        i.cpfcnpj as interveniente_cpf

      FROM sotech.pat_alocacao a
      LEFT JOIN sotech.pat_tombamento t ON a.fktombamento = t.pktombamento
      LEFT JOIN sotech.est_produto p ON t.fkproduto = p.pkproduto
      LEFT JOIN sotech.cdg_unidadesaude us ON a.fkunidadesaude = us.pkunidadesaude
      LEFT JOIN sotech.cdg_setor s ON a.fksetor = s.pksetor
      LEFT JOIN sotech.cdx_unidadesaude ux on us.pkunidadesaude = ux.fkunidadesaude
      LEFT JOIN sotech.cdg_mantenedora m on m.pkmantenedora = ux.fkmantenedora
      LEFT JOIN sotech.cdg_interveniente i ON a.fkprofissional = i.pkinterveniente
      ORDER BY a.dataalocacao DESC
    `);

    return result.rows.map(row => ({
      ...row,
      tombamento: row.tombamento ? {
        pktombamento: row.fktombamento,
        tombamento: row.tombamento,
        serial: row.serial,
        imei: row.imei,
        mac: row.mac,
        produto: row.produto_nome ? { 
          nome: row.produto_nome,
          codigo: row.produto_codigo 
        } : undefined
      } : undefined,
      unidadesaude: row.unidade_nome ? { 
        nome: row.unidade_nome,
        cnes: row.cnes
      } : undefined,
      setor: row.setor_nome ? { nome: row.setor_nome } : undefined,
      mantenedora: row.mantenedora ? {
        nome: row.mantenedora,
        cnpj: row.cnpj
      } : undefined,
      interveniente: row.interveniente_nome ? {
        nome: row.interveniente_nome,
        cns: row.interveniente_cns,
        cpf: row.interveniente_cpf
      } : undefined
    }));
  }

  async getAlocacao(id: number): Promise<Alocacao | undefined> {
    const result = await query(`
      SELECT a.*, ci.interveniente as profissional_nome
      FROM sotech.pat_alocacao a
      LEFT JOIN sotech.cdg_interveniente ci ON a.fkprofissional = ci.pkinterveniente
      WHERE a.pkalocacao = $1
    `, [id]);
    return result.rows[0] || undefined;
  }

  async getAlocacaoById(id: number): Promise<Alocacao | null> {
    const result = await query(`
      SELECT 
        a.pkalocacao,
        a.responsavel_unidade,
        a.dataalocacao,
        a.observacao,
        a.fkprofissional,

        -- Dados do tombamento
        t.tombamento,
        t.serial,
        t.imei,
        t.mac,
        t.observacao as tombamento_observacao,

        -- Dados do produto
        p.produto as produto_nome,
        p.codigo as produto_codigo,

        -- Dados da unidade de saúde
        us.unidadesaude as unidade_nome,
        ux.cnes,

        -- Dados do setor
        s.setor as setor_nome,

        -- Dados da empresa/mantenedora
        m.mantenedora,
        m.cnpj,

        -- Dados do interveniente (se existir)
        i.interveniente as interveniente_nome,
        i.cnscnes as interveniente_cns,
        i.cpfcnpj as interveniente_cpf

      FROM sotech.pat_alocacao a
      LEFT JOIN sotech.pat_tombamento t ON a.fktombamento = t.pktombamento
      LEFT JOIN sotech.est_produto p ON t.fkproduto = p.pkproduto
      LEFT JOIN sotech.cdg_unidadesaude us ON a.fkunidadesaude = us.pkunidadesaude
      LEFT JOIN sotech.cdg_setor s ON a.fksetor = s.pksetor
      LEFT JOIN sotech.cdx_unidadesaude ux on us.pkunidadesaude = ux.fkunidadesaude
      LEFT JOIN sotech.cdg_mantenedora m on m.pkmantenedora = ux.fkmantenedora
      LEFT JOIN sotech.cdg_interveniente i ON a.fkprofissional = i.pkinterveniente
      WHERE a.pkalocacao = $1
    `, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      pkalocacao: row.pkalocacao,
      fktombamento: row.fktombamento,
      fkunidadesaude: row.fkunidadesaude,
      fksetor: row.fksetor,
      fkprofissional: row.fkprofissional,
      responsavel_unidade: row.responsavel_unidade,
      dataalocacao: row.dataalocacao,
      observacao: row.observacao,
      ativo: true,
      fkuser: row.fkuser || 0,
      created_at: row.created_at,
      version: row.version || 1
    } as any;
  }

  async createAlocacao(alocacao: InsertAlocacao): Promise<Alocacao> {
    const result = await query(`
      INSERT INTO sotech.pat_alocacao
      (fktombamento, fkunidadesaude, fksetor, responsavel_unidade, dataalocacao, photos, termo, responsavel, observacao, fkuser, fkprofissional)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      alocacao.fktombamento,
      alocacao.fkunidadesaude,
      alocacao.fksetor,
      alocacao.responsavel_unidade,
      alocacao.dataalocacao,
      alocacao.photos ? JSON.stringify(alocacao.photos) : null,
      alocacao.termo,
      alocacao.responsavel,
      alocacao.observacao,
      alocacao.fkuser || 0,
      alocacao.fkprofissional
    ]);

    // Update tombamento status to 'alocado'
    await query('UPDATE sotech.pat_tombamento SET status = $1 WHERE pktombamento = $2', ['alocado', alocacao.fktombamento]);

    return result.rows[0];
  }

  async updateAlocacao(id: number, alocacao: Partial<InsertAlocacao>): Promise<Alocacao> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(alocacao).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${++paramCount}`);
        values.push(key === 'photos' && value ? JSON.stringify(value) : value);
      }
    });

    const result = await query(`
      UPDATE sotech.pat_alocacao
      SET ${fields.join(', ')}, version = version + 1
      WHERE pkalocacao = $1
      RETURNING *
    `, [id, ...values]);

    return result.rows[0];
  }

  async deleteAlocacao(id: number): Promise<boolean> {
    // Get the tombamento ID before deleting
    const alocacao = await this.getAlocacao(id);
    if (alocacao) {
      // Update tombamento status back to 'disponivel'
      await query('UPDATE sotech.pat_tombamento SET status = $1 WHERE pktombamento = $2', ['disponivel', alocacao.fktombamento]);
    }

    const result = await query('UPDATE sotech.pat_alocacao SET ativo = false WHERE pkalocacao = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  // Transferencia methods
  async getTransferencias(): Promise<Transferencia[]> {
    const result = await query(`
      SELECT tr.*,
             t.tombamento,
             p.produto as produto_nome,
             uo.unidadesaude as unidade_origem_nome,
             ud.unidadesaude as unidade_destino_nome
      FROM sotech.pat_transferencia tr
      LEFT JOIN sotech.pat_tombamento t ON tr.fktombamento = t.pktombamento
      LEFT JOIN sotech.est_produto p ON t.fkproduto = p.pkproduto
      LEFT JOIN sotech.cdg_unidadesaude uo ON tr.fkunidadesaude_origem = uo.pkunidadesaude
      LEFT JOIN sotech.cdg_unidadesaude ud ON tr.fkunidadesaude_destino = ud.pkunidadesaude
      WHERE tr.ativo = true
      ORDER BY tr.created_at DESC
    `);

    return result.rows.map(row => ({
      ...row,
      tombamento: row.tombamento ? {
        tombamento: row.tombamento,
        produto: row.produto_nome ? { nome: row.produto_nome } : undefined
      } : undefined,
      unidade_origem: row.unidade_origem_nome ? { nome: row.unidade_origem_nome } : undefined,
      unidade_destino: row.unidade_destino_nome ? { nome: row.unidade_destino_nome } : undefined
    }));
  }

  async getTransferencia(id: number): Promise<Transferencia | undefined> {
    const result = await query('SELECT * FROM sotech.pat_transferencia WHERE pktransferencia = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createTransferencia(transferencia: InsertTransferencia): Promise<Transferencia> {
    // First, deactivate the current allocation
    if (transferencia.fkunidadesaude_origem) {
      await query(`
        UPDATE sotech.pat_alocacao
        SET ativo = false
        WHERE fktombamento = $1 AND fkunidadesaude = $2 AND ativo = true
      `, [transferencia.fktombamento, transferencia.fkunidadesaude_origem]);
    }

    // Insert the transfer record
    const result = await query(`
      INSERT INTO sotech.pat_transferencia
      (fktombamento, fkunidadesaude_origem, fkunidadesaude_destino, fksetor_origem, fksetor_destino, responsavel_destino, datatasnferencia, responsavel, observacao, fkuser)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      transferencia.fktombamento,
      transferencia.fkunidadesaude_origem,
      transferencia.fkunidadesaude_destino,
      transferencia.fksetor_origem,
      transferencia.fksetor_destino,
      transferencia.responsavel_destino,
      transferencia.datatasnferencia,
      transferencia.responsavel,
      transferencia.observacao,
      transferencia.fkuser || 0
    ]);

    // Create new allocation at destination
    await query(`
      INSERT INTO sotech.pat_alocacao
      (fktombamento, fkunidadesaude, fksetor, responsavel_unidade, dataalocacao, responsavel, fkuser)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      transferencia.fktombamento,
      transferencia.fkunidadesaude_destino,
      transferencia.fksetor_destino || null,
      transferencia.responsavel_destino || 'Transferência Automática',
      transferencia.datatasnferencia,
      transferencia.responsavel || 'Sistema',
      transferencia.fkuser || 0
    ]);

    return result.rows[0];
  }

  async updateTransferencia(id: number, transferencia: Partial<InsertTransferencia>): Promise<Transferencia> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(transferencia).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${++paramCount}`);
        values.push(value);
      }
    });

    const result = await query(`
      UPDATE sotech.pat_transferencia
      SET ${fields.join(', ')}, version = version + 1
      WHERE pktransferencia = $1
      RETURNING *
    `, [id, ...values]);

    return result.rows[0];
  }

  async deleteTransferencia(id: number): Promise<boolean> {
    const result = await query('UPDATE sotech.pat_transferencia SET ativo = false WHERE pktransferencia = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  async getHistoricoMovimentacao(fktombamento: number): Promise<any[]> {
    const result = await query(`
      SELECT
        'alocacao' as tipo,
        a.dataalocacao as data,
        a.responsavel_unidade as responsavel,
        u.unidadesaude as unidade,
        s.setor as setor,
        a.termo,
        a.ativo
      FROM sotech.pat_alocacao a
      LEFT JOIN sotech.cdg_unidadesaude u ON a.fkunidadesaude = u.pkunidadesaude
      LEFT JOIN sotech.cdg_setor s ON a.fksetor = s.pksetor
      WHERE a.fktombamento = $1

      UNION ALL

      SELECT
        'transferencia' as tipo,
        t.datatasnferencia as data,
        t.responsavel,
        CONCAT(uo.unidadesaude, ' → ', ud.unidadesaude) as unidade,
        CASE
          WHEN t.fksetor_destino IS NOT NULL THEN t.fksetor_destino
          ELSE NULL
        END as setor,
        NULL as termo,
        t.ativo
      FROM sotech.pat_transferencia t
      LEFT JOIN sotech.cdg_unidadesaude uo ON t.fkunidadesaude_origem = uo.pkunidadesaude
      LEFT JOIN sotech.cdg_unidadesaude ud ON t.fkunidadesaude_destino = ud.pkunidadesaude
      WHERE t.fktombamento = $1

      ORDER BY data DESC
    `, [fktombamento]);

    return result.rows;
  }

  // Manutencao methods
  async getManutencoes(): Promise<Manutencao[]> {
    const result = await query(`
      SELECT m.*,
             t.tombamento,
             p.produto as produto_nome
      FROM sotech.pat_manutencao m
      LEFT JOIN sotech.pat_tombamento t ON m.fktombamento = t.pktombamento
      LEFT JOIN sotech.est_produto p ON t.fkproduto = p.pkproduto
      WHERE m.ativo = true
      ORDER BY m.created_at DESC
    `);

    return result.rows.map(row => ({
      ...row,
      tombamento: row.tombamento ? {
        tombamento: row.tombamento,
        produto: row.produto_nome ? { nome: row.produto_nome } : undefined
      } : undefined
    }));
  }

  async getManutencao(id: number): Promise<Manutencao | undefined> {
    const result = await query('SELECT * FROM sotech.pat_manutencao WHERE pkmanutencao = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createManutencao(manutencao: InsertManutencao): Promise<Manutencao> {
    const result = await query(`
      INSERT INTO sotech.pat_manutencao
      (fktombamento, dataretirada, motivo, responsavel, dataretorno, observacao, fkuser)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      manutencao.fktombamento,
      manutencao.dataretirada,
      manutencao.motivo,
      manutencao.responsavel,
      manutencao.dataretorno,
      manutencao.observacao,
      manutencao.fkuser || 0
    ]);

    // Update tombamento status to 'manutencao'
    await query('UPDATE sotech.pat_tombamento SET status = $1 WHERE pktombamento = $2', ['manutencao', manutencao.fktombamento]);

    return result.rows[0];
  }

  async updateManutencao(id: number, manutencao: Partial<InsertManutencao>): Promise<Manutencao> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(manutencao).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${++paramCount}`);
        values.push(value);
      }
    });

    const result = await query(`
      UPDATE sotech.pat_manutencao
      SET ${fields.join(', ')}, version = version + 1
      WHERE pkmanutencao = $1
      RETURNING *
    `, [id, ...values]);

    return result.rows[0];
  }

  async deleteManutencao(id: number): Promise<boolean> {
    // Get the tombamento ID before deleting
    const manutencao = await this.getManutencao(id);
    if (manutencao) {
      // Update tombamento status back to 'disponivel'
      await query('UPDATE sotech.pat_tombamento SET status = $1 WHERE pktombamento = $2', ['disponivel', manutencao.fktombamento]);
    }

    const result = await query('UPDATE sotech.pat_manutencao SET ativo = false WHERE pkmanutencao = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  // Support data methods
  async getUnidadesSaude(): Promise<UnidadeSaude[]> {
    const result = await query('SELECT * FROM sotech.cdg_unidadesaude WHERE ativo = true ORDER BY unidadesaude');
    return result.rows;
  }

  async getSetores(): Promise<Setor[]> {
    const result = await query('SELECT * FROM sotech.cdg_setor WHERE ativo = true ORDER BY setor');
    return result.rows;
  }

  async getProfissionais(): Promise<any[]> {
    const result = await query('SELECT * FROM sotech.cdg_interveniente ORDER BY interveniente');
    return result.rows;
  }

  // Product entries methods
  async getProdutoEntradas(fkproduto: number): Promise<any[]> {
    const result = await query(`
      SELECT
        p.pkpedido,
        p.datapedido,
        tp.pktipopedido as tipo_pedido,
        tp.tipo as tipo_texto,
        pi.pkpedidoitem,
        pi.quantidadeentrada,
        (
          SELECT COUNT(*)
          FROM sotech.pat_tombamento t
          WHERE t.fkpedidoitem = pi.pkpedidoitem AND t.ativo = true
        ) as quantidade_tombada
      FROM sotech.est_pedido p
      INNER JOIN sotech.est_pedidoitem pi ON p.pkpedido = pi.fkpedido
      INNER JOIN sotech.est_tipopedido tp ON p.fktipopedido = tp.pktipopedido
      WHERE pi.fkproduto = $1
        AND tp.tipo = 'E'
        AND p.estado = 'F'
      ORDER BY p.datapedido DESC
    `, [fkproduto]);

    console.log(`Searching for product entries with fkproduto: ${fkproduto}`);
    console.log(`Found ${result.rows.length} entries:`, result.rows);

    // Calculate quantidade_disponivel and filter out entries where all items are tombados
    return result.rows
      .map(row => {
        const quantidadeEntrada = parseFloat(row.quantidadeentrada) || 0;
        const quantidadeTombada = parseInt(row.quantidade_tombada) || 0;
        const quantidadeDisponivel = quantidadeEntrada - quantidadeTombada;

        return {
          ...row,
          pkpedidoitem: parseInt(row.pkpedidoitem),
          quantidadeentrada: quantidadeEntrada,
          quantidade_tombada: quantidadeTombada,
          quantidade_disponivel: quantidadeDisponivel
        };
      })
      .filter(row => row.quantidade_disponivel > 0);
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const totalResult = await query('SELECT COUNT(*) as total FROM sotech.pat_tombamento WHERE ativo = true');
    const availableResult = await query('SELECT COUNT(*) as total FROM sotech.pat_tombamento WHERE ativo = true AND status = $1', ['disponivel']);
    const allocatedResult = await query('SELECT COUNT(*) as total FROM sotech.pat_tombamento WHERE ativo = true AND status = $1', ['alocado']);
    const maintenanceResult = await query('SELECT COUNT(*) as total FROM sotech.pat_tombamento WHERE ativo = true AND status = $1', ['manutencao']);

    return {
      totalItems: parseInt(totalResult.rows[0].total),
      available: parseInt(availableResult.rows[0].total),
      allocated: parseInt(allocatedResult.rows[0].total),
      maintenance: parseInt(maintenanceResult.rows[0].total),
      transferred: 0,
      itemsByUnit: [],
      itemsByClassification: [],
      recentActivities: []
    };
  }

  async getEmpresa() {
    const result = await query(`
      SELECT mantenedora, cnpj
      FROM sotech.cdg_mantenedora
      LIMIT 1
    `);

    return result.rows[0] || null;
  }
}

export const storage = new DatabaseStorage();