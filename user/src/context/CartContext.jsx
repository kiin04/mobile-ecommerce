import { createContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const updateCartItems = (items) => {
        setCartItems(items);
        localStorage.setItem("localCart", JSON.stringify(items));
    };

    return (
        <CartContext.Provider value={{ cartItems, setCartItems: updateCartItems }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;