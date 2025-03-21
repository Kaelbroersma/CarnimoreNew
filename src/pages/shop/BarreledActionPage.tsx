import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import ProductPage from '../ProductPage';

const BarreledActionPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts, clearProducts } = useProductStore();

  const handleProductClick = (productSlug: string) => {
    navigate(`/shop/barreled-action/${productSlug}`);
  };

  return (
    <ProductPage
      title="Barreled Actions"
      description="Premium custom barreled actions for precision rifle builds"
      categorySlug="barreled-action"
      products={products}
      loading={loading}
      error={error}
      fetchProducts={fetchProducts}
      clearProducts={clearProducts}
      onProductClick={handleProductClick}
    />
  );
};

export default BarreledActionPage;