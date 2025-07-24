import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./core/Home";
import Signup from "./user/Signup.jsx";
import Signin from './lib/Signin.jsx'
import Profile from "./user/Profile.jsx";
import PrivateRoute from "./lib/PrivateRoute.jsx";
import EditProfile from "./user/EditProfile.jsx";
import ForYou from "./core/ForYou.jsx";
import Admin from "./core/Admin.jsx";
import Gallery from "./core/Gallery.jsx";
import Contact from "./core/Contact.jsx";
import Footer from "./core/Footer.jsx";

import Menu from "./core/Menu";
function MainRouter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       <Menu />
      
      <div style={{ flex: 1 }}>
        <Routes>
           <Route path="/" element={<Home />} />
           <Route path="/signup" element={<Signup />} />
           <Route path="/signin" element={<Signin />} />
           <Route path="/foryou" element={<ForYou />} />
           <Route path="/gallery" element={<Gallery />} />
           <Route path="/admin" element={<Admin />} />
           <Route path="/contact" element={<Contact />} />
        
          <Route
            path="/user/edit/:userId"
            element={
              <PrivateRoute>
                 <EditProfile />
              </PrivateRoute>
            }
          />
           <Route path="/user/:userId" element={<Profile />} />
        </Routes>
      </div>
      
      <Footer />
    </div>
  );
}

export default MainRouter;
