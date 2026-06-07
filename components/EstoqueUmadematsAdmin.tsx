import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Tag, Plus, X, Check, Trash2, DollarSign, 
  Smartphone, Calendar, TrendingUp, Share2, Power, Store, 
  ChevronRight, ArrowLeft, RefreshCw, Layers, Edit3, ShieldAlert, Copy, CheckCircle2, History, Menu, BarChart
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Helper functions for Currency Masking
export const applyCurrencyMask = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  const numericValue = parseInt(digits, 10) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

export const parseCurrencyToFloat = (val: string): number => {
  if (!val) return 0;
  const cleaned = val.replace(/[^\d,.-]/g, '');
  let standard = cleaned;
  if (cleaned.includes(',') && cleaned.includes('.')) {
    standard = cleaned.replace(/\./g, '').replace(/,/g, '.');
  } else if (cleaned.includes(',')) {
    standard = cleaned.replace(/,/g, '.');
  }
  const parsed = parseFloat(standard);
  return isNaN(parsed) ? 0 : parsed;
};

// Types
export interface EstoqueProduto {
  id: string;
  name: string;
  category: 'VESTUÁRIO' | 'ITENS';
  price: number;
  initial_quantity: number;
  created_at?: string;
  variations?: EstoqueVariacao[];
}

export interface EstoqueVariacao {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
}

export interface EstoqueEvento {
  id: string;
  event_name: string;
  status: 'ABERTO' | 'FECHADO';
  opened_at?: string;
  closed_at?: string;
}

export interface EstoqueVenda {
  id: string;
  event_id: string;
  total_price: number;
  payment_method: 'PIX' | 'CARTÃO';
  status: 'CONCLUIDA' | 'CANCELADA';
  created_at: string;
  items?: EstoqueVendaItem[];
}

export interface EstoqueVendaItem {
  id: string;
  sale_id: string;
  product_id: string;
  variation_id?: string;
  quantity: number;
  price_at_sale: number;
  size?: string;
  // Join helpers
  product_name?: string;
  category?: string;
}

// Default Seed Products
const INITIAL_PRODUCTS_SEED = [
  // VESTUÁRIO
  { name: 'Camiseta Congresso Verde', category: 'VESTUÁRIO' as const, price: 50, initial_fill: 10 },
  { name: 'Camiseta Congresso Terracota', category: 'VESTUÁRIO' as const, price: 50, initial_fill: 10 },
  { name: 'Oversized Preta', category: 'VESTUÁRIO' as const, price: 70, initial_fill: 8 },
  { name: 'Oversized Penteca', category: 'VESTUÁRIO' as const, price: 70, initial_fill: 8 },
  // ITENS
  { name: 'Bíblia', category: 'ITENS' as const, price: 40, initial_quantity: 30 },
  { name: 'Adesivo', category: 'ITENS' as const, price: 5, initial_quantity: 200 },
  { name: 'Copo', category: 'ITENS' as const, price: 15, initial_quantity: 80 },
  { name: 'Trifé', category: 'ITENS' as const, price: 25, initial_quantity: 40 },
  { name: 'Box Umademats', category: 'ITENS' as const, price: 120, initial_quantity: 15 },
];

// Sizes List Config
const SIZES_CONFIG = {
  INFANTIL: ['2', '4', '6', '8', '10', '12', '14'],
  BABYLOOK: ['Babylook PP', 'Babylook P', 'Babylook M', 'Babylook G', 'Babylook GG', 'Babylook XGG'],
  ADULTO: ['PP', 'P', 'M', 'G', 'GG', 'XGG']
};

