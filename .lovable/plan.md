# Plano de Implementação: Ocultar e Excluir Etapas do Funil

O usuário deseja a capacidade de ocultar ou excluir etapas do funil no painel administrativo. Já implementamos a opção de ocultar a página de vendas, mas agora precisamos estender isso para as etapas individuais do quiz e do resultado.

## Alterações Propostas

### 1. Atualização do Esquema de Dados
- Modificar o tipo `FunnelDraft` em `src/lib/funnel-content.ts` para incluir um campo `hidden?: boolean` em cada etapa.

### 2. Interface do Administrador (`src/routes/_authenticated/admin.tsx`)
- Adicionar botões de ação em cada "card" de etapa na `ContentSection`:
    - **Botão de Ocultar/Exibir**: Alternar a visibilidade da etapa sem removê-la.
    - **Botão de Excluir**: Remover a etapa do funil (com confirmação).
- Adicionar funcionalidade para **Restaurar Etapas** (talvez uma lista de etapas excluídas ou um botão de "Adicionar Etapa Padrão" se faltarem etapas críticas).
- Atualizar a função `updateStep` para lidar com a propriedade `hidden`.

### 3. Lógica do Funil no Frontend (`src/routes/index.tsx`)
- Filtrar o array `questions` para remover as etapas marcadas como `hidden` ou removidas do `draft.steps`.
- Garantir que a lógica de navegação do quiz (avanço de passos) ignore as etapas ocultas.
- O componente `ResultStep.tsx` também deve respeitar as configurações de visibilidade das sub-etapas (como benefícios, depoimentos, etc.).

## Detalhes Técnicos

### FunnelDraft (src/lib/funnel-content.ts)
```typescript
export type FunnelDraft = {
  steps: Record<
    string,
    {
      // ... campos existentes
      hidden?: boolean;
    }
  >;
  // ...
};
```

### Componente ContentSection (src/routes/_authenticated/admin.tsx)
- Adicionar ícones `Eye` / `EyeOff` ao lado de cada título de etapa.
- Adicionar ícone `Trash2` para "exclusão" (na verdade, marcação como oculta/removida no rascunho).

### Componente Index (src/routes/index.tsx)
- No `useMemo` de `questions`, adicionar um `.filter(q => !draft.steps[q.id]?.hidden)`.

---

**Nota:** Como a estrutura de etapas é baseada em IDs fixos (`dor`, `motivacao`, etc.), a "exclusão" funcionará tecnicamente ocultando a etapa, já que os componentes esperam IDs específicos. Se o usuário quiser adicionar novas perguntas customizadas, isso exigiria uma refatoração maior da estrutura de dados do quiz. Por enquanto, focaremos em permitir que ele gerencie a visibilidade das etapas existentes.
