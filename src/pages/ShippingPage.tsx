import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, Clock, DollarSign } from 'lucide-react';

const ShippingPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-16">
          <motion.h1 
            className="font-heading text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Shipping & <span className="text-tan">Handling</span>
          </motion.h1>
          <motion.div 
            className="w-24 h-0.5 bg-tan mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
        </div>

        {/* Shipping Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            className="bg-gunmetal p-8 rounded-sm shadow-luxury"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <Truck className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">Shipping Methods</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Standard Shipping (Free)</h3>
                <p className="text-gray-300">7-10 business days</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Express Shipping</h3>
                <p className="text-gray-300">3-5 business days (+$25)</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Priority Shipping</h3>
                <p className="text-gray-300">1-2 business days (+$45)</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gunmetal p-8 rounded-sm shadow-luxury"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center mb-6">
              <Package className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">Handling Information</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-300">
                All orders are carefully packaged to ensure safe delivery. Custom firearms and sensitive items are shipped in discrete, protective packaging.
              </p>
              <p className="text-gray-300">
                Orders are typically processed within 1-2 business days before shipping.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="bg-gunmetal p-8 rounded-sm shadow-luxury"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-6">
              <Clock className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">Processing Times</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li>• In-stock items: 1-2 business days</li>
              <li>• Custom orders: 2-3 weeks</li>
              <li>• Duracoat services: 3-4 weeks</li>
              <li>• NFA items: Processing time varies</li>
            </ul>
          </motion.div>

          <motion.div
            className="bg-gunmetal p-8 rounded-sm shadow-luxury"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center mb-6">
              <DollarSign className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">Shipping Policies</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                All firearms must be shipped to a licensed FFL dealer. You will need to provide your dealer's information during checkout.
              </p>
              <p>
                International shipping is available for non-firearm products only and subject to additional fees and restrictions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;