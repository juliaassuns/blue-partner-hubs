-- Schema do BluePartner Hub: histórico de clientes/licenças reais do Partner Center.
-- Aplicado manualmente uma vez (ver db/README.md). Sem ORM/ferramenta de migração
-- por enquanto — schema pequeno o suficiente pra não justificar isso ainda.

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'customers')
CREATE TABLE customers (
  id UNIQUEIDENTIFIER PRIMARY KEY,
  nome NVARCHAR(200) NOT NULL,
  tenant NVARCHAR(200) NOT NULL,
  primeiro_visto DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  ultimo_visto DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'snapshots')
CREATE TABLE snapshots (
  id INT IDENTITY PRIMARY KEY,
  customer_id UNIQUEIDENTIFIER NOT NULL REFERENCES customers(id),
  data_snapshot DATE NOT NULL,
  produtos NVARCHAR(MAX) NULL,        -- JSON array de produtos ativos
  gaps_criticos NVARCHAR(MAX) NULL,   -- JSON array de gaps
  pontos_potenciais INT NULL,
  licencas_erro NVARCHAR(500) NULL,
  assinaturas NVARCHAR(MAX) NULL,     -- JSON array de assinaturas
  assinaturas_erro NVARCHAR(500) NULL,
  CONSTRAINT uq_snapshot UNIQUE (customer_id, data_snapshot)
);

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'maicpp_scores')
CREATE TABLE maicpp_scores (
  area_id NVARCHAR(50) PRIMARY KEY,
  pontuacao INT NOT NULL,
  meta INT NOT NULL,
  performance INT NOT NULL,
  skilling INT NOT NULL,
  customer_success INT NOT NULL,
  designacao BIT NOT NULL DEFAULT 0,
  atualizado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  atualizado_por NVARCHAR(200) NULL
);

-- Permite que a Web App (Managed Identity) leia/escreva sem ser admin do servidor.
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'app-bluepartner-hub')
BEGIN
  CREATE USER [app-bluepartner-hub] FROM EXTERNAL PROVIDER;
  ALTER ROLE db_datareader ADD MEMBER [app-bluepartner-hub];
  ALTER ROLE db_datawriter ADD MEMBER [app-bluepartner-hub];
END
