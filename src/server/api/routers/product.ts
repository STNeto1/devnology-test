import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const brazilianProduct = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string(),
  categoria: z.string(),
  imagem: z.string(),
  preco: z.coerce.number(),
  material: z.string(),
  departamento: z.string(),
});

const brazilianSchema = z.array(brazilianProduct);

const europeanProduct = z.object({
  id: z.string(),
  name: z.string(),
  hasDiscount: z.boolean(),
  gallery: z.array(z.string()),
  description: z.string(),
  price: z.coerce.number(),
  discountValue: z.coerce.number(),
  details: z.object({
    adjective: z.string(),
    material: z.string(),
  }),
});
const europeanSchema = z.array(europeanProduct);

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

const fetchFromEuropeanProvider = async (
  props: z.infer<typeof searchSchema>
) => {
  const url = new URL(
    "http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/european_provider"
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
  const parsedData = europeanSchema.safeParse(json);

  if (!parsedData.success) {
    console.log(parsedData.error.issues);
    return [];
  }

  return parsedData.data;
};

type SearchProduct = {
  id: string;
  origin: "brazil" | "europe";
  name: string;
  description: string;
  price: number;
  discount_price: number;
  discount: boolean;
  thumbnail: string;
};

const mergeProducts = (
  brazilian: z.infer<typeof brazilianSchema>,
  european: z.infer<typeof europeanSchema>
) => {
  const result: Array<SearchProduct> = [];

  for (const elem of brazilian) {
    result.push({
      id: elem.id,
      origin: "brazil",
      name: elem.nome,
      description: elem.descricao,
      price: elem.preco,
      discount_price: 0,
      discount: false,
      thumbnail: elem.imagem,
    });
  }

  for (const elem of european) {
    result.push({
      id: elem.id,
      origin: "europe",
      name: elem.name,
      description: elem.description,
      price: elem.price,
      discount_price: elem.discountValue,
      discount: elem.hasDiscount,
      thumbnail: elem.gallery.at(0) ?? "",
    });
  }

  return result;
};

export type ShowProduct = {
  id: string;
  origin: "brazil" | "europe";
  name: string;
  description: string;
  price: number;
  discount_price: number;
  discount: boolean;
  gallery: string[];
  category: string | null;
  details: Record<string, string>;
};

export const fetchBrazilianProduct = async (
  id: string
): Promise<ShowProduct | null> => {
  const url = new URL(
    `https://616d6bdb6dacbb001794ca17.mockapi.io/devnology/brazilian_provider/${id}`
  );

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await response.json();
  const parsedData = brazilianProduct.safeParse(json);

  if (!parsedData.success) {
    console.log(parsedData.error.issues);
    return null;
  }

  return {
    id: parsedData.data.id,
    category: parsedData.data.categoria,
    description: parsedData.data.descricao,
    discount: false,
    discount_price: 0,
    gallery: [
      parsedData.data.imagem,
      parsedData.data.imagem,
      parsedData.data.imagem,
      parsedData.data.imagem,
    ],
    name: parsedData.data.nome,
    origin: "brazil",
    price: parsedData.data.preco,
    details: {
      Material: parsedData.data.material,
      Departamento: parsedData.data.departamento,
    },
  };
};

export const fetchEuropeanProduct = async (
  id: string
): Promise<ShowProduct | null> => {
  const url = new URL(
    `https://616d6bdb6dacbb001794ca17.mockapi.io/devnology/european_provider/${id}`
  );

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await response.json();
  const parsedData = europeanProduct.safeParse(json);

  if (!parsedData.success) {
    console.log(parsedData.error.issues);
    return null;
  }

  return {
    id: parsedData.data.id,
    category: "",
    description: parsedData.data.description,
    discount: parsedData.data.hasDiscount,
    discount_price: parsedData.data.discountValue,
    gallery: parsedData.data.gallery,
    name: parsedData.data.name,
    origin: "europe",
    price: parsedData.data.price,
    details: {
      Adjective: parsedData.data.details.adjective,
      Material: parsedData.data.details.material,
    },
  };
};

export const productRouter = createTRPCRouter({
  search: publicProcedure.input(searchSchema).query(async ({ input }) => {
    const [brazilianProducts, europeanProducts] = await Promise.all([
      fetchFromBrazilianProvider({
        limit: input.limit / 2,
        page: input.page,
        term: input.term,
      }),
      fetchFromEuropeanProvider({
        limit: input.limit / 2,
        page: input.page,
        term: input.term,
      }),
    ]);

    return mergeProducts(brazilianProducts, europeanProducts);
  }),
  brazilianProduct: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const product = await fetchBrazilianProduct(input);
      if (!product) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Produto não encontrado",
        });
      }

      return product;
    }),
  europeanProduct: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const product = await fetchEuropeanProduct(input);
      if (!product) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Produto não encontrado",
        });
      }

      return product;
    }),
  fetchMany: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ input }) => {
      const brazilianProducts = input
        .filter((elem) => elem.startsWith("brazil"))
        .map((elem) => elem.split("_")[1] as string);

      const europeanProducts = input
        .filter((elem) => elem.startsWith("europe"))
        .map((elem) => elem.split("_")[1] as string);

      const _brazilianProducts = await Promise.all(
        brazilianProducts.map((id) => fetchBrazilianProduct(id))
      );
      const _europeanProducts = await Promise.all(
        europeanProducts.map((id) => fetchEuropeanProduct(id))
      );

      return [..._brazilianProducts, ..._europeanProducts].filter((elem) =>
        Boolean(elem)
      ) as ShowProduct[];
    }),
});
