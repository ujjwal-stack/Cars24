// client/src/components/payment/PaymentForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { Button } from '../common/Button';

export const PaymentForm = ({ car, transactionType = 'booking' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    calculateAmount();
  }, [car, transactionType]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const calculateAmount = () => {
    let baseAmount = 0;
    
    if (transactionType === 'booking') {
      baseAmount = Math.min(car.pricing.askingPrice * 0.1, 50000); // 10% or max 50k
    } else {
      baseAmount = car.pricing.askingPrice;
    }

    const platformFee = Math.round(baseAmount * 0.02); // 2%
    const gst = Math.round(platformFee * 0.18); // 18% on platform fee
    const total = baseAmount + platformFee + gst;

    setAmount(baseAmount);
    setBreakdown({
      baseAmount,
      platformFee,
      gst,
      total
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Create order
      const orderResult = await paymentService.createOrder({
        carId: car._id,
        amount: breakdown.baseAmount,
        transactionType
      });

      const { order, transaction } = orderResult.data;

      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Cars24',
        description: `${transactionType === 'booking' ? 'Booking' : 'Payment'} for ${car.basicInfo.brand} ${car.basicInfo.model}`,
        order_id: order.id,
        handler: async function (response) {
          // Verify payment
          try {
            await paymentService.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              transactionId: transaction
            });

            // Navigate to success page
            navigate(`/payment-success/${transaction}`);
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#e74c3c'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  if (!breakdown) {
    return <div>Calculating...</div>;
  }

  return (
    <div className="payment-form">
      <div className="payment-car-info">
        <img 
          src={car.images?.[0]?.url || '/placeholder-car.jpg'} 
          alt={`${car.basicInfo.brand} ${car.basicInfo.model}`}
          className="payment-car-image"
        />
        <div className="payment-car-details">
          <h3>{car.basicInfo.brand} {car.basicInfo.model}</h3>
          <p>{car.basicInfo.variant}</p>
          <p className="payment-car-price">
            ₹{car.pricing.askingPrice.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="payment-breakdown">
        <h3>Payment Breakdown</h3>
        
        <div className="breakdown-item">
          <span>{transactionType === 'booking' ? 'Booking Amount' : 'Car Price'}</span>
          <span>₹{breakdown.baseAmount.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="breakdown-item">
          <span>Platform Fee (2%)</span>
          <span>₹{breakdown.platformFee.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="breakdown-item">
          <span>GST (18%)</span>
          <span>₹{breakdown.gst.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="breakdown-item breakdown-total">
          <span>Total Amount</span>
          <span>₹{breakdown.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="payment-info">
        <p>✓ 100% Secure Payment</p>
        <p>✓ Money-back Guarantee</p>
        <p>✓ Hassle-free Process</p>
      </div>

      <Button
        variant="primary"
        size="large"
        loading={loading}
        onClick={handlePayment}
        className="payment-btn"
      >
        {transactionType === 'booking' ? 'Pay Booking Amount' : 'Pay Full Amount'}
      </Button>

      <p className="payment-note">
        By proceeding, you agree to our Terms & Conditions
      </p>
    </div>
  );
};

export default PaymentForm;