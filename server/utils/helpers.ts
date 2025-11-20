import { Product } from '../types';

export const calculateOrderTotal = (items: { price: number; qty: number }[]): number => {
    return items.reduce((total, item) => total + item.price * item.qty, 0);
};
