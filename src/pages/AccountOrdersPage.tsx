import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Truck, Clock, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { callNetlifyFunction } from '../lib/supabase';
import Button from '../components/Button';

interface Order {
  order_id: string;
  order_status: 'pending' | 'shipped' | 'delivered' | 'canceled';
  payment_status: 'paid' | 'pending' | 'failed';
  total_amount: number;
  shipping_address: string;
  order_date: string;
  payment_method: string;
  tracking_number?: string;
  order_items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    options?: Record<string, any>;
  }>;
}

const AccountOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const result = await callNetlifyFunction('supabase-client', {
          action: 'getOrders',
          payload: { userId: user.id }
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
        setOrders(result.data || []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusColor = (status: Order['order_status']) => {
    switch (status) {
      case 'shipped':
        return 'text-blue-400';
      case 'delivered':
        return 'text-green-400';
      case 'canceled':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getPaymentStatusColor = (status: Order['payment_status']) => {
    switch (status) {
      case 'paid':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
              <h1 className="font-heading text-2xl font-bold">Your Orders</h1>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Package className="animate-pulse text-tan mx-auto mb-4" size={32} />
              <p className="text-gray-400">Loading your orders...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-sm p-4 mb-6 flex items-start">
              <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Orders List */}
          {!loading && !error && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-gunmetal rounded-sm">
                  <ShoppingBag className="text-tan mx-auto mb-4" size={32} />
                  <h3 className="font-heading text-xl font-bold mb-2">No Orders Yet</h3>
                  <p className="text-gray-400 mb-6">Place an order to see your order history here.</p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/shop')}
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div
                    key={order.order_id}
                    className="bg-gunmetal p-6 rounded-sm shadow-luxury"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="font-heading text-xl font-bold mb-2">
                          Order #{order.order_id}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-400">
                            <Clock size={16} className="inline mr-1" />
                            {formatDate(order.order_date)}
                          </span>
                          <span className={getStatusColor(order.order_status)}>
                            {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                          </span>
                          <span className={getPaymentStatusColor(order.payment_status)}>
                            Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className="text-tan text-xl font-bold">
                          ${order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gunmetal-light pt-4 mb-4">
                      <h4 className="font-medium mb-3">Order Items:</h4>
                      <div className="space-y-3">
                        {order.order_items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                              {item.options && Object.entries(item.options).map(([key, value]) => (
                                value && (
                                  <p key={key} className="text-sm text-gray-400">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                                  </p>
                                )
                              ))}
                            </div>
                            <span className="text-tan">${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gunmetal-light pt-4 space-y-2">
                      <div className="flex items-start">
                        <Truck className="text-tan mr-2 flex-shrink-0 mt-1" size={18} />
                        <div>
                          <p className="text-sm text-gray-400">Shipping Address:</p>
                          <p className="text-sm">{order.shipping_address}</p>
                        </div>
                      </div>
                      {order.tracking_number && (
                        <div className="flex items-center">
                          <Package className="text-tan mr-2" size={18} />
                          <div>
                            <p className="text-sm text-gray-400">Tracking Number:</p>
                            <p className="text-sm font-mono">{order.tracking_number}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountOrdersPage;