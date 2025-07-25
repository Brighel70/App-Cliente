import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronDown, ChevronRight, X, ShoppingCart, RotateCcw, Menu } from 'lucide-react';

const MyDivinos = () => {
  // UTENTE HARDCODED - ACCESSO DIRETTO SENZA LOGIN
  const [user] = useState({ 
    id: '1', 
    nome_locale: 'Andrea Bulgari', 
    telefono: '+393356222225' 
  });
  
  const [loading, setLoading] = useState(true);
  const [macroCategories, setMacroCategories] = useState([]);
  const [expandedMacroCategories, setExpandedMacroCategories] = useState({});
  const [expandedSubCategories, setExpandedSubCategories] = useState({});
  const [favorites, setFavorites] = useState(new Set(['BR001', 'AD001']));
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

  // DATI MOCK - SOSTITUIRANNO SUPABASE IN QUESTA FASE
  const mockMacroCategories = [
    { 
      id: 'vino', 
      name: 'VINO', 
      icon: '🍷',
      subcategories: [
        { id: 'vino-rosso', name: 'Vino Rosso', products: [
          { id: 'BR001', name: 'Barbaresco Ceretto', description: 'Vino elegante e profondo, con note di ciliegia, viola e spezie fini.', price: 45.00, code: 'BR001', subcategory: 'Nebbiolo' },
          { id: 'AD001', name: 'AD 1212', description: 'Rosso intenso e speziato, con note di frutta matura e tannini morbidi.', price: 32.00, code: 'AD001', subcategory: 'Barbera' }
        ]},
        { id: 'vino-bianco', name: 'Vino Bianco', products: [
          { id: 'VB001', name: 'Chardonnay Riserva', description: 'Bianco strutturato e minerale, note di frutta tropicale.', price: 28.00, code: 'VB001', subcategory: 'Chardonnay' }
        ]},
        { id: 'champagne', name: 'Champagne', products: [
          { id: 'BS001', name: 'Billecart - Salmon Brut', description: 'Champagne fine e vivace, con bollicina elegante, note di agrumi e pane tostato.', price: 55.00, code: 'BS001', subcategory: 'Brut' },
          { id: 'PR001', name: 'Pol Roger', description: 'Champagne strutturato e raffinato, con sentori di mela, brioche e fiori bianchi.', price: 48.00, code: 'PR001', subcategory: 'Brut' }
        ]}
      ]
    },
    {
      id: 'distillati',
      name: 'DISTILLATI',
      icon: '🥃',
      subcategories: [
        { id: 'vodka', name: 'Vodka', products: [
          { id: 'VD001', name: 'Grey Goose', description: 'Vodka premium francese, purezza cristallina.', price: 35.00, code: 'VD001', subcategory: 'Premium' }
        ]},
        { id: 'gin', name: 'Gin', products: [
          { id: 'PG001', name: 'Portofino Gin', description: 'Gin premium italiano con botaniche mediterranee, fresco e aromatico.', price: 38.00, code: 'PG001', subcategory: 'Premium' },
          { id: 'HG001', name: 'Hendricks', description: 'Gin scozzese distintivo con cetriolo e rosa, dal sapore unico e raffinato.', price: 42.00, code: 'HG001', subcategory: 'Premium' }
        ]},
        { id: 'whisky', name: 'Whisky', products: [
          { id: 'WH001', name: 'Macallan 12', description: 'Whisky scozzese single malt invecchiato 12 anni, note di miele e spezie.', price: 85.00, code: 'WH001', subcategory: 'Single Malt' }
        ]}
      ]
    },
    {
      id: 'analcolici',
      name: 'ANALCOLICI',
      icon: '🥤',
      subcategories: [
        { id: 'tonica', name: 'Tonica', products: [
          { id: 'FT001', name: 'Fever Tree Tonic Water', description: 'Acqua tonica premium con chinino naturale, perfetta per gin tonic.', price: 24.00, code: 'FT001', subcategory: 'Tonica' },
          { id: 'SW001', name: 'Schweppes Tonic', description: 'Tonica classica con bollicine fini e gusto bilanciato.', price: 18.00, code: 'SW001', subcategory: 'Tonica' }
        ]},
        { id: 'sciroppi', name: 'Sciroppo Monin', products: [
          { id: 'SM001', name: 'Scir. Sambuco Monin', description: 'Sciroppo di sambuco premium per cocktail, dal sapore floreale e delicato.', price: 12.00, code: 'SM001', subcategory: 'Sciroppo' },
          { id: 'SM002', name: 'Scir. Vaniglia Monin', description: 'Sciroppo di vaniglia Madagascar, aroma intenso e naturale.', price: 12.50, code: 'SM002', subcategory: 'Sciroppo' }
        ]}
      ]
    },
    {
      id: 'alimentare',
      name: 'ALIMENTARE',
      icon: '🧀',
      subcategories: [
        { id: 'conserve', name: 'Conserve', products: [
          { id: 'AC001', name: 'Acciughe del Cantabrico', description: 'Acciughe pregiate salate a mano, dal sapore intenso e delicato.', price: 22.00, code: 'AC001', subcategory: 'Conserve' }
        ]},
        { id: 'formaggi', name: 'Formaggi', products: [
          { id: 'FO001', name: 'Gorgonzola DOP', description: 'Formaggio cremoso delle valli bergamasche, stagionato 60 giorni.', price: 18.00, code: 'FO001', subcategory: 'Erborinati' }
        ]}
      ]
    }
  ];

  const mockPastOrders = [
    {
      id: '1',
      date: '18/07/2025',
      products: [
        { name: 'Pol Roger', quantity: 6, id: 'PR001' },
        { name: 'Portofino Gin', quantity: 3, id: 'PG001' },
        { name: 'Fever Tree Tonic Water', quantity: 2, id: 'FT001' }
      ],
      notes: 'URGENTE PER EVENTO DOMANI',
      stato: 'in_gestione'
    },
    {
      id: '2', 
      date: '15/07/2025',
      products: [
        { name: 'Barbaresco Ceretto', quantity: 12, id: 'BR001' },
        { name: 'Chardonnay Riserva', quantity: 6, id: 'VB001' }
      ],
      notes: 'CONSEGNA RISTORANTE',
      stato: 'consegnato'
    },
    {
      id: '3',
      date: '10/07/2025', 
      products: [
        { name: 'Hendricks', quantity: 4, id: 'HG001' },
        { name: 'Grey Goose', quantity: 2, id: 'VD001' },
        { name: 'Scir. Sambuco Monin', quantity: 8, id: 'SM001' }
      ],
      notes: 'COCKTAIL BAR SETUP',
      stato: 'in_spedizione'
    },
    {
      id: '4',
      date: '05/07/2025',
      products: [
        { name: 'Billecart - Salmon Brut', quantity: 24, id: 'BS001' }
      ],
      notes: 'MATRIMONIO VILLA',
      stato: 'in_attesa'
    }
  ];

  // Carica dati mock (simula caricamento)
  useEffect(() => {
    const loadMockData = () => {
      setLoading(true);
      // Simula chiamata API
      setTimeout(() => {
        setMacroCategories(mockMacroCategories);
        setPastOrders(mockPastOrders);
        setLoading(false);
      }, 1000);
    };
    
    loadMockData();
  }, []);

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

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
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
        // Per ora mostra alert - in futuro aprirà PDF
        alert('Catalogo Vini - PDF non ancora caricato');
        break;
      case 'distillati':
        // Per ora mostra alert - in futuro aprirà PDF
        alert('Catalogo Distillati - PDF non ancora caricato');
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

  // FUNZIONE MOCK: SALVA ORDINE (per ora solo messaggio)
  const saveOrder = () => {
    if (Object.keys(cart).length === 0) return;
    
    alert('Ordine salvato con successo!\n(In questa fase mock, l\'ordine non viene effettivamente salvato)');
    
    // Reset carrello
    setCart({});
    setNotes('');
    setShowCart(false);
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
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.stato === 'in_attesa' ? 'bg-orange-100 text-orange-800' :
                        order.stato === 'in_gestione' ? 'bg-blue-100 text-blue-800' :
                        order.stato === 'in_spedizione' ? 'bg-purple-100 text-purple-800' :
                        order.stato === 'consegnato' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.stato?.replace('_', ' ') || 'in attesa'}
                      </span>
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
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-blue-900">Prodotti Ordinati</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${
                selectedHistoryOrder.stato === 'in_attesa' ? 'bg-orange-100 text-orange-800' :
                selectedHistoryOrder.stato === 'in_gestione' ? 'bg-blue-100 text-blue-800' :
                selectedHistoryOrder.stato === 'in_spedizione' ? 'bg-purple-100 text-purple-800' :
                selectedHistoryOrder.stato === 'consegnato' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedHistoryOrder.stato?.replace('_', ' ') || 'in attesa'}
              </span>
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
                onClick={saveOrder}
                className="w-full bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800"
              >
                Conferma Ordine
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
                  
                  const whatsappNumber = '393356222225';
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

export default MyDivinos;
