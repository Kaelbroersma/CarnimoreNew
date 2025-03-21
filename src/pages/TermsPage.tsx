import React from 'react';
import { motion } from 'framer-motion';
import { Scale, FileText, Shield, AlertTriangle } from 'lucide-react';

const TermsPage: React.FC = () => {
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
            Terms of <span className="text-tan">Service</span>
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
            Please read these terms carefully before using our services. By using our website and services, you agree to these terms.
          </motion.p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-12">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-6">
              <FileText className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">General Terms</h2>
            </div>
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury">
              <div className="space-y-4 text-gray-300">
                <p>
                  By accessing and placing an order with Carnimore, you confirm that you are in agreement with and bound by the terms and conditions contained herein.
                </p>
                <p>
                  These terms apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center mb-6">
              <Scale className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">Legal Compliance</h2>
            </div>
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury">
              <div className="space-y-4 text-gray-300">
                <p>You agree to comply with all applicable laws and regulations regarding:</p>
                <ul className="space-y-2">
                  <li>• Federal firearms regulations</li>
                  <li>• State and local firearms laws</li>
                  <li>• Age restrictions and verification</li>
                  <li>• Licensing requirements</li>
                  <li>• Transfer and shipping regulations</li>
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
              <h2 className="font-heading text-2xl font-bold">Product Terms</h2>
            </div>
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury">
              <div className="space-y-4 text-gray-300">
                <h3 className="font-bold text-lg mb-3">Custom Orders</h3>
                <ul className="space-y-2">
                  <li>• All sales are final on custom orders</li>
                  <li>• Production times are estimates and subject to change</li>
                  <li>• Modifications after order placement may incur additional charges</li>
                  <li>• Cancellations may be subject to restocking fees</li>
                </ul>

                <h3 className="font-bold text-lg mt-6 mb-3">Warranties</h3>
                <ul className="space-y-2">
                  <li>• Limited warranty on workmanship</li>
                  <li>• Manufacturer warranties apply where applicable</li>
                  <li>• Modifications may void manufacturer warranties</li>
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
              <AlertTriangle className="text-tan mr-3" size={24} />
              <h2 className="font-heading text-2xl font-bold">Limitations of Liability</h2>
            </div>
            <div className="bg-gunmetal p-8 rounded-sm shadow-luxury">
              <div className="space-y-4 text-gray-300">
                <p>
                  Carnimore shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
                <p>
                  We reserve the right to:
                </p>
                <ul className="space-y-2">
                  <li>• Modify or withdraw services</li>
                  <li>• Refuse service to anyone</li>
                  <li>• Modify these terms at any time</li>
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
          <h2 className="font-heading text-2xl font-bold mb-4">Questions About Our Terms?</h2>
          <p className="text-gray-300 mb-4">
            If you have any questions about our terms of service, please contact our legal department:
          </p>
          <p className="text-tan">
            legal@carnimore.com
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;