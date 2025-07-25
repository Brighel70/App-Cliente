// PAGINA DETTAGLIO ORDINE - SEZIONE CORRETTA
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
