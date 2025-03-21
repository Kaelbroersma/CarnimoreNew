import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import ProductPage from '../ProductPage';

const NFAPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts, clearProducts } = useProductStore();

  const handleProductClick = (productSlug: string) => {
    navigate(`/shop/nfa/${productSlug}`);
  };

  return (
    <ProductPage
      title="NFA Items"
      description="Premium suppressors and NFA-regulated firearms and accessories"
      categorySlug="nfa"
      products={products}
      loading={loading}
      error={error}
      fetchProducts={fetchProducts}
      clearProducts={clearProducts}
      onProductClick={handleProductClick}
    />
  );
};

export default NFAPage;