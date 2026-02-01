
-- ==========================================================
-- SCRIPT DE REESTRUTURAÇÃO - ORGANIZAÇÃO UMADEMATS
-- Descrição: Migração de Tarefas para Projetos + Subtarefas
-- ==========================================================

-- 1. Remover tabela antiga se existir para evitar conflitos de nome
DROP TABLE IF EXISTS public.organization_tasks;

-- 2. Tabela de PROJETOS
CREATE TABLE public.organization_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    participants TEXT,
    column_id TEXT NOT NULL DEFAULT 'planejamento', -- 'planejamento', 'execucao', 'finalizado'
    is_completed BOOLEAN DEFAULT false
);

-- 3. Tabela de TAREFAS VINCULADAS AO PROJETO
CREATE TABLE public.organization_project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.organization_projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false
);

-- 4. Tabela de COMENTÁRIOS (HISTÓRICO)
CREATE TABLE public.organization_project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.organization_projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    content TEXT NOT NULL
);

-- 5. Habilitar RLS
ALTER TABLE public.organization_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_project_comments ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de Acesso
CREATE POLICY "Acesso público projetos" ON public.organization_projects FOR ALL USING (true);
CREATE POLICY "Acesso público subtarefas" ON public.organization_project_tasks FOR ALL USING (true);
CREATE POLICY "Acesso público comentários" ON public.organization_project_comments FOR ALL USING (true);
