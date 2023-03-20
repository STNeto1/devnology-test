import { TRPCError } from "@trpc/server";
import {
  fetchBrazilianProduct,
  fetchEuropeanProduct,
  type ShowProduct,
} from "~/server/api/routers/product";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createOrderSchema } from "~/server/inputs/order";

export const orderRouter = createTRPCRouter({
  createOrder: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const brazilianProducts = input.items
          .filter((elem) => elem.ref.startsWith("brazil"))
          .map((elem) => elem.ref.split("_")[1] as string);

        const europeanProducts = input.items
          .filter((elem) => elem.ref.startsWith("europe"))
          .map((elem) => elem.ref.split("_")[1] as string);

        const _brazilianProducts = await Promise.all(
          brazilianProducts.map((id) => fetchBrazilianProduct(id))
        );
        const _europeanProducts = await Promise.all(
          europeanProducts.map((id) => fetchEuropeanProduct(id))
        );

        const result = [..._brazilianProducts, ..._europeanProducts].filter(
          (elem) => Boolean(elem)
        ) as ShowProduct[];

        const total = result.reduce((acc, curr) => {
          const inputElem = input.items.find(
            (i) => i.ref === [curr.origin, curr.id].join("_")
          );
          if (!inputElem) {
            return acc;
          }

          const price = curr.discount ? curr.discount_price : curr.price;

          return acc + inputElem.quantity * price;
        }, 0);

        const newOrder = await ctx.prisma.order.create({
          data: {
            cardName: input.cardName,
            cardNumber: input.cardNumber,
            cardExpiration: input.cardExpiration,
            cardCvc: input.cardCvc,
            address: input.address,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            userId: ctx.auth.userId,
            total,
            items: {
              create: result.map((item) => {
                const itemRef = [item.origin, item.id].join("_");

                const price = item.discount ? item.discount_price : item.price;
                const inputElem = input.items.find((i) => i.ref === itemRef);

                return {
                  origin: item.origin,
                  unitPrice: price,
                  ref: itemRef,
                  quantity: inputElem?.quantity ?? 1,
                };
              }),
            },
          },
        });

        console.log({ newOrder });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "",
        });
      }
    }),
});
