import { ContactUsMapForm } from '../components/ContactUs'
import Container from '../components/Container'
import Features from '../components/FeaturesProvider'
import WeeklyBookingsChart from '../components/GraphProvider'
import HeroSection from '../components/Hero'

function ProviderHome() {
  return (
    <div>
          <Container>
            <HeroSection />
            <Features />
            <WeeklyBookingsChart />
            <ContactUsMapForm />
          </Container>
    </div>
  )
}

export default ProviderHome