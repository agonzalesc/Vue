let app = Vue.createApp({
    data() {
      return {
        // En false por defecto para que no aparezca siempre el sidebar
        showSidebar:false,
        // Seguimiento del inventario, lo establecemos como una matriz vacía 
        inventory: [],
        // Almacenar que alimentos hay en el carrito de compra
        // Eliminando los datos fictios del carrito
        cart: {}
      }
    }, 
    
    // Para que el numero que acompaña a cart en la interfaz de home,cambie de acuerdo a los alimentos que se agregan al carro
    computed: {
      totalQuantity() {
        return Object.values(this.cart).reduce((acc, curr) => {
          return acc + curr
        }, 0)
      }
    },

    methods: { 
      // Metodo para agregar la cantidad de alimentos al carrito, se deben tener en cuenta las cantidades
      // Recibe tipo de alimento y cantidad de este
      // Se está generalizando para que recorra el inventario y funcione con todos los alimentos
      addToCart(name, index) {
        if (!this.cart[name]) this.cart[name] = 0
        this.cart[name] += this.inventory[index].quantity
        this.inventory[index].quantity = 0
        
      },
      // Método que funciona como interruptor para alternar la barra lateral 
      toggleSidebar(){
        this.showSidebar = !this.showSidebar
      },
      // Método para hacer que la equis de los alimentos en el carrito funcione
      removeItem(name){
        delete this.cart[name]
      }
  },
  async mounted(){
    // Buscando el archivo de food.json, datos que son la matriz de todos los objetos de comida
    const res = await fetch('./food.json')
    const data = await res.json()
    this.inventory = data
  }
})


  // Creando el componente para la barra lateral de carrito de compras
  app.component('sidebar', {
    // Apoyo para el la alternancia del sidebar //Tener acceso al carrito de cada alimento
    props: ['toggle','cart', 'inventory', 'remove'],
  
    methods:{
      // Acceder al inventario para encontrar los precios de cada alimento
      getPrice(name) {
        const product = this.inventory.find((p) => {
          return p.name === name
        })
        return product.price.USD
      },
      // Calcular el valor total de los productos en el carrito, clave y valor cada que se recorre
      calculateTotal() {
        const total = Object.entries(this.cart).reduce((acc, curr, index) => {
          return acc + (curr[1] * this.getPrice(curr[0]))
        }, 0)
        return total.toFixed(2)
      }
    },

    template: `
        <aside class="cart-container">
        <div class="cart">
          <h1 class="cart-title spread">
            <span>
              Cart
              <i class="icofont-cart-alt icofont-1x"></i>
            </span>
            <button @click="toggle"class="cart-close">&times;</button>
          </h1>

          <div class="cart-body">
            <table class="cart-table">
              <thead>
                <tr>
                  <th><span class="sr-only">Product Image</span></th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(quantity, key, i) in cart" :key="i">
                  <td><i class="icofont-carrot icofont-3x"></i></td>
                  <td>{{ key }}</td>

                  <td>\${{ getPrice(key) }}</td>
                  
                  <td class="center">{{ quantity }}</td>

                  <td> \${{quantity * getPrice(key)}}</td>
                  <td class="center">

                    <button @click="remove(key)" class="btn btn-light cart-remove">
                      &times;
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <p class="center" v-if="!Object.keys(cart).length"><em>No items in cart</em></p>
            <div class="spread">
              <span><strong>Total:</strong> \${{calculateTotal ()}} </span>
              <button class="btn btn-light">Checkout</button>
            </div>
          </div>
        </div>
      </aside>
    `
  }),


  app.mount('#app')