import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* ---------LeftSection------------ */}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Would you like me to create a visual version of this named logo for
            you? Let me know any specific preferences, and I'll design it!
          </p>
        </div>
        {/* ---------CenterSection------------ */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600 ">
            <li>Home</li>
            <li>About Us</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        {/* ---------RightSection------------ */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600 ">
            <li>+1-212-456-7890</li>
            <li>girish@gmail.com</li>
          </ul>
        </div>
      </div>
      {/* ------copyRight------ */}
      <div>
      <hr/>
        <p className="py-5 text-sm text-center">CopyRight 2024@ DocScribe - All Rigts Reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
