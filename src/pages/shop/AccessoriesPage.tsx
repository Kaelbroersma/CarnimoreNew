import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import ProductPage from '../ProductPage';

const AccessoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts, clearProducts } = useProductStore();

  const handleProductClick = (productSlug: string) => {
    navigate(`/shop/accessories/${productSlug}`);
  };

  return (
    <ProductPage
      title="Accessories"
      description="Essential firearm accessories and components for optimal performance"
      categorySlug="accessories"
      products={products}
      loading={loading}
      error={error}
      fetchProducts={fetchProducts}
      clearProducts={clearProducts}
      onProductClick={handleProductClick}
    />
  );
};

export default AccessoriesPage;