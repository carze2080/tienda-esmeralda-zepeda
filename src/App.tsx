import React, { useState, useEffect } from 'react';
import { 
  Product, Order, ElectronicInvoice, BoutiqueProfile, 
  OrderItem, CustomerInfo, PaymentMethod, CostBreakdown, OrderStatus 
} from './types';
import { 
  getStoredProfile, saveStoredProfile, 
  getStoredProducts, saveStoredProducts, 
  getStoredOrders, saveStoredOrders, 
  getStoredInvoices, saveStoredInvoices, 
  calculatePricingFromCost, clearAllLocalBoutiqueData 
} from './utils/storage';
import { generateElectronicInvoice } from './utils/invoiceGenerator';
import { playOrderAlertChime, playSuccessChime } from './utils/audio';

import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { OrdersView } from './components/OrdersView';
import { InvoicesView } from './components/InvoicesView';
import { FinancesView } from './components/FinancesView';
import { OrderNotificationBanner } from './components/OrderNotificationBanner';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { ProductCostModal } from './components/ProductCostModal';
import { ClientShopModal } from './components/ClientShopModal';
import { SettingsModal } from './components/SettingsModal';

import { testFirestoreConnection } from './firebase';
import { 
  subscribeToProducts, subscribeToOrders, subscribeToInvoices, subscribeToProfile,
  syncSaveProduct, syncDeleteProduct, syncSaveOrder, syncUpdateOrderStatus, 
  syncSaveInvoice, syncSaveProfile, clearAllFirestoreData
} from './utils/firebaseSync';

export default function App() {
  const [profile, setProfile] = useState<BoutiqueProfile>(getStoredProfile);
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [invoices, setInvoices] = useState<ElectronicInvoice[]>(getStoredInvoices);

  const [activeTab, setActiveTab] = useState<TabType>('pos');
  const [selectedInvoice, setSelectedInvoice] = useState<ElectronicInvoice | null>(null);
  const [costModalProduct, setCostModalProduct] = useState<Product | null>(null);
  const [isClientShopOpen, setIsClientShopOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeAlertOrder, setActiveAlertOrder] = useState<Order | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredInvoices(invoices);
  }, [invoices]);

  // Real-time Firestore Cloud Synchronization
  useEffect(() => {
    testFirestoreConnection();

    const unsubProducts = subscribeToProducts((cloudProds) => {
      if (cloudProds && cloudProds.length > 0) {
        setProducts(cloudProds);
      }
    }, products);

    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders((prev) => {
          // If a new order arrives from outside that was not in our local list, alert!
          if (cloudOrders.length > prev.length && prev.length > 0) {
            const newest = cloudOrders[0];
            if (newest.status === 'nuevo') {
              playOrderAlertChime();
              setActiveAlertOrder(newest);
            }
          }
          return cloudOrders;
        });
      }
    }, orders);

    const unsubInvoices = subscribeToInvoices((cloudInvs) => {
      if (cloudInvs && cloudInvs.length > 0) {
        setInvoices(cloudInvs);
      }
    }, invoices);

    const unsubProfile = subscribeToProfile((cloudProf) => {
      if (cloudProf) {
        setProfile((prev) => ({ ...prev, ...cloudProf }));
      }
    }, profile);

    return () => {
      unsubProducts();
      unsubOrders();
      unsubInvoices();
      unsubProfile();
    };
  }, []);

  const newOrdersCount = orders.filter((o) => o.status === 'nuevo').length;

  // Sound toggle
  const handleToggleSound = () => {
    setProfile((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  // Create an order (from POS or Client Store)
  const handleCreateOrder = (
    customer: CustomerInfo,
    items: OrderItem[],
    paymentMethod: PaymentMethod,
    notes?: string,
    isOnline = false
  ) => {
    const subtotal = items.reduce((sum, it) => sum + (it.totalPrice / (1 + profile.taxRate)), 0);
    const total = items.reduce((sum, it) => sum + it.totalPrice, 0);
    const taxAmount = total - subtotal;
    const totalCost = items.reduce((sum, it) => sum + it.totalCost, 0);
    const profit = total - totalCost;

    const orderNumber = `PED-${1000 + orders.length + 1}`;
    const newOrderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: newOrderId,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      paymentMethod,
      status: isOnline ? 'nuevo' : 'entregado',
      notes,
      isOnlineOrder: isOnline,
    };

    // Auto-generate certified electronic invoice
    const newInvoice = generateElectronicInvoice(newOrder, profile, invoices.length + 1);
    newOrder.invoiceId = newInvoice.id;

    // Deduct stock from products inventory
    setProducts((prevProducts) => {
      return prevProducts.map((prod) => {
        const orderItemMatches = items.filter((it) => it.productId === prod.id);
        if (orderItemMatches.length === 0) return prod;

        const updatedVariants = prod.variants.map((variant) => {
          const matchedItem = orderItemMatches.find((it) => it.size === variant.size);
          if (matchedItem) {
            return {
              ...variant,
              stock: Math.max(0, variant.stock - matchedItem.quantity),
            };
          }
          return variant;
        });

        const newTotalStock = updatedVariants.reduce((s, v) => s + v.stock, 0);

        const updatedProduct = {
          ...prod,
          variants: updatedVariants,
          totalStock: newTotalStock,
        };
        // Sync deducted stock to Firestore
        syncSaveProduct(updatedProduct).catch(console.error);
        return updatedProduct;
      });
    });

    // Update orders and invoices in state and Firestore
    setOrders((prev) => [newOrder, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);
    syncSaveOrder(newOrder).catch(console.error);
    syncSaveInvoice(newInvoice).catch(console.error);

    // Audio & vibration instant alert
    if (profile.soundEnabled) {
      playOrderAlertChime();
    }

    // Show popup notification banner
    setActiveAlertOrder(newOrder);

    // If made from POS, automatically show the generated invoice modal so Esmeralda can deliver it to the client
    if (!isOnline) {
      setSelectedInvoice(newInvoice);
    }
  };

  // Simulate incoming order to test the instant notification and chime
  const handleSimulateOrder = () => {
    // Pick an available product
    const availableProds = products.filter((p) => p.totalStock > 0);
    const prod = availableProds.length > 0 ? availableProds[Math.floor(Math.random() * availableProds.length)] : products[0];
    const availableVariant = prod.variants.find((v) => v.stock > 0) || prod.variants[0];

    const sampleCustomers = [
      { name: 'Ana Sofía Garza', phone: '+52 33 4455 6677', address: 'Paseo de las Lomas 820, Guadalajara' },
      { name: 'Renata Montes', phone: '+52 33 9988 7766', address: 'Av. Américas 1500, Zapopan' },
      { name: 'Camila Villalobos', phone: '+52 33 1212 3434', address: 'Colonia Americana, Guadalajara' },
      { name: 'Isabella Treviño', phone: '+52 33 7654 3210', address: 'Puerta de Hierro 420, Zapopan' },
    ];
    const client = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];

    const item: OrderItem = {
      productId: prod.id,
      productName: prod.name,
      size: availableVariant.size,
      color: availableVariant.color,
      quantity: 1,
      unitCost: prod.totalCost,
      unitPrice: prod.sellingPrice,
      totalCost: prod.totalCost,
      totalPrice: prod.sellingPrice,
      sku: availableVariant.sku,
    };

    handleCreateOrder(
      {
        name: client.name,
        phone: client.phone,
        address: client.address,
        rfc: 'XAXX010101000',
        cfdiUsage: 'S01 - Sin efectos fiscales',
      },
      [item],
      'transferencia',
      'Pedido realizado desde celular del cliente. Requiere envío a domicilio.',
      true
    );
  };

  // Status transitions
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    syncUpdateOrderStatus(orderId, newStatus).catch(console.error);
    if (profile.soundEnabled) {
      playSuccessChime();
    }
  };

  // Product CRUD
  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    syncSaveProduct(updated).catch(console.error);
    if (profile.soundEnabled) {
      playSuccessChime();
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    syncSaveProduct(newProduct).catch(console.error);
    if (profile.soundEnabled) {
      playSuccessChime();
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    syncDeleteProduct(productId).catch(console.error);
  };

  // Save cost breakdown from Cost Calculator Modal
  const handleSaveProductCost = (
    productId: string,
    breakdown: CostBreakdown,
    totalCost: number,
    profitAmount: number,
    sellingPrice: number
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = {
            ...p,
            costBreakdown: breakdown,
            totalCost,
            profitAmount,
            sellingPrice,
          };
          syncSaveProduct(updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );
    if (profile.soundEnabled) {
      playSuccessChime();
    }
  };

  // Export full backup JSON
  const handleExportBackup = () => {
    const backupData = {
      appName: 'Esmeralda Zepeda Boutique',
      exportDate: new Date().toISOString(),
      profile,
      products,
      orders,
      invoices,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo_boutique_esmeralda_zepeda_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (profile.soundEnabled) {
      playSuccessChime();
    }
  };

  // Import full backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) setProfile(parsed.profile);
        if (Array.isArray(parsed.products)) setProducts(parsed.products);
        if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
        if (Array.isArray(parsed.invoices)) setInvoices(parsed.invoices);
        if (profile.soundEnabled) {
          playSuccessChime();
        }
        alert('¡Copia de seguridad restaurada con éxito!');
      } catch (err) {
        console.error('Error al restaurar respaldo:', err);
        alert('El archivo seleccionado no es un respaldo válido.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Clean all data completely
  const handleClearAllData = async () => {
    if (confirm('¿Estás segura de eliminar todos los datos? Esta acción dejará tu inventario, pedidos y facturas en blanco para que subas tus prendas reales.')) {
      setProducts([]);
      setOrders([]);
      setInvoices([]);
      clearAllLocalBoutiqueData();
      await clearAllFirestoreData();
      if (profile.soundEnabled) {
        playSuccessChime();
      }
      alert('¡Listo! Tu boutique está 100% limpia para registrar tus prendas.');
    }
  };

  // One-time automatic cleanup of old sample demo items if present
  useEffect(() => {
    const hasOldDemos = products.some((p) => p.id === 'prod-1' || p.id === 'prod-2');
    if (hasOldDemos) {
      setProducts([]);
      setOrders([]);
      setInvoices([]);
      clearAllLocalBoutiqueData();
      clearAllFirestoreData().catch(console.error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Header */}
      <Header
        profile={profile}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenClientShop={() => setIsClientShopOpen(true)}
        onSimulateOrder={handleSimulateOrder}
        newOrdersCount={newOrdersCount}
      />

      {/* Main Content Area based on Tab */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-2">
        {activeTab === 'pos' && (
          <POSView
            products={products}
            profile={profile}
            onCreateOrder={(customer, items, paymentMethod, notes) =>
              handleCreateOrder(customer, items, paymentMethod, notes, false)
            }
          />
        )}

        {activeTab === 'inventario' && (
          <InventoryView
            products={products}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onOpenCostCalculator={(product) => setCostModalProduct(product)}
          />
        )}

        {activeTab === 'pedidos' && (
          <OrdersView
            orders={orders}
            invoices={invoices}
            profile={profile}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onViewInvoice={(inv) => setSelectedInvoice(inv)}
            onSimulateOrder={handleSimulateOrder}
          />
        )}

        {activeTab === 'facturas' && (
          <InvoicesView
            invoices={invoices}
            onViewInvoice={(inv) => setSelectedInvoice(inv)}
          />
        )}

        {activeTab === 'finanzas' && (
          <FinancesView
            products={products}
            orders={orders}
            profile={profile}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        newOrdersCount={newOrdersCount}
      />

      {/* Real-time Order Popup Notification Banner */}
      <OrderNotificationBanner
        order={activeAlertOrder}
        onClose={() => setActiveAlertOrder(null)}
        onViewOrder={(order) => {
          setActiveTab('pedidos');
          setActiveAlertOrder(null);
        }}
      />

      {/* Electronic Invoice Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      {/* Cost & Markup Calculator Modal */}
      <ProductCostModal
        product={costModalProduct}
        onClose={() => setCostModalProduct(null)}
        onSaveCost={handleSaveProductCost}
      />

      {/* Client Shop Modal */}
      <ClientShopModal
        isOpen={isClientShopOpen}
        onClose={() => setIsClientShopOpen(false)}
        products={products}
        profile={profile}
        onSubmitClientOrder={(customer, items, notes) =>
          handleCreateOrder(customer, items, 'contra_entrega', notes, true)
        }
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => {
          setProfile(updated);
          syncSaveProfile(updated).catch(console.error);
        }}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
