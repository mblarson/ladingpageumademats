import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Tag, Plus, X, Check, Trash2, DollarSign, 
  Smartphone, Calendar, TrendingUp, Share2, Power, Store, 
  ChevronRight, ArrowLeft, RefreshCw, Layers, Edit3, ShieldAlert, Copy, CheckCircle2
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
  const [activeSubTab, setActiveSubTab] = useState<'menu' | 'estoque' | 'loja' | 'sql'>('menu');
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
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<EstoqueProduto | null>(null);
  const [productToEdit, setProductToEdit] = useState<EstoqueProduto | null>(null);
  const [productForSizes, setProductForSizes] = useState<EstoqueProduto | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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

  // Toast Notification State
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; text: string }>>([]);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString();
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

  // Sync everything
  const loadData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      const generatedProdId = dbMode === 'SUPABASE' ? undefined : `prod-${Date.now()}`;
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
                id: `var-${Date.now()}-${index}`,
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
      showToast("Produto cadastrado com sucesso!", "success");

      // Silently refresh in background
      loadData();
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
      showToast("Produto excluído com sucesso!", "success");
      // Silently sync background
      loadData();
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
          id: `var-temp-${Date.now()}-${index}`,
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
            id: `var-temp-${Date.now()}`,
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
                id: `var-${Date.now()}`,
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
          id: `ev-${Date.now()}`,
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

  // -------------------------------------------------------------
  // SALES TRANSACTIONS (VENDER, BAIXA DIRETA DE ESTOQUE)
  // -------------------------------------------------------------
  const handleRegisterVenda = async (payment_method: 'PIX' | 'CARTÃO') => {
    if (!activeEvento || !showVendaModal) return;
    const { produto, size } = showVendaModal;

    setLoading(true);

    try {
      if (dbMode === 'SUPABASE') {
        // Double Check stock on clothes
        let selectedVarId = undefined;
        if (produto.category === 'VESTUÁRIO' && size) {
          const matchedVar = produto.variations?.find(v => v.size === size);
          if (!matchedVar || matchedVar.quantity <= 0) {
            showToast("Estoque esgotado para este tamanho!", "error");
            setLoading(false);
            return;
          }
          selectedVarId = matchedVar.id;
        } else if (produto.category === 'ITENS' && produto.initial_quantity <= 0) {
          showToast("Estoque esgotado para este item!", "error");
          setLoading(false);
          return;
        }

        // 1. Insert into Sales
        const { data: dbSale, error: saleErr } = await supabase
          .from('estoque_vendas')
          .insert([{ event_id: activeEvento.id, total_price: produto.price, payment_method, status: 'CONCLUIDA' }])
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
              quantity: 1,
              price_at_sale: produto.price,
              size
            }]);

          if (itemErr) throw itemErr;

          // 3. Subtract stock manually inside Supabase (if trigger is not configured)
          if (produto.category === 'VESTUÁRIO' && selectedVarId) {
            const currentQty = produto.variations?.find(v => v.id === selectedVarId)?.quantity || 1;
            await supabase
              .from('estoque_variacoes')
              .update({ quantity: currentQty - 1 })
              .eq('id', selectedVarId);
          } else {
            const currentQty = produto.initial_quantity || 1;
            await supabase
              .from('estoque_produtos')
              .update({ initial_quantity: currentQty - 1 })
              .eq('id', produto.id);
          }
        }
      } else {
        // LOCAL DB WORKFLOW
        // 1. Subtract Stock Local
        const updatedProducts = produtos.map(p => {
          if (p.id === produto.id) {
            if (p.category === 'VESTUÁRIO') {
              const updatedVars = (p.variations || []).map(v => {
                if (v.size === size) {
                  return { ...v, quantity: Math.max(0, v.quantity - 1) };
                }
                return v;
              });
              const sumQty = updatedVars.reduce((sum, current) => sum + current.quantity, 0);
              return { ...p, variations: updatedVars, initial_quantity: sumQty };
            } else {
              return { ...p, initial_quantity: Math.max(0, p.initial_quantity - 1) };
            }
          }
          return p;
        });

        // 2. Create Sale
        const saleId = `sale-${Date.now()}`;
        const newSale: EstoqueVenda = {
          id: saleId,
          event_id: activeEvento.id,
          total_price: produto.price,
          payment_method,
          status: 'CONCLUIDA',
          created_at: new Date().toISOString(),
          items: [{
            id: `sale-item-${Date.now()}`,
            sale_id: saleId,
            product_id: produto.id,
            quantity: 1,
            price_at_sale: produto.price,
            size,
            product_name: produto.name,
            category: produto.category
          }]
        };

        const updatedSales = [newSale, ...vendas];
        saveLocalStorageData(updatedProducts, eventos, updatedSales);
      }

      showToast("Venda registrada com sucesso!", "success");
      await loadData();
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

      await loadData();
      setShowConfirmCancelVenda(null);
      showToast("Venda cancelada e estoque estornado com sucesso!", "success");
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
      showToast("Evento fechado com sucesso!", "success");
      await loadData();
    } catch (err: any) {
      showToast("Erro ao fechar evento: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculations for current/last event sales metrics
  const activeEventSales = useMemo(() => {
    const targetEventId = activeEvento?.id || (eventos.length > 0 ? eventos[eventos.length - 1].id : null);
    if (!targetEventId) return [];
    return vendas.filter(v => v.event_id === targetEventId);
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
    const targetEvent = activeEvento || (eventos.length > 0 ? eventos[eventos.length - 1] : null);
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

    if (summary.canceledCount > 0) {
      message += `\n*🚫 ESTORNOS / VENDAS CANCELADAS:*\n`;
      message += `• ${summary.canceledCount} vendas canceladas (Estorno de R$ ${summary.canceledTotal.toFixed(2).replace('.', ',')})\n`;
    }

    message += `\n_Relatório gerado em: ${new Date().toLocaleString('pt-BR')}_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const uniqueProdutos = useMemo(() => {
    return Array.from(new Map(produtos.map(p => [p.id, p])).values());
  }, [produtos]);

  return (
    <div className="space-y-6">
      {/* Main Switchboard */}
      {activeSubTab === 'menu' && (
        <div className="flex flex-col items-center justify-center py-12 px-4 gap-8">
          <div className="text-center space-y-2">
            <h3 className="font-display italic text-3xl md:text-4xl text-white uppercase tracking-wide">Estoque Umademats</h3>
            <p className="text-white/40 text-xs uppercase font-bold tracking-widest max-w-md mx-auto">
              Controle rápido de estoque de camisetas e itens do congresso, com vendas rápidas de balcão.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-lg mx-auto">
            {/* Option 1: ESTOQUE */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSubTab('estoque')}
              className="w-full sm:w-1/2 bg-[#121212] border border-white/10 hover:border-brand-neon rounded-2xl p-4 shadow-lg flex items-center gap-3 relative group transition-colors"
            >
              <div className="w-10 h-10 bg-brand-neon/10 rounded-xl flex items-center justify-center text-[#ccff00] border border-brand-neon/20 shrink-0">
                <ShoppingBag size={18} />
              </div>
              <div className="text-left">
                <h4 className="font-display text-lg font-bold uppercase text-white group-hover:text-brand-neon transition-colors leading-none">Estoque</h4>
              </div>
            </motion.button>

            {/* Option 2: ABRIR LOJA / LOJA */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSubTab('loja')}
              className="w-full sm:w-1/2 bg-[#121212] border border-white/10 hover:border-brand-purple rounded-2xl p-4 shadow-lg flex items-center gap-3 relative group transition-colors"
            >
              <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center text-[#a855f7] border border-brand-purple/20 shrink-0">
                <Store size={18} />
              </div>
              <div className="text-left">
                <h4 className="font-display text-lg font-bold uppercase text-white group-hover:text-[#a855f7] transition-colors leading-none">Abrir Loja</h4>
              </div>
            </motion.button>
          </div>

          {onBack && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="mt-4 px-6 py-3 rounded-xl border border-white/10 hover:border-white/35 text-white/60 hover:text-white uppercase font-bold text-xs tracking-widest flex items-center gap-2 transition-all bg-[#0d0d0d]"
            >
              <ArrowLeft size={14} /> Voltar ao Controle Administrativo
            </motion.button>
          )}
        </div>
      )}

      {/* SECTION 1: ESTOQUE MANAGEMENT */}
      {activeSubTab === 'estoque' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <button 
              onClick={() => setActiveSubTab('menu')}
              className="flex items-center gap-1.5 uppercase font-black text-xs text-white/50 hover:text-white tracking-widest active:translate-x-[-2px] transition-all"
            >
              <ArrowLeft size={14} />
              Menu Principal
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowAddProductModal(true)}
                className="w-full sm:w-auto h-11 bg-[#C7EF66] hover:bg-[#C7EF66]/90 text-[#11358B] px-6 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Plus size={16} strokeWidth={2.5} />
                Adicionar Produto
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl uppercase tracking-wider text-white">Grade de Estoque Cadastrada</h3>
            
            {produtos.length === 0 ? (
              <div className="bg-[#101010] p-12 text-center rounded-2xl border border-white/5">
                <ShoppingBag size={48} className="mx-auto text-white/10 mb-4 animate-bounce" />
                <p className="text-xs uppercase font-bold tracking-widest text-white/30">Nenhum produto cadastrado no estoque.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {uniqueProdutos.map(p => {
                  const itemsCount = p.category === 'VESTUÁRIO' 
                    ? (p.variations || []).reduce((sum, current) => sum + current.quantity, 0)
                    : p.initial_quantity;

                  return (
                    <div 
                      key={p.id}
                      onClick={() => handlePrepareSizes(p)}
                      className="bg-[#111111] hover:bg-[#151515] border border-white/10 hover:border-[#ccff00]/40 p-2.5 rounded-lg transition-all cursor-pointer select-none"
                    >
                      {/* Top Row: Type - Product Name - Edit/Delete Icons */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 font-sans font-medium text-white">
                          <span className={`${p.category === 'VESTUÁRIO' ? 'text-[#ccff00]' : 'text-brand-pink'} text-[10px] tracking-wider uppercase font-semibold shrink-0`}>
                            {p.category}
                          </span>
                          <span className="text-white/40 text-[10px] shrink-0 font-semibold">—</span>
                          <span className="truncate text-xs md:text-sm text-white/90 font-medium">
                            {p.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* pencil icon */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrepareEdit(p);
                            }}
                            className="text-white/60 hover:text-[#ccff00] p-1.5 hover:bg-white/5 rounded-md transition-all"
                            title="Editar Produto"
                          >
                            <Edit3 size={14} />
                          </button>
                          {/* red trash icon */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductToDelete(p);
                            }}
                            className="text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-md transition-all"
                            title="Excluir Produto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Quantity - Price */}
                      <div className="flex items-center justify-between mt-1 text-xs text-white/50 font-sans leading-none">
                        <span>{itemsCount} unidades</span>
                        <span className="font-mono text-brand-neon font-semibold text-xs">
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
        <div className="space-y-6">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <button 
              onClick={() => setActiveSubTab('menu')}
              className="flex items-center gap-1.5 uppercase font-black text-xs text-white/50 hover:text-white tracking-widest active:translate-x-[-2px] transition-all"
            >
              <ArrowLeft size={14} />
              Menu Principal
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {activeEvento ? (
                <>
                  <div className="bg-[#a855f7]/10 border border-brand-purple/30 px-4 py-2.5 rounded-xl flex items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center gap-2">
                      <Store size={16} className="text-[#a855f7] animate-pulse" />
                      <div className="text-left">
                        <p className="text-[8px] uppercase font-black text-white/30 tracking-wider">Loja Aberta</p>
                        <p className="text-xs text-white font-bold max-w-[120px] truncate">{activeEvento.event_name}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFecharLojaConfirm()}
                    className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Power size={14} />
                    Fechar Loja
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAbrirLojaModal(true)}
                  className="w-full sm:w-auto bg-brand-purple hover:bg-brand-purple/80 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                >
                  <Power size={14} />
                  Abrir Loja
                </button>
              )}
            </div>
          </div>

          {/* ACTIVE sales panel */}
          {activeEvento ? (
            <div className="space-y-6">
              {/* TOTAL VENDIDO DISPLAY PANEL */}
              <div 
                onClick={() => setShowDetalhesVendasModal(true)}
                className="bg-[#121222] border-2 border-[#ccff00] hover:border-white p-6 rounded-3xl cursor-pointer relative overflow-hidden group shadow-2xl transition-all"
              >
                <div className="absolute right-0 top-0 p-6 text-brand-neon/10 group-hover:scale-110 transition-transform">
                  <TrendingUp size={100} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#ccff00] tracking-widest block mb-1">TOTAL VENDIDO NO EVENTO</span>
                    <span className="text-4xl md:text-5xl font-mono text-white font-black leading-none flex items-center gap-3">
                      R$ {activeEventSummary.totalSold.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <button className="bg-brand-neon hover:bg-white text-black px-4 py-2.5 rounded-full text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
                    Ver Detalhamento das Vendas
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div className="relative z-10 flex gap-6 mt-4 pt-4 border-t border-white/5 text-[10px] text-white/50 uppercase font-black tracking-wider">
                  <div>PIX: <span className="text-white">R$ {activeEventSummary.pixTotal.toFixed(2).replace('.', ',')}</span></div>
                  <div>Cartão: <span className="text-white">R$ {activeEventSummary.cardTotal.toFixed(2).replace('.', ',')}</span></div>
                  <div>Canceladas: <span className="text-rose-500 font-bold">{activeEventSummary.canceledCount}</span></div>
                </div>
              </div>

              {/* POS ITEMS GRID */}
              <div className="space-y-4">
                <h3 className="font-display text-xl uppercase tracking-wider text-white">Selecione o produto para vender</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueProdutos.map(p => {
                    const totalEstoque = p.category === 'VESTUÁRIO'
                      ? (p.variations || []).reduce((sum, curr) => sum + curr.quantity, 0)
                      : p.initial_quantity;

                    return (
                      <div 
                        key={p.id}
                        className="bg-[#111] border border-white/15 p-5 rounded-3xl flex flex-col justify-between hover:border-white/30 transition-all shadow-xl group"
                      >
                        <div className="mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[8px] font-black uppercase text-white/40 tracking-wider">{p.category}</span>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${totalEstoque > 10 ? 'text-green-500' : totalEstoque > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                              {totalEstoque > 0 ? `${totalEstoque} em Estoque` : 'ESGOTADO'}
                            </span>
                          </div>
                          <h4 className="font-display text-lg uppercase text-white group-hover:text-brand-neon transition-colors leading-snug">{p.name}</h4>
                          <p className="text-xl font-mono text-white font-black mt-1">R$ {p.price.toFixed(2)}</p>
                        </div>

                        {/* RENDER VARIATIONS OR SELL INSTANT BUTTON */}
                        {p.category === 'VESTUÁRIO' ? (
                          <div className="mt-2 space-y-2">
                            <p className="text-[8px] uppercase font-black text-white/20 tracking-widest leading-none mb-1">Selecione o tamanho para registrar venda:</p>
                            <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto no-scrollbar">
                                {p.variations && p.variations.length > 0 ? p.variations.map(v => (
                                  <button
                                    key={`${p.id}-${v.size}`}
                                    disabled={v.quantity <= 0}
                                  onClick={() => setShowVendaModal({ produto: p, size: v.size })}
                                  className={`p-1.5 rounded-lg border text-center text-[10px] uppercase font-semibold flex flex-col items-center justify-center transition-all ${v.quantity > 0 ? 'bg-white/5 border-white/10 hover:border-brand-neon hover:bg-brand-neon/5 text-white' : 'bg-red-500/5 border-red-500/10 text-white/20 cursor-not-allowed'}`}
                                >
                                  <span>{v.size.replace('Babylook', 'BL').replace('Infantil', 'INF')}</span>
                                  <span className={`text-[8px] font-mono mt-0.5 font-bold ${v.quantity > 3 ? 'text-white/40' : v.quantity > 0 ? 'text-amber-500 font-extrabold' : 'text-red-500'}`}>
                                    [{v.quantity}]
                                  </span>
                                </button>
                              )) : (
                                <div className="col-span-4 p-2 text-center text-[10px] text-white/30 uppercase italic">
                                  Sem variação cadastrada
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            disabled={totalEstoque <= 0}
                            onClick={() => setShowVendaModal({ produto: p })}
                            className={`w-full py-3.5 rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition-all ${totalEstoque > 0 ? 'bg-[#ccff00] text-black hover:bg-white active:translate-y-0.5' : 'bg-[#151515] text-white/20 border border-white/5 cursor-not-allowed'}`}
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
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#111] border border-white/5 rounded-3xl gap-4">
              <Store size={48} className="text-white/10 shrink-0" />
              <div className="text-center space-y-1">
                <h4 className="text-lg font-display uppercase text-white leading-none">LOJA FECHADA / DESATIVADA</h4>
                <p className="text-xs text-white/30 uppercase font-black tracking-widest">Abra a loja acima seletivamente para iniciar vendas de evento.</p>
              </div>
              <button
                onClick={() => setShowAbrirLojaModal(true)}
                className="bg-brand-purple hover:bg-brand-purple/80 text-white px-8 py-3.5 rounded-2xl font-bold uppercase text-xs shadow-lg flex items-center gap-2 mt-2 transition-all active:scale-95"
              >
                <Power size={14} />
                Abrir Loja Agora
              </button>
            </div>
          )}
        </div>
      )}

      {/* SQL REFERENCE VIEW */}
      {activeSubTab === 'sql' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <button 
              onClick={() => setActiveSubTab('menu')}
              className="flex items-center gap-1.5 uppercase font-black text-xs text-white/50 hover:text-white tracking-widest active:translate-x-[-2px] transition-all"
            >
              <ArrowLeft size={14} />
              Menu Principal
            </button>
            <button
              onClick={copySQL}
              className="bg-brand-neon hover:bg-white text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {isCopied ? 'Copiado!' : 'Copiar SQL Inteiro'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-xl uppercase text-white leading-none">Script SQL para o Supabase</h3>
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest leading-relaxed">
                Execute o script de criação estruturada abaixo diretamente no Terminal de Editores SQL da console Supabase para provisionar o estoque definitivo.
              </p>
            </div>

            <div className="bg-black border border-white/15 p-6 rounded-3xl overflow-x-auto relative">
              <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre scrollbar-thin">
                {SQL_CODE}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODALS & OVERLAYS 
         ------------------------------------------------------------- */}
      <AnimatePresence>
        
        {/* ADD PRODUCT MODAL */}
        {showAddProductModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddProductModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-[#ccff00] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-left">
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                <h3 className="font-display uppercase text-xl text-white">Cadastrar Novo Produto</h3>
                <button onClick={() => setShowAddProductModal(false)} className="text-white/30 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-5">
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-white/[0.4] text-[9px] uppercase font-black tracking-widest pl-1">Nome do Produto</label>
                  <input 
                    type="text" 
                    required
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    placeholder="Ex: Camiseta UMADEMATS 2026"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon text-sm uppercase font-bold"
                  />
                </div>

                {/* Categoria Selector */}
                <div className="space-y-2">
                  <label className="text-white/[0.4] text-[9px] uppercase font-black tracking-widest pl-1">Categoria de Produto</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewProdCategory('VESTUÁRIO')}
                      className={`py-3.5 rounded-xl font-bold text-xs uppercase border-2 transition-all ${newProdCategory === 'VESTUÁRIO' ? 'bg-[#ccff00]/10 border-brand-neon text-[#ccff00]' : 'bg-black border-white/10 text-white/50 hover:border-white/20'}`}
                    >
                      VESTUÁRIO (Grade)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProdCategory('ITENS')}
                      className={`py-3.5 rounded-xl font-bold text-xs uppercase border-2 transition-all ${newProdCategory === 'ITENS' ? 'bg-brand-pink/10 border-brand-pink text-brand-pink' : 'bg-black border-white/10 text-white/50 hover:border-white/20'}`}
                    >
                      ITENS (Qtd Única)
                    </button>
                  </div>
                </div>

                {/* Valor & Qtd Unica (Itens) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white/[0.4] text-[9px] uppercase font-black tracking-widest pl-1">Valor Unitário (R$)</label>
                    <input 
                      type="text" 
                      required
                      value={newProdPrice}
                      onChange={e => setNewProdPrice(applyCurrencyMask(e.target.value))}
                      placeholder="R$ 0,00"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon text-sm font-mono font-bold"
                    />
                  </div>

                  {newProdCategory === 'ITENS' && (
                    <div className="space-y-2">
                      <label className="text-white/[0.4] text-[9px] uppercase font-black tracking-widest pl-1">Quantidade Inicial</label>
                      <input 
                        type="number" 
                        required
                        value={newProdQty}
                        onChange={e => setNewProdQty(e.target.value)}
                        placeholder="Ex: 100"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon text-sm font-mono font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Size Grid (For Vestuario Category) */}
                {newProdCategory === 'VESTUÁRIO' && (
                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-brand-neon tracking-wider">GRADE DE TAMANHOS (Clique para Editar)</h4>
                      <p className="text-[9px] text-white/30 uppercase font-bold leading-normal">Defina as unidades disponíveis para cada tamanho clicando neles.</p>
                    </div>

                    {/* INFANTIL SIZES */}
                    <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em] block pl-1 font-sans">INFANTIL (Tamanhos 2 a 14)</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SIZES_CONFIG.INFANTIL.map(size => {
                          const qty = sizeQuantities[size] || 0;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setEditingSizeCell({
                                  product: { id: 'new-product', name: newProdName || 'Novo Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(newProdPrice) || 0, initial_quantity: 0 },
                                  size,
                                  curQty: qty
                                });
                                setNewSizeQtyInput(qty.toString());
                              }}
                              className="w-full bg-white/5 hover:bg-white/10 hover:border-[#6192FC]/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98]"
                            >
                              <span className="text-xs text-white/60 font-semibold uppercase">{size}</span>
                              <span className="text-xs font-mono font-black text-[#C7EF66] shrink-0">{qty} un</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* BABYLOOK SIZES */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em] block pl-1 font-sans">BABYLOOK (PP ao XGG)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SIZES_CONFIG.BABYLOOK.map(size => {
                          const qty = sizeQuantities[size] || 0;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setEditingSizeCell({
                                  product: { id: 'new-product', name: newProdName || 'Novo Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(newProdPrice) || 0, initial_quantity: 0 },
                                  size,
                                  curQty: qty
                                });
                                setNewSizeQtyInput(qty.toString());
                              }}
                              className="w-full bg-white/5 hover:bg-white/10 hover:border-[#6192FC]/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98]"
                            >
                              <span className="text-xs text-white/60 font-semibold uppercase truncate max-w-[110px]" title={size}>
                                {size.replace('Babylook ', 'BL ')}
                              </span>
                              <span className="text-xs font-mono font-black text-[#C7EF66] shrink-0">{qty} un</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ADULTO SIZES */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em] block pl-1 font-sans">ADULTO UNISSEX (PP ao XGG)</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SIZES_CONFIG.ADULTO.map(size => {
                          const qty = sizeQuantities[size] || 0;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setEditingSizeCell({
                                  product: { id: 'new-product', name: newProdName || 'Novo Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(newProdPrice) || 0, initial_quantity: 0 },
                                  size,
                                  curQty: qty
                                });
                                setNewSizeQtyInput(qty.toString());
                              }}
                              className="w-full bg-white/5 hover:bg-white/10 hover:border-[#6192FC]/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98]"
                            >
                              <span className="text-xs text-white/60 font-semibold uppercase">{size}</span>
                              <span className="text-xs font-mono font-black text-[#C7EF66] shrink-0">{qty} un</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5 flex gap-2 shrink-0">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-brand-neon hover:bg-[#b0db00] text-black py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-1.5 active:translate-y-0.5"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} strokeWidth={2.5} />}
                    Cadastrar Produto
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white max-w-[120px] rounded-xl font-bold text-xs uppercase"
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
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-brand-purple w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl">
              <Store size={40} className="mx-auto text-brand-purple mb-4" />
              <h3 className="text-xl font-display uppercase text-white mb-2 leading-none">ABRIR SEÇÃO DE EVENTO</h3>
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-6">Nomeie sessão de vendas de balcão.</p>
              
              <form onSubmit={handleIniciarEvento} className="space-y-4">
                <div className="text-left space-y-1">
                  <span className="text-[8px] font-black uppercase text-white/30 tracking-widest block pl-1">Nome do Encontro / Congresso</span>
                  <input 
                    type="text" 
                    required
                    value={eventoInputName}
                    onChange={e => setEventoInputName(e.target.value)}
                    placeholder="Ex: Congresso UMADEMATS 2026"
                    className="w-full bg-black border border-white/15 focus:border-brand-purple focus:outline-none rounded-xl px-4 py-3 text-sm text-white uppercase font-bold text-center"
                  />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-purple hover:bg-purple-600 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg flex items-center justify-center gap-1 active:translate-y-0.5"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <Power size={14} />}
                    Iniciar Evento
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAbrirLojaModal(false)} 
                    className="w-full py-2.5 text-white/30 hover:text-white uppercase font-black text-[9px] tracking-widest"
                  >
                    Voltar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MAKE SALE / CHOOSE PAYMENT INBALCÃO MODAL */}
        {showVendaModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVendaModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-brand-neon w-full max-w-sm rounded-[2rem] p-6 text-center shadow-2xl">
              <ShoppingBag size={40} className="mx-auto text-brand-neon mb-4 animate-bounce" />
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-wider">REGISTRO DE VENDA RÁPIDA</span>
                <h3 className="text-xl font-display uppercase text-white leading-none mt-2">{showVendaModal.produto.name}</h3>
                {showVendaModal.size && (
                  <span className="inline-block bg-[#ccff00]/10 text-brand-neon border border-[#ccff00]/20 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mt-1.5">
                    Tamanho: {showVendaModal.size}
                  </span>
                )}
                <div className="font-mono text-3xl text-white font-black py-4">
                  R$ {showVendaModal.produto.price.toFixed(2).replace('.', ',')}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Meio de Pagamento Utilizado:</p>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (confirm(`Confirmar venda no valor de R$ ${showVendaModal.produto.price.toFixed(2)} via PIX?`)) {
                        handleRegisterVenda('PIX');
                      }
                    }}
                    className="py-4 bg-[#ccff00]/10 border border-[#ccff00]/30 hover:border-[#ccff00] text-brand-neon rounded-2xl flex flex-col items-center justify-center gap-1 active:bg-[#ccff00]/20"
                  >
                    <Smartphone size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">Pix</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (confirm(`Confirmar venda no valor de R$ ${showVendaModal.produto.price.toFixed(2)} via CARTÃO?`)) {
                        handleRegisterVenda('CARTÃO');
                      }
                    }}
                    className="py-4 bg-[#a855f7]/10 border border-brand-purple/30 hover:border-brand-purple text-brand-purple rounded-2xl flex flex-col items-center justify-center gap-1 active:bg-[#a855f7]/20"
                  >
                    <DollarSign size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">Cartão</span>
                  </motion.button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowVendaModal(null)}
                  className="w-full py-2.5 text-white/30 hover:text-white uppercase font-black text-[9px] tracking-[0.15em] block pt-4"
                >
                  Cancelar Venda
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DETAILS OF REALIZED SALES (CLICK TO DETAIL & CANCEL OPTION) */}
        {showDetalhesVendasModal && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetalhesVendasModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-left">
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-display uppercase text-xl text-white">Vendas Realizadas</h3>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Histórico completo da seção aberta de balcão</p>
                </div>
                <button onClick={() => setShowDetalhesVendasModal(false)} className="text-white/30 hover:text-white transition-colors"><X size={24} /></button>
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
                        className={`p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${isCanceled ? 'bg-red-500/5 border border-red-500/10 opacity-40' : 'bg-white/5 border border-white/5 hover:border-white/10'}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isCanceled ? 'bg-red-500/20 text-red-500 border border-red-500/20' : sale.payment_method === 'PIX' ? 'bg-[#ccff00]/10 text-brand-neon border border-[#ccff00]/20' : 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20'}`}>
                              {isCanceled ? 'Cancelada' : sale.payment_method}
                            </span>
                            <span className="text-[8px] text-white/30 uppercase font-mono">
                              {new Date(sale.created_at).toLocaleTimeString('pt-BR')}
                            </span>
                          </div>
                          
                          <p className={`text-sm font-bold uppercase mt-1.5 leading-tight ${isCanceled ? 'line-through text-white/30' : 'text-white'}`}>
                            {matchedItem ? matchedItem.product_name : 'Produto Desconhecido'}
                          </p>

                          {matchedItem?.size && (
                            <span className="inline-block bg-white/5 text-white/50 text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5 border border-white/5">
                              Tamanho: {matchedItem.size}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-white/5 sm:border-0 pt-2 sm:pt-0 shrink-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[8px] text-white/30 uppercase block font-bold leading-none mb-1">Valor Final</span>
                            <span className={`text-base font-mono font-black ${isCanceled ? 'text-white/20' : 'text-[#ccff00]'}`}>
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
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-red-500 w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl">
              <ShieldAlert size={40} className="mx-auto text-red-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-display uppercase text-white mb-2 leading-none">Confirmar Cancelamento?</h3>
              <p className="text-white/40 text-xs uppercase font-extrabold tracking-widest leading-normal mb-6">
                Esta ação restaura imediatamente os saldos de estoque do produto.
              </p>

              <div className="bg-black/30 p-4 rounded-xl border border-red-500/10 text-left mb-6">
                <p className="text-[8px] text-white/30 uppercase font-black tracking-widest leading-none mb-1">Item Vendido</p>
                <p className="text-sm font-extrabold uppercase text-white">
                  {showConfirmCancelVenda.items && showConfirmCancelVenda.items[0]?.product_name}
                </p>
                {showConfirmCancelVenda.items?.[0]?.size && (
                  <p className="text-[10px] text-[#ccff00] uppercase font-black">
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
                  className="w-full py-2.5 text-white/30 hover:text-white uppercase font-black text-[9px] tracking-widest"
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
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-[#ccff00] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-left">
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-display uppercase text-2xl text-[#ccff00]">Resumo de Fechamento</h3>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Conclusão bem-sucedida do caixa</p>
                </div>
                <button onClick={() => setShowFecharLojaModal(false)} className="text-white/30 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                {/* Event Name Badge */}
                <div className="bg-[#ccff00]/10 border border-[#ccff00]/30 p-4 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-brand-neon shrink-0" />
                  <div className="text-left">
                    <p className="text-[8px] uppercase font-black text-white/30 tracking-widest leading-none mb-1">FECHAMENTO DE SEÇÃO DE VENDAS</p>
                    <p className="text-base text-white font-extrabold uppercase">Sessão Finalizada</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                    <span className="text-[8px] uppercase font-bold text-white/30 tracking-wider block mb-1">Faturamento</span>
                    <span className="text-lg font-mono font-black text-white">R$ {activeEventSummary.totalSold.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                    <span className="text-[8px] uppercase font-bold text-white/30 tracking-wider block mb-1">PIX</span>
                    <span className="text-lg font-mono font-black text-[#ccff00]">R$ {activeEventSummary.pixTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                    <span className="text-[8px] uppercase font-bold text-white/30 tracking-wider block mb-1">CARTÃO</span>
                    <span className="text-lg font-mono font-black text-[#a855f7]">R$ {activeEventSummary.cardTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                {/* Items Sold list */}
                <div className="space-y-3">
                  <span className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em] block pl-1">Balancete de Produtos Vendidos</span>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {activeEventSummary.products.length === 0 ? (
                      <p className="text-center text-[10px] text-white/30 uppercase italic py-4 font-bold">Nenhum produto vendido nessa seção.</p>
                    ) : (
                      activeEventSummary.products.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/[0.03] last:border-0">
                          <span className="text-xs uppercase text-white font-extrabold">{p.name}</span>
                          <span className="text-xs font-mono font-black text-brand-neon">{p.qty}x</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Canceled check */}
                {activeEventSummary.canceledCount > 0 && (
                  <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl text-[10px] uppercase font-bold text-red-400">
                    Sessão teve {activeEventSummary.canceledCount} estornos realizados (Total de R$ {activeEventSummary.canceledTotal.toFixed(2).replace('.', ',')})
                  </div>
                )}
              </div>

              {/* Share Footer */}
              <div className="p-6 border-t border-white/5 bg-white/5 shrink-0 flex gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 shadow-lg active:translate-y-0.5 transition-all text-center"
                >
                  <Share2 size={14} />
                  Compartilhar via WhatsApp
                </button>
                <button
                  onClick={() => setShowFecharLojaModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-xl font-bold uppercase text-xs"
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
              className="relative bg-[#1a1a1a] border-2 border-red-500 w-full max-w-sm rounded-[2rem] p-6 text-center shadow-2xl"
            >
              <ShieldAlert size={40} className="mx-auto text-red-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-display uppercase text-white mb-2 leading-none">Excluir Produto?</h3>
              <p className="text-white/40 text-xs uppercase font-extrabold tracking-widest leading-normal mb-6">
                Tem certeza que deseja excluir permanentemente o produto do estoque?
              </p>

              <div className="bg-black/30 p-4 rounded-xl border border-red-500/10 text-left mb-6">
                <p className="text-[8px] text-white/30 uppercase font-black tracking-widest leading-none mb-1">Produto Selecionado</p>
                <p className="text-sm font-extrabold uppercase text-white">
                  {productToDelete.name}
                </p>
                <p className="text-[#ccff00] text-xs font-mono font-bold mt-1 uppercase">
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
                  className="w-full py-2.5 text-white/30 hover:text-white uppercase font-black text-[9px] tracking-widest"
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
              className="relative bg-[#1a1a1a] border-2 border-brand-neon w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 shrink-0">
                <h3 className="text-lg font-display uppercase text-white font-bold">Editar Produto</h3>
                <button onClick={() => setProductToEdit(null)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProductEdit} className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1 pb-2 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-wider block">Nome do Produto</label>
                  <input
                    type="text"
                    value={editProdName}
                    onChange={(e) => setEditProdName(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-neon"
                    placeholder="Nome"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-black tracking-wider block">Preço (R$)</label>
                    <input
                      type="text"
                      value={editProdPrice}
                      onChange={(e) => setEditProdPrice(applyCurrencyMask(e.target.value))}
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-brand-neon"
                      placeholder="R$ 0,00"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-black tracking-wider block">Categoria</label>
                    <select
                      value={editProdCategory}
                      onChange={(e) => setEditProdCategory(e.target.value as 'VESTUÁRIO' | 'ITENS')}
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-neon appearance-none font-bold uppercase"
                    >
                      <option value="VESTUÁRIO" className="bg-[#1a1a1a]">VESTUÁRIO</option>
                      <option value="ITENS" className="bg-[#1a1a1a]">ITENS</option>
                    </select>
                  </div>
                </div>

                {editProdCategory === 'ITENS' ? (
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-black tracking-wider block">Quantidade em Estoque</label>
                    <input
                      type="number"
                      value={editProdQty}
                      onChange={(e) => setEditProdQty(e.target.value)}
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-brand-neon"
                      placeholder="Qtd"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] text-[#ccff00] uppercase font-black tracking-wider block">Grade de Quantidades por Tamanho (Clique para Editar)</span>
                    
                    <div className="space-y-3 max-h-[35vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] custom-scrollbar pr-1 bg-black/30 p-3 rounded-2xl border border-white/5">
                      {/* INFANTIL */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest block pl-1 font-sans">Grade Infantil</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {SIZES_CONFIG.INFANTIL.map(size => {
                            const qty = editSizeQuantities[size] || 0;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => {
                                  setEditingSizeCell({
                                    product: { id: 'edit-product', name: editProdName || 'Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(editProdPrice) || 0, initial_quantity: 0 },
                                    size,
                                    curQty: qty
                                  });
                                  setNewSizeQtyInput(qty.toString());
                                }}
                                className="w-full bg-white/5 hover:bg-white/10 hover:border-[#6192FC]/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98]"
                              >
                                <span className="text-xs text-white/60 font-semibold uppercase">{size}</span>
                                <span className="text-xs font-mono font-black text-[#C7EF66] shrink-0">{qty} un</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* BABYLOOK */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest block pl-1 font-sans">Grade Babylook</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SIZES_CONFIG.BABYLOOK.map(size => {
                            const qty = editSizeQuantities[size] || 0;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => {
                                  setEditingSizeCell({
                                    product: { id: 'edit-product', name: editProdName || 'Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(editProdPrice) || 0, initial_quantity: 0 },
                                    size,
                                    curQty: qty
                                  });
                                  setNewSizeQtyInput(qty.toString());
                                }}
                                className="w-full bg-white/5 hover:bg-white/10 hover:border-[#6192FC]/40 border border-[#ccff00]/10 rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98]"
                              >
                                <span className="text-xs text-white/60 font-semibold uppercase truncate max-w-[110px]" title={size}>
                                  {size.replace('Babylook ', 'BL ')}
                                </span>
                                <span className="text-xs font-mono font-black text-[#C7EF66] shrink-0">{qty} un</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ADULTO */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest block pl-1 font-sans">Grade Adulto</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {SIZES_CONFIG.ADULTO.map(size => {
                            const qty = editSizeQuantities[size] || 0;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => {
                                  setEditingSizeCell({
                                    product: { id: 'edit-product', name: editProdName || 'Produto', category: 'VESTUÁRIO', price: parseCurrencyToFloat(editProdPrice) || 0, initial_quantity: 0 },
                                    size,
                                    curQty: qty
                                  });
                                  setNewSizeQtyInput(qty.toString());
                                }}
                                className="w-full bg-white/5 hover:bg-white/10 hover:border-[#6192FC]/40 border border-[#ccff00]/10 rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98]"
                              >
                                <span className="text-xs text-white/60 font-semibold uppercase">{size}</span>
                                <span className="text-xs font-mono font-black text-[#C7EF66] shrink-0">{qty} un</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-3 shrink-0">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-neon hover:bg-[#b0db00] text-black py-3 rounded-xl font-bold uppercase text-xs transition-colors"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductToEdit(null)}
                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase text-[10px] tracking-widest"
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
              className="relative bg-[#1a1a1a] border-2 border-white/10 w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-start justify-between pb-3 border-b border-white/5 mb-4 text-left shrink-0">
                <div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${productForSizes.category === 'VESTUÁRIO' ? 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20' : 'bg-brand-pink/10 text-brand-pink border border-brand-pink/20'}`}>
                    {productForSizes.category}
                  </span>
                  <h3 className="text-xl font-display uppercase text-white font-extrabold mt-1">{productForSizes.name}</h3>
                </div>
                <button onClick={() => setProductForSizes(null)} className="text-white/40 hover:text-white mt-1">
                  <X size={20} />
                </button>
              </div>

              {/* Informações Gerais */}
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex justify-between items-center mb-4 shrink-0 text-xs text-white/50 text-left">
                <div>
                  <span className="block text-[8px] uppercase font-bold tracking-wider mb-0.5">Valor Unitário</span>
                  <span className="text-base text-brand-neon font-bold font-mono">
                    R$ {productForSizes.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] uppercase font-bold tracking-wider mb-0.5">Estoque Total</span>
                  <span className="text-base text-white font-bold font-mono">
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
                    <label className="text-[10px] text-white/40 uppercase font-black tracking-wider block">Ajustar Quantidade em Estoque</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          const current = parseInt(sizesModalQty) || 0;
                          setSizesModalQty(Math.max(0, current - 1).toString());
                        }}
                        className="w-12 h-12 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 rounded-xl font-black text-white text-lg flex items-center justify-center select-none"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={sizesModalQty}
                        onChange={(e) => setSizesModalQty(e.target.value)}
                        className="flex-1 bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-center text-lg text-white font-mono focus:outline-none focus:border-brand-neon"
                      />
                      <button 
                        onClick={() => {
                          const current = parseInt(sizesModalQty) || 0;
                          setSizesModalQty((current + 1).toString());
                        }}
                        className="w-12 h-12 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 rounded-xl font-black text-[#ccff00] text-lg flex items-center justify-center select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-wider block">Grade de Tamanhos (Clique para Editar)</span>

                    <div className="space-y-4">
                      {/* INFANTIL DISPLAY */}
                      {SIZES_CONFIG.INFANTIL.some(size => sizesModalQuantities[size] !== undefined) && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-[#ccff00] uppercase font-black tracking-widest block pl-1">Grade Infantil</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SIZES_CONFIG.INFANTIL.map(size => {
                              const qty = sizesModalQuantities[size] || 0;
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => {
                                    setEditingSizeCell({ product: productForSizes, size, curQty: qty });
                                    setNewSizeQtyInput(qty.toString());
                                  }}
                                  className="w-full bg-white/5 hover:bg-white/10 hover:border-[#6192FC]/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98]"
                                >
                                  <span className="text-xs text-white/60 font-semibold uppercase">{size}</span>
                                  <span className="text-xs font-mono font-black text-[#C7EF66] shrink-0">{qty} un</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* BABYLOOK DISPLAY */}
                      {SIZES_CONFIG.BABYLOOK.some(size => sizesModalQuantities[size] !== undefined) && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[9px] text-[#ccff00] uppercase font-black tracking-widest block pl-1">Grade Babylook</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {SIZES_CONFIG.BABYLOOK.map(size => {
                              const qty = sizesModalQuantities[size] || 0;
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => {
                                    setEditingSizeCell({ product: productForSizes, size, curQty: qty });
                                    setNewSizeQtyInput(qty.toString());
                                  }}
                                  className="w-full bg-white/5 hover:bg-white/10 hover:border-[#6192FC]/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98]"
                                >
                                  <span className="text-xs text-white/60 font-semibold uppercase truncate max-w-[110px]" title={size}>
                                    {size.replace('Babylook ', 'BL ')}
                                  </span>
                                  <span className="text-xs font-mono font-black text-[#C7EF66] shrink-0">{qty} un</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ADULTO DISPLAY */}
                      {SIZES_CONFIG.ADULTO.some(size => sizesModalQuantities[size] !== undefined) && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[9px] text-[#ccff00] uppercase font-black tracking-widest block pl-1">Grade Adulto</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SIZES_CONFIG.ADULTO.map(size => {
                              const qty = sizesModalQuantities[size] || 0;
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => {
                                    setEditingSizeCell({ product: productForSizes, size, curQty: qty });
                                    setNewSizeQtyInput(qty.toString());
                                  }}
                                  className="w-full bg-white/5 hover:bg-white/10 hover:border-[#6192FC]/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-left transition-all active:scale-[0.98]"
                                >
                                  <span className="text-xs text-white/60 font-semibold uppercase">{size}</span>
                                  <span className="text-xs font-mono font-black text-[#C7EF66] shrink-0">{qty} un</span>
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
              <div className="pt-4 border-t border-white/5 flex gap-3 shrink-0">
                {productForSizes.category === 'ITENS' ? (
                  <>
                    <button
                      onClick={handleSaveProductSizes}
                      className="flex-1 h-11 bg-[#C7EF66] hover:bg-[#C7EF66]/90 text-[#11358B] rounded-xl font-bold uppercase text-xs tracking-wider transition-all"
                    >
                      Salvar Alterações
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductForSizes(null)}
                      className="px-5 h-11 bg-[#EFF0F4] hover:bg-slate-200 text-[#11358B] rounded-xl font-bold uppercase text-xs tracking-wider transition-all"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setProductForSizes(null)}
                    className="w-full h-11 bg-[#6192FC] hover:bg-[#11358B] hover:text-[#EFF0F4] text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all"
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
              className="relative bg-[#1a1a1a] border-2 border-[#6192FC] w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 shrink-0">
                <div>
                  <p className="text-[8px] text-white/30 uppercase font-black tracking-widest leading-none mb-1">Ajustar Saldo de Vestuário</p>
                  <h4 className="text-base text-white font-extrabold uppercase truncate max-w-[200px]" title={editingSizeCell.product.name}>
                    {editingSizeCell.product.name}
                  </h4>
                </div>
                <button 
                  onClick={() => setEditingSizeCell(null)} 
                  className="text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSizeQtyDirect} className="space-y-4">
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-white/40 uppercase font-black tracking-wider">Tamanho</span>
                  <span className="font-display font-black text-[#C7EF66] uppercase text-sm bg-[#C7EF66]/10 px-2.5 py-0.5 rounded-lg border border-[#C7EF66]/20">
                    {editingSizeCell.size}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-wider pl-1 font-sans">Nova quantidade</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={newSizeQtyInput}
                    onChange={(e) => setNewSizeQtyInput(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-[#ccff00] font-mono font-bold focus:outline-none focus:border-[#6192FC]"
                    placeholder="Ex: 10"
                    autoFocus
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#6192FC] hover:bg-[#11358B] hover:text-[#EFF0F4] text-white font-bold uppercase text-xs h-11 rounded-xl transition-colors"
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
