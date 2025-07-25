import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronDown, ChevronRight, X, ShoppingCart, RotateCcw, Menu } from 'lucide-react';
import { supabaseApi } from '../lib/supabase';

const MyDivinos = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [macroCategories, setMacroCategories] = useState([]);
  const [expandedMacroCategories, setExpandedMacroCategories] = useState({});
  const [expandedSubCategories, setExpandedSubCategories] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [cart, setCart] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notes, setNotes] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [pastOrders, setPastOrders] = useState([]);
  
  // NAVIGAZIONE PULITA CON STATO UNICO
  const [currentPage, setCurrentPage] = useState('homepage');
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);
  
  const hamburgerRef = useRef(null);

  // Carica dati iniziali
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Per ora usiamo Andrea Bulgari hardcoded
      // In futuro si può aggiungere autenticazione
      const userData = await supabaseApi.getUserByPhone('+393356222225');
      
      if (!userData) {
        console.error('Utente non trovato');
        return;
      }

      setUser(userData);
      
      // Carica prodotti per l'utente
      const productsData = await supabaseApi.getProductsForUser(userData.id);
      
      // Organizza i prodotti per categoria
      const categoriesMap = new Map();
      
      productsData.forEach(item => {
        const product = item.prodotti;
        const subCategory = product.sub_categorie;
        const macroCategory = subCategory.macro_categorie;
        
        if (!categoriesMap.has(macroCategory.id)) {
          categoriesMap.set(macroCategory.id, {
            id: macroCategory.id,
            name: macroCategory.nome,
            icon: macroCategory.icona,
            subcategories: new Map()
          });
        }
        
        const macro = categoriesMap.get(macroCategory.id);
        
        if (!macro.subcategories.has(subCategory.id)) {
          macro.subcategories.set(subCategory.id, {
            id: subCategory.id,
            name: subCategory.nome,
            products: []
          });
        }
        
        const sub = macro.subcategories.get(subCategory.id);
        sub.products.push({
          id: product.id,
          name: product.nome,
          description: product.descrizione,
          price: parseFloat(product.prezzo),
          code: product.codice,
          dimensions: product.dimensioni,
          subcategory: product.sottocategoria
        });
      });
      
      // Converte le mappe in array
      const categoriesArray = Array.from(categoriesMap.values()).map(macro => ({
        ...macro,
        subcategories: Array.from(macro.subcategories.values())
      }));
      
      setMacroCategories(categoriesArray);
      
      // Carica preferiti
      const favoritesData = await supabaseApi.getFavorites(userData.id);
      setFavorites(new Set(favoritesData));
      
      // Carica storico ordini
      const ordersData = await supabaseApi.getOrderHistory(userData.id);
      const formattedOrders = ordersData.map(order => ({
        id: order.id,
        date: new Date(order.data_ordine).toLocaleDateString('it-IT'),
        notes: order.note,
        stato: order.stato,
        products: order.ordini_prodotti.map(op => ({
          id: op.prodotti.id,
          name: op.prodotti.nome,
          code: op.prodotti.codice,
          quantity: op.quantita
        }))
      }));
      
      setPastOrders(formattedOrders);
      
      // Aggiorna ultimo login
      await supabaseApi.updateLastLogin(userData.id);
      
    } catch (error) {
      console.error('Errore inizializzazione app:', error);
    } finally {
      setLoading(false);
    }
  };

  // Click outside handler per hamburger menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
        setShowHamburgerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ottieni tutti i prodotti da tutte le categorie
  const allProducts = macroCategories.flatMap(macro => 
    macro.subcategories.flatMap(sub => sub.products)
  );
  
  const favoriteProducts = allProducts.filter(product => favorites.has(product.id));

  // Funzione per ottenere le macro categorie di un ordine
  const getOrderMacroCategories = (order) => {
    const categoriesInOrder = new Set();
    
    order.products.forEach(item => {
      const product = allProducts.find(p => p.id === item.id || p.name === item.name);
      if (product) {
        const macroCategory = macroCategories.find(macro => 
          macro.subcategories.some(sub => 
            sub.products.some(prod => prod.id === product.id)
          )
        );
        if (macroCategory) {
          categoriesInOrder.add(macroCategory);
        }
      }
    });
    
    return Array.from(categoriesInOrder);
  };

  // NAVIGAZIONE FUNZIONI
  const goToHomepage = () => {
    setCurrentPage('homepage');
    setSelectedHistoryOrder(null);
  };

  const goToStorico = () => {
    setCurrentPage('storico');
    setSelectedHistoryOrder(null);
  };

  const goToDettaglioOrdine = (order) => {
    setSelectedHistoryOrder(order);
    setCurrentPage('dettaglio');
  };

  const toggleMacroCategory = (macroId) => {
    setExpandedMacroCategories(prev => {
      if (prev[macroId]) {
        setExpandedSubCategories({});
        return { [macroId]: false };
      }
      setExpandedSubCategories({});
      return { [macroId]: true };
    });
  };

  const toggleSubCategory = (subId) => {
    setExpandedSubCategories(prev => {
      if (prev[subId]) {
        return {};
      }
      return { [subId]: true };
    });
  };

  const toggleFavorite = async (productId) => {
    if (!user) return;
    
    try {
      const isNowFavorite = await supabaseApi.toggleFavorite(user.id, productId);
      
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (isNowFavorite) {
          newFavorites.add(productId);
        } else {
          newFavorites.delete(productId);
        }
        return newFavorites;
      });
    } catch (error) {
      console.error('Errore toggle preferito:', error);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity === 0) {
      const newCart = { ...cart };
      delete newCart[productId];
      setCart(newCart);
    } else {
      setCart(prev => ({ ...prev, [productId]: quantity }));
    }
  };

  const getCartItemsCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleMenuAction = (action) => {
    setShowHamburgerMenu(false);
    switch(action) {
      case 'storico':
        setCurrentPage('storico');
        break;
      case 'vini':
        window.open('/cataloghi/vini-champagne.pdf', '_blank');
        break;
      case 'distillati':
        window.open('/cataloghi/distillati.pdf', '_blank');
        break;
      case 'esci':
        window.close();
        break;
    }
  };

  const cloneHistoryOrder = (order) => {
    const newCart = {};
    
    order.products.forEach(item => {
      const product = allProducts.find(p => p.id === item.id || p.name === item.name);
      if (product) {
        newCart[product.id] = item.quantity;
      }
    });
    
    setCart(newCart);
    setNotes(order.notes || '');
    goToHomepage();
  };

  const generateWhatsAppMessage = async () => {
    if (!user) return;
    
    try {
      // Salva l'ordine nel database
      await supabaseApi.saveOrder(user.id, cart, notes);
      
      // Genera messaggio WhatsApp
      const orderDate = new Date().toLocaleDateString('it-IT');
      const orderedProducts = Object.entries(cart).map(([productId, quantity]) => {
        const product = allProducts.find(p => p.id === productId);
        const isCarton = product.name.toLowerCase().includes('tonic') || 
                         product.name.toLowerCase().includes('tonica');
        const quantityText = isCarton ? `×${quantity} (cartoni)` : `×${quantity}`;
        const dimensions = product.dimensions ? ` - ${product.dimensions}` : '';
        return `🔹 ${product.code} - ${product.name}${dimensions} ${quantityText}`;
      }).join('\n');
      
      const message = `🍷 *ORDINE MyDivinos*\n\n` +
                     `👤 *CLIENTE:* ${user.nome_locale}\n` +
                     `📞 *TELEFONO:* ${user.telefono}\n` +
                     `📅 *DATA:* ${orderDate}\n\n` +
                     `📦 *PRODOTTI ORDINATI:*\n${orderedProducts}\n\n` +
                     (notes ? `📝 *NOTE AGGIUNTIVE:*\n${notes}\n\n` : '') +
                     `Grazie! 🙏`;
      
      const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '393356222225';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Reset carrello dopo invio
      setTimeout(() => {
        setCart({});
        setNotes('');
        setShowCart(false);
        // Ricarica storico ordini
        initializeApp();
      }, 500);
      
    } catch (error) {
      console.error('Errore invio ordine:', error);
      alert('Errore durante il salvataggio dell\'ordine. Riprova.');
    }
  };

  const resetCart = () => {
    setCart({});
    setNotes('');
  };

  const cloneLastOrder = () => {
    if (pastOrders.length > 0) {
      const lastOrder = pastOrders[0];
      const newCart = {};
      
      lastOrder.products.forEach(item => {
        const product = allProducts.find(p => p.name === item.name || p.id === item.id);
        if (product) {
          newCart[product.id] = item.quantity;
        }
      });
      
      setCart(newCart);
      setNotes(lastOrder.notes || '');
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-red-600 font-bold text-2xl italic transform -rotate-12">My</span>
            <span className="text-blue-900 font-bold text-3xl">Divinos</span>
          </div>
          <p className="text-blue-900">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Se non c'è utente, mostra errore
  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-red-600 font-bold text-2xl italic transform -rotate-12">My</span>
            <span className="text-blue-900 font-bold text-3xl">Divinos</span>
          </div>
          <p className="text-red-600 mb-4">Utente non trovato</p>
          <button 
            onClick={initializeApp}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  const ProductItem = ({ product }) => (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <button 
            onClick={() => toggleFavorite(product.id)}
            className="mr-3"
          >
            <Star 
              className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
            />
          </button>
          
          <div className="cursor-pointer flex-1" onClick={() => setSelectedProduct(product)}>
            <h4 className="font-semibold text-blue-900 hover:text-blue-700 text-xl">{product.name}</h4>
            {product.dimensions && (
              <p className="text-sm text-gray-600">{product.dimensions}</p>
            )}
          </div>
        </div>
        
        <div className="ml-4">
          <select 
            value={cart[product.id] || 0}
            onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
            className={`px-3 py-2 border rounded-md text-sm font-medium ${
              cart[product.id] > 0 
                ? 'bg-blue-900 text-white border-blue-900' 
                : 'bg-white text-blue-900 border-gray-300'
            }`}
          >
            {[...Array(21)].map((_, i) => (
              <option key={i} value={i}>{i === 0 ? '--' : i}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // PAGINA STORICO ORDINI
  if (currentPage === 'storico') {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-white p-4 border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={goToHomepage}
                className="text-blue-900 hover:text-blue-700"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                <span className="text-red-600 font-bold text-lg italic transform -rotate-12">My</span>
                <span className="text-blue-900 font-bold text-2xl">Divinos</span>
              </div>
            </div>
            <span className="text-sm text-gray-600">{pastOrders.length} ordini</span>
          </div>
          <h1 className="text-xl font-bold text-blue-900 mt-2">Storico Ordini</h1>
        </div>

        <div className="p-4 space-y-4">
          {pastOrders.map(order => {
            const orderCategories = getOrderMacroCategories(order);
            
            return (
              <div 
                key={order.id} 
                onClick={() => goToDettaglioOrdine(order)}
                className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-900 rounded-lg p-4 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">📅</span>
                      <h3 className="font-bold text-blue-900 text-lg">{order.date}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <span>📦</span>
                        <span>{order.products.length} prodotti</span>
                      </span>
                      {orderCategories.length > 0 && (
                        <span className="flex items-center space-x-1">
                          {orderCategories.map((category, index) => (
                            <span key={category.id} className="flex items-center">
                              <span className="text-xs font-medium">{category.name.toLowerCase()}</span>
                              {index < orderCategories.length - 1 && <span className="mx-1">•</span>}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-blue-900 flex items-center space-x-2">
                    <span className="text-sm font-medium">Vedi dettagli</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // PAGINA DETTAGLIO ORDINE
  if (currentPage === 'dettaglio' && selectedHistoryOrder) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-white p-4 border-b sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button 
              onClick={goToStorico}
              className="text-blue-900 hover:text-blue-700"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center">
              <span className="text-red-600 font-bold text-lg italic transform -rotate-12">My</span>
              <span className="text-blue-900 font-bold text-2xl">Divinos</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-blue-900 mt-2">Ordine {selectedHistoryOrder.date}</h1>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg shadow border">
            <div className="bg-gray-50 px-6 py-3">
              <h2 className="font-semibold text-blue-900">Prodotti Ordinati</h2>
            </div>
            <div className="p-4">
              {selectedHistoryOrder.products.map((item, index) => (
                <div key={index} className="flex justify-between py-2">
                  <span className="text-blue-900">{item.name}</span>
                  <span className="text-blue-900 font-medium">×{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedHistoryOrder
