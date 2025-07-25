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
              {selectedHistoryOrder.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Note</h3>
              <p className="text-blue-900">{selectedHistoryOrder.notes}</p>
            </div>
          )}

          <button 
            onClick={() => cloneHistoryOrder(selectedHistoryOrder)}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Clona questo ordine</span>
          </button>
        </div>
      </div>
    );
  }

  // PAGINA CARRELLO
  if (showCart) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-white p-4 border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-600 font-bold text-lg italic transform -rotate-12">My</span>
              <span className="text-blue-900 font-bold text-2xl">Divinos</span>
            </div>
            <h1 className="text-xl font-bold text-blue-900">{user.nome_locale}</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-blue-900">Il tuo carrello</h2>
            <span className="text-sm text-gray-600">{getCartItemsCount()} prodotti</span>
          </div>

          {Object.keys(cart).length > 0 ? (
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(cart).map(([productId, quantity]) => {
                      const product = allProducts.find(p => p.id === productId);
                      return (
                        <tr key={productId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-lg font-semibold text-blue-900">{product?.name}</div>
                            {product?.dimensions && (
                              <div className="text-sm text-gray-600">{product.dimensions}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select 
                              value={quantity}
                              onChange={(e) => updateQuantity(productId, parseInt(e.target.value))}
                              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-blue-900 text-white"
                            >
                              {[...Array(21)].map((_, i) => (
                                <option key={i} value={i}>{i === 0 ? '--' : i}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => updateQuantity(productId, 0)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Il carrello è vuoto</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Note aggiuntive
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.toUpperCase())}
              placeholder="Prodotti aggiuntivi o richieste speciali..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none uppercase text-blue-900"
              rows={3}
            />
          </div>

          <div className="space-y-3 pt-4">
            {Object.keys(cart).length > 0 && (
              <button 
                onClick={generateWhatsAppMessage}
                className="w-full bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800"
              >
                Invia Ordine
              </button>
            )}
            
            <button 
              onClick={() => setShowCart(false)}
              className="w-full bg-gray-100 text-blue-900 py-3 rounded-lg font-medium hover:bg-gray-200"
            >
              Torna indietro
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PAGINA HOMEPAGE (default)
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-red-600 font-bold text-lg italic transform -rotate-12">My</span>
              <span className="text-blue-900 font-bold text-2xl">Divinos</span>
            </div>
            
            <div className="relative" ref={hamburgerRef}>
              <button
                onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
                className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              
              {showHamburgerMenu && (
                <div className="absolute top-12 left-0 bg-blue-900 rounded-lg shadow-2xl py-2 min-w-[320px] z-50">
                  <button
                    onClick={() => handleMenuAction('storico')}
                    className="w-full px-6 py-3 text-left text-white hover:bg-blue-800 flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg">📅</span>
                    <span className="text-lg">Storico</span>
                  </button>
                  
                  <button
                    onClick={() => handleMenuAction('vini')}
                    className="w-full px-6 py-3 text-left text-white hover:bg-blue-800 flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg">📄</span>
                    <span className="text-lg">Catalogo Vini</span>
                  </button>
                  
                  <button
                    onClick={() => handleMenuAction('distillati')}
                    className="w-full px-6 py-3 text-left text-white hover:bg-blue-800 flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg">🥃</span>
                    <span className="text-lg">Catalogo Distillati</span>
                  </button>
                  
                  <div className="border-t border-blue-700 my-1"></div>
                  
                  <button
                    onClick={() => handleMenuAction('esci')}
                    className="w-full px-6 py-3 text-left text-white hover:bg-blue-800 flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg">🚪</span>
                    <span className="text-lg">Esci</span>
                  </button>
                  
                  <div className="border-t border-blue-700 mt-2 pt-2">
                    <button
                      onClick={() => setShowHamburgerMenu(false)}
                      className="w-full px-6 py-2 text-center text-blue-300 hover:text-white text-sm"
                    >
                      ✕ Chiudi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {pastOrders.length > 0 && (
              <button 
                onClick={cloneLastOrder}
                className="text-blue-900 hover:text-blue-700"
                title="Clona ultimo ordine"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-bold text-blue-900">{user.nome_locale}</h1>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-blue-900">{selectedProduct.name}</h3>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
                <svg width="120" height="180" viewBox="0 0 120 180" className="text-blue-900">
                  <rect x="45" y="50" width="30" height="120" fill="currentColor" rx="2"/>
                  <rect x="50" y="30" width="20" height="25" fill="currentColor"/>
                  <rect x="48" y="25" width="24" height="8" fill="currentColor" rx="2"/>
                  <rect x="47" y="80" width="26" height="40" fill="white" stroke="currentColor" strokeWidth="1" rx="1"/>
                  <text x="60" y="95" textAnchor="middle" fontSize="6" fill="currentColor">WINE</text>
                  <text x="60" y="105" textAnchor="middle" fontSize="4" fill="currentColor">2024</text>
                </svg>
              </div>
              
              <div>
                <p className="text-sm text-blue-900 mb-2">{selectedProduct.description}</p>
                <p className="text-sm text-blue-900 mb-1">Codice: {selectedProduct.code}</p>
                {selectedProduct.dimensions && (
                  <p className="text-sm text-blue-900 mb-1">Dimensioni: {selectedProduct.dimensions}</p>
                )}
                <p className="text-sm text-blue-900 mb-1">Sottocategoria: {selectedProduct.subcategory}</p>
                <p className="text-lg font-bold text-blue-900">€{selectedProduct.price?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 pb-20">
        {favoriteProducts.length > 0 && (
          <div>
            <button 
              onClick={() => toggleMacroCategory('preferiti')}
              className="w-full bg-yellow-400 text-blue-900 p-4 rounded-lg flex justify-between items-center font-bold text-lg"
            >
              <div className="flex items-center space-x-2">
                <Star className="w-6 h-6 fill-current" />
                <span>PREFERITI</span>
              </div>
              {expandedMacroCategories.preferiti ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
            
            {expandedMacroCategories.preferiti && (
              <div className="mt-3 space-y-3 border-l-4 border-yellow-400 pl-4">
                {favoriteProducts.map(product => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {macroCategories.map(macroCategory => (
          <div key={macroCategory.id}>
            <button 
              onClick={() => toggleMacroCategory(macroCategory.id)}
              className={`w-full p-5 rounded-xl flex justify-between items-center font-bold text-lg transition-colors ${
                expandedMacroCategories[macroCategory.id] 
                  ? 'bg-blue-800 text-white' 
                  : 'bg-blue-900 text-white hover:bg-blue-800'
              }`}
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{macroCategory.icon}</span>
                <span className="tracking-wide">{macroCategory.name}</span>
              </div>
              {expandedMacroCategories[macroCategory.id] ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
            
            {expandedMacroCategories[macroCategory.id] && (
              <div className="mt-3 space-y-3 ml-4">
                {macroCategory.subcategories.map(subCategory => (
                  <div key={subCategory.id}>
                    <button 
                      onClick={() => toggleSubCategory(subCategory.id)}
                      className={`w-full p-4 rounded-xl flex justify-between items-center font-semibold text-lg transition-colors ${
                        expandedSubCategories[subCategory.id] 
                          ? 'bg-gray-300 text-blue-900' 
                          : 'bg-gray-200 text-blue-900 hover:bg-gray-300'
                      }`}
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    >
                      <span className="tracking-wide">{subCategory.name}</span>
                      {expandedSubCategories[subCategory.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    
                    {expandedSubCategories[subCategory.id] && (
                      <div className="mt-2 space-y-2 ml-4">
                        {subCategory.products.map(product => (
                          <ProductItem key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="bg-gray-50 p-4 rounded-lg">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.toUpperCase())}
            placeholder="Note / altre referenze"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none uppercase text-blue-900 placeholder-gray-400"
            rows={3}
          />
        </div>

        <button 
          onClick={resetCart}
          className="w-full bg-gray-300 text-blue-900 py-3 rounded-lg font-medium hover:bg-gray-400"
        >
          Resetta
        </button>

        <div className="border-t border-blue-900 my-4"></div>

        <button 
          onClick={() => setShowMessageModal(true)}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
        >
          Messaggia con noi
        </button>
      </div>

      {getCartItemsCount() > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <button 
            onClick={() => setShowCart(true)}
            className="bg-blue-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-800"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Carrello ({getCartItemsCount()})</span>
          </button>
        </div>
      )}

      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invia un messaggio</h3>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Il tuo messaggio
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Scrivi qui il tuo messaggio, richiesta o domanda..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none text-blue-900"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  const orderDate = new Date().toLocaleDateString('it-IT');
                  const message = `💬 *MESSAGGIO MyDivinos*\n\n` +
                                 `👤 *CLIENTE:* ${user.nome_locale}\n` +
                                 `📞 *TELEFONO:* ${user.telefono}\n` +
                                 `📅 *DATA:* ${orderDate}\n\n` +
                                 `💬 *MESSAGGIO:*\n${messageText}\n\n` +
                                 `Cordiali saluti 🙏`;
                  
                  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '393356222225';
                  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                  setShowMessageModal(false);
                  setMessageText('');
                }}
                disabled={!messageText.trim()}
                className="flex-1 bg-blue-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Invia
              </button>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageText('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDivinos;.products.map((item, index) => (
                <div key={index} className="flex justify-between py-2">
                  <span className="text-blue-900">{item.name}</span>
                  <span className="text-blue-900 font-medium">×{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedHistoryOrder
