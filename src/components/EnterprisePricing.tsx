
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import ContactSalesForm from './ContactSalesForm';

const EnterprisePricing = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  
  return (
    <div className="mt-16 bg-gray-50 rounded-xl p-8 max-w-3xl mx-auto">
      {!showContactForm ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Enterprise Solutions</h2>
          <p className="text-gray-600 mb-6">
            Looking for a solution for your recruitment team or career services department?
            We offer custom enterprise packages with volume discounts.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setShowContactForm(true)}
          >
            Contact Sales
          </Button>
        </div>
      ) : (
        <ContactSalesForm onCancel={() => setShowContactForm(false)} />
      )}
    </div>
  );
};

export default EnterprisePricing;
