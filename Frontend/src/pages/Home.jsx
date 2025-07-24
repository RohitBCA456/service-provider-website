import React from 'react';
import Container from '../components/Container';
import HeroSection from '../components/Hero';
import Features from '../components/Cards';
import MarqueeProviderDemo from '../components/ListProviders';
// import PricingCards from '../components/Pricing';
import { ContactUsMapForm } from '../components/ContactUs';
import ErrorBoundary from '../components/ErrorBoundary'; // Import the boundary

function Home() {
  return (
    <ErrorBoundary>
      <div>
        <Container>
          <HeroSection />
          <Features />
          {/* <PricingCards /> */}
          <MarqueeProviderDemo />
          <ContactUsMapForm />
        </Container>
      </div>
    </ErrorBoundary>
  );
}

export default Home;
