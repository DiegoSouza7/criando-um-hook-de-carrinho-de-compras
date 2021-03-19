import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productData = await (await api.get(`products/${productId}`)).data
      const productDataStock = await (await api.get(`stock/${productId}`)).data

      if( cart.filter(product => product.id ===  productId).length === 0 ) {
        setCart([...cart, { ...productData, amount: 1 }]);

        localStorage.setItem('@RocketShoes:cart', JSON.stringify([
          ...cart, { ...productData, amount: 1 }
        ]))
      } else if( cart.filter(product => product.id ===  productId).length !== 0 ) {
        const [product] = cart.filter(product => product.id ===  productId)
        
        if(product.amount < productDataStock.amount) {
          product.amount ++
          const cardFilred = cart.filter(product => product.id !==  productId)
          setCart([...cardFilred, { ...product }]);

          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      }      
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
