import { ContactUsMapForm } from '../components/ContactUs';
import Container from '../components/Container';
import Features from '../components/FeaturesProvider';
import WeeklyBookingsChart from '../components/GraphProvider';
import HeroSection from '../components/Hero';
import usePushNotification from '../hooks/usePushNotification'; // ✅
import { useEffect, useState } from 'react';
import axios from 'axios';

function ProviderHome() {
  const [providerId, setProviderId] = useState(null);

  useEffect(() => {
    // Fetch current provider user
    const fetchCurrentProvider = async () => {
      try {
        const res = await axios.get("https://service-provider-website.onrender.com/api/v1/auth/getCurrentUser", {
          withCredentials: true,
        });
        if (res.data?.user?._id) {
          setProviderId(res.data.user._id);
        }
      } catch (err) {
        console.error("Failed to fetch provider:", err);
      }
    };

    fetchCurrentProvider();
  }, []);

  usePushNotification(providerId); // ✅ call the hook

  return (
    <div>
      <Container>
        <HeroSection />
        <Features />
        <WeeklyBookingsChart />
        <ContactUsMapForm />
      </Container>
    </div>
  );
}

export default ProviderHome;
