//variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');


//cart
let cart = [];

//buttons
let buttonsDOM = [];

//getting the products
class Products {
    async getProducts() {
        try {
            let results = await fetch("products.json");
            let data = await results.json();
            
            let products = data.items;

            //use map method to get the attributes from the items array
            products = products.map(item => {
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image};
            })
            return products;

        } catch (error) {
            console.log(error);
        }
    }
}

//display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src=${product.image} alt="product" class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>${product.price}</h4>
            </article>`;
        });
        productsDOM.innerHTML = result;
    }

    getBagButtons() {
        //we use the spread operator to convert the list into an array
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        //looping through the buttons array to get the id attribute
        buttons.forEach(button => {
            let id = button.dataset.id;
            //checking if the item already exists in the cart
            let inCart = cart.find(item => item.id === id);
            //do something if it exists
            if(inCart) {
                button.disabled = true;
            }
            //if not: do this
            button.addEventListener('click', (event) => {
                event.target.disabled = true;

                //get the product from local storage products using the id
                let cartItem = {...Storage.getProduct(id), amount:1};

                //add product to the cart
                cart = [...cart, cartItem];
                
                //save the cart in the local storage
                Storage.saveCart(cart);

                //set cart values
                this.setCartValues(cart);

                //add cart items to the DOM
                this.addCartItem(cartItem);

            });  
        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        // we use the .map() method to iterate through each item in the cart to calculate tempTotal and itemsTotal
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div =  document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = 
        `
            <img src=${item.image} alt="product">
            <div>
                <h4>${item.title}</h4>
                <h5>${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
        `;
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }

    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    //for each item in the local storage cart, add the same item to the DOM cart
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }

    cartLogic() {
        //clear cart
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        //cart functionality
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }

        });
    }

    clearCart() {
        // get the id of all the products currently in the cart
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
        Storage.saveCart(cart);
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage,saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
    }
     
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id == id);
    }

}




//local storage
class Storage {
    //save the product in the local storage
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    
    //get the products from the local storage
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    //save the cart in the local storage
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    //get the cart values from the local storage
    static getCart(cart) {
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')): [];
    }
}


//set the functionalities when the contents are loaded
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    //setup applicatiom
    ui.setupApp();

    //get all products
    products.getProducts().then(products => {
        //display products in the DOM
        ui.displayProducts(products);
        //save the products in the local storage
        //we don't need to create an object of the storage class to use the method, as the method is defined static
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    })
})
