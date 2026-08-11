# BluePartner Hub

Crie uma aplicação SaaS moderna chamada:

BLUEPARTNER PARTNER INTELLIGENCE CENTER

Objetivo:

Centralizar a gestão completa do ecossistema Microsoft Partner da BluePartner, permitindo acompanhar aproximadamente 70 revendas CSP, centenas de clientes, designações Solutions Partner, pontuação MAICPP, certificações, especializações, benefícios, incentivos e oportunidades de crescimento.

O sistema será utilizado apenas internamente pela equipe BluePartner.

=================================================================

ESTILO VISUAL

=================================================================

Utilizar design inspirado no Microsoft Partner Center.

Tema Dark Mode por padrão.

Visual executivo e corporativo.

Utilizar Fluent UI e Microsoft Design Language.

Criar experiência moderna semelhante a:

- Microsoft Partner Center

- Microsoft 365 Admin Center

- Azure Portal

- Fabric

Utilizar:

- Cards KPI

- Gráficos interativos

- Heatmaps

- Ranking

- Indicadores coloridos

- Barras de progresso

- Filtros dinâmicos

- Drill Down

- Menu lateral recolhível

Dashboard responsivo.

=================================================================

MENU LATERAL

=================================================================

Dashboard Executivo

Revendas CSP

Clientes

Solutions Partner

Especializações

Certificações

Benefícios e Incentivos

Plano de Ação

Relatórios

Copilot BluePartner

Configurações

=================================================================

DASHBOARD EXECUTIVO

=================================================================

Exibir KPIs principais:

Total de Revendas CSP

Total de Clientes

Total de Certificações

Total de Especializações

Total de Designações

Próximas Renovações

Pontuação Global MAICPP

Status Geral

Exemplo:

Modern Work

59/100

Security

72/100

Infrastructure

84/100

Business Applications

65/100

Data & AI

45/100

Digital & App Innovation

70/100

Exibir gráfico radar comparando todas as áreas.

Exibir gráfico histórico mensal.

Exibir evolução dos últimos 24 meses.

Exibir metas anuais.

=================================================================

MÓDULO SOLUTIONS PARTNER

=================================================================

Criar uma página para cada área:

Modern Work

Security

Infrastructure

Data & AI

Digital & App Innovation

Business Applications

Para cada área mostrar:

Pontuação Atual

Meta

Pontuação Necessária

Status

Data Renovação

Dias Restantes

Performance

Skilling

Customer Success

Barra de progresso.

Semáforo:

Verde

Amarelo

Vermelho

Exibir recomendações automáticas.

=================================================================

MÓDULO REVENDAS CSP

=================================================================

Exibir lista de aproximadamente 70 revendas.

Filtros:

Nome

Status

Segmento

Pontuação

Potencial

Ranking

Cada revenda possuir:

Nome

Gerente Responsável

Quantidade de Clientes

Contribuição MAICPP

Contribuição Modern Work

Contribuição Security

Contribuição Azure

Contribuição Business Apps

Saúde Geral

Potencial de Crescimento

Próximas Ações

Criar Ranking Geral.

Criar Top 10 Revendas.

Criar Revendas em Risco.

Criar Revendas com Maior Potencial.

=================================================================

MÓDULO CLIENTES

=================================================================

Cada revenda possuir seus clientes.

Ao selecionar uma revenda abrir:

Lista de clientes.

Ao selecionar um cliente exibir:

Nome

Tenant

Segmento

Quantidade de Usuários

Licenciamento

Data Renovação

Status

Produtos Utilizados

Microsoft 365

Teams

SharePoint

Exchange

OneDrive

Copilot

Defender

Entra ID

Azure

Power Platform

Dynamics

Fabric

Indicadores de adoção.

Painel de oportunidades.

Detectar automaticamente:

Cliente sem Defender

Cliente sem Copilot

Cliente sem Power BI

Cliente sem Fabric

Cliente sem Azure

Cliente sem Entra P2

Cliente sem Backup

Gerar score de oportunidade.

Exibir potencial de geração de pontos.

=================================================================

MÓDULO CERTIFICAÇÕES

=================================================================

Tabela de colaboradores.

Campos:

Nome

Cargo

Área

Certificação

Nível

Data Obtenção

Validade

Status

Indicadores:

Certificações Válidas

Certificações Expirando

Certificações Expiradas

Impacto no Score

Criar alerta automático:

30 dias

60 dias

90 dias

=================================================================

MÓDULO ESPECIALIZAÇÕES

=================================================================

Listar especializações Microsoft.

Mostrar:

Status

Requisitos

Pontuação

Data Renovação

Pendências

Progresso

Criar painel visual mostrando:

Conquistadas

Em andamento

Não iniciadas

=================================================================

MÓDULO BENEFÍCIOS E INCENTIVOS

=================================================================

Exibir:

ISV Success

Partner Benefits

Marketplace Rewards

Azure Credits

Copilot Benefits

Support Benefits

Consulting Benefits

Treinamentos

Status

Data Expiração

Utilização

Saldo

=================================================================

MÓDULO PLANO DE AÇÃO

=================================================================

Gerar automaticamente ações recomendadas.

Exemplo:

Faltam 11 pontos em Modern Work

Necessário mais 1 certificação intermediária

Necessário mais 2 deployments

Necessário crescimento de uso em 3 clientes

Classificar por:

Baixo esforço

Médio esforço

Alto impacto

Urgente

=================================================================

COPILOT BLUEPARTNER

=================================================================

Criar assistente de IA interno.

Chat integrado.

Permitir perguntas:

“O que falta para renovar Security?”

“Quais revendas possuem maior potencial para Modern Work?”

“Quais clientes podem gerar pontos para Data & AI?”

“Quais certificações devemos priorizar?”

“Quais especializações estão em risco?”

“Monte um plano para atingir 70 pontos.”

Responder utilizando todos os dados da plataforma.

=================================================================

BANCO DE DADOS

=================================================================

Entidades:

Revendas

Clientes

Tenants

Certificações

Especializações

Designações

Pontuações

Benefícios

Incentivos

Usuários

Metas

Planos de Ação

=================================================================

ANALYTICS

=================================================================

Dashboard Power BI Embedded.

Gráficos:

Linha

Barra

Pizza

Radar

Heatmap

Forecast

Ranking

Tendência

Comparativos entre:

Revendas

Clientes

Soluções

Consultores

=================================================================

OBJETIVO FINAL

=================================================================

Criar uma central única para acompanhamento do ecossistema Microsoft da BluePartner.

A plataforma deve permitir acompanhar:

- Revendas CSP

- Clientes

- MAICPP

- Solutions Partner

- Certificações

- Especializações

- Benefícios

- Incentivos

- Oportunidades

- Renovação

- Crescimento

Tudo em uma experiência visual moderna, intuitiva, executiva e altamente interativa.

## Development

Requer [Bun](https://bun.sh) instalado.

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev
```
