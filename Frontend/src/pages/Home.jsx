import React from 'react'
import Container from '../components/Container'
import HeroSection from '../components/Hero'
import Features from '../components/Cards'
import MarqueeProviderDemo from '../components/ListProviders'
import PricingCards from '../components/Pricing'
import { ContactUsMapForm } from '../components/ContactUs'

function Home() {
  return (
    <div>
          <Container>
                    <HeroSection />
                    <Features />
                    <PricingCards />
                    <MarqueeProviderDemo />
                    <ContactUsMapForm />
          </Container>
    </div>
  )
}

export default Home