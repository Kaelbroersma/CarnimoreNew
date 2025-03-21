import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database } from 'lucide-react';

const PrivacyPage: React.FC = () => {
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
            Privacy <span className="text-tan">Policy</span>
          </motion.h1>
          <motion.div 
            className="w-24 h-0.5 bg-tan mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.
          </motion.p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-12">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-6">
              <Database className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">Information We Collect</h2>
            </div>
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury">
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-3">Personal Information</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Name and contact information</li>
                  <li>• Shipping and billing addresses</li>
                  <li>• Payment information</li>
                  <li>• Federal Firearms License (FFL) information when applicable</li>
                  <li>• Communication preferences</li>
                </ul>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center mb-6">
              <Eye className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">How We Use Your Information</h2>
            </div>
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury">
              <div className="space-y-4 text-gray-300">
                <p>We use your information to:</p>
                <ul className="space-y-2">
                  <li>• Process and fulfill your orders</li>
                  <li>• Communicate about your order status</li>
                  <li>• Send important product updates and recalls</li>
                  <li>• Improve our products and services</li>
                  <li>• Comply with legal requirements</li>
                </ul>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center mb-6">
              <Shield className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">Information Security</h2>
            </div>
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury">
              <div className="space-y-4 text-gray-300">
                <p>
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="space-y-2">
                  <li>• Encryption of sensitive data</li>
                  <li>• Secure payment processing</li>
                  <li>• Regular security audits</li>
                  <li>• Limited access to personal information</li>
                </ul>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex items-center mb-6">
              <Lock className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">Your Rights</h2>
            </div>
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury">
              <div className="space-y-4 text-gray-300">
                <p>You have the right to:</p>
                <ul className="space-y-2">
                  <li>• Access your personal information</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Request deletion of your information</li>
                  <li>• Opt-out of marketing communications</li>
                  <li>• File a complaint with regulatory authorities</li>
                </ul>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Contact Information */}
        <motion.div
          className="mt-12 bg-gunmetal p-8 rounded-sm shadow-luxury text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="font-heading text-2xl font-bold mb-4">Questions About Privacy?</h2>
          <p className="text-gray-300 mb-4">
            If you have any questions about our privacy practices, please contact us:
          </p>
          <p className="text-tan">
            privacy@carnimore.com
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;