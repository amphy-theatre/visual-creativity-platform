import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PricingModal from "@/components/PricingModal/PricingModal";

const NotFound = () => {
  const location = useLocation();
  const { showPricingModal, setShowPricingModal } = useAuth();
  
  // Log the 404 error
  console.error(
    "404 Error: User attempted to access non-existent route:",
    location.pathname
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
      
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
