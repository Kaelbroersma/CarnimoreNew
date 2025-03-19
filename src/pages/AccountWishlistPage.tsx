import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';

const AccountWishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/account')}
                className="mr-4 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="font-heading text-2xl font-bold">Your Wishlist</h1>
            </div>
          </div>

          {/* Placeholder Content */}
          <motion.div
            className="bg-gunmetal p-12 rounded-sm text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Heart className="text-tan mx-auto mb-4" size={48} />
            <h2 className="font-heading text-2xl font-bold mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              We're working on bringing you the ability to save your favorite items.
              Check back soon!
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/shop')}
            >
              Browse Products
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountWishlistPage;