import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';


const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {

     const {user} = useSelector((state) => state.auth);
      
 


    if (user) {
        return <Navigate to="/" />;
    }

   return children
}

export default PublicRoute