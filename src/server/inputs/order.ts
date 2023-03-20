import { z } from "zod";

export const createOrderSchema = z.object({
  cardName: z.string(),
  cardNumber: z.string(),
  cardExpiration: z.string(),
  cardCvc: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  items: z.array(
    z.object({
      ref: z.string(),
      quantity: z.number().positive(),
    })
  ),
});
