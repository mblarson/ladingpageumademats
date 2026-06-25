
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

-- ==========================================================
-- PEDIDOS DE CAMISETAS - CONGRESSO 2026
-- ==========================================================

DROP TABLE IF EXISTS public.pedidos_camisetas;

CREATE TABLE public.pedidos_camisetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    telefone TEXT NOT NULL,
    cor TEXT NOT NULL, -- 'TERRACOTA', 'VERDE-OLIVA'
    tamanho TEXT NOT NULL, -- 'Infantil 1', 'Baby Look PP', 'Unissex G', etc.
    quantidade INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'coletado')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.pedidos_camisetas ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Acesso público para inserção" ON public.pedidos_camisetas FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para leitura e exclusão" ON public.pedidos_camisetas FOR ALL USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedidos_camisetas_created_at ON public.pedidos_camisetas(created_at);


-- ==========================================================
-- SISTEMA DE AVISOS INDIVIDUAIS - LEITURA BÍBLICA
-- ==========================================================
DROP TABLE IF EXISTS public.bible_announcements;

CREATE TABLE public.bible_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'important'
    is_active BOOLEAN NOT NULL DEFAULT true,
    user_name TEXT NOT NULL -- Destinatário obrigatório do aviso (Leitor)
);

-- Habilitar RLS
ALTER TABLE public.bible_announcements ENABLE ROW LEVEL SECURITY;

-- Criar Políticas de Acesso Público
CREATE POLICY "Leitura pública de avisos" ON public.bible_announcements FOR SELECT USING (true);
CREATE POLICY "Controle administrativo de avisos" ON public.bible_announcements FOR ALL USING (true);

