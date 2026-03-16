'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaUsers, 
  FaShieldAlt, 
  FaClock,
  FaStar,
  FaHandshake
} from 'react-icons/fa';
import Link from 'next/link';

const values = [
  {
    icon: FaShieldAlt,
    title: 'Trust & Safety',
    description: 'All artisans undergo thorough background checks and verification processes.',
  },
  {
    icon: FaStar,
    title: 'Quality Service',
    description: 'We maintain high standards and only work with skilled professionals.',
  },
  {
    icon: FaClock,
    title: 'On-Time Delivery',
    description: 'Punctuality is our priority. We value your time.',
  },
  {
    icon: FaHandshake,
    title: 'Fair Pricing',
    description: 'Transparent pricing with no hidden fees or surprises.',
  },
];

const stats = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '5,000+', label: 'Verified Artisans' },
  { value: '50,000+', label: 'Jobs Completed' },
  { value: '4.8/5', label: 'Average Rating' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            About Artisan Marketplace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-primary-100 max-w-3xl mx-auto"
          >
            Connecting skilled artisans with customers who need their services. 
            We are building a community of trust, quality, and reliability.
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                At Artisan Marketplace, we believe everyone deserves access to quality services 
                from skilled professionals. Our mission is to bridge the gap between talented 
                artisans and customers who need their expertise.
              </p>
              <p className="text-gray-600 text-lg mb-6">
                We are committed to creating opportunities for artisans to grow their businesses 
                while providing customers with a seamless, trustworthy platform to find and 
                book the services they need.
              </p>
              <ul className="space-y-3">
                {[
                  'Empowering local artisans',
                  'Ensuring customer satisfaction',
                  'Building lasting relationships',
                  'Promoting quality workmanship',
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <FaCheckCircle className="text-primary-600 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-primary-600 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do at Artisan Marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting started with Artisan Marketplace is simple and straightforward
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Search',
                description: 'Browse through our extensive list of verified artisans by category, location, or rating.',
              },
              {
                step: '2',
                title: 'Book',
                description: 'Select your preferred artisan, choose a date and time, and book their services.',
              },
              {
                step: '3',
                title: 'Relax',
                description: 'Sit back and let the professional handle your needs. Pay securely through our platform.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and skilled artisans on our platform today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/artisans"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Find an Artisan
            </Link>
            <Link
              href="/register?type=artisan"
              className="bg-secondary-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-secondary-600 transition-colors"
            >
              Become an Artisan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
