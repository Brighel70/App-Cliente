import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility functions per il database
export const supabaseApi = {
  // Ottieni utente per telefono
  async getUserByPhone(telefono) {
    const { data, error } = await supabase
      .from('utenti')
      .select('*')
      .eq('telefono', telefono)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error)
      return null
    }
    
    return data
  },

  // Ottieni prodotti per utente con categorie
  async getProductsForUser(userId) {
    const { data, error } = await supabase
      .from('prodotti_utente')
      .select(`
        prodotto_id,
        prodotti (
          id,
          codice,
          nome,
          descrizione,
          prezzo,
          dimensioni,
          sottocategoria,
          sub_categorie (
            id,
            nome,
            macro_categorie (
              id,
              nome,
              icona
            )
          )
        )
      `)
      .eq('utente_id', userId)
    
    if (error) {
      console.error('Error fetching products:', error)
      return []
    }
    
    return data
  },

  // Ottieni preferiti utente
  async getFavorites(userId) {
    const { data, error } = await supabase
      .from('preferiti')
      .select('prodotto_id')
      .eq('utente_id', userId)
    
    if (error) {
      console.error('Error fetching favorites:', error)
      return []
    }
    
    return data.map(item => item.prodotto_id)
  },

  // Aggiungi/rimuovi preferito
  async toggleFavorite(userId, productId) {
    // Prima controlla se esiste
    const { data: existing } = await supabase
      .from('preferiti')
      .select('id')
      .eq('utente_id', userId)
      .eq('prodotto_id', productId)
      .single()
    
    if (existing) {
      // Rimuovi
      const { error } = await supabase
        .from('preferiti')
        .delete()
        .eq('utente_id', userId)
        .eq('prodotto_id', productId)
      
      if (error) console.error('Error removing favorite:', error)
      return false
    } else {
      // Aggiungi
      const { error } = await supabase
        .from('preferiti')
        .insert([{ utente_id: userId, prodotto_id: productId }])
      
      if (error) console.error('Error adding favorite:', error)
      return true
    }
  },

  // Ottieni storico ordini
  async getOrderHistory(userId) {
    const { data, error } = await supabase
      .from('ordini')
      .select(`
        id,
        data_ordine,
        note,
        stato,
        ordini_prodotti (
          quantita,
          prodotti (
            id,
            codice,
            nome
          )
        )
      `)
      .eq('utente_id', userId)
      .order('data_ordine', { ascending: false })
    
    if (error) {
      console.error('Error fetching order history:', error)
      return []
    }
    
    return data
  },

  // Salva nuovo ordine
  async saveOrder(userId, cartItems, notes) {
    try {
      // Crea l'ordine
      const { data: order, error: orderError } = await supabase
        .from('ordini')
        .insert([{
          utente_id: userId,
          note: notes || '',
          stato: 'inviato'
        }])
        .select()
        .single()
      
      if (orderError) throw orderError
      
      // Aggiungi i prodotti dell'ordine
      const orderProducts = Object.entries(cartItems).map(([productId, quantity]) => ({
        ordine_id: order.id,
        prodotto_id: productId,
        quantita: quantity
      }))
      
      const { error: productsError } = await supabase
        .from('ordini_prodotti')
        .insert(orderProducts)
      
      if (productsError) throw productsError
      
      return order
    } catch (error) {
      console.error('Error saving order:', error)
      throw error
    }
  },

  // Aggiorna ultimo login utente
  async updateLastLogin(userId) {
    const { error } = await supabase
      .from('utenti')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
    
    if (error) console.error('Error updating last login:', error)
  }
}
