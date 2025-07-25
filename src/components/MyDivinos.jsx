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
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // NAVIGAZIONE PULITA CON STATO UNICO
  const [currentPage, setCurrentPage] = useState('homepage');
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);
  
  const hamburgerRef = useRef(null);

  // DATI MOCK DI FALLBACK (se Supabase non funziona)
  const mockUser = { 
    id: '1', 
    nome_locale: 'Andrea Bulgari', 
    telefono: '+393356222225' 
  };

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
    }
  ];

  // Carica dati iniziali
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Prova a caricare da Supabase, fallback su dati mock
      try {
        console.log('🔍 Tentativo connessione Supabase...');
        
        // Cerca utente Andrea Bulgari
        const userData = await supabaseApi.getUserByPhone('+393356222225');
        
        if (userData) {
          console.log('✅ Utente trovato in Supabase:', userData.nome_locale);
          setUser(userData);
          
          // Carica prodotti per l'utente
          const productsData = await supabaseApi.getProductsForUser(userData.id);
          console.log('📦 Prodotti caricati:', productsData.length);
          
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
          
          console.log('✅ Dati Supabase caricati con successo');
          
        } else {
          throw new Error('Utente non trovato in Supabase');
        }
        
      } catch (supabaseError) {
        console.warn('⚠️  Supabase non disponibile, uso dati mock:', supabaseError.message);
        
        // Fallback su dati mock
        setUser(mockUser);
        setMacroCategories(mockMacroCategories);
        setPastOrders(mockPastOrders);
        setFavorites(new Set(['BR001', 'AD001']));
      }
      
    } catch (error) {
      console.error('❌ Errore inizializzazione app:', error);
      
      // Fallback finale su dati mock
      setUser(mockUser);
      setMacroCategories(mockMacroCategories);
      setPastOrders(mockPastOrders);
      setFavorites(new Set(['BR001', 'AD001']));
      
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
      // Prova prima con Supabase
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
      console.warn('⚠️  Fallback locale per preferiti:', error.message);
      
      // Fallback locale se Supabase non funziona
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(productId)) {
          newFavorites.delete(productId);
        } else {
          newFavorites.add(productId);
        }
        return newFavorites;
      });
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

  // FUNZIONE PRINCIPALE: SALVA ORDINE IN SUPABASE
  const saveOrder = async () => {
    if (!user || Object.keys(cart).length === 0) return;
    
    try {
      setLoading(true);
      
      // Prova a salvare in Supabase
      try {
        await supabaseApi.saveOrder(user.id, cart, notes);
        console.log('✅ Ordine salvato in Supabase');
        
        // Mostra messaggio di successo
        setOrderSuccess(true);
        
        // Reset carrello dopo 2 secondi
        setTimeout(() => {
          setCart({});
          setNotes('');
          setShowCart(false);
          setOrderSuccess(false);
          // Ricarica storico ordini
          initializeApp();
        }, 2000);
        
      } catch (supabaseError) {
        console.warn('⚠️  Fallback locale per salvataggio ordine:', supabaseError.message);
        
        // Fallback: simula salvataggio locale
        alert('Ordine salvato localmente!\n(Supabase non disponibile, ordine in cache locale)');
        
        // Reset carrello
        setCart({});
        setNotes('');
        setShowCart(false);
      }
      
    } catch (error) {
      console.error('❌ Errore salvataggio ordine:', error);
      alert('Errore durante il salvataggio dell\'ordine. Riprova.');
    } finally {
      setLoading(false);
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
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          </div>
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
          <p className="text-red-600 mb-4">Errore di caricamento</p>
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
