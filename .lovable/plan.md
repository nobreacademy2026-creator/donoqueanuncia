# Plano: Rastreamento de Retenção de Vídeo no Admin

Implementar o monitoramento de retenção de vídeo (quanto tempo o usuário assiste) e exibir esses dados no painel administrativo.

## Mudanças no Frontend
- Atualização do componente `SalesPage` para registrar eventos de retenção em marcos de tempo (10s, 30s, 60s, etc.) tanto para vídeos enviados quanto para embeds (YouTube/Vimeo).
- Adição de lógica de monitoramento de tempo para vídeos embarcados.

## Mudanças no Admin
- Inclusão de uma nova seção de "Retenção do vídeo" na aba de Analytics.
- Exibição de gráficos de barra de conversão para cada marco de retenção, permitindo identificar onde os usuários param de assistir.

## Detalhes Técnicos
- Registro de novo evento `video_retencao` na tabela `analytics_events`.
- Utilização de `window._videoStartTime` para estimar retenção em embeds externos onde o acesso ao `currentTime` é restrito por cross-origin.
- Ajustes de RLS e GRANTs já realizados em turnos anteriores para permitir a leitura/escrita desses eventos.
