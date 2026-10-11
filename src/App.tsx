/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';

// Pages
import { HomePage } from './pages/HomePage.tsx';
import { ProductListPage } from './pages/ProductListPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.tsx';
import { OrderHistoryPage } from './pages/OrderHistoryPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;

      case 'products':
        return (
          <ProductListPage
            initialCategory={pageParams.category || 'all'}
            initialSearch={pageParams.search || ''}
            onNavigate={handleNavigate}
          />
        );

      case 'product-detail':
        return (
          <ProductDetailPage
            slug={pageParams.slug || ''}
            onNavigate={handleNavigate}
          />
        );

      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;

      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;

      case 'order-confirmation':
        return (
          <OrderConfirmationPage
            order={pageParams.order}
            isSimulated={pageParams.isSimulated}
            onNavigate={handleNavigate}
          />
        );

      case 'orders':
        return <OrderHistoryPage onNavigate={handleNavigate} />;

      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;

      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;

      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;

      case 'admin':
        return <AdminDashboardPage onNavigate={handleNavigate} />;

      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;

      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;

      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 font-sans selection:bg-orange-500 selection:text-white">
          <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
          <main className="flex-1">
            {renderCurrentPage()}
          </main>
          <Footer onNavigate={handleNavigate} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
