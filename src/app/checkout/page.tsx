import PayButton from "@/components/shared/PayButton";
import { PLANS } from "@/config/plans";


export default function CheckoutPage() {
  return (
    <main className="p-8 max-w-md mx-auto text-center border rounded-xl shadow-sm mt-12">
      <h2 className="text-2xl font-bold mb-4">Complete Your Order</h2>
      <p className="mb-6 text-gray-600">Test Nexi XPay Sandbox Payment</p>
      
      {/* Starter plan (€15.50) */}
      <PayButton
        plan={PLANS[0]}
        restaurantName="Demo Restaurant"
        ownerEmail="demo@restaurant.com"
        ownerName="Demo Owner"
      />
    </main>
  );
}