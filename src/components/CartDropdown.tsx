import { Dialog, Transition } from "@headlessui/react";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useState, type FC } from "react";
import { Loading } from "~/components/Loading";
import { useCartStore, type SimpleCartItem } from "~/lib/cart";
import { api, type RouterOutputs } from "~/utils/api";
import { intlCurrency } from "~/utils/intl";

export const calculateSubtotal = (
  data: SimpleCartItem[],
  external: RouterOutputs["product"]["fetchMany"]
) => {
  let total = 0;

  external.forEach((elem) => {
    const cartElem = data.find(
      (cElem) => cElem._ref === [elem.origin, elem.id].join("_")
    );
    if (!cartElem) {
      return;
    }

    const price = elem.discount ? elem.discount_price : elem.price;

    total += price * cartElem.quantity;
  });

  return total;
};

export const CartDropdown: FC = () => {
  const [open, setOpen] = useState(false);
  const { isReady } = useRouter();

  const items = useCartStore((state) => state.getItems());
  const cartSize = useCartStore((state) => state.size());
  const removeItem = useCartStore((state) => state.remove);

  const fetchCartProducts = api.product.fetchMany.useQuery(
    items.map((p) => p._ref)
  );

  return (
    <>
      <button
        type="button"
        className="flex gap-2 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="sr-only">View notifications</span>
        <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
        <span className="">{isReady ? cartSize : 0}</span>
      </button>

      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 overflow-hidden"
          onClose={setOpen}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Carrinho
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {fetchCartProducts.isLoading && (
                        <section className="pt-4">
                          <Loading />
                        </section>
                      )}

                      {!!fetchCartProducts.data && (
                        <div className="mt-8">
                          <div className="flow-root">
                            <ul
                              role="list"
                              className="-my-6 divide-y divide-gray-200"
                            >
                              {fetchCartProducts.data.map((product) => (
                                <li
                                  key={[product.id, product.origin].join("_")}
                                  className="flex py-6"
                                >
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      src={product.gallery.at(0) ?? ""}
                                      alt={product.name}
                                      className="h-full w-full object-cover object-center"
                                      width={96}
                                      height={96}
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>
                                          {product.name}
                                          {/* <a href={product.href}>{product.name}</a> */}
                                        </h3>
                                        <p className="ml-4">
                                          {intlCurrency(
                                            product.discount
                                              ? product.discount_price
                                              : product.price
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <p className="text-gray-500">
                                        Qty
                                        {
                                          items.find(
                                            (elem) =>
                                              elem.id === product.id &&
                                              elem.origin === product.origin
                                          )?.quantity
                                        }
                                      </p>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          className="font-medium text-gray-600 hover:text-gray-500"
                                          onClick={() =>
                                            removeItem(
                                              items.find(
                                                (elem) =>
                                                  elem.id === product.id &&
                                                  elem.origin === product.origin
                                              )?._ref ?? ""
                                            )
                                          }
                                        >
                                          Remover
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>
                          {intlCurrency(
                            calculateSubtotal(
                              items,
                              fetchCartProducts.data ?? []
                            )
                          )}
                        </p>
                      </div>

                      <div className="mt-6">
                        <Link
                          href="/checkout"
                          className="flex items-center justify-center rounded-md border border-transparent bg-gray-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-700"
                        >
                          Checkout
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
