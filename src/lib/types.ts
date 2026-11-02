export type Category={id:string;name:string;slug:string;sort_order:number};
export type Product={robot_part?:string|null;is_bestseller?:boolean;id:string;category_id:string|null;name:string;slug:string;description:string;specs:Record<string,string>;price:number;bulk_price:number|null;stock_qty:number;low_stock_threshold:number;is_available:boolean;is_featured:boolean;images:string[];created_at:string;updated_at:string};
export type QuoteItem={name:string;qty:number;price:number};
export type Quote={id:string;quote_no:string;customer_name:string;customer_phone:string;items:QuoteItem[];total:number;status:string;valid_until:string|null;created_at:string};
export type Message={id:string;name:string;phone:string;email:string;body:string;is_read:boolean;created_at:string};
export type Content=Record<string,Record<string,string>>;
