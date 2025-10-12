import { assets } from "../../assets/assets";

function Companies() {
  return (
    <div className="pt-16">
      <p className="text-base text-gray-500">
        Join learners from companies like
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16 md:mt-10 mt-5">
        <img src={assets.vercel_logo} alt="Vercel" className="w-20 md:w-28" />
        <img src={assets.stripe_logo} alt="Stripe" className="w-24 md:w-32" />
        <img src={assets.figma_logo} alt="Figma" className="w-24 md:w-32" />
        <img src={assets.adobe_logo} alt="Adobe" className="w-20 md:w-28" />
        <img src={assets.paypal_logo} alt="Paypal" className="w-20 md:w-28" />
      </div>
    </div>
  );
}

export default Companies;
