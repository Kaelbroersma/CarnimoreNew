import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useMobileDetection } from '../components/MobileDetection';
import { getImageUrl } from '../utils/imageUtils';
import Button from '../components/Button';
import Breadcrumbs from '../components/Breadcrumbs';
import OptionSelector from '../components/ProductOptions/OptionSelector';

const ProductDetailsPage: React.FC = () => {
  const { categorySlug, productSlug } = useParams();
  const navigate = useNavigate();
  const isMobile = useMobileDetection();
  
  const {
    selectedProduct: product,
    selectedCaliber,
    selectedOptions,
    colors,
    loading,
    error,
    fetchProduct,
    setSelectedCaliber,
    setSelectedOption,
    setColors,
    calculateTotalPrice,
    clearSelections
  } = useProductStore();

  const { addItem } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  useEffect(() => {
    if (!categorySlug || !productSlug) return;

    // Clear any existing selections
    clearSelections();

    // Fetch product
    fetchProduct(productSlug);
  }, [categorySlug, productSlug]);

  const handleBack = () => {
    if (!categorySlug) return;
    navigate(`/shop/${categorySlug}`);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      const baseItem = {
        id: product.product_id,
        name: product.name,
        quantity: 1,
        image: product.images?.[0]?.image_url || '/img/Logo-Main.webp'
      };

      switch (categorySlug) {
        case 'carnimore-models':
        case 'barreled-action':
          if (!selectedCaliber) return;
          await addItem({
            ...baseItem,
            price: calculateTotalPrice(),
            options: {
              caliber: selectedCaliber,
              colors,
              ...selectedOptions
            }
          });
          break;

        case 'duracoat':
          await addItem({
            ...baseItem,
            price: calculateTotalPrice(),
            options: {
              colors,
              isDirty: selectedOptions.isDirty
            }
          });
          break;

        case 'merch':
          if (!selectedOptions.size || !selectedOptions.color) return;
          await addItem({
            ...baseItem,
            price: product.price,
            options: {
              size: selectedOptions.size,
              color: selectedOptions.color
            }
          });
          break;

        default:
          // Simple products (optics, accessories, nfa)
          await addItem({
            ...baseItem,
            price: product.price
          });
          break;
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Parse specifications from JSON if they exist
  const specifications = product?.specifications ? 
    (Array.isArray(product.specifications) ? 
      product.specifications : 
      JSON.parse(product.specifications as string)
    ) : null;

  if (!product || loading) return null;

  const needsCaliberSelection = ['carnimore-models', 'barreled-action'].includes(categorySlug || '');
  const needsSizeColorSelection = categorySlug === 'merch';
  const isDisabled = isAddingToCart || 
    (needsCaliberSelection && !selectedCaliber) ||
    (needsSizeColorSelection && (!selectedOptions.size || !selectedOptions.color));

  const getButtonText = () => {
    if (isAddingToCart) return 'Adding to Cart...';
    if (needsCaliberSelection && !selectedCaliber) return 'Select Caliber to Continue';
    if (needsSizeColorSelection && (!selectedOptions.size || !selectedOptions.color)) return 'Select Size and Color to Continue';
    return 'Add to Cart';
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button and Breadcrumbs */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-400 hover:text-tan transition-colors mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/shop' },
            { 
              label: categorySlug === 'carnimore-models' 
                ? 'Carnimore Models'
                : categorySlug === 'duracoat'
                ? 'Duracoat Services'
                : categorySlug === 'optics'
                ? 'Optics'
                : categorySlug === 'accessories'
                ? 'Accessories'
                : categorySlug === 'nfa'
                ? 'NFA Items'
                : categorySlug === 'barreled-action'
                ? 'Barreled Actions'
                : 'Merchandise',
              href: `/shop/${categorySlug}`
            },
            { label: product.name }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className={`${!isMobile && 'lg:sticky lg:top-24'}`}>
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div 
                className="relative aspect-w-4 aspect-h-3 bg-gunmetal rounded-sm overflow-hidden cursor-pointer"
                onClick={() => setShowLightbox(true)}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={getImageUrl(product.images[selectedImageIndex].image_url)}
                    alt={`${product.name} - View ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-dark-gray flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Grid */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.image_id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-w-1 aspect-h-1 rounded-sm overflow-hidden ${
                        index === selectedImageIndex 
                          ? 'ring-2 ring-tan' 
                          : 'ring-1 ring-gunmetal hover:ring-tan/50'
                      }`}
                    >
                      <img
                        src={getImageUrl(image.image_url)}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {product.name}
            </h1>
            <p className="text-gray-400 mb-6">{product.description}</p>

            <div className="flex justify-between items-center mb-8">
              <span className="text-tan text-3xl font-bold">
                ${product.price.toLocaleString()}
              </span>
              {product.weight && (
                <span className="text-gray-400">
                  Weight: {product.weight}
                </span>
              )}
            </div>

            {/* Specifications Section */}
            {specifications && specifications.length > 0 && (
              <div className="mb-8">
                <button
                  onClick={() => setShowSpecs(!showSpecs)}
                  className="w-full flex items-center justify-between p-4 bg-gunmetal hover:bg-gunmetal-light transition-colors rounded-sm"
                >
                  <span className="font-heading text-lg">Specifications</span>
                  {showSpecs ? (
                    <ChevronUp className="text-tan" size={20} />
                  ) : (
                    <ChevronDown className="text-tan" size={20} />
                  )}
                </button>
                
                {showSpecs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gunmetal-dark p-4 mt-2 rounded-sm"
                  >
                    <ul className="space-y-2">
                      {specifications.map((spec: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-tan mr-2">•</span>
                          <span className="text-gray-300">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            )}

            {/* Product Options */}
            <OptionSelector
              categorySlug={categorySlug}
              product={product}
              selectedCaliber={selectedCaliber}
              carnimoreOptions={selectedOptions}
              carnimoreColors={colors}
              duracoatColors={colors}
              isDirty={selectedOptions.isDirty}
              selectedSize={selectedOptions.size}
              selectedColor={selectedOptions.color}
              onCaliberSelect={setSelectedCaliber}
              onOptionChange={setSelectedOption}
              onCarnimoreColorsChange={setColors}
              onDuracoatColorsChange={setColors}
              onDirtyChange={(isDirty) => setSelectedOption('isDirty', isDirty)}
              onSizeSelect={(size) => setSelectedOption('size', size)}
              onColorSelect={(color) => setSelectedOption('color', color)}
            />

            {/* Add to Cart Button */}
            <div className="mt-8">
              <Button
                variant="primary"
                fullWidth
                disabled={isDisabled}
                onClick={handleAddToCart}
              >
                {getButtonText()}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && product.images && product.images.length > 0 && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-tan transition-colors"
          >
            <X size={24} />
          </button>

          <button
            onClick={() => setSelectedImageIndex((prev) => 
              prev === 0 ? product.images!.length - 1 : prev - 1
            )}
            className="absolute left-4 text-white hover:text-tan transition-colors"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={() => setSelectedImageIndex((prev) => 
              prev === product.images!.length - 1 ? 0 : prev + 1
            )}
            className="absolute right-4 text-white hover:text-tan transition-colors"
          >
            <ChevronRight size={32} />
          </button>

          <img
            src={getImageUrl(product.images[selectedImageIndex].image_url)}
            alt={`${product.name} - Full View`}
            className="max-w-full max-h-[90vh] object-contain"
          />
        </motion.div>
      )}
    </div>
  );
};

export default ProductDetailsPage;