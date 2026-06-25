
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
    user_name TEXT NOT NULL, -- Destinatário obrigatório do aviso (Leitor)
    last_acknowledged_at TIMESTAMPTZ NULL -- Última confirmação do aviso (ENTENDI)
);

-- Execução do alter se a tabela já existir
ALTER TABLE public.bible_announcements ADD COLUMN IF NOT EXISTS last_acknowledged_at TIMESTAMPTZ NULL;

-- Habilitar RLS
ALTER TABLE public.bible_announcements ENABLE ROW LEVEL SECURITY;

-- Criar Políticas de Acesso Público
CREATE POLICY "Leitura pública de avisos" ON public.bible_announcements FOR SELECT USING (true);
CREATE POLICY "Controle administrativo de avisos" ON public.bible_announcements FOR ALL USING (true);


-- ==========================================================
-- AUDITORIA DE LEITURA DE AVISOS - LEITURA BÍBLICA
-- ==========================================================
DROP TABLE IF EXISTS public.bible_announcements_audit;

CREATE TABLE public.bible_announcements_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    announcement_id UUID NOT NULL, -- UUID do aviso correspondente
    user_id TEXT, -- ID do usuário (Auth) ou email
    user_name TEXT NOT NULL, -- Nome do destinatário
    acao TEXT NOT NULL DEFAULT 'ENTENDI' -- Ação registrada
);

-- Habilitar RLS
ALTER TABLE public.bible_announcements_audit ENABLE ROW LEVEL SECURITY;

-- Criar Políticas de Acesso Público/Admin para Auditoria
CREATE POLICY "Leitura pública de auditoria" ON public.bible_announcements_audit FOR SELECT USING (true);
CREATE POLICY "Inserção pública de auditoria" ON public.bible_announcements_audit FOR INSERT WITH CHECK (true);
CREATE POLICY "Controle administrativo de auditoria" ON public.bible_announcements_audit FOR ALL USING (true);

