import { RowDataPacket } from 'mysql2';

export interface Category extends RowDataPacket {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
}

export interface Product extends RowDataPacket {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    category_id: number | null;
    image_url: string;
    is_featured: boolean;
    created_at: Date;
}

export interface Order extends RowDataPacket {
    id: number;
    code: string;
    total: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'cancelled';
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    created_at: Date;
}

export interface OrderItem extends RowDataPacket {
    id: number;
    order_id: number;
    product_id: number | null;
    title_snapshot: string;
    price: number;
    qty: number;
}
