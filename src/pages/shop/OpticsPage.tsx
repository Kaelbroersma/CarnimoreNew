import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import ProductPage from '../ProductPage';

const OpticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts, clearProducts } = useProductStore();

  const handleProductClick = (productSlug: string) => {
    navigate(`/shop/optics/${productSlug}`);
  };

  return (
    <ProductPage
      title="Optics"
      description="High-quality scopes and sighting solutions for precision shooting"
      categorySlug="optics"
      products={products}
      loading={loading}
      error={error}
      fetchProducts={fetchProducts}
      clearProducts={clearProducts}
      onProductClick={handleProductClick}
    />
  );
};

export default OpticsPage;