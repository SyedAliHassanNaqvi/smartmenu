import PayButton from "@/components/ui/PayButton";


export default function CheckoutPage() {
  return (
    <main className="p-8 max-w-md mx-auto text-center border rounded-xl shadow-sm mt-12">
      <h2 className="text-2xl font-bold mb-4">Complete Your Order</h2>
      <p className="mb-6 text-gray-600">Test Nexi XPay Sandbox Payment</p>
      
      {/* €15.50 = 1550 cents */}
      <PayButton amount={1550} />
    </main>
  );
}