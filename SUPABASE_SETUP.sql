
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


-- ==========================================================
-- CONFIGURAÇÕES DO SITE (SEÇÃO 2 E HERO) - BASE64 / JSONB
-- ==========================================================
-- A tabela site_config persiste as configurações do site (landing page).
-- A coluna 'value' deve ser do tipo JSONB (ou TEXT), garantindo capacidade
-- para armazenar strings Base64 longas de imagem (até 1GB no PostgreSQL)
-- sem qualquer limitação ou truncamento de caracteres.

CREATE TABLE IF NOT EXISTS public.site_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caso a tabela já exista e a coluna 'value' tenha sido criada com tipo limitado (ex: VARCHAR):
-- Execute o comando abaixo no SQL Editor do Supabase:
ALTER TABLE public.site_config ALTER COLUMN value TYPE JSONB USING value::jsonb;

-- Caso utilize coluna TEXT simples em vez de JSONB:
-- ALTER TABLE public.site_config ALTER COLUMN value TYPE TEXT;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso: Leitura pública e gravação irrestrita/admin
DROP POLICY IF EXISTS "Leitura pública de site_config" ON public.site_config;
CREATE POLICY "Leitura pública de site_config" ON public.site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gravação pública/admin de site_config" ON public.site_config;
CREATE POLICY "Gravação pública/admin de site_config" ON public.site_config FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- GESTÃO DE SLIDES DO HERO (MIGRAÇÃO PARA UPLOAD VIA BASE64)
-- ==============================================================================
-- 1. Executar no SQL Editor do Supabase para migrar a coluna de armazenamento:
ALTER TABLE public.hero_slides RENAME COLUMN redirect_url TO url_base64;
ALTER TABLE public.hero_slides ALTER COLUMN url_base64 TYPE TEXT;

-- 2. Habilitar Row Level Security (RLS) para hero_slides
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso para hero_slides (Leitura pública e gravação irrestrita/admin)
DROP POLICY IF EXISTS "Leitura pública de hero_slides" ON public.hero_slides;
CREATE POLICY "Leitura pública de hero_slides" ON public.hero_slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gravação pública/admin de hero_slides" ON public.hero_slides;
CREATE POLICY "Gravação pública/admin de hero_slides" ON public.hero_slides FOR ALL USING (true) WITH CHECK (true);




