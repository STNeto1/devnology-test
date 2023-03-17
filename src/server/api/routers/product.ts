import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const brazilianSchema = z.array(
  z.object({
    id: z.string(),
    nome: z.string(),
    descricao: z.string(),
    categoria: z.string(),
    imagem: z.string(),
    preco: z.coerce.number(),
    material: z.string(),
    departamento: z.string(),
  })
);

const searchSchema = z.object({
  term: z.string(),
  page: z.number().positive(),
  limit: z.number().positive(),
});

const fetchFromBrazilianProvider = async (
  props: z.infer<typeof searchSchema>
) => {
  const url = new URL(
    "https://616d6bdb6dacbb001794ca17.mockapi.io/devnology/brazilian_provider"
  );
  url.searchParams.append("search", props.term);
  url.searchParams.append("page", props.page.toString());
  url.searchParams.append("limit", props.limit.toString());

  // url.searchParams.append

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await response.json();
  const parsedData = brazilianSchema.safeParse(json);

  if (!parsedData.success) {
    console.log(parsedData.error.issues);
    return [];
  }

  return parsedData.data;
};

export const productRouter = createTRPCRouter({
  search: publicProcedure.input(searchSchema).query(async ({ input }) => {
    const brazilianProducts = await fetchFromBrazilianProvider(input);

    return {
      products: brazilianProducts,
    };
  }),
});