export const EstoqueUmadematsAdmin: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  // Navigation & Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<'loja' | 'estoque' | 'ultimos-eventos'>('loja');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPastEventId, setSelectedPastEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbMode, setDbMode] = useState<'SUPABASE' | 'LOCAL'>('LOCAL');

  // Core Data State
  const [produtos, setProdutos] = useState<EstoqueProduto[]>([]);
  const [eventos, setEventos] = useState<EstoqueEvento[]>([]);
  const [vendas, setVendas] = useState<EstoqueVenda[]>([]);
  const [activeEvento, setActiveEvento] = useState<EstoqueEvento | null>(null);

  // Modal States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAbrirLojaModal, setShowAbrirLojaModal] = useState(false);
  const [showVendaModal, setShowVendaModal] = useState<{ produto: EstoqueProduto; size?: string } | null>(null);
  const [showDetalhesVendasModal, setShowDetalhesVendasModal] = useState(false);
  const [showFecharLojaModal, setShowFecharLojaModal] = useState(false);
  const [showConfirmCancelVenda, setShowConfirmCancelVenda] = useState<EstoqueVenda | null>(null);
  const [showResumoEventoRealTimeModal, setShowResumoEventoRealTimeModal] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<EstoqueProduto | null>(null);
  const [productToEdit, setProductToEdit] = useState<EstoqueProduto | null>(null);
  const [productForSizes, setProductForSizes] = useState<EstoqueProduto | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Expanded clothes product sizes and checkout confirmation
  const [expandedProductSizes, setExpandedProductSizes] = useState<string | null>(null);
  const [vendaQuantidade, setVendaQuantidade] = useState<number>(1);
  const [confirmVendaData, setConfirmVendaData] = useState<{ produto: EstoqueProduto; size?: string; paymentMethod: 'PIX' | 'CARTÃO'; quantidade: number } | null>(null);

  // Edit Product Form State
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdCategory, setEditProdCategory] = useState<'VESTUÁRIO' | 'ITENS'>('VESTUÁRIO');
  const [editProdQty, setEditProdQty] = useState('');
  const [editSizeQuantities, setEditSizeQuantities] = useState<Record<string, number>>({});

  // Sizes Modal State
  const [sizesModalQuantities, setSizesModalQuantities] = useState<Record<string, number>>({});
  const [sizesModalQty, setSizesModalQty] = useState('');

  // New Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'VESTUÁRIO' | 'ITENS'>('VESTUÁRIO');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdQty, setNewProdQty] = useState('');
  // For Vestuario sizes
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});

  // Event creation form state
  const [eventoInputName, setEventoInputName] = useState('');

  // Small Size edit modal state (VESTUÁRIO)
  const [editingSizeCell, setEditingSizeCell] = useState<{ product: EstoqueProduto; size: string; curQty: number } | null>(null);
  const [newSizeQtyInput, setNewSizeQtyInput] = useState<string>('');
  
  // Custom Success Modal Message
  const [successModalMessage, setSuccessModalMessage] = useState<string | null>(null);

  // Toast Notification State
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; text: string }>>([]);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // -------------------------------------------------------------
  // SQL CODE DEFINITION FOR USER REFERENCE
  // -------------------------------------------------------------
  const SQL_CODE = `-- SCRIPT COMPLETO - ESTOQUE E POS UMADEMATS --

-- 1. Tabela de Produtos
CREATE TABLE IF NOT EXISTS estoque_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('VESTUÁRIO', 'ITENS')),
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    initial_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Variações de Tamanho (Controle Vestuário)
CREATE TABLE IF NOT EXISTS estoque_variacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES estoque_produtos(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, size)
);

-- 3. Tabela de Sessões / Eventos de Venda
CREATE TABLE IF NOT EXISTS estoque_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('ABERTO', 'FECHADO')) DEFAULT 'ABERTO',
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- 4. Tabela de Registro de Vendas
CREATE TABLE IF NOT EXISTS estoque_vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES estoque_eventos(id) ON DELETE CASCADE,
    total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('PIX', 'CARTÃO')),
    status TEXT NOT NULL CHECK(status IN ('CONCLUIDA', 'CANCELADA')) DEFAULT 'CONCLUIDA',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Itens dentro da Venda
CREATE TABLE IF NOT EXISTS estoque_venda_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES estoque_vendas(id) ON DELETE CASCADE,
    product_id UUID REFERENCES estoque_produtos(id) ON DELETE CASCADE,
    variation_id UUID REFERENCES estoque_variacoes(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_sale NUMERIC(10,2) NOT NULL,
    size TEXT, -- Cópia do tamanho para histórico rápido
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices Rápidos para Performance
CREATE INDEX IF NOT EXISTS idx_estoque_variacoes_product ON estoque_variacoes(product_id);
CREATE INDEX IF NOT EXISTS idx_estoque_vendas_event ON estoque_vendas(event_id);
CREATE INDEX IF NOT EXISTS idx_estoque_venda_itens_sale ON estoque_venda_itens(sale_id);

-- Ativar RLS se necessário (por padrão, as tabelas estarão expostas a usuários autenticados)
ALTER TABLE estoque_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_variacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_venda_itens ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Universais Para Acesso Total Temporário (ou ajuste para Admin Autenticado)
DROP POLICY IF EXISTS "Permitir leitura para todos" ON estoque_produtos;
DROP POLICY IF EXISTS "Permitir gravação para todos" ON estoque_produtos;
CREATE POLICY "Permitir leitura para todos" ON estoque_produtos FOR SELECT USING (true);
CREATE POLICY "Permitir gravação para todos" ON estoque_produtos FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir leitura para todos" ON estoque_variacoes;
DROP POLICY IF EXISTS "Permitir gravação para todos" ON estoque_variacoes;
CREATE POLICY "Permitir leitura para todos" ON estoque_variacoes FOR SELECT USING (true);
CREATE POLICY "Permitir gravação para todos" ON estoque_variacoes FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir leitura para todos" ON estoque_eventos;
DROP POLICY IF EXISTS "Permitir gravação para todos" ON estoque_eventos;
CREATE POLICY "Permitir leitura para todos" ON estoque_eventos FOR SELECT USING (true);
CREATE POLICY "Permitir gravação para todos" ON estoque_eventos FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir leitura para todos" ON estoque_vendas;
DROP POLICY IF EXISTS "Permitir gravação para todos" ON estoque_vendas;
CREATE POLICY "Permitir leitura para todos" ON estoque_vendas FOR SELECT USING (true);
CREATE POLICY "Permitir gravação para todos" ON estoque_vendas FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir leitura para todos" ON estoque_venda_itens;
DROP POLICY IF EXISTS "Permitir gravação para todos" ON estoque_venda_itens;
CREATE POLICY "Permitir leitura para todos" ON estoque_venda_itens FOR SELECT USING (true);
CREATE POLICY "Permitir gravação para todos" ON estoque_venda_itens FOR ALL USING (true);`;

  // -------------------------------------------------------------
  // CORE SYNC & LOCALSTORAGE LOGIC
  // -------------------------------------------------------------
  
  // Seed local storage with default if empty
  const getLocalStorageData = () => {
    let prods = localStorage.getItem('umademats_estoque_produtos');
    let evs = localStorage.getItem('umademats_estoque_eventos');
    let vnds = localStorage.getItem('umademats_estoque_vendas');

    if (!prods) {
      // Seed default values
      const seededProds: EstoqueProduto[] = INITIAL_PRODUCTS_SEED.map((seeded, index) => {
        const pId = `seed-${index + 1}`;
        if (seeded.category === 'VESTUÁRIO') {
          // Pre populate sizes with elegant seed quantities
          const variations: EstoqueVariacao[] = [];
          
          SIZES_CONFIG.INFANTIL.forEach(s => {
            variations.push({ id: `var-inf-${pId}-${s}`, product_id: pId, size: s, quantity: seeded.initial_fill });
          });
          SIZES_CONFIG.BABYLOOK.forEach(s => {
            variations.push({ id: `var-bl-${pId}-${s}`, product_id: pId, size: s, quantity: seeded.initial_fill });
          });
          SIZES_CONFIG.ADULTO.forEach(s => {
            variations.push({ id: `var-ad-${pId}-${s}`, product_id: pId, size: s, quantity: seeded.initial_fill });
          });

          const totalQty = variations.reduce((acc, curr) => acc + curr.quantity, 0);

          return {
            id: pId,
            name: seeded.name,
            category: 'VESTUÁRIO',
            price: seeded.price,
            initial_quantity: totalQty,
            variations
          };
        } else {
          return {
            id: pId,
            name: seeded.name,
            category: 'ITENS',
            price: seeded.price,
            initial_quantity: seeded.initial_quantity || 0,
            variations: []
          };
        }
      });
      localStorage.setItem('umademats_estoque_produtos', JSON.stringify(seededProds));
      prods = JSON.stringify(seededProds);
    }

    if (!evs) {
      localStorage.setItem('umademats_estoque_eventos', JSON.stringify([]));
      evs = '[]';
    }
    if (!vnds) {
      localStorage.setItem('umademats_estoque_vendas', JSON.stringify([]));
      vnds = '[]';
    }

    return {
      produtos: JSON.parse(prods) as EstoqueProduto[],
      eventos: JSON.parse(evs) as EstoqueEvento[],
      vendas: JSON.parse(vnds) as EstoqueVenda[]
    };
  };

  const saveLocalStorageData = (p: EstoqueProduto[], e: EstoqueEvento[], v: EstoqueVenda[]) => {
    localStorage.setItem('umademats_estoque_produtos', JSON.stringify(p));
    localStorage.setItem('umademats_estoque_eventos', JSON.stringify(e));
    localStorage.setItem('umademats_estoque_vendas', JSON.stringify(v));
  };

  // Real-time update string status
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  // Sync everything
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // 1. Try to query Supabase
      const { data: testProds, error: testErr } = await supabase
        .from('estoque_produtos')
        .select('*')
        .limit(1);

      if (testErr || !testProds) {
        // Fallback to local
        console.log("Supabase stock tables not found or unaccessible. Switching to robust Local Mode.");
        setDbMode('LOCAL');
        const local = getLocalStorageData();
        setProdutos(local.produtos);
        setEventos(local.eventos);
        setVendas(local.vendas);
        
        // Find active event
        const activeEv = local.eventos.find(ev => ev.status === 'ABERTO');
        setActiveEvento(activeEv || null);
      } else {
        // Tables exist, let's load from Supabase!
        setDbMode('SUPABASE');
        
        const [
          resProdutos,
          resVariacoes,
          resEventos,
          resVendas,
          resVendaItens
        ] = await Promise.all([
          supabase.from('estoque_produtos').select('*').order('name', { ascending: true }),
          supabase.from('estoque_variacoes').select('*'),
          supabase.from('estoque_eventos').select('*').order('opened_at', { ascending: false }),
          supabase.from('estoque_vendas').select('*').order('created_at', { ascending: false }),
          supabase.from('estoque_venda_itens').select('*')
        ]);

        const dbProdutos = resProdutos.data;
        const dbVariacoes = resVariacoes.data;
        const dbEventos = resEventos.data;
        const dbVendas = resVendas.data;
        const dbVendaItens = resVendaItens.data;

        // Compile variations and items
        const parsedProducts: EstoqueProduto[] = (dbProdutos || []).map(p => {
          const productVariations = (dbVariacoes || []).filter(v => v.product_id === p.id);
          return {
            ...p,
            variations: productVariations
          };
        });

        const compiledVendas: EstoqueVenda[] = (dbVendas || []).map(v => {
          const saleItems = (dbVendaItens || []).filter(vi => vi.sale_id === v.id).map(vi => {
            const prod = parsedProducts.find(pr => pr.id === vi.product_id);
            return {
              ...vi,
              product_name: prod ? prod.name : 'Produto Desconhecido',
              category: prod ? prod.category : 'ITENS'
            };
          });
          return {
            ...v,
            items: saleItems
          };
        });

        setProdutos(parsedProducts);
        setEventos(dbEventos || []);
        setVendas(compiledVendas);

        const openEvent = (dbEventos || []).find(e => e.status === 'ABERTO');
        setActiveEvento(openEvent || null);
      }
    } catch (err) {
      console.error("Database connection check failed:", err);
      // Local mode fallback
      setDbMode('LOCAL');
      const local = getLocalStorageData();
      setProdutos(local.produtos);
      setEventos(local.eventos);
      setVendas(local.vendas);
      const activeEv = local.eventos.find(ev => ev.status === 'ABERTO');
      setActiveEvento(activeEv || null);
    } finally {
      setLastUpdateTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto atualizacao silenciosa a cada 15 segundos
    const inv = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(inv);
  }, []);

  useEffect(() => {
    if (showVendaModal) {
      setVendaQuantidade(1);
    }
  }, [showVendaModal?.produto?.id, showVendaModal?.size]);

  const copySQL = () => {
    navigator.clipboard.writeText(SQL_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // STOCK ACTIONS (CADASTRO PRODUTOS)
  // -------------------------------------------------------------
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      showToast("Informe o nome do produto.", "error");
      return;
    }
    const price = parseCurrencyToFloat(newProdPrice) || 0;
    if (price <= 0) {
      showToast("Informe um preço válido.", "error");
      return;
    }

    setLoading(true);

    try {
      const generatedProdId = dbMode === 'SUPABASE' ? undefined : `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      let optimisticNewProduct: EstoqueProduto | null = null;
      
      if (dbMode === 'SUPABASE') {
        // Real Supabase Insert
        const qtyVal = newProdCategory === 'ITENS' ? (parseInt(newProdQty) || 0) : 0;
        const { data: insertedProduct, error: prodErr } = await supabase
          .from('estoque_produtos')
          .insert([{ name: newProdName, category: newProdCategory, price, initial_quantity: qtyVal }])
          .select()
          .single();

        if (prodErr) throw prodErr;

        if (insertedProduct) {
          let compiledVars: EstoqueVariacao[] = [];
          
          if (newProdCategory === 'VESTUÁRIO') {
            // Add variations
            const varsToInsert = Object.entries(sizeQuantities)
              .filter(([_, qty]) => (qty as number) > 0)
              .map(([size, qty]) => ({
                product_id: insertedProduct.id,
                size,
                quantity: qty as number
              }));

            if (varsToInsert.length > 0) {
              const { error: varErr, data: insertedVars } = await supabase
                .from('estoque_variacoes')
                .insert(varsToInsert)
                .select();
              
              if (varErr) throw varErr;
              compiledVars = (insertedVars || []).map(v => ({
                id: v.id,
                product_id: v.product_id,
                size: v.size,
                quantity: v.quantity
              }));
            }
          }

          const sumOfSizes = compiledVars.reduce((sum, item) => sum + item.quantity, 0);

          optimisticNewProduct = {
            id: insertedProduct.id,
            name: insertedProduct.name,
            category: insertedProduct.category,
            price: insertedProduct.price,
            initial_quantity: insertedProduct.category === 'VESTUÁRIO' ? sumOfSizes : insertedProduct.initial_quantity,
            variations: compiledVars
          };
        }
      } else {
        // Local Sync
        let totalQty = 0;
        let CompiledVars: EstoqueVariacao[] = [];

        if (newProdCategory === 'VESTUÁRIO') {
          CompiledVars = Object.entries(sizeQuantities)
            .filter(([_, qty]) => (qty as number) > 0)
            .map(([size, qty], index) => {
              totalQty += (qty as number);
              return {
                id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${index}`,
                product_id: generatedProdId!,
                size,
                quantity: qty as number
              };
            });
        } else {
          totalQty = parseInt(newProdQty) || 0;
        }

        optimisticNewProduct = {
          id: generatedProdId!,
          name: newProdName,
          category: newProdCategory,
          price,
          initial_quantity: totalQty,
          variations: CompiledVars
        };

        const updatedProducts = [...produtos, optimisticNewProduct];
        saveLocalStorageData(updatedProducts, eventos, vendas);
      }

      // Optimistically insert and sort locally
      if (optimisticNewProduct) {
        setProdutos(prev => [...prev, optimisticNewProduct!].sort((a, b) => a.name.localeCompare(b.name)));
      }

      // Close state and cleanup
      setShowAddProductModal(false);
      setNewProdName('');
      setNewProdPrice('');
      setNewProdQty('');
      setSizeQuantities({});
      setSuccessModalMessage("Produto cadastrado com sucesso!");

      // Silently refresh in background
      loadData(true);
    } catch (err: any) {
      console.error(err);
      showToast("Erro ao cadastrar produto: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    // 1. Optimistic UI state update
    const previousProducts = [...produtos];
    setProdutos(prev => prev.filter(p => p.id !== id));

    setLoading(true);
    try {
      if (dbMode === 'SUPABASE') {
        const { error } = await supabase.from('estoque_produtos').delete().eq('id', id);
        if (error) throw error;
      } else {
        const updatedProducts = previousProducts.filter(p => p.id !== id);
        saveLocalStorageData(updatedProducts, eventos, vendas);
      }
      setSuccessModalMessage("Produto excluído com sucesso!");
      // Silently sync background
      loadData(true);
    } catch (err: any) {
      console.error("Erro ao excluir produto:", err.message);
      setProdutos(previousProducts); // revert if failed
      showToast("Erro ao excluir produto: " + err.message, "error");
    } finally {
      setLoading(false);
      setProductToDelete(null);
    }
  };

  const handleUpdateProduct = async (
    productId: string,
    updatedData: {
      name: string;
      price: number;
      category: 'VESTUÁRIO' | 'ITENS';
      initial_quantity?: number;
      variations?: { size: string; quantity: number }[];
    }
  ) => {
    // 1. Optimistic local state update
    const previousProducts = [...produtos];

    let computedTotalQty = 0;
    let optimisticVars: EstoqueVariacao[] = [];
    if (updatedData.category === 'VESTUÁRIO' && updatedData.variations) {
      optimisticVars = updatedData.variations.map((v, index) => {
        computedTotalQty += v.quantity;
        return {
          id: `var-temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${index}`,
          product_id: productId,
          size: v.size,
          quantity: v.quantity
        };
      });
    } else {
      computedTotalQty = updatedData.initial_quantity || 0;
    }

    setProdutos(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          name: updatedData.name,
          price: updatedData.price,
          category: updatedData.category,
          initial_quantity: computedTotalQty,
          variations: optimisticVars
        };
      }
      return p;
    }));

    setLoading(true);
    try {
      if (dbMode === 'SUPABASE') {
        // Update core product parameters
        const { error: prodErr } = await supabase
          .from('estoque_produtos')
          .update({
            name: updatedData.name,
            price: updatedData.price,
            category: updatedData.category,
            initial_quantity: updatedData.category === 'ITENS' ? (updatedData.initial_quantity || 0) : 0
          })
          .eq('id', productId);
        if (prodErr) throw prodErr;

        if (updatedData.category === 'VESTUÁRIO' && updatedData.variations) {
          // Fetch existing variations for this product
          const { data: existingVars, error: fetchErr } = await supabase
            .from('estoque_variacoes')
            .select('*')
            .eq('product_id', productId);
            
          if (fetchErr) throw fetchErr;

          const existingMap = new Map<string, string>(); // size -> id
          (existingVars || []).forEach(ev => {
            existingMap.set(ev.size, ev.id);
          });

          // Perform individual insert or update to guarantee persistence
          for (const v of updatedData.variations) {
            const existingId = existingMap.get(v.size);
            if (existingId) {
              const { error: updErr } = await supabase
                .from('estoque_variacoes')
                .update({ quantity: v.quantity })
                .eq('id', existingId);
              if (updErr) throw updErr;
            } else {
              const { error: insErr } = await supabase
                .from('estoque_variacoes')
                .insert([{
                  product_id: productId,
                  size: v.size,
                  quantity: v.quantity
                }]);
              if (insErr) throw insErr;
            }
          }
        } else if (updatedData.category === 'ITENS') {
          // If changed to items, remove variation records from db to prevent orphans
          const { error: delErr } = await supabase
            .from('estoque_variacoes')
            .delete()
            .eq('product_id', productId);
          if (delErr) throw delErr;
        }
      } else {
        // Local mode fallback
        const updatedProducts = previousProducts.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              name: updatedData.name,
              price: updatedData.price,
              category: updatedData.category,
              initial_quantity: computedTotalQty,
              variations: optimisticVars
            };
          }
          return p;
        });

        saveLocalStorageData(updatedProducts, eventos, vendas);
      }

      showToast("Produto atualizado com sucesso!", "success");
      // Sync in background
      loadData();
    } catch (err: any) {
      console.error("Erro ao atualizar produto:", err.message);
      setProdutos(previousProducts); // revert if failed
      showToast("Erro ao salvar alterações: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareEdit = (p: EstoqueProduto) => {
    setProductToEdit(p);
    setEditProdName(p.name);
    setEditProdPrice(applyCurrencyMask(p.price.toFixed(2).replace(/\D/g, '')));
    setEditProdCategory(p.category);
    setEditProdQty(p.category === 'ITENS' ? p.initial_quantity.toString() : '');
    
    const sizeMap: Record<string, number> = {};
    const allPossibleSizes = [
      ...SIZES_CONFIG.INFANTIL,
      ...SIZES_CONFIG.BABYLOOK,
      ...SIZES_CONFIG.ADULTO
    ];
    allPossibleSizes.forEach(s => {
      const match = (p.variations || []).find(v => v.size === s);
      sizeMap[s] = match ? match.quantity : 0;
    });
    setEditSizeQuantities(sizeMap);
  };

  const handlePrepareSizes = (p: EstoqueProduto) => {
    setProductForSizes(p);
    setSizesModalQty(p.category === 'ITENS' ? p.initial_quantity.toString() : '');
    
    const sizeMap: Record<string, number> = {};
    const allPossibleSizes = [
      ...SIZES_CONFIG.INFANTIL,
      ...SIZES_CONFIG.BABYLOOK,
      ...SIZES_CONFIG.ADULTO
    ];
    allPossibleSizes.forEach(s => {
      const match = (p.variations || []).find(v => v.size === s);
      sizeMap[s] = match ? match.quantity : 0;
    });
    setSizesModalQuantities(sizeMap);
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit) return;
    if (!editProdName.trim()) {
      showToast("Informe o nome do produto.", "error");
      return;
    }
    const price = parseCurrencyToFloat(editProdPrice) || 0;
    if (price <= 0) {
      showToast("Informe um preço válido.", "error");
      return;
    }

    const qtyVal = editProdCategory === 'ITENS' ? (parseInt(editProdQty) || 0) : 0;
    const variationsToSave = editProdCategory === 'VESTUÁRIO' 
      ? Object.entries(editSizeQuantities).map(([size, quantity]) => ({ size, quantity: Number(quantity) }))
      : [];

    await handleUpdateProduct(productToEdit.id, {
      name: editProdName,
      price,
      category: editProdCategory,
      initial_quantity: qtyVal,
      variations: variationsToSave
    });

    setProductToEdit(null);
  };

  const handleSaveProductSizes = async () => {
    if (!productForSizes) return;
    
    const qtyVal = productForSizes.category === 'ITENS' ? (parseInt(sizesModalQty) || 0) : 0;
    const variationsToSave = productForSizes.category === 'VESTUÁRIO' 
      ? Object.entries(sizesModalQuantities).map(([size, quantity]) => ({ size, quantity: Number(quantity) }))
      : [];

    await handleUpdateProduct(productForSizes.id, {
      name: productForSizes.name,
      price: productForSizes.price,
      category: productForSizes.category,
      initial_quantity: qtyVal,
      variations: variationsToSave
    });

    setProductForSizes(null);
  };

  const handleSaveSizeQtyDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSizeCell) return;
    const parsedQty = parseInt(newSizeQtyInput, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      showToast("Informe uma quantidade de tamanho válida (número não negativo).", "error");
      return;
    }

    if (editingSizeCell.product.id === 'new-product') {
      setSizeQuantities(prev => ({
        ...prev,
        [editingSizeCell.size]: parsedQty
      }));
      setEditingSizeCell(null);
      return;
    }

    if (editingSizeCell.product.id === 'edit-product') {
      setEditSizeQuantities(prev => ({
        ...prev,
        [editingSizeCell.size]: parsedQty
      }));
      setEditingSizeCell(null);
      return;
    }

    // Live optimistic update
    const previousProducts = [...produtos];
    const { product, size } = editingSizeCell;

    setProdutos(prev => prev.map(p => {
      if (p.id === product.id) {
        let found = false;
        const updatedVars = (p.variations || []).map(v => {
          if (v.size === size) {
            found = true;
            return { ...v, quantity: parsedQty };
          }
          return v;
        });
        if (!found) {
          updatedVars.push({
            id: `var-temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            product_id: product.id,
            size,
            quantity: parsedQty
          });
        }
        const totalQty = updatedVars.reduce((sum, current) => sum + current.quantity, 0);
        return { ...p, variations: updatedVars, initial_quantity: totalQty };
      }
      return p;
    }));

    setLoading(true);
    try {
      if (dbMode === 'SUPABASE') {
        const matchVar = (product.variations || []).find(v => v.size === size);
        if (matchVar) {
          const { error: err } = await supabase
            .from('estoque_variacoes')
            .update({ quantity: parsedQty })
            .eq('id', matchVar.id);
          if (err) throw err;
        } else {
          const { error: err } = await supabase
            .from('estoque_variacoes')
            .insert([{ product_id: product.id, size, quantity: parsedQty }]);
          if (err) throw err;
        }
      } else {
        const updatedProducts = previousProducts.map(p => {
          if (p.id === product.id) {
            let found = false;
            const updatedVars = (p.variations || []).map(v => {
              if (v.size === size) {
                found = true;
                return { ...v, quantity: parsedQty };
              }
              return v;
            });
            if (!found) {
              updatedVars.push({
                id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                product_id: product.id,
                size,
                quantity: parsedQty
              });
            }
            const totalQty = updatedVars.reduce((sum, current) => sum + current.quantity, 0);
            return { ...p, variations: updatedVars, initial_quantity: totalQty };
          }
          return p;
        });
        saveLocalStorageData(updatedProducts, eventos, vendas);
      }

      showToast("Quantidade do tamanho atualizada com sucesso!", "success");

      // Background refetch
      loadData();

      // Refetch and sync size modal state instantly too
      if (productForSizes && productForSizes.id === product.id) {
        setSizesModalQuantities(prev => ({
          ...prev,
          [size]: parsedQty
        }));
      }

      setEditingSizeCell(null);
    } catch (err: any) {
      console.error(err);
      setProdutos(previousProducts); // rollback
      showToast("Erro ao salvar quantidade: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper inside form to handle size quantity shifts
  const updateSizeQty = (size: string, val: string) => {
    const parsed = parseInt(val) || 0;
    setSizeQuantities(prev => ({
      ...prev,
      [size]: parsed
    }));
  };

  // -------------------------------------------------------------
  // EVENT OPERATIONS (LOJA WORKFLOW)
  // -------------------------------------------------------------
  const handleIniciarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoInputName.trim()) {
      showToast("Informe o nome do evento.", "error");
      return;
    }

    setLoading(true);
    try {
      if (dbMode === 'SUPABASE') {
        const { data: newEv, error: evErr } = await supabase
          .from('estoque_eventos')
          .insert([{ event_name: eventoInputName, status: 'ABERTO' }])
          .select()
          .single();

        if (evErr) throw evErr;
        setActiveEvento(newEv);
      } else {
        const newEv: EstoqueEvento = {
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          event_name: eventoInputName,
          status: 'ABERTO',
          opened_at: new Date().toISOString()
        };
        const updatedEvents = [...eventos, newEv];
        saveLocalStorageData(produtos, updatedEvents, vendas);
        setActiveEvento(newEv);
      }
      await loadData();
      setShowAbrirLojaModal(false);
      setEventoInputName('');
      showToast("Evento iniciado com sucesso!", "success");
    } catch (err: any) {
      showToast("Erro ao iniciar evento: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = (amount: number) => {
    if (!showVendaModal) return;
    const availableStock = showVendaModal.produto.category === 'VESTUÁRIO' && showVendaModal.size
      ? (showVendaModal.produto.variations?.find(v => v.size === showVendaModal.size)?.quantity || 0)
      : (showVendaModal.produto.initial_quantity || 0);

    setVendaQuantidade(prev => {
      const newQty = prev + amount;
      if (newQty < 1) return 1;
      if (newQty > availableStock) {
        showToast(`Quantidade superior ao estoque disponível! Máximo: ${availableStock}`, "error");
        return availableStock;
      }
      return newQty;
    });
  };

  const handleQtyInputChange = (val: string) => {
    if (!showVendaModal) return;
    const availableStock = showVendaModal.produto.category === 'VESTUÁRIO' && showVendaModal.size
      ? (showVendaModal.produto.variations?.find(v => v.size === showVendaModal.size)?.quantity || 0)
      : (showVendaModal.produto.initial_quantity || 0);

    if (val === '') {
      setVendaQuantidade(0);
      return;
    }
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      setVendaQuantidade(1);
    } else if (parsed > availableStock) {
      showToast(`Quantidade superior ao estoque disponível! Máximo: ${availableStock}`, "error");
      setVendaQuantidade(availableStock);
    } else {
      setVendaQuantidade(parsed);
    }
  };

  // -------------------------------------------------------------
  // SALES TRANSACTIONS (VENDER, BAIXA DIRETA DE ESTOQUE)
  // -------------------------------------------------------------
  const handleRegisterVenda = async (payment_method: 'PIX' | 'CARTÃO') => {
    if (!activeEvento || !showVendaModal) return;
    const { produto, size } = showVendaModal;
    const chosenQuantity = confirmVendaData?.quantidade || vendaQuantidade || 1;

    setLoading(true);

    try {
      if (dbMode === 'SUPABASE') {
        // Double Check stock on clothes
        let selectedVarId = undefined;
        if (produto.category === 'VESTUÁRIO' && size) {
          const matchedVar = produto.variations?.find(v => v.size === size);
          if (!matchedVar || matchedVar.quantity < chosenQuantity) {
            showToast(`Estoque insuficiente! Apenas ${matchedVar?.quantity || 0} disponível.`, "error");
            setLoading(false);
            return;
          }
          selectedVarId = matchedVar.id;
        } else if (produto.category === 'ITENS' && produto.initial_quantity < chosenQuantity) {
          showToast(`Estoque insuficiente! Apenas ${produto.initial_quantity || 0} disponível.`, "error");
          setLoading(false);
          return;
        }

        // 1. Insert into Sales
        const { data: dbSale, error: saleErr } = await supabase
          .from('estoque_vendas')
          .insert([{ event_id: activeEvento.id, total_price: produto.price * chosenQuantity, payment_method, status: 'CONCLUIDA' }])
          .select()
          .single();

        if (saleErr) throw saleErr;

        // 2. Insert into Sale items
        if (dbSale) {
          const { error: itemErr } = await supabase
            .from('estoque_venda_itens')
            .insert([{
              sale_id: dbSale.id,
              product_id: produto.id,
              variation_id: selectedVarId,
              quantity: chosenQuantity,
              price_at_sale: produto.price,
              size
            }]);

          if (itemErr) throw itemErr;

          // 3. Subtract stock manually inside Supabase (if trigger is not configured)
          if (produto.category === 'VESTUÁRIO' && selectedVarId) {
            const currentQty = produto.variations?.find(v => v.id === selectedVarId)?.quantity || 0;
            await supabase
              .from('estoque_variacoes')
              .update({ quantity: currentQty - chosenQuantity })
              .eq('id', selectedVarId);
          } else {
            const currentQty = produto.initial_quantity || 0;
            await supabase
              .from('estoque_produtos')
              .update({ initial_quantity: currentQty - chosenQuantity })
              .eq('id', produto.id);
          }

          // Update local state instantly for zero-latency screen refresh
          const updatedProducts = produtos.map(p => {
            if (p.id === produto.id) {
              if (p.category === 'VESTUÁRIO') {
                const updatedVars = (p.variations || []).map(v => {
                  if (v.size === size) {
                    return { ...v, quantity: Math.max(0, v.quantity - chosenQuantity) };
                  }
                  return v;
                });
                const sumQty = updatedVars.reduce((sum, current) => sum + current.quantity, 0);
                return { ...p, variations: updatedVars, initial_quantity: sumQty };
              } else {
                return { ...p, initial_quantity: Math.max(0, p.initial_quantity - chosenQuantity) };
              }
            }
            return p;
          });

          const newSale: EstoqueVenda = {
            id: dbSale.id,
            event_id: activeEvento.id,
            total_price: produto.price * chosenQuantity,
            payment_method,
            status: 'CONCLUIDA',
            created_at: dbSale.created_at || new Date().toISOString(),
            items: [{
              id: `sale-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              sale_id: dbSale.id,
              product_id: produto.id,
              quantity: chosenQuantity,
              price_at_sale: produto.price,
              size,
              product_name: produto.name,
              category: produto.category
            }]
          };

          setProdutos(updatedProducts);
          setVendas(prev => [newSale, ...prev]);
        }
      } else {
        // LOCAL DB WORKFLOW
        // 1. Subtract Stock Local
        const updatedProducts = produtos.map(p => {
          if (p.id === produto.id) {
            if (p.category === 'VESTUÁRIO') {
              const updatedVars = (p.variations || []).map(v => {
                if (v.size === size) {
                  return { ...v, quantity: Math.max(0, v.quantity - chosenQuantity) };
                }
                return v;
              });
              const sumQty = updatedVars.reduce((sum, current) => sum + current.quantity, 0);
              return { ...p, variations: updatedVars, initial_quantity: sumQty };
            } else {
              return { ...p, initial_quantity: Math.max(0, p.initial_quantity - chosenQuantity) };
            }
          }
          return p;
        });

        // 2. Create Sale
        const saleId = `sale-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newSale: EstoqueVenda = {
          id: saleId,
          event_id: activeEvento.id,
          total_price: produto.price * chosenQuantity,
          payment_method,
          status: 'CONCLUIDA',
          created_at: new Date().toISOString(),
          items: [{
            id: `sale-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            sale_id: saleId,
            product_id: produto.id,
            quantity: chosenQuantity,
            price_at_sale: produto.price,
            size,
            product_name: produto.name,
            category: produto.category
          }]
        };

        const updatedSales = [newSale, ...vendas];
        saveLocalStorageData(updatedProducts, eventos, updatedSales);
        
        // Update states directly
        setProdutos(updatedProducts);
        setVendas(updatedSales);
      }

      setSuccessModalMessage("Venda registrada com sucesso!");
      loadData(true);
      setShowVendaModal(null);
    } catch (err: any) {
      showToast("Erro ao realizar venda: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CANCEL SALES (ESTORNO AUTOMÁTICO DE ESTOQUE)
  // -------------------------------------------------------------
  const handleConfirmCancelarVenda = async () => {
    if (!showConfirmCancelVenda) return;
    const sale = showConfirmCancelVenda;
    setLoading(true);

    try {
      if (dbMode === 'SUPABASE') {
        // 1. Flag sale as CANCELADA
        const { error: cancelErr } = await supabase
          .from('estoque_vendas')
          .update({ status: 'CANCELADA' })
          .eq('id', sale.id);

        if (cancelErr) throw cancelErr;

        // 2. Query items to restore stock
        const { data: sItems } = await supabase
          .from('estoque_venda_itens')
          .select('*')
          .eq('sale_id', sale.id);

        if (sItems) {
          for (const item of sItems) {
            if (item.variation_id) {
              // Get current variation qty
              const { data: curVar } = await supabase.from('estoque_variacoes').select('quantity').eq('id', item.variation_id).single();
              if (curVar) {
                await supabase
                  .from('estoque_variacoes')
                  .update({ quantity: curVar.quantity + item.quantity })
                  .eq('id', item.variation_id);
              }
            } else {
              // Item stock
              const { data: curProd } = await supabase.from('estoque_produtos').select('initial_quantity').eq('id', item.product_id).single();
              if (curProd) {
                await supabase
                  .from('estoque_produtos')
                  .update({ initial_quantity: curProd.initial_quantity + item.quantity })
                  .eq('id', item.product_id);
              }
            }
          }
        }
      } else {
        // LOCAL DB WORKFLOW
        // Restore quantities to products list
        const saleItem = sale.items && sale.items[0];
        
        let restoredProducts = [...produtos];
        if (saleItem) {
          restoredProducts = produtos.map(p => {
            if (p.id === saleItem.product_id) {
              if (p.category === 'VESTUÁRIO') {
                const updatedVars = (p.variations || []).map(v => {
                  if (v.size === saleItem.size) {
                    return { ...v, quantity: v.quantity + saleItem.quantity };
                  }
                  return v;
                });
                const sumQty = updatedVars.reduce((sum, current) => sum + current.quantity, 0);
                return { ...p, variations: updatedVars, initial_quantity: sumQty };
              } else {
                return { ...p, initial_quantity: p.initial_quantity + saleItem.quantity };
              }
            }
            return p;
          });
        }

        // Change Status local
        const updatedSales = vendas.map(v => {
          if (v.id === sale.id) {
            return { ...v, status: 'CANCELADA' as const };
          }
          return v;
        });

        saveLocalStorageData(restoredProducts, eventos, updatedSales);
      }

      loadData(true);
      setShowConfirmCancelVenda(null);
      setSuccessModalMessage("Venda cancelada e estoque estornado com sucesso!");
    } catch (err: any) {
      showToast("Erro ao estornar venda: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CLOSE SHOP WORKFLOW (FECHAMENTO DE EVENTO & WHATSAPP)
  // -------------------------------------------------------------
  const handleFecharLojaConfirm = async () => {
    if (!activeEvento) return;
    setLoading(true);

    try {
      if (dbMode === 'SUPABASE') {
        const { error: closeErr } = await supabase
          .from('estoque_eventos')
          .update({ status: 'FECHADO', closed_at: new Date().toISOString() })
          .eq('id', activeEvento.id);
        if (closeErr) throw closeErr;
      } else {
        const updatedEvents = eventos.map(ev => {
          if (ev.id === activeEvento.id) {
            return { ...ev, status: 'FECHADO' as const, closed_at: new Date().toISOString() };
          }
          return ev;
        });
        saveLocalStorageData(produtos, updatedEvents, vendas);
      }

      // Keep active event stored locally for the final summary modal presentation after closure
      setShowFecharLojaModal(true);
      setActiveEvento(null);
      setSuccessModalMessage("Loja fechada com sucesso!");
      loadData(true);
    } catch (err: any) {
      showToast("Erro ao fechar evento: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculations for current/last event sales metrics
  const activeEventSales = useMemo(() => {
    // We should fallback to the most recent event, which is at index 0 because we prepend new ones or Supabase orders by DESC.
    const targetEventId = activeEvento?.id || (eventos.length > 0 ? eventos[0].id : null);
    if (!targetEventId) return [];
    const salesFiltered = vendas.filter(v => v.event_id === targetEventId);
    return Array.from(new Map(salesFiltered.map(v => [v.id, v])).values());
  }, [vendas, activeEvento, eventos]);

  const activeEventSummary = useMemo(() => {
    const activeSales = activeEventSales.filter(v => v.status === 'CONCLUIDA');
    const canceledSales = activeEventSales.filter(v => v.status === 'CANCELADA');

    const totalSold = activeSales.reduce((acc, curr) => acc + Number(curr.total_price), 0);
    const pixTotal = activeSales.filter(v => v.payment_method === 'PIX').reduce((acc, curr) => acc + Number(curr.total_price), 0);
    const cardTotal = activeSales.filter(v => v.payment_method === 'CARTÃO').reduce((acc, curr) => acc + Number(curr.total_price), 0);

    // Group product counts
    const productCounts: Record<string, { qty: number; total: number; sizeStr?: string }> = {};
    activeSales.forEach(s => {
      if (s.items) {
        s.items.forEach(item => {
          const key = item.size ? `${item.product_name} (${item.size})` : `${item.product_name}`;
          if (!productCounts[key]) {
            productCounts[key] = { qty: 0, total: 0 };
          }
          productCounts[key].qty += item.quantity;
          productCounts[key].total += item.quantity * Number(item.price_at_sale);
        });
      } else {
        // Fallback standard item compiled manually on older builds/joins
        const firstChar = s.id;
      }
    });

    return {
      totalSold,
      pixTotal,
      cardTotal,
      products: Object.entries(productCounts).map(([name, data]) => ({ name, ...data })),
      canceledCount: canceledSales.length,
      canceledTotal: canceledSales.reduce((acc, curr) => acc + Number(curr.total_price), 0),
    };
  }, [activeEventSales]);

  // WhatsApp formatted string API trigger
  const handleShareWhatsApp = () => {
    const targetEvent = activeEvento || (eventos.length > 0 ? eventos[0] : null);
    if (!targetEvent) return;

    const summary = activeEventSummary;
    let message = `*RESUMO DO EVENTO - ESTOQUE UMADEMATS*\n`;
    message += `*Evento:* ${targetEvent.event_name}\n`;
    message += `*Status:* SEÇÃO REALIZADA / FECHADA\n`;
    message += `------------------------------------\n\n`;
    message += `*📊 FATURAMENTO GERADO:*\n`;
    message += `• *Total Vendido:* R$ ${summary.totalSold.toFixed(2).replace('.', ',')}\n`;
    message += `• *Total em PIX:* R$ ${summary.pixTotal.toFixed(2).replace('.', ',')}\n`;
    message += `• *Total em CARTÃO:* R$ ${summary.cardTotal.toFixed(2).replace('.', ',')}\n\n`;

    message += `*📦 ITENS E QUANTIDADES VENDIDAS:*\n`;
    if (summary.products.length === 0) {
      message += `_Nenhum produto vendido._\n`;
    } else {
      summary.products.forEach(p => {
        message += `• ${p.name}: ${p.qty}x (R$ ${p.total.toFixed(2).replace('.', ',')})\n`;
      });
    }

    message += `\n_Relatório gerado em: ${new Date().toLocaleString('pt-BR')}_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const uniqueProdutos = useMemo(() => {
    return Array.from(new Map(produtos.map(p => [p.id, p])).values());
  }, [produtos]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#FAFAFA] text-slate-800 font-sans overflow-hidden absolute inset-0 z-50">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-[280px] h-full bg-[#111827] text-white shrink-0 shadow-xl relative z-10">
        <div className="p-6 flex items-center justify-center border-b border-white/10 h-24">
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src="https://res.cloudinary.com/dnoqaitd6/image/upload/v1780755790/lojaumadematslogo_czyapl.png" 
              alt="Logo" 
              className="max-w-full max-h-16 object-contain" 
            />
          </div>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveSubTab('loja')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeSubTab === 'loja' ? 'bg-white text-[#111827] font-bold shadow-sm' : 'hover:bg-white/10 text-white/90 font-small'}`}>
            <Store size={20} /> <span className="uppercase tracking-widest text-[8px] lg:text-xs font-black text-center lg:text-left">Abrir Loja</span>
          </button>
          <button onClick={() => setActiveSubTab('estoque')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeSubTab === 'estoque' ? 'bg-white text-[#111827] font-bold shadow-sm' : 'hover:bg-white/10 text-white/90 font-medium'}`}>
            <ShoppingBag size={20} /> <span className="uppercase tracking-widest text-[8px] lg:text-xs font-black text-center lg:text-left">Estoque</span>
          </button>
          <button onClick={() => setActiveSubTab('ultimos-eventos')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeSubTab === 'ultimos-eventos' ? 'bg-white text-[#111827] font-bold shadow-sm' : 'hover:bg-white/10 text-white/90 font-medium'}`}>
            <History size={20} /> <span className="uppercase tracking-widest text-[8px] lg:text-xs font-black text-center lg:text-left">Últimos Eventos</span>
          </button>
        </nav>
        {onBack && (
          <div className="p-6 border-t border-white/10">
            <button onClick={onBack} className="w-full flex justify-center items-center gap-2 p-4 rounded-xl border border-white/20 text-white/70 uppercase font-bold text-xs tracking-widest hover:text-white hover:bg-white/10 transition-colors">
              <ArrowLeft size={16} /> Voltar ao Gestor
            </button>
          </div>
        )}
      </aside>

      {/* MOBILE TOPBAR */}
      <div className="md:hidden flex items-center justify-between bg-[#111827] text-white p-4 shrink-0 shadow-md relative z-10">
        <h1 className="font-montserrat font-bold uppercase tracking-widest text-sm flex items-center gap-2">
           {activeSubTab === 'loja' && <><Store size={18} /> Abrir Loja</>}
           {activeSubTab === 'estoque' && <><ShoppingBag size={18} /> Estoque</>}
           {activeSubTab === 'ultimos-eventos' && <><History size={18} /> Últimos Eventos</>}
        </h1>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
           <Menu size={20} />
        </button>
      </div>

      {/* MOBILE MENU MODAL */}
      <AnimatePresence>
        {isMobileMenuOpen && (
           <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="fixed inset-0 bg-[#111827] z-[99999] flex flex-col items-center justify-start p-6 text-white md:hidden overflow-y-auto">
              <div className="flex w-full items-center justify-between mb-8 opacity-100 pb-4 border-b border-white/10">
                 <div className="w-[140px] h-[50px] flex items-center justify-center">
                   <img src="https://res.cloudinary.com/dnoqaitd6/image/upload/v1780755790/lojaumadematslogo_czyapl.png" alt="Loja" className="max-w-full max-h-full object-contain" />
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-white/10 rounded-xl hover:bg-white/20">
                    <X size={24} />
                 </button>
              </div>
              <div className="flex flex-col gap-4 w-full">
                 <button onClick={() => { setActiveSubTab('loja'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start px-6 py-5 rounded-2xl border ${activeSubTab === 'loja' ? 'bg-white text-[#111827] border-white shadow-lg scale-[1.02]' : 'bg-transparent border-white/20 text-white'}`}>
                    <span className="font-bold uppercase tracking-widest text-sm flex items-center gap-4"><Store size={22} /> Abrir Loja</span>
                 </button>
                 <button onClick={() => { setActiveSubTab('estoque'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start px-6 py-5 rounded-2xl border ${activeSubTab === 'estoque' ? 'bg-white text-[#111827] border-white shadow-lg scale-[1.02]' : 'bg-transparent border-white/20 text-white'}`}>
                    <span className="font-bold uppercase tracking-widest text-sm flex items-center gap-4"><ShoppingBag size={22} /> Estoque</span>
                 </button>
                 <button onClick={() => { setActiveSubTab('ultimos-eventos'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start px-6 py-5 rounded-2xl border ${activeSubTab === 'ultimos-eventos' ? 'bg-white text-[#111827] border-white shadow-lg scale-[1.02]' : 'bg-transparent border-white/20 text-white'}`}>
                    <span className="font-bold uppercase tracking-widest text-sm flex items-center gap-4"><History size={22} /> Últimos Eventos</span>
                 </button>
                 
                 {onBack && (
                     <button onClick={onBack} className="mt-6 w-full flex justify-center items-center gap-2 p-5 rounded-xl border border-white/10 bg-white/5 text-white/70 uppercase font-bold text-xs tracking-widest hover:text-white hover:bg-white/10">
                        <ArrowLeft size={16} /> Voltar ao Gestor
                     </button>
                 )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto w-full relative bg-[#FAFAFA]">
        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest hidden sm:inline-block">
             Update: {lastUpdateTime || '---'}
           </span>
        </div>
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-24">

      {/* SECTION 1: ESTOQUE MANAGEMENT */}
      {activeSubTab === 'estoque' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <h2 className="text-xl font-montserrat font-bold uppercase tracking-wider text-[#111827]">Gestão de Estoque</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowAddProductModal(true)}
                className="w-full sm:w-auto h-9 bg-[#111827] hover:bg-[#111827]/90 text-white px-5 rounded-lg font-bold uppercase text-[11px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Plus size={14} strokeWidth={2.5} />
                Adicionar Produto
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {produtos.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-xl border border-slate-200 shadow-sm">
                <ShoppingBag size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400">Nenhum produto cadastrado no estoque.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {uniqueProdutos.map(p => {
                  const itemsCount = p.category === 'VESTUÁRIO' 
                    ? (p.variations || []).reduce((sum, current) => sum + current.quantity, 0)
                    : p.initial_quantity;

                  return (
                    <div 
                      key={p.id}
                      onClick={() => handlePrepareSizes(p)}
                      className="bg-white hover:border-[#111827]/30 border border-slate-200 p-3.5 rounded-xl transition-all cursor-pointer select-none shadow-sm flex flex-col justify-between"
                    >
                      {/* Top Row: Type - Product Name - Edit/Delete Icons */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0 font-sans font-medium text-slate-800 pt-0.5">
                          <span className={`${p.category === 'VESTUÁRIO' ? 'bg-[#111827]/10 text-[#111827]' : 'bg-[#75BCE8]/20 text-[#75BCE8]'} text-[9px] tracking-wider uppercase font-extrabold shrink-0 px-1.5 py-0.5 rounded-md`}>
                            {p.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrepareEdit(p);
                            }}
                            className="text-slate-400 hover:text-[#111827] p-1 hover:bg-slate-100 rounded transition-all"
                            title="Editar Produto"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductToDelete(p);
                            }}
                            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-all"
                            title="Excluir Produto"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Middle: Name */}
                      <div className="mb-2">
                         <span className="truncate text-sm text-slate-800 font-bold block">{p.name}</span>
                      </div>

                      {/* Bottom Row: Quantity - Price */}
                      <div className="flex items-center justify-between text-xs text-slate-500 font-sans leading-none font-bold mt-auto pt-2">
                        <span className="text-[10px] uppercase">{itemsCount} un.</span>
                        <span className="font-mono text-[#111827] font-black tracking-tighter">
                          R$ {p.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: LIVE STORE TERMINAL */}
      {activeSubTab === 'loja' && (
        <div className="space-y-4">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto ml-auto">
              {activeEvento ? (
                <>
                  <button
                    onClick={() => setShowResumoEventoRealTimeModal(true)}
                    className="w-full sm:w-auto h-9 bg-white border border-[#111827] hover:bg-slate-50 text-[#111827] px-5 rounded-lg font-bold uppercase text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <BarChart size={14} />
                    Resumo do Evento
                  </button>
                  <div className="bg-[#75BCE8]/15 border border-[#75BCE8]/35 px-4 py-2 rounded-xl flex items-center justify-between sm:justify-start gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Store size={14} className="text-[#111827] animate-pulse" />
                      <div className="text-left">
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider leading-none">Loja Aberta</p>
                        <p className="text-[11px] text-[#111827] font-bold max-w-[125px] truncate pt-0.5">{activeEvento.event_name}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFecharLojaConfirm()}
                    className="w-full sm:w-auto h-9 bg-red-600 hover:bg-red-700 text-white px-5 rounded-lg font-bold uppercase text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Power size={14} />
                    Fechar Loja
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAbrirLojaModal(true)}
                  className="w-full sm:w-auto h-9 bg-[#111827] hover:bg-[#111827]/90 text-white px-6 rounded-lg font-bold uppercase text-[11px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Power size={14} />
                  Abrir Loja
                </button>
              )}
            </div>
          </div>

          {/* ACTIVE sales panel */}
          {activeEvento ? (
            <div className="space-y-4">
              {/* TOTAL VENDIDO DISPLAY PANEL */}
              <div 
                onClick={() => setShowDetalhesVendasModal(true)}
                className="bg-[#111827] border border-[#111827] p-5 rounded-2xl cursor-pointer relative overflow-hidden group shadow-md transition-all"
              >
                <div className="absolute right-0 top-0 p-5 text-white/5 group-hover:scale-110 transition-transform">
                  <TrendingUp size={80} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase text-[#75BCE8] tracking-widest block mb-1">TOTAL VENDIDO NO EVENTO</span>
                    <span className="text-3xl md:text-4xl font-mono text-white font-black leading-none flex items-center gap-2">
                       R$ {activeEventSummary.totalSold.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <button className="bg-[#75BCE8] hover:bg-white text-[#111827] px-4 py-2 rounded-lg text-[9px] uppercase font-black tracking-widest flex items-center gap-1 transition-all">
                    Ver Detalhamento
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div className="relative z-10 flex gap-6 mt-3 pt-3 border-t border-white/10 text-[9px] text-white/70 uppercase font-bold tracking-wider">
                  <div>PIX: <span className="text-white">R$ {activeEventSummary.pixTotal.toFixed(2).replace('.', ',')}</span></div>
                  <div>Cartão: <span className="text-white">R$ {activeEventSummary.cardTotal.toFixed(2).replace('.', ',')}</span></div>
                  <div>Canceladas: <span className="text-red-300 font-bold">{activeEventSummary.canceledCount}</span></div>
                </div>
              </div>

              {/* POS ITEMS GRID */}
              <div className="space-y-3">
                <h3 className="font-montserrat text-lg uppercase tracking-wider text-[#111827] font-bold">POS Rápido: Venda Balcão</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {uniqueProdutos.map(p => {
                    const totalEstoque = p.category === 'VESTUÁRIO'
                      ? (p.variations || []).reduce((sum, curr) => sum + curr.quantity, 0)
                      : p.initial_quantity;

                    return (
                      <div 
                        key={p.id}
                        className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between hover:border-[#111827]/40 transition-all shadow-sm group"
                      >
                        <div className="mb-3">
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[8px] font-bold uppercase tracking-wider font-sans bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{p.category}</span>
                            <span className={`text-[9px] font-extrabold uppercase tracking-wider ${totalEstoque > 10 ? 'text-green-600' : totalEstoque > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                              {totalEstoque > 0 ? `${totalEstoque} em Estoque` : 'ESGOTADO'}
                            </span>
                          </div>
                          <h4 className="font-montserrat text-sm uppercase text-slate-800 group-hover:text-[#111827] font-bold transition-colors leading-snug truncate">{p.name}</h4>
                          <p className="text-lg font-mono text-[#111827] font-black mt-1 tracking-tighter">R$ {p.price.toFixed(2).replace('.', ',')}</p>
                        </div>

                        {/* RENDER VARIATIONS OR SELL INSTANT BUTTON */}
                        {p.category === 'VESTUÁRIO' ? (
                          expandedProductSizes === p.id ? (
                            <div className="mt-2 space-y-2 animate-fade-in border-t border-slate-100 pt-2">
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-[9px] uppercase font-bold text-[#111827] tracking-widest leading-none">Tamanhos:</p>
                                <button
                                  onClick={() => setExpandedProductSizes(null)}
                                  className="text-[9px] uppercase font-bold text-slate-400 hover:text-[#111827] transition-colors"
                                >
                                  Voltar
                                </button>
                              </div>
                              <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                                {p.variations && p.variations.some(v => v.quantity > 0) ? (
                                  p.variations
                                    .filter(v => v.quantity > 0)
                                    .map(v => (
                                      <button
                                        key={`${p.id}-${v.size}`}
                                        onClick={() => {
                                          setShowVendaModal({ produto: p, size: v.size });
                                          setExpandedProductSizes(null);
                                        }}
                                        className="p-2 rounded-xl bg-white border border-slate-300 hover:border-[#111827] hover:bg-[#111827]/10 text-[#111827] text-[11px] uppercase font-bold flex flex-col items-center justify-center transition-all"
                                      >
                                        <span>{v.size.replace('Babylook', 'BL').replace('Infantil', 'INF')}</span>
                                        <span className="text-[9px] font-mono mt-0.5 font-bold text-slate-500">
                                          {v.quantity} un
                                        </span>
                                      </button>
                                    ))
                                ) : (
                                  <div className="col-span-3 p-2 text-center text-[10px] text-slate-400 uppercase italic font-bold">
                                    Sem estoque disponível
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <button
                              disabled={totalEstoque <= 0}
                              onClick={() => setExpandedProductSizes(p.id)}
                              className={`w-full py-3.5 rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition-all ${totalEstoque > 0 ? 'bg-[#111827] text-white hover:bg-[#111827]/95 active:translate-y-0.5' : 'bg-slate-200 text-slate-400 border border-slate-355 cursor-not-allowed'}`}
                            >
                              <ShoppingBag size={14} />
                              VENDER ITEM
                            </button>
                          )
                        ) : (
                          <button
                            disabled={totalEstoque <= 0}
                            onClick={() => setShowVendaModal({ produto: p })}
                            className={`w-full py-3.5 rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition-all ${totalEstoque > 0 ? 'bg-[#111827] text-white hover:bg-[#111827]/95 active:translate-y-0.5' : 'bg-slate-200 text-slate-400 border border-slate-355 cursor-not-allowed'}`}
                          >
                            <ShoppingBag size={14} />
                            VENDER ITEM
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#EBEBEB] border border-slate-300 rounded-3xl gap-4">
              <Store size={48} className="text-[#111827]/25 shrink-0" />
              <div className="text-center space-y-1">
                <h4 className="text-lg font-montserrat uppercase text-[#111827] font-bold leading-none">LOJA FECHADA / DESATIVADA</h4>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Abra a loja acima seletivamente para iniciar vendas de evento.</p>
              </div>
              <button
                onClick={() => setShowAbrirLojaModal(true)}
                className="bg-[#111827] hover:bg-[#111827]/90 text-white px-8 py-3.5 rounded-2xl font-bold uppercase text-xs shadow-md flex items-center gap-2 mt-2 transition-all active:scale-95"
              >
                <Power size={14} />
                Abrir Loja Agora
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: ÚLTIMOS EVENTOS */}
      {activeSubTab === 'ultimos-eventos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-montserrat font-bold uppercase tracking-wider text-[#111827]">Últimos Eventos</h2>
            {selectedPastEventId && (
               <button onClick={() => setSelectedPastEventId(null)} className="flex items-center gap-1.5 uppercase font-bold text-xs text-slate-500 hover:text-[#111827] transition-colors"><ArrowLeft size={14}/> Voltar</button>
            )}
          </div>
          
          {!selectedPastEventId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventos.filter(e => e.status === 'FECHADO').length === 0 ? (
                 <div className="col-span-full py-16 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                   <History size={32} className="mx-auto mb-3 opacity-30" />
                   Nenhum evento encerrado encontrado.
                 </div>
              ) : (
                eventos.filter(e => e.status === 'FECHADO').sort((a,b) => new Date(b.opened_at || 0).getTime() - new Date(a.opened_at || 0).getTime()).map(ev => {
                  const eventSales = vendas.filter(v => v.event_id === ev.id && v.status === 'CONCLUIDA');
                  const totalGeral = eventSales.reduce((acc, v) => acc + (v.total_price || 0), 0);
                  const dtOpen = ev.opened_at ? new Date(ev.opened_at).toLocaleDateString('pt-BR') : 'Data desconhecida';
                  return (
                    <motion.div key={ev.id} whileHover={{ scale: 1.01 }} className="bg-white border hover:border-[#111827]/30 border-slate-200 rounded-2xl p-5 shadow-sm cursor-pointer transition-all flex flex-col justify-between h-[140px]" onClick={() => setSelectedPastEventId(ev.id)}>
                       <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-bold uppercase text-[#111827] line-clamp-1">{ev.event_name}</h4>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{dtOpen}</p>
                          </div>
                          <div className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-[9px] font-bold uppercase shrink-0">Encerrado</div>
                       </div>
                       <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111827]/60 flex items-center gap-1.5"><ShoppingBag size={12}/> {eventSales.length} Vendas</span>
                          <span className="text-sm font-black text-slate-800">{applyCurrencyMask((totalGeral * 100).toString())}</span>
                       </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto">
              {(() => {
                const ev = eventos.find(e => e.id === selectedPastEventId);
                const eventSales = vendas.filter(v => v.event_id === selectedPastEventId && v.status === 'CONCLUIDA');
                // Calculate summaries
                const pixTotal = eventSales.filter(v => v.payment_method === 'PIX').reduce((acc, v) => acc + (v.total_price || 0), 0);
                const cardTotal = eventSales.filter(v => v.payment_method === 'CARTÃO').reduce((acc, v) => acc + (v.total_price || 0), 0);
                const generalTotal = pixTotal + cardTotal;
                
                const productCounts: Record<string, { qty: number, total: number }> = {};
                eventSales.forEach(s => {
                    s.items?.forEach(vi => {
                       const name = vi.size ? `${vi.product_name || 'Produto'} (${vi.size})` : (vi.product_name || 'Produto');
                       if (!productCounts[name]) productCounts[name] = { qty: 0, total: 0 };
                       productCounts[name].qty += vi.quantity;
                       productCounts[name].total += (vi.price_at_sale * vi.quantity);
                    })
                });
                return (
                  <>
                     <div className="bg-[#111827] text-white p-8 rounded-3xl shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                           <History size={100} />
                        </div>
                        <h3 className="text-xl font-bold uppercase relative z-10">{ev?.event_name}</h3>
                        <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-2 relative z-10">Total Faturado</p>
                        <p className="text-4xl font-black mt-2 relative z-10">{applyCurrencyMask((generalTotal * 100).toString())}</p>
                        <div className="flex gap-4 items-center justify-center mt-8 relative z-10">
                           <div className="bg-white/10 rounded-2xl px-6 py-4 flex-1 max-w-[160px]">
                              <p className="text-[10px] text-white/60 uppercase font-black tracking-widest mb-1.5">PIX</p>
                              <p className="text-lg font-bold">{applyCurrencyMask((pixTotal * 100).toString())}</p>
                           </div>
                           <div className="bg-white/10 rounded-2xl px-6 py-4 flex-1 max-w-[160px]">
                              <p className="text-[10px] text-white/60 uppercase font-black tracking-widest mb-1.5">CARTÃO</p>
                              <p className="text-lg font-bold">{applyCurrencyMask((cardTotal * 100).toString())}</p>
                           </div>
                        </div>
                     </div>
                     <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <h4 className="text-xs uppercase font-black tracking-widest text-[#111827] mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><ShoppingBag size={14}/> Itens Vendidos</h4>
                        {Object.keys(productCounts).length === 0 ? (
                           <p className="text-xs font-bold text-slate-400 py-6 text-center">Nenhum item vendido neste evento.</p>
                        ) : (
                          <div className="space-y-1">
                             {Object.entries(productCounts).sort((a,b) => b[1].qty - a[1].qty).map(([name, data]) => (
                               <div key={name} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-3 rounded-lg transition-colors">
                                  <span className="text-sm font-bold text-slate-700">{name} <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold ml-2">x{data.qty}</span></span>
                                  <span className="text-sm font-black text-[#111827]">{applyCurrencyMask((data.total * 100).toString())}</span>
                               </div>
                             ))}
                          </div>
                        )}
                     </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          MODALS & OVERLAYS 
         ------------------------------------------------------------- */}
      <AnimatePresence>
        
        {/* SUCCESS CONFIRMATION MODAL */}
        {successModalMessage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSuccessModalMessage(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#EBEBEB] border-2 border-[#111827] w-full max-w-xs rounded-3xl p-6 text-center shadow-md">
              <div className="w-12 h-12 bg-[#111827]/10 text-[#111827] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#111827]/20">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-[#111827] font-bold text-lg mb-2">Sucesso!</h3>
              <p className="text-slate-600 text-sm font-medium mb-6">{successModalMessage}</p>
              <button onClick={() => setSuccessModalMessage(null)} className="w-full h-11 bg-[#111827] hover:bg-[#111827]/90 text-white rounded-xl font-bold uppercase text-xs tracking-wider shadow-sm transition-all">
                OK
              </button>
            </motion.div>
          </div>
        )}

        {/* ADD PRODUCT MODAL */}
        {showAddProductModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddProductModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#FAFAFA] border-2 border-[#111827] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-left">
              <div className="p-5 border-b border-[#111827]/10 bg-white/50 flex items-center justify-between shrink-0">
                <h3 className="font-montserrat uppercase text-lg text-[#111827] font-black">Cadastrar Novo Produto</h3>
                <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-[#111827] transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
                {/* Nome */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 text-[9px] uppercase font-black tracking-widest pl-1">Nome do Produto</label>
                  <input 
                    type="text" 
                    required
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    placeholder="Ex: Camiseta UMADEMATS 2026"
                    className="w-full bg-white border border-[#EBEBEB] shadow-sm rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:border-[#75BCE8] text-sm font-bold"
                  />
                </div>

                {/* Categoria Selector */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 text-[9px] uppercase font-black tracking-widest pl-1">Categoria de Produto</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewProdCategory('VESTUÁRIO')}
                      className={`py-2.5 rounded-lg font-bold text-xs uppercase border-2 transition-all ${newProdCategory === 'VESTUÁRIO' ? 'bg-[#75BCE8]/20 border-[#75BCE8] text-[#111827]' : 'bg-white border-[#EBEBEB] text-slate-400 hover:border-[#75BCE8]'}`}
                    >
                      VESTUÁRIO (Grade)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProdCategory('ITENS')}
                      className={`py-3.5 rounded-xl font-bold text-xs uppercase border-2 transition-all ${newProdCategory === 'ITENS' ? 'bg-[#75BCE8]/20 border-[#75BCE8] text-[#111827]' : 'bg-white border-[#EBEBEB] text-slate-400 hover:border-[#75BCE8]'}`}
                    >
                      ITENS (Qtd Única)
                    </button>
                  </div>
                </div>

                {/* Valor & Qtd Unica (Itens) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-slate-500 text-[9px] uppercase font-black tracking-widest pl-1">Valor Unitário (R$)</label>
                    <input 
                      type="text" 
                      required
                      value={newProdPrice}
                      onChange={e => setNewProdPrice(applyCurrencyMask(e.target.value))}
                      placeholder="R$ 0,00"
                      className="w-full bg-white border border-[#EBEBEB] shadow-sm rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#75BCE8] text-sm font-mono font-bold"
                    />
                  </div>

                  {newProdCategory === 'ITENS' && (
                    <div className="space-y-2">
                      <label className="text-slate-500 text-[9px] uppercase font-black tracking-widest pl-1">Quantidade Inicial</label>
                      <input 
                        type="number" 
                        required
                        value={newProdQty}
                        onChange={e => setNewProdQty(e.target.value)}
                        placeholder="Ex: 100"
                        className="w-full bg-white border border-[#EBEBEB] shadow-sm rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#75BCE8] text-sm font-mono font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Size Grid (For Vestuario Category) */}
                {newProdCategory === 'VESTUÁRIO' && (
                  <div className="space-y-4 pt-2 border-t border-[#111827]/10">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-[#111827] tracking-wider">GRADE DE TAMANHOS (Clique para Editar)</h4>
                      <p className="text-[9px] text-slate-400 uppercase font-bold leading-normal">Defina as unidades disponíveis para cada tamanho clicando neles.</p>
                    </div>

                    {/* INFANTIL SIZES */}
                    <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] block pl-1 font-sans">INFANTIL (Tamanhos 2 a 14)</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SIZES_CONFIG.INFANTIL.map(size => {
                          const qty = sizeQuantities[size] || 0;
                          return (
                            <button
                              key={`add-infantil-${size}`}
                              type="button"
                              onClick={() => {
                                setEditingSizeCell({
                                  product: { id: 'new-product', name: newProdName || 'Novo Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(newProdPrice) || 0, initial_quantity: 0 },
                                  size,
                                  curQty: qty
                                });
                                setNewSizeQtyInput(qty.toString());
                              }}
                              className="w-full bg-white hover:bg-slate-50 hover:border-[#75BCE8] border border-[#EBEBEB] rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm"
                            >
                              <span className="text-xs text-slate-500 font-semibold uppercase">{size}</span>
                              <span className="text-xs font-mono font-black text-[#111827] shrink-0">{qty} un</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* BABYLOOK SIZES */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] block pl-1 font-sans">BABYLOOK (PP ao XGG)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SIZES_CONFIG.BABYLOOK.map(size => {
                          const qty = sizeQuantities[size] || 0;
                          return (
                            <button
                              key={`add-babylook-${size}`}
                              type="button"
                              onClick={() => {
                                setEditingSizeCell({
                                  product: { id: 'new-product', name: newProdName || 'Novo Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(newProdPrice) || 0, initial_quantity: 0 },
                                  size,
                                  curQty: qty
                                });
                                setNewSizeQtyInput(qty.toString());
                              }}
                              className="w-full bg-white hover:bg-slate-50 hover:border-[#75BCE8] border border-[#EBEBEB] rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm"
                            >
                              <span className="text-xs text-slate-500 font-semibold uppercase truncate max-w-[110px]" title={size}>
                                {size.replace('Babylook ', 'BL ')}
                              </span>
                              <span className="text-xs font-mono font-black text-[#111827] shrink-0">{qty} un</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ADULTO SIZES */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] block pl-1 font-sans">ADULTO UNISSEX (PP ao XGG)</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SIZES_CONFIG.ADULTO.map(size => {
                          const qty = sizeQuantities[size] || 0;
                          return (
                            <button
                              key={`add-adulto-${size}`}
                              type="button"
                              onClick={() => {
                                setEditingSizeCell({
                                  product: { id: 'new-product', name: newProdName || 'Novo Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(newProdPrice) || 0, initial_quantity: 0 },
                                  size,
                                  curQty: qty
                                });
                                setNewSizeQtyInput(qty.toString());
                              }}
                              className="w-full bg-white hover:bg-slate-50 hover:border-[#75BCE8] border border-[#EBEBEB] rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm"
                            >
                              <span className="text-xs text-slate-500 font-semibold uppercase">{size}</span>
                              <span className="text-xs font-mono font-black text-[#111827] shrink-0">{qty} un</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[#111827]/10 flex gap-2 shrink-0">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#111827] hover:bg-[#111827]/90 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-1.5 active:translate-y-0.5"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} strokeWidth={2.5} />}
                    Cadastrar Produto
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="flex-1 bg-white hover:bg-slate-50 border border-[#EBEBEB] text-[#111827] max-w-[120px] rounded-xl font-bold text-xs uppercase shadow-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ABRIR LOJA MODAL */}
        {showAbrirLojaModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAbrirLojaModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#EBEBEB] border-2 border-[#111827] w-full max-w-sm rounded-[2rem] p-8 text-center shadow-md">
              <Store size={40} className="mx-auto text-[#111827] mb-4" />
              <h3 className="text-xl font-montserrat uppercase text-[#111827] font-black mb-2 leading-none">ABRIR SEÇÃO DE EVENTO</h3>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-6">Nomeie sessão de vendas de balcão.</p>
              
              <form onSubmit={handleIniciarEvento} className="space-y-4">
                <div className="text-left space-y-1">
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block pl-1">Nome do Encontro / Congresso</span>
                  <input 
                    type="text" 
                    required
                    value={eventoInputName}
                    onChange={e => setEventoInputName(e.target.value)}
                    placeholder="Ex: Congresso UMADEMATS 2026"
                    className="w-full bg-white border border-[#EBEBEB] focus:border-[#75BCE8] focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-800 uppercase font-bold text-center shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#111827] hover:bg-[#111827]/90 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-wider shadow-sm flex items-center justify-center gap-1 active:translate-y-0.5"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <Power size={14} />}
                    Iniciar Evento
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAbrirLojaModal(false)} 
                    className="w-full py-2.5 text-slate-400 hover:text-[#111827] uppercase font-black text-[9px] tracking-widest"
                  >
                    Voltar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MAKE SALE / CHOOSE PAYMENT INBALCÃO MODAL */}
        {showVendaModal && (() => {
          const availableStock = showVendaModal.produto.category === 'VESTUÁRIO' && showVendaModal.size
            ? (showVendaModal.produto.variations?.find(v => v.size === showVendaModal.size)?.quantity || 0)
            : (showVendaModal.produto.initial_quantity || 0);

          return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVendaModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#EBEBEB] border-2 border-[#111827] w-full max-w-sm rounded-[2rem] p-6 text-center shadow-md">
                <ShoppingBag size={40} className="mx-auto text-[#111827] mb-4 animate-bounce" />
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">REGISTRO DE VENDA RÁPIDA</span>
                  <h3 className="text-xl font-montserrat uppercase text-[#111827] leading-none mt-2 font-black">{showVendaModal.produto.name}</h3>
                  {showVendaModal.size && (
                    <span className="inline-block bg-[#75BCE8]/20 text-[#111827] border border-[#75BCE8]/40 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mt-1.5">
                      Tamanho: {showVendaModal.size}
                    </span>
                  )}
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mt-2">
                    Disponível: {availableStock} {availableStock === 1 ? 'unidade' : 'unidades'}
                  </span>
                </div>

                {/* QUANTITY INPUT */}
                <div className="py-4 border-y border-slate-300/60 my-4 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Quantidade</span>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(-1)}
                      className="w-12 h-12 rounded-xl bg-white border border-slate-300 font-black text-xl text-[#111827] flex items-center justify-center hover:bg-slate-100 active:scale-95 shadow-sm shrink-0"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={availableStock}
                      value={vendaQuantidade || ''}
                      onChange={(e) => handleQtyInputChange(e.target.value)}
                      onBlur={() => { if (!vendaQuantidade || vendaQuantidade < 1) setVendaQuantidade(1); }}
                      className="w-20 h-12 bg-white border border-slate-300 rounded-xl text-center font-mono font-black text-lg text-[#111827] shadow-inner focus:outline-none focus:border-[#111827] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(1)}
                      className="w-12 h-12 rounded-xl bg-white border border-slate-300 font-black text-xl text-[#111827] flex items-center justify-center hover:bg-slate-100 active:scale-95 shadow-sm shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="font-mono text-3xl text-slate-800 font-black pb-4">
                  Total: R$ {(showVendaModal.produto.price * (vendaQuantidade || 1)).toFixed(2).replace('.', ',')}
                </div>

                <div className="pt-4 border-t border-slate-300 space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Meio de Pagamento Utilizado:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      disabled={!vendaQuantidade || vendaQuantidade < 1}
                      onClick={() => {
                        setConfirmVendaData({
                          produto: showVendaModal.produto,
                          size: showVendaModal.size,
                          paymentMethod: 'PIX',
                          quantidade: vendaQuantidade || 1
                        });
                      }}
                      className="py-4 bg-white border border-[#EBEBEB] hover:border-[#75BCE8] text-[#111827] rounded-2xl flex flex-col items-center justify-center gap-1 active:bg-[#EBEBEB] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Smartphone size={20} />
                      <span className="text-xs font-bold uppercase tracking-wider">Pix</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      disabled={!vendaQuantidade || vendaQuantidade < 1}
                      onClick={() => {
                        setConfirmVendaData({
                          produto: showVendaModal.produto,
                          size: showVendaModal.size,
                          paymentMethod: 'CARTÃO',
                          quantidade: vendaQuantidade || 1
                        });
                      }}
                      className="py-4 bg-white border border-[#EBEBEB] hover:border-[#111827] text-[#111827] rounded-2xl flex flex-col items-center justify-center gap-1 active:bg-[#EBEBEB] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DollarSign size={20} />
                      <span className="text-xs font-bold uppercase tracking-wider">Cartão</span>
                    </motion.button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowVendaModal(null)}
                    className="w-full py-2.5 text-slate-400 hover:text-[#111827] uppercase font-black text-[9px] tracking-[0.15em] block pt-4 transition-colors"
                  >
                    Cancelar Venda
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}

        {/* COMPREHENSIVE SALES CONFIRMATION OVERLAY MODAL */}
        {confirmVendaData && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setConfirmVendaData(null)} 
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-[#EBEBEB] border-2 border-[#111827] w-full max-w-sm rounded-[2rem] p-6 shadow-md text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-[#111827]/10 text-[#111827] shrink-0 border border-[#111827]/20">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="font-montserrat font-black text-lg uppercase text-[#111827] leading-tight">CONFIRMAR VENDA?</h3>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none">Verifique as informações antes de finalizar</p>
                </div>
              </div>

              <div className="space-y-3.5 bg-white border border-[#EBEBEB] rounded-2xl p-4 mb-5 shadow-sm">
                <div>
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">PRODUTO</span>
                  <span className="text-sm font-bold text-slate-800 uppercase">{confirmVendaData.produto.name}</span>
                </div>

                {confirmVendaData.size && (
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">TAMANHO</span>
                    <span className="inline-block bg-[#75BCE8]/20 text-[#111827] border border-[#75BCE8]/40 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-0.5">
                      {confirmVendaData.size}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">QUANTIDADE</span>
                  <span className="text-sm font-bold text-slate-800">{confirmVendaData.quantidade}</span>
                </div>

                <div>
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">VALOR UNITÁRIO</span>
                  <span className="text-sm font-mono font-bold text-slate-800">R$ {confirmVendaData.produto.price.toFixed(2).replace('.', ',')}</span>
                </div>

                <div>
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">TOTAL</span>
                  <span className="text-xl font-mono font-black text-slate-800">R$ {(confirmVendaData.produto.price * confirmVendaData.quantidade).toFixed(2).replace('.', ',')}</span>
                </div>

                <div>
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">FORMA DE PAGAMENTO</span>
                  <span className={`inline-block font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-widest mt-0.5 ${
                    confirmVendaData.paymentMethod === 'PIX' 
                      ? 'bg-[#111827]/10 text-[#111827] border border-[#111827]/20' 
                      : 'bg-[#75BCE8]/20 text-[#111827] border border-[#75BCE8]/30'
                  }`}>
                    {confirmVendaData.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    const paymentMethod = confirmVendaData.paymentMethod;
                    await handleRegisterVenda(paymentMethod);
                    setConfirmVendaData(null);
                  }}
                  className="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-sm md:text-base rounded-2xl tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={14} /> : 'CONFIRMAR'}
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmVendaData(null)}
                  className="w-full py-3 text-slate-400 hover:text-[#111827] uppercase font-bold text-[10px] tracking-widest transition-colors block text-center"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* REAL-TIME RESUMO DO EVENTO MODAL */}
        {showResumoEventoRealTimeModal && activeEvento && (() => {
          const activeSales = activeEventSales.filter(v => v.status === 'CONCLUIDA');
          
          const totalItemsSold = activeSales.reduce((acc, curr) => {
             return acc + (curr.items ? curr.items.reduce((sum, item) => sum + item.quantity, 0) : 1);
          }, 0);

          // Group by pure product name
          const groupedProducts: Record<string, { qty: number, sizes: Record<string, number> }> = {};
          activeSales.forEach(s => {
             if (s.items) {
               s.items.forEach(item => {
                 const name = item.product_name || 'Produto';
                 const size = item.size || 'Único';
                 
                 if (!groupedProducts[name]) {
                   groupedProducts[name] = { qty: 0, sizes: {} };
                 }
                 groupedProducts[name].qty += item.quantity;
                 
                 if (!groupedProducts[name].sizes[size]) {
                   groupedProducts[name].sizes[size] = 0;
                 }
                 groupedProducts[name].sizes[size] += item.quantity;
               });
             }
          });

          return (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="relative bg-[#FAFAFA] border-0 md:border-2 border-[#111827] w-full min-h-screen md:min-h-0 md:h-[85vh] md:max-w-[80vw] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left">
                {/* Header */}
                <div className="p-6 bg-[#111827] text-white flex items-center justify-between shrink-0 shadow-lg relative z-20">
                   <div>
                     <h3 className="font-montserrat uppercase text-2xl font-black text-[#75BCE8] tracking-widest">Resumo do Evento</h3>
                     <div className="text-xs uppercase font-bold tracking-wider mt-2 space-y-1">
                        <p>Evento: <span className="text-white">{activeEvento.event_name}</span></p>
                        <p className="text-white/60">Iniciado em: {activeEvento.opened_at ? new Date(activeEvento.opened_at).toLocaleString('pt-BR') : '---'}</p>
                        <p className="text-white/60">Última Atualização: <span className="text-green-400">{lastUpdateTime || '---'}</span></p>
                     </div>
                   </div>
                   <button onClick={() => setShowResumoEventoRealTimeModal(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors self-start"><X size={24} /></button>
                </div>

                {/* Content Tabs / Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                   {/* Financials Row */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                       <div className="bg-white border-2 border-[#111827] p-5 rounded-2xl shadow-[4px_4px_0_0_#111827]">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#75BCE8] block mb-2">TOTAL FATURADO</span>
                          <span className="text-3xl font-mono font-black text-[#111827]">R$ {activeEventSummary.totalSold.toFixed(2).replace('.', ',')}</span>
                       </div>
                       <div className="bg-white border border-[#EBEBEB] p-5 rounded-2xl">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">PIX</span>
                          <span className="text-2xl font-mono font-black text-slate-700">R$ {activeEventSummary.pixTotal.toFixed(2).replace('.', ',')}</span>
                       </div>
                       <div className="bg-white border border-[#EBEBEB] p-5 rounded-2xl">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">CARTÃO</span>
                          <span className="text-2xl font-mono font-black text-slate-700">R$ {activeEventSummary.cardTotal.toFixed(2).replace('.', ',')}</span>
                       </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Resumo de Produtos */}
                      <div className="lg:col-span-2 space-y-4">
                         <div className="flex items-center gap-2 border-b-2 border-[#111827] pb-2">
                            <ShoppingBag className="text-[#111827]" size={20} />
                            <h4 className="font-montserrat uppercase font-black tracking-widest text-[#111827]">Resumo de Produtos</h4>
                            <span className="ml-auto text-[10px] font-bold bg-[#111827] text-white px-2 py-1 rounded hidden sm:block">Total de itens: {totalItemsSold}</span>
                         </div>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(groupedProducts).length === 0 && (
                              <p className="text-xs text-slate-500 font-bold py-4 col-span-2 text-center border-2 border-dashed border-slate-200 rounded-xl">Nenhum produto vendido.</p>
                            )}
                            {Object.entries(groupedProducts).sort((a,b) => b[1].qty - a[1].qty).map(([name, data]) => {
                               const sizeEntries = Object.entries(data.sizes);
                               const hasMultipleSizes = sizeEntries.length > 1 || (sizeEntries.length === 1 && sizeEntries[0][0] !== 'Único' && sizeEntries[0][0] !== 'undefined');
                               return (
                                 <div key={name} className="bg-white rounded-xl border border-[#EBEBEB] p-4 flex flex-col justify-between shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                       <span className="font-extrabold text-sm text-[#111827] uppercase">{name}</span>
                                       <span className="font-black text-xs font-mono bg-[#75BCE8]/20 text-[#111827] px-2 py-1 rounded">{data.qty} un</span>
                                    </div>
                                    {hasMultipleSizes && (
                                       <div className="mt-2 pt-2 border-t border-dashed border-slate-200">
                                          <div className="flex flex-wrap gap-2">
                                             {sizeEntries.sort((a,b) => b[1] - a[1]).map(([sName, sQty]) => (
                                                <span key={sName} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                                   {sName} - {sQty}
                                                </span>
                                             ))}
                                          </div>
                                       </div>
                                    )}
                                 </div>
                               );
                            })}
                         </div>
                      </div>

                      {/* Ultimas Vendas */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 border-b-2 border-[#111827] pb-2">
                            <History className="text-[#111827]" size={20} />
                            <h4 className="font-montserrat uppercase font-black tracking-widest text-[#111827]">Últimas Vendas</h4>
                         </div>
                         <div className="bg-white rounded-xl border border-[#EBEBEB] divide-y divide-[#EBEBEB] shadow-sm max-h-[500px] overflow-y-auto custom-scrollbar">
                            {activeEventSales.slice(0, 20).map((sale) => {
                               const isCanceled = sale.status === 'CANCELADA';
                               const mappedItem = sale.items && sale.items[0];
                               const displayName = mappedItem ? mappedItem.product_name + (mappedItem.size ? ` ${mappedItem.size}` : '') : 'Produto Desconhecido';
                               return (
                                 <div key={sale.id} className={`p-3 ${isCanceled ? 'bg-red-50/50 opacity-60' : ''}`}>
                                    <div className="flex items-start justify-between mb-1">
                                       <span className="text-[9px] font-mono font-bold text-slate-400">{new Date(sale.created_at).toLocaleTimeString('pt-BR')}</span>
                                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isCanceled ? 'bg-red-100 text-red-600' : (sale.payment_method === 'PIX' ? 'bg-[#111827]/10 text-[#111827]' : 'bg-[#75BCE8]/20 text-[#111827]')}`}>{isCanceled ? 'CANCELADO' : sale.payment_method}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className={`text-xs font-bold uppercase truncate pr-2 ${isCanceled ? 'line-through text-slate-400' : 'text-[#111827]'}`}>{displayName}</span>
                                       <span className={`text-xs font-mono font-black shrink-0 ${isCanceled ? 'text-slate-400' : 'text-[#111827]'}`}>R$ {sale.total_price.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    {mappedItem && mappedItem.quantity > 1 && (
                                       <div className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-1">{mappedItem.quantity} unidades</div>
                                    )}
                                 </div>
                               )
                            })}
                            {activeEventSales.length === 0 && <div className="p-6 text-center text-[10px] uppercase tracking-widest text-slate-400 font-bold">Sem vendas.</div>}
                         </div>
                      </div>
                   </div>

                </div>
              </motion.div>
            </div>
          )
        })()}

        {/* DETAILS OF REALIZED SALES (CLICK TO DETAIL & CANCEL OPTION) */}
        {showDetalhesVendasModal && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetalhesVendasModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#EBEBEB] border-2 border-[#111827] w-full max-w-xl rounded-3xl overflow-hidden shadow-md flex flex-col max-h-[85vh] text-left">
              <div className="p-6 border-b border-[#111827]/10 bg-white/50 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-montserrat uppercase text-xl text-[#111827] font-black">Vendas Realizadas</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Histórico completo da seção aberta de balcão</p>
                </div>
                <button onClick={() => setShowDetalhesVendasModal(false)} className="text-slate-400 hover:text-[#111827] transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                {activeEventSales.length === 0 ? (
                  <div className="p-12 text-center text-white/20 uppercase font-bold text-xs tracking-widest">
                    Nenhuma venda registrada até o momento.
                  </div>
                ) : (
                  activeEventSales.map((sale) => {
                    const matchedItem = sale.items && sale.items[0];
                    const isCanceled = sale.status === 'CANCELADA';

                    return (
                      <div 
                        key={sale.id}
                        className={`p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all shadow-sm ${isCanceled ? 'bg-red-50 border border-red-100 opacity-60' : 'bg-white border border-[#EBEBEB] hover:border-[#75BCE8]'}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isCanceled ? 'bg-red-100 text-red-600 border border-red-200' : sale.payment_method === 'PIX' ? 'bg-[#111827]/10 text-[#111827] border border-[#111827]/20' : 'bg-[#75BCE8]/20 text-[#111827] border border-[#75BCE8]/30'}`}>
                              {isCanceled ? 'Cancelada' : sale.payment_method}
                            </span>
                            <span className="text-[8px] text-slate-400 uppercase font-mono">
                              {new Date(sale.created_at).toLocaleTimeString('pt-BR')}
                            </span>
                          </div>
                          
                          <p className={`text-sm font-bold uppercase mt-1.5 leading-tight ${isCanceled ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {matchedItem ? matchedItem.product_name : 'Produto Desconhecido'}
                          </p>

                          {matchedItem?.size && (
                            <span className="inline-block bg-white text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5 border border-[#EBEBEB]">
                              Tamanho: {matchedItem.size}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-[#EBEBEB] sm:border-0 pt-2 sm:pt-0 shrink-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[8px] text-slate-400 uppercase block font-bold leading-none mb-1">Valor Final</span>
                            <span className={`text-base font-mono font-black ${isCanceled ? 'text-slate-300' : 'text-[#111827]'}`}>
                              R$ {sale.total_price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>

                          {!isCanceled && (
                            <button
                              onClick={() => {
                                setShowConfirmCancelVenda(sale);
                              }}
                              className="text-red-500 hover:text-red-400 p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all"
                              title="Cancelar esta venda e estornar"
                            >
                              <Power size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* CONFIRM CANCEL TRANSACTION MODAL (NO WINDOW.ALERT AS MANDATED) */}
        {showConfirmCancelVenda && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirmCancelVenda(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#EBEBEB] border-2 border-red-500 w-full max-w-sm rounded-[2rem] p-8 text-center shadow-md">
              <ShieldAlert size={40} className="mx-auto text-red-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-montserrat uppercase text-[#111827] font-black mb-2 leading-none">Confirmar Cancelamento?</h3>
              <p className="text-slate-500 text-xs uppercase font-extrabold tracking-widest leading-normal mb-6">
                Esta ação restaura imediatamente os saldos de estoque do produto.
              </p>

              <div className="bg-white p-4 rounded-xl border border-[#EBEBEB] text-left mb-6 shadow-sm">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Item Vendido</p>
                <p className="text-sm font-extrabold uppercase text-slate-800">
                  {showConfirmCancelVenda.items && showConfirmCancelVenda.items[0]?.product_name}
                </p>
                {showConfirmCancelVenda.items?.[0]?.size && (
                  <p className="text-[10px] text-[#75BCE8] uppercase font-black mt-1">
                    Tamanho: {showConfirmCancelVenda.items[0].size}
                  </p>
                )}
                <p className="text-xl font-mono text-red-500 font-black mt-2 leading-none">
                  - R$ {showConfirmCancelVenda.total_price.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleConfirmCancelarVenda}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1 active:translate-y-0.5"
                >
                  Sim, Estornar Estoque
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmCancelVenda(null)}
                  className="w-full py-2.5 text-slate-400 hover:text-[#111827] uppercase font-black text-[9px] tracking-widest transition-colors"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* CLOSURE FINAL EVENT SUMMARY MODAL */}
        {showFecharLojaModal && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFecharLojaModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#EBEBEB] border-2 border-[#111827] w-full max-w-lg rounded-3xl overflow-hidden shadow-md flex flex-col max-h-[90vh] text-left">
              <div className="p-6 border-b border-[#111827]/10 bg-white/50 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-montserrat uppercase text-2xl text-[#111827] font-black">Resumo de Fechamento</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Conclusão bem-sucedida do caixa</p>
                </div>
                <button onClick={() => setShowFecharLojaModal(false)} className="text-slate-400 hover:text-[#111827] transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                {/* Event Name Badge */}
                <div className="bg-[#111827]/10 border border-[#111827]/20 p-4 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-[#111827] shrink-0" />
                  <div className="text-left">
                    <p className="text-[8px] uppercase font-black text-[#111827]/50 tracking-widest leading-none mb-1">FECHAMENTO DE SEÇÃO DE VENDAS</p>
                    <p className="text-base text-[#111827] font-extrabold uppercase">Sessão Finalizada</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white border border-[#EBEBEB] shadow-sm p-3 rounded-2xl">
                    <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Faturamento</span>
                    <span className="text-lg font-mono font-black text-[#111827]">R$ {activeEventSummary.totalSold.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="bg-white border border-[#EBEBEB] shadow-sm p-3 rounded-2xl">
                    <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block mb-1">PIX</span>
                    <span className="text-lg font-mono font-black text-[#111827]">R$ {activeEventSummary.pixTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="bg-white border border-[#EBEBEB] shadow-sm p-3 rounded-2xl">
                    <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block mb-1">CARTÃO</span>
                    <span className="text-lg font-mono font-black text-[#111827]">R$ {activeEventSummary.cardTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                {/* Items Sold list */}
                <div className="space-y-3">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em] block pl-1">Balancete de Produtos Vendidos</span>
                  <div className="bg-white p-4 rounded-2xl border border-[#EBEBEB] shadow-sm space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {activeEventSummary.products.length === 0 ? (
                      <p className="text-center text-[10px] text-slate-400 uppercase italic py-4 font-bold">Nenhum produto vendido nessa seção.</p>
                    ) : (
                      activeEventSummary.products.map((p) => (
                        <div key={p.name} className="flex justify-between items-center py-1.5 border-b border-[#EBEBEB] last:border-0">
                          <span className="text-xs uppercase text-slate-800 font-extrabold">{p.name}</span>
                          <span className="text-xs font-mono font-black text-[#111827]">{p.qty}x</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Canceled check */}
                {activeEventSummary.canceledCount > 0 && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-[10px] uppercase font-bold text-red-600">
                    Sessão teve {activeEventSummary.canceledCount} estornos realizados (Total de R$ {activeEventSummary.canceledTotal.toFixed(2).replace('.', ',')})
                  </div>
                )}
              </div>

              {/* Share Footer */}
              <div className="p-6 border-t border-[#111827]/10 bg-white/50 shrink-0 flex gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5 transition-all text-center"
                >
                  <Share2 size={14} />
                  Compartilhar via WhatsApp
                </button>
                <button
                  onClick={() => setShowFecharLojaModal(false)}
                  className="bg-white hover:bg-slate-50 border border-[#EBEBEB] text-[#111827] px-6 py-4 rounded-xl font-bold uppercase text-xs shadow-sm"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* CUSTOM PRODUCT DELETE CONFIRMATION MODAL */}
        {productToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setProductToDelete(null)} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-[#EBEBEB] border-2 border-[#111827] w-full max-w-sm rounded-[2rem] p-6 text-center shadow-md"
            >
              <ShieldAlert size={40} className="mx-auto text-red-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-montserrat uppercase text-[#111827] font-black mb-2 leading-none">Excluir Produto?</h3>
              <p className="text-slate-500 text-xs uppercase font-extrabold tracking-widest leading-normal mb-6">
                Tem certeza que deseja excluir permanentemente o produto do estoque?
              </p>

              <div className="bg-white p-4 rounded-xl border border-[#EBEBEB] text-left mb-6 shadow-sm">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Produto Selecionado</p>
                <p className="text-sm font-extrabold uppercase text-slate-800">
                  {productToDelete.name}
                </p>
                <p className="text-slate-500 text-xs font-mono font-bold mt-1 uppercase">
                  Categoria: {productToDelete.category}
                </p>
                <p className="text-xl font-mono text-red-500 font-black mt-2 leading-none">
                  Valor: R$ {productToDelete.price.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(productToDelete.id)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1 active:translate-y-0.5"
                >
                  Sim, Excluir Produto
                </button>
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="w-full py-2.5 text-slate-400 hover:text-[#111827] uppercase font-black text-[9px] tracking-widest transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL DE EDIÇÃO DE PRODUTO */}
        {productToEdit && (
          <div className="fixed inset-0 z-[125] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setProductToEdit(null)} 
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-[#EBEBEB] border-2 border-[#111827] w-full max-w-lg rounded-3xl p-6 shadow-md flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#111827]/10 mb-4 shrink-0">
                <h3 className="text-lg font-montserrat uppercase text-[#111827] font-black">Editar Produto</h3>
                <button onClick={() => setProductToEdit(null)} className="text-slate-400 hover:text-[#111827]">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProductEdit} className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1 pb-2 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Nome do Produto</label>
                  <input
                    type="text"
                    value={editProdName}
                    onChange={(e) => setEditProdName(e.target.value)}
                    className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#75BCE8] shadow-sm"
                    placeholder="Nome"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Preço (R$)</label>
                    <input
                      type="text"
                      value={editProdPrice}
                      onChange={(e) => setEditProdPrice(applyCurrencyMask(e.target.value))}
                      className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm text-slate-800 font-mono focus:outline-none focus:border-[#75BCE8] shadow-sm"
                      placeholder="R$ 0,00"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Categoria</label>
                    <select
                      value={editProdCategory}
                      onChange={(e) => setEditProdCategory(e.target.value as 'VESTUÁRIO' | 'ITENS')}
                      className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#75BCE8] appearance-none font-bold uppercase shadow-sm"
                    >
                      <option value="VESTUÁRIO" className="bg-[#EBEBEB]">VESTUÁRIO</option>
                      <option value="ITENS" className="bg-[#EBEBEB]">ITENS</option>
                    </select>
                  </div>
                </div>

                {editProdCategory === 'ITENS' ? (
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Quantidade em Estoque</label>
                    <input
                      type="number"
                      value={editProdQty}
                      onChange={(e) => setEditProdQty(e.target.value)}
                      className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm text-slate-800 font-mono focus:outline-none focus:border-[#75BCE8] shadow-sm"
                      placeholder="Qtd"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] text-[#111827] uppercase font-black tracking-wider block">Grade de Quantidades por Tamanho (Clique para Editar)</span>
                    
                    <div className="space-y-3 max-h-[35vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] custom-scrollbar pr-1 bg-white p-3 rounded-2xl border border-[#EBEBEB] shadow-sm">
                      {/* INFANTIL */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block pl-1 font-sans">Grade Infantil</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {SIZES_CONFIG.INFANTIL.map(size => {
                            const qty = editSizeQuantities[size] || 0;
                            return (
                              <button
                                key={`edit-infantil-${size}`}
                                type="button"
                                onClick={() => {
                                  setEditingSizeCell({
                                    product: { id: 'edit-product', name: editProdName || 'Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(editProdPrice) || 0, initial_quantity: 0 },
                                    size,
                                    curQty: qty
                                  });
                                  setNewSizeQtyInput(qty.toString());
                                }}
                                className="w-full bg-white hover:bg-slate-50 hover:border-[#75BCE8] border border-[#EBEBEB] rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm"
                              >
                                <span className="text-xs text-slate-500 font-semibold uppercase">{size}</span>
                                <span className="text-xs font-mono font-black text-[#111827] shrink-0">{qty} un</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* BABYLOOK */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block pl-1 font-sans">Grade Babylook</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SIZES_CONFIG.BABYLOOK.map(size => {
                            const qty = editSizeQuantities[size] || 0;
                            return (
                              <button
                                key={`edit-babylook-${size}`}
                                type="button"
                                onClick={() => {
                                  setEditingSizeCell({
                                    product: { id: 'edit-product', name: editProdName || 'Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(editProdPrice) || 0, initial_quantity: 0 },
                                    size,
                                    curQty: qty
                                  });
                                  setNewSizeQtyInput(qty.toString());
                                }}
                                className="w-full bg-white hover:bg-slate-50 hover:border-[#75BCE8] border border-[#EBEBEB] rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm"
                              >
                                <span className="text-xs text-slate-500 font-semibold uppercase truncate max-w-[110px]" title={size}>
                                  {size.replace('Babylook ', 'BL ')}
                                </span>
                                <span className="text-xs font-mono font-black text-[#111827] shrink-0">{qty} un</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ADULTO */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block pl-1 font-sans">Grade Adulto</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {SIZES_CONFIG.ADULTO.map(size => {
                            const qty = editSizeQuantities[size] || 0;
                            return (
                              <button
                                key={`edit-adulto-${size}`}
                                type="button"
                                onClick={() => {
                                  setEditingSizeCell({
                                    product: { id: 'edit-product', name: editProdName || 'Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(editProdPrice) || 0, initial_quantity: 0 },
                                    size,
                                    curQty: qty
                                  });
                                  setNewSizeQtyInput(qty.toString());
                                }}
                                className="w-full bg-white hover:bg-slate-50 hover:border-[#75BCE8] border border-[#EBEBEB] rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm"
                              >
                                <span className="text-xs text-slate-500 font-semibold uppercase">{size}</span>
                                <span className="text-xs font-mono font-black text-[#111827] shrink-0">{qty} un</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-3 shrink-0 border-t border-[#111827]/10 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#111827] hover:bg-[#111827]/90 text-white py-3 rounded-xl font-bold uppercase text-xs transition-colors shadow-sm"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductToEdit(null)}
                    className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-[#EBEBEB] text-[#111827] shadow-sm font-bold uppercase text-[10px] tracking-widest"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL GRANDE DE DETALHAMENTO DE PRODUTO E TAMANHOS */}
        {productForSizes && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setProductForSizes(null)} 
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-[#EBEBEB] border-2 border-[#111827] w-full max-w-lg rounded-3xl p-6 shadow-md flex flex-col max-h-[90vh]"
            >
              <div className="flex items-start justify-between pb-3 border-b border-[#111827]/10 mb-4 text-left shrink-0">
                <div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${productForSizes.category === 'VESTUÁRIO' ? 'bg-[#111827]/10 text-[#111827] border border-[#111827]/20' : 'bg-brand-pink/10 text-brand-pink border border-brand-pink/20'}`}>
                    {productForSizes.category}
                  </span>
                  <h3 className="text-xl font-montserrat uppercase text-[#111827] font-extrabold mt-1">{productForSizes.name}</h3>
                </div>
                <button onClick={() => setProductForSizes(null)} className="text-slate-400 hover:text-[#111827] mt-1">
                  <X size={20} />
                </button>
              </div>

              {/* Informações Gerais */}
              <div className="bg-white p-3 rounded-xl border border-[#EBEBEB] shadow-sm flex justify-between items-center mb-4 shrink-0 text-xs text-slate-500 text-left">
                <div>
                  <span className="block text-[8px] uppercase font-bold tracking-wider mb-0.5">Valor Unitário</span>
                  <span className="text-base text-slate-800 font-bold font-mono">
                    R$ {productForSizes.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] uppercase font-bold tracking-wider mb-0.5">Estoque Total</span>
                  <span className="text-base text-slate-800 font-bold font-mono">
                    {productForSizes.category === 'VESTUÁRIO' 
                      ? Object.values(sizesModalQuantities).reduce((a: number, b: number) => a + Number(b), 0)
                      : (parseInt(sizesModalQty) || 0)
                    }un
                  </span>
                </div>
              </div>

              {/* Corpo Editável */}
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] custom-scrollbar pr-1 pb-4 space-y-4 text-left">
                {productForSizes.category === 'ITENS' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Ajustar Quantidade em Estoque</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          const current = parseInt(sizesModalQty) || 0;
                          setSizesModalQty(Math.max(0, current - 1).toString());
                        }}
                        className="w-12 h-12 bg-white hover:bg-slate-50 active:scale-95 border border-[#EBEBEB] rounded-xl font-black text-[#111827] text-lg flex items-center justify-center select-none shadow-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={sizesModalQty}
                        onChange={(e) => setSizesModalQty(e.target.value)}
                        className="flex-1 bg-white border border-[#EBEBEB] shadow-sm rounded-xl px-4 py-3 text-center text-lg text-slate-800 font-mono font-bold focus:outline-none focus:border-[#75BCE8]"
                      />
                      <button 
                        onClick={() => {
                          const current = parseInt(sizesModalQty) || 0;
                          setSizesModalQty((current + 1).toString());
                        }}
                        className="w-12 h-12 bg-[#111827] hover:bg-[#111827]/90 active:scale-95 text-white rounded-xl font-black text-lg flex items-center justify-center select-none shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Grade de Tamanhos (Clique para Editar)</span>

                    <div className="space-y-4">
                      {/* INFANTIL DISPLAY */}
                      {SIZES_CONFIG.INFANTIL.some(size => sizesModalQuantities[size] !== undefined) && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-[#111827] uppercase font-black tracking-widest block pl-1">Grade Infantil</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SIZES_CONFIG.INFANTIL.map(size => {
                              const qty = sizesModalQuantities[size] || 0;
                              return (
                                <button
                                  key={`sizes-infantil-${size}`}
                                  type="button"
                                  onClick={() => {
                                    setEditingSizeCell({ product: productForSizes, size, curQty: qty });
                                    setNewSizeQtyInput(qty.toString());
                                  }}
                                  className="w-full bg-white hover:bg-slate-50 hover:border-[#75BCE8] border border-[#EBEBEB] rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm"
                                >
                                  <span className="text-xs text-slate-500 font-semibold uppercase">{size}</span>
                                  <span className="text-xs font-mono font-black text-[#111827] shrink-0">{qty} un</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* BABYLOOK DISPLAY */}
                      {SIZES_CONFIG.BABYLOOK.some(size => sizesModalQuantities[size] !== undefined) && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[9px] text-[#111827] uppercase font-black tracking-widest block pl-1">Grade Babylook</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {SIZES_CONFIG.BABYLOOK.map(size => {
                              const qty = sizesModalQuantities[size] || 0;
                              return (
                                <button
                                  key={`sizes-babylook-${size}`}
                                  type="button"
                                  onClick={() => {
                                    setEditingSizeCell({ product: productForSizes, size, curQty: qty });
                                    setNewSizeQtyInput(qty.toString());
                                  }}
                                  className="w-full bg-white hover:bg-slate-50 hover:border-[#75BCE8] border border-[#EBEBEB] rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm"
                                >
                                  <span className="text-xs text-slate-500 font-semibold uppercase truncate max-w-[110px]" title={size}>
                                    {size.replace('Babylook ', 'BL ')}
                                  </span>
                                  <span className="text-xs font-mono font-black text-[#111827] shrink-0">{qty} un</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ADULTO DISPLAY */}
                      {SIZES_CONFIG.ADULTO.some(size => sizesModalQuantities[size] !== undefined) && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[9px] text-[#111827] uppercase font-black tracking-widest block pl-1">Grade Adulto</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SIZES_CONFIG.ADULTO.map(size => {
                              const qty = sizesModalQuantities[size] || 0;
                              return (
                                <button
                                  key={`sizes-adulto-${size}`}
                                  type="button"
                                  onClick={() => {
                                    setEditingSizeCell({ product: productForSizes, size, curQty: qty });
                                    setNewSizeQtyInput(qty.toString());
                                  }}
                                  className="w-full bg-white hover:bg-slate-50 hover:border-[#75BCE8] border border-[#EBEBEB] rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm"
                                >
                                  <span className="text-xs text-slate-500 font-semibold uppercase">{size}</span>
                                  <span className="text-xs font-mono font-black text-[#111827] shrink-0">{qty} un</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-4 border-t border-[#111827]/10 flex gap-3 shrink-0">
                {productForSizes.category === 'ITENS' ? (
                  <>
                    <button
                      onClick={handleSaveProductSizes}
                      className="flex-1 h-11 bg-[#111827] hover:bg-[#111827]/90 text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-sm"
                    >
                      Salvar Alterações
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductForSizes(null)}
                      className="px-5 h-11 bg-white hover:bg-slate-50 border border-[#EBEBEB] text-[#111827] rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-sm"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setProductForSizes(null)}
                    className="w-full h-11 bg-[#111827] hover:bg-[#111827]/90 text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-sm"
                  >
                    Fechar Grade de Tamanhos
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL PEQUENO DE EDIÇÃO DE QUANTIDADE DE UM TAMANHO ESPECÍFICO (VESTUÁRIO) */}
        {editingSizeCell && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setEditingSizeCell(null)} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-[#EBEBEB] border-2 border-[#111827] w-full max-w-sm rounded-3xl p-6 shadow-md flex flex-col text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#111827]/10 mb-4 shrink-0">
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Ajustar Saldo de Vestuário</p>
                  <h4 className="text-base text-[#111827] font-extrabold uppercase truncate max-w-[200px]" title={editingSizeCell.product.name}>
                    {editingSizeCell.product.name}
                  </h4>
                </div>
                <button 
                  onClick={() => setEditingSizeCell(null)} 
                  className="text-slate-400 hover:text-[#111827]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSizeQtyDirect} className="space-y-4">
                <div className="bg-white p-3 rounded-xl border border-[#EBEBEB] shadow-sm flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase font-black tracking-wider">Tamanho</span>
                  <span className="font-montserrat font-black text-[#111827] uppercase text-sm bg-[#75BCE8]/20 px-2.5 py-0.5 rounded-lg border border-[#75BCE8]/30">
                    {editingSizeCell.size}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider pl-1 font-sans">Nova quantidade</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={newSizeQtyInput}
                    onChange={(e) => setNewSizeQtyInput(e.target.value)}
                    className="w-full bg-white border border-[#EBEBEB] shadow-sm rounded-xl px-4 py-3 text-sm text-slate-800 font-mono font-bold focus:outline-none focus:border-[#75BCE8]"
                    placeholder="Ex: 10"
                    autoFocus
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#111827] hover:bg-[#111827]/90 text-white font-bold uppercase text-xs h-11 rounded-xl transition-colors shadow-sm"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSizeCell(null)}
                    className="px-5 bg-[#EFF0F4] hover:bg-slate-200 text-[#11358B] font-bold uppercase text-[10px] tracking-widest h-11 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      </div>
      </main>

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 pointer-events-auto ${
                toast.type === 'success' 
                  ? 'bg-emerald-950/95 border-emerald-500/35 text-emerald-200 shadow-emerald-900/10' 
                  : toast.type === 'error'
                  ? 'bg-rose-950/95 border-rose-500/35 text-rose-200 shadow-rose-900/10'
                  : 'bg-zinc-900/95 border-white/10 text-zinc-100 shadow-black/20'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              <span className="text-xs font-semibold leading-relaxed">{toast.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};
