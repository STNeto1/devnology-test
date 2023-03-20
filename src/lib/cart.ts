import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type SimpleCartItem = {
  id: string;
  origin: "brazil" | "europe";
  quantity: number;
};

interface ICartStore {
  products: Array<SimpleCartItem>;

  size: () => number;
  add: (item: Omit<SimpleCartItem, "quantity">) => void;
  inStore: (item: Omit<SimpleCartItem, "quantity">) => boolean;
}

export const useCartStore = create<ICartStore>()(
  devtools(
    persist(
      (set, get) => ({
        products: [],
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
                id: item.id,
                origin: item.origin,
                quantity: 1,
              },
            ],
          }));
        },
      }),
      {
        name: "cart-store",
      }
    )
  )
);
