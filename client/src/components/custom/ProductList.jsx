import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '../ui/input';
import { addToCart } from '@/redux/slices/cartSlice';
import { AllCategory } from '@/redux/slices/categories/categoriesSlice';
import { fetchProducts } from '@/redux/slices/products/productSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Loader2 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const ProductCard = ({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAddingToCart,
  isInCart,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image || '/placeholder-product.jpg'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.currentTarget.src = '/placeholder-product.jpg')}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
        <div className="flex-grow" />
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex sm:flex-row items-center gap-2 justify-between mt-4">
            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium">Qty</p>
              <div className="flex border border-black rounded-full">
                <button
                  onClick={() =>
                    onQuantityChange(product._id, (parseInt(quantity) || 1) - 1, product.stock)
                  }
                  className="w-7 rounded-l-full h-7 flex items-center justify-center text-sm font-bold hover:bg-gray-200"
                  disabled={(parseInt(quantity) || 1) <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  max={product.stock}
                  value={quantity === '' ? '' : quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      onQuantityChange(product._id, '', product.stock);
                    } else {
                      const parsed = parseInt(val);
                      if (!isNaN(parsed)) {
                        onQuantityChange(product._id, parsed, product.stock);
                      }
                    }
                  }}
                  onFocus={(e) => e.target.select()} 
                  className="w-10 text-center focus:outline-none text-sm py-1"
                />

                <button
                  onClick={() =>
                    onQuantityChange(product._id, (parseInt(quantity) || 1) + 1, product.stock)
                  }
                  className="w-7 h-7 rounded-r-full flex items-center justify-center text-sm font-bold hover:bg-gray-200"
                  disabled={(parseInt(quantity) || 1) >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => onAddToCart(product)}
              disabled={isAddingToCart || (parseInt(quantity) || 0) <= 0}
              className={`text-sm cursor-pointer px-4 md:px-5 py-1.5 rounded-full transition-colors whitespace-nowrap w-full sm:w-auto ${isInCart
                  ? 'bg-green-600'
                  : isAddingToCart || (parseInt(quantity) || 0) <= 0
                    ? 'bg-red-700 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800'
                } text-white`}
            >
              {isInCart
                ? 'Added to Cart'
                : isAddingToCart
                  ? 'Adding...'
                  : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductList = () => {
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories } = useSelector((s) => s.categories);
  const { products, status } = useSelector((s) => s.products);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const combinedCategories = [
    {
      _id: 'all',
      name: 'All',
      image: 'https://cdn.pixabay.com/photo/2023/07/19/12/16/car-8136751_1280.jpg',
    },
    ...categories,
  ];
  const categoryChunks = chunkArray(combinedCategories, 8);

  useEffect(() => {
    dispatch(AllCategory());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ category, searchTerm }));
  }, [category, searchTerm, dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      const initialQuantities = {};
      products.forEach((product) => {
        initialQuantities[product._id] = product.stock > 0 ? 1 : 0;
      });
      setQuantities(initialQuantities);
    }
  }, [products]);

  const handleQuantityChange = (productId, value, stock) => {
    if (value === '') {
      setQuantities((prev) => ({ ...prev, [productId]: '' }));
      return;
    }

    let newValue = parseInt(value);
    if (isNaN(newValue)) newValue = 1;
    newValue = Math.max(Math.min(newValue, stock), 1);
    setQuantities((prev) => ({ ...prev, [productId]: newValue }));
  };

  const handleAddToCart = (product) => {
    if (!user) {
      toast.warning('You must login first');
      navigate('/login');
      return;
    }

    const qty = parseInt(quantities[product._id]);
    if (!qty || qty <= 0) {
      toast.warning('Please select at least 1 item');
      return;
    }

    setIsAddingToCart(true);

    dispatch(
      addToCart({
        _id: product._id,
        name: product.title,
        price: product.price,
        stock: product.stock,
        quantity: qty,
        image: product.image,
      })
    );

    setIsAddingToCart(false);
    toast.success('Product added to cart');
    setQuantities((prev) => ({ ...prev, [product._id]: 1 }));
  };

  const loadingProducts = status === 'loading';

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-4 py-6">
      {/* Category Swiper */}
      <Swiper pagination modules={[Pagination]} className="mySwiper" spaceBetween={10}>
        {categoryChunks.map((chunk, index) => (
          <SwiperSlide key={index}>
            <div className="grid grid-cols-4 md:grid-cols-8 mt-18 pb-6 gap-3">
              {chunk.map(cat => (
                <div
                  key={cat._id}
                  className={`flex flex-col items-center rounded-xl p-1 ${category === cat._id ? 'border border-[#FED700]' : ''
                    } cursor-pointer text-center`}
                  onClick={() => setCategory(cat._id)}
                >
                  <div className="rounded-full p-1">
                    <img
                      src={cat.image || '/fallback.jpg'}
                      alt={cat.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  </div>
                  <p className="text-xs mt-2">{cat.name}</p>
                </div>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products…"
        className="mb-6 border w-full rounded-xl border-[#FED700] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-400"
      />

      {/* Loader */}
      {loadingProducts && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}

      {/* Empty State */}
      {!loadingProducts && products.filter((p) => p.stock > 0).length === 0 && (
        <p className="text-center text-lg text-gray-500 mb-10">No products found.</p>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products
          .filter((product) => product.stock > 0)
          .map((product) => {
            const isInCart = !!cartItems.find((item) => item._id === product._id);
            return (
              <ProductCard
                key={product._id}
                product={product}
                quantity={quantities[product._id]}
                onQuantityChange={handleQuantityChange}
                onAddToCart={handleAddToCart}
                isAddingToCart={isAddingToCart}
                isInCart={isInCart}
              />
            );
          })}
      </div>
    </div>
  );
};

export default ProductList;
