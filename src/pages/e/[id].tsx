import clsx from "clsx";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC } from "react";
import { Loading } from "~/components/Loading";
import { DefaultLayout } from "~/templates/Default";
import { api, RouterOutputs } from "~/utils/api";
import { intlCurrency } from "~/utils/intl";

const EuropeanProductPage: NextPage = () => {
  const { isReady, query } = useRouter();
  const showProduct = api.product.europeanProduct.useQuery(
    query["id"] as string,
    {
      enabled: isReady,
    }
  );

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <DefaultLayout>
        {showProduct.isLoading && (
          <section className="h-full w-full">
            <Loading />
          </section>
        )}

        {showProduct.data ? <ProductSection {...showProduct.data} /> : null}
      </DefaultLayout>
    </>
  );
};

const ProductSection: FC<RouterOutputs["product"]["europeanProduct"]> = (
  props
) => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white">
        <main className="mx-auto mt-8 max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-2">
          <div className="p-4 lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-5 lg:col-start-8">
              <div className="flex justify-between">
                <h1 className="text-xl font-medium text-gray-900">
                  {props.name}
                </h1>
                <p className="text-xl font-medium text-gray-900">
                  {intlCurrency(props.price ?? 0)}
                </p>
              </div>
            </div>

            {/* Image gallery */}
            <div className="lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 ">
              <h2 className="sr-only">Images</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8">
                {props.gallery.map((image, idx) => (
                  <Image
                    key={[idx, image].join("___")}
                    src={image}
                    alt={props.name}
                    width={idx === 0 ? 650 : 310}
                    height={idx === 0 ? 490 : 235}
                    className={clsx(
                      idx === 0
                        ? "lg:col-span-2 lg:row-span-2"
                        : "hidden lg:block",
                      "rounded-lg"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 lg:col-span-5">
              {/* Product details */}
              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900">
                  Description
                </h2>

                <div className="prose prose-sm mt-4 text-gray-500">
                  {props.description}
                </div>
              </div>

              {Object.entries(props.details ?? {}).map(([_key, value]) => (
                <div className="mt-10" key={[_key, value].join("__")}>
                  <h2 className="text-sm font-medium text-gray-900">{_key}</h2>

                  <div className="prose prose-sm mt-4 text-gray-500">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EuropeanProductPage;
