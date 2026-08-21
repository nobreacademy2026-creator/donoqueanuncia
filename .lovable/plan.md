# Plano de Correção do Webhook da Cakto

O objetivo é resolver a falha na conexão do webhook da plataforma Cakto, garantindo que os eventos de compra e checkout sejam capturados corretamente no painel administrativo e enviados para a Meta CAPI.

## Alterações Técnicas

### 1. Reforço no Webhook (`src/routes/api/public/webhook.tsx`)
- Adicionar cabeçalhos de resposta para evitar problemas de CORS em testes de integração (`Access-Control-Allow-Origin: *`).
- Expandir o mapeamento de campos da Cakto no `body` (como `body.data.customer.email` e `body.data.status`).
- Tratar payloads vazios ou malformados com respostas HTTP mais descritivas.
- Garantir que o `eventId` atenda aos requisitos da Meta (regex `^[a-zA-Z0-9_-]{8,120}$`).

### 2. Ajuste na Validação da Meta (`src/lib/meta-conversions.functions.ts`)
- Suavizar a verificação de `event_id` para aceitar IDs gerados dinamicamente que contenham prefixos de webhook.
- Garantir que chamadas de webhook (sem `origin` ou `referer`) não sejam bloqueadas pela política de mesma origem.

### 3. Melhoria no Dashboard (`src/components/admin/TrackingDashboard.tsx`)
- Atualizar o mapeamento de nomes amigáveis para garantir que eventos da Cakto apareçam com os termos corretos ("Compra Aprovada", "Venda").
- Adicionar uma seção de "Status da Integração" no topo para o usuário validar se o URL do webhook está ativo.

### 4. Correção no Banco de Dados
- Verificar e reaplicar permissões `GRANT` se necessário para garantir que o `supabaseAdmin` no webhook possa escrever na tabela `analytics_events` via RPC mesmo com RLS ativo.

## User Interface (Painel Admin)
- Exibição de um alerta visual caso um evento de webhook chegue com payload inválido (logs técnicos).
- Botão "Copiar URL de Webhook" com instruções claras para colar na Cakto.

## Próximos Passos
- Implementar as mudanças no código.
- Solicitar ao usuário que faça um novo teste na plataforma Cakto.
- Verificar os logs em tempo real para confirmar a chegada do evento.
