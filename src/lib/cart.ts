import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type SimpleCartItem = {
  _ref: string;
  id: string;
  origin: "brazil" | "europe";
  quantity: number;
};

interface ICartStore {
  products: Array<SimpleCartItem>;

  size: () => number;
  add: (item: Omit<SimpleCartItem, "quantity" | "_ref">) => void;
  inStore: (item: Omit<SimpleCartItem, "quantity" | "_ref">) => boolean;
  getItems: () => Array<SimpleCartItem>;
  remove: (_ref: string) => void;
}

export const useCartStore = create<ICartStore>()(
  devtools(
    persist(
      (set, get) => ({
        products: [],

        getItems: () => get().products,
        size: () => get().products.length,
        inStore: (item) =>
          get().products.some(
            (p) => p.id === item.id && p.origin === item.origin
          ),
        add: (item) => {
          const existing = get().products.some(
            (p) => p.id === item.id && p.origin === item.origin
          );

          if (existing) {
            set((state) => ({
              ...state,
              products: state.products.map((p) => ({
                ...p,
                quantity:
                  p.id === item.id && p.origin === item.origin
                    ? p.quantity + 1
                    : p.quantity,
              })),
            }));
            return;
          }

          set((state) => ({
            ...state,
            products: [
              ...state.products,
              {
                _ref: [item.origin, item.id].join("_"),
                id: item.id,
                origin: item.origin,
                quantity: 1,
              },
            ],
          }));
        },
        remove: (item) => {
          const items = get().products;

          set((state) => ({
            ...state,
            products: items.filter((p) => {
              return p._ref !== item;
            }),
          }));
        },
      }),
      {
        name: "cart-store",
      }
    )
  )
);
